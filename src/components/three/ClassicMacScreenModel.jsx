import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MOBILE_MQ } from '../../lib/mobile-layout';

export const CLASSIC_MAC_SCREEN_URL = '/models/Mac1-screen-updated.glb';

const BODY_BEIGE = new THREE.Color('#d8d0c4');
const BODY_WARM = new THREE.Color('#c9c0b4');
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const YAW_LIMIT = THREE.MathUtils.degToRad(36);
const MODEL_LIFT = 0.22;
const LOOK_LIFT = 0.06;
const MOBILE_OVERVIEW_LOOK_DROP = 0.62;
const FOLLOW_YAW = THREE.MathUtils.degToRad(34);
const SCREEN_NAMES = new Set(['Material #1']);
const RAW_SCREEN = {
  min: new THREE.Vector3(-3.7775816917419434, 4.042942047119141, 4.614737510681152),
  max: new THREE.Vector3(3.9202632904052734, 12.314278602600098, 5.834877014160156),
};
const GLASS_CROP = { left: 0.05, right: 0.05, top: 0.07, bottom: 0.30 };

const restorePlastic = (material) => {
  if (!material) return;
  const name = material.name || '';
  material.metalness = 0;
  material.envMapIntensity = 0.16;

  if (name === 'Material #0' || name === 'Housing Rear Panel') {
    material.color.copy(BODY_BEIGE);
    material.roughness = 0.66;
    if (material.emissive) {
      material.emissive.set('#26231e');
      material.emissiveIntensity = 0.035;
    }
  }
  if (name === 'Material #10') {
    material.color.copy(BODY_WARM);
    material.roughness = 0.58;
  }
  if (name === 'Material #12') {
    material.color.set('#b8b2a6');
    material.roughness = 0.55;
  }
  material.needsUpdate = true;
};

const transformBox = (box, object) => {
  const world = new THREE.Box3();
  const point = new THREE.Vector3();
  const corners = [
    [0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1],
    [1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1],
  ];
  object.updateWorldMatrix(true, true);
  corners.forEach(([x, y, z]) => {
    point.set(
      x ? box.max.x : box.min.x,
      y ? box.max.y : box.min.y,
      z ? box.max.z : box.min.z,
    ).applyMatrix4(object.matrixWorld);
    world.expandByPoint(point);
  });
  return world;
};

const coreBoxFromScreen = (screenBox) => {
  const size = screenBox.getSize(new THREE.Vector3());
  const core = screenBox.clone();
  core.min.x -= size.x * 0.04;
  core.max.x += size.x * 0.04;
  core.min.y = screenBox.min.y - size.y * 0.58;
  core.min.z = screenBox.min.z - size.x * 0.88;
  core.max.z = screenBox.max.z;
  return core;
};

const glassBoxFromScreen = (screenBox) => {
  const size = screenBox.getSize(new THREE.Vector3());
  const glass = screenBox.clone();
  glass.min.x += size.x * GLASS_CROP.left;
  glass.max.x -= size.x * GLASS_CROP.right;
  glass.min.y += size.y * GLASS_CROP.bottom;
  glass.max.y -= size.y * GLASS_CROP.top;
  return glass;
};

const fitModelToScreen = (object, screenLocal) => {
  object.position.set(0, 0, 0);
  object.rotation.set(0, 0, 0);
  object.scale.setScalar(1);
  const core = coreBoxFromScreen(screenLocal);
  const size = core.getSize(new THREE.Vector3());
  const center = core.getCenter(new THREE.Vector3());
  const longest = Math.max(size.x, size.y, size.z, 0.001);
  const scale = 2.95 / longest;
  object.scale.setScalar(scale);
  object.position.copy(center).multiplyScalar(-scale);
  const fittedCore = transformBox(core, object);
  object.position.y -= fittedCore.min.y;
  const screenWorld = transformBox(screenLocal, object);
  const screenCenter = screenWorld.getCenter(new THREE.Vector3());
  object.position.x -= screenCenter.x;
  return transformBox(core, object);
};

const easeInOutQuad = (t) => (
  t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2
);

const isScreenMaterial = (material) => {
  if (!material) return false;
  const name = material.name || '';
  if (SCREEN_NAMES.has(name)) return true;
  if (name === 'Material #11') return false;
  if (/screen|crt|display|monitor/i.test(name)) return true;
  return false;
};

const expandGroupBox = (mesh, group, target) => {
  const geom = mesh.geometry;
  const pos = geom.attributes.position;
  if (!pos) return false;
  const index = geom.index;
  const vertex = new THREE.Vector3();
  let found = false;
  for (let i = 0; i < group.count; i += 1) {
    const vi = index ? index.getX(group.start + i) : group.start + i;
    vertex.fromBufferAttribute(pos, vi);
    vertex.applyMatrix4(mesh.matrixWorld);
    target.expandByPoint(vertex);
    found = true;
  }
  return found;
};

const screenBoxFromRaw = (model) => {
  const box = new THREE.Box3();
  const corners = [
    [0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1],
    [1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1],
  ];
  const point = new THREE.Vector3();
  model.updateWorldMatrix(true, true);
  corners.forEach(([x, y, z]) => {
    point.set(
      x ? RAW_SCREEN.max.x : RAW_SCREEN.min.x,
      y ? RAW_SCREEN.max.y : RAW_SCREEN.min.y,
      z ? RAW_SCREEN.max.z : RAW_SCREEN.min.z,
    ).applyMatrix4(model.matrixWorld);
    box.expandByPoint(point);
  });
  return box.isEmpty() ? null : box;
};

const findScreenBox = (model) => {
  const box = new THREE.Box3();
  let found = false;
  model.updateWorldMatrix(true, true);
  model.traverse((child) => {
    if (!child.isMesh || !child.geometry) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    const groups = child.geometry.groups || [];
    if (groups.length) {
      groups.forEach((group) => {
        if (!isScreenMaterial(materials[group.materialIndex])) return;
        if (expandGroupBox(child, group, box)) found = true;
      });
      return;
    }
    if (materials.length === 1 && isScreenMaterial(materials[0])) {
      box.expandByObject(child);
      found = true;
    }
  });
  if (found && !box.isEmpty()) return box;
  return screenBoxFromRaw(model);
};

const inferFront = (fitted, screenBox) => {
  const mid = fitted.getCenter(new THREE.Vector3());
  const size = fitted.getSize(new THREE.Vector3());
  if (!screenBox) {
    const fallback = mid.clone();
    fallback.y += size.y * 0.18;
    fallback.z = fitted.max.z;
    return {
      screenCenter: fallback,
      screenSize: new THREE.Vector3(size.x * 0.52, size.y * 0.36, 0.04),
      frontDir: new THREE.Vector3(0, 0, 1),
    };
  }

  const glass = glassBoxFromScreen(screenBox);
  const screenCenter = glass.getCenter(new THREE.Vector3());
  const screenSize = glass.getSize(new THREE.Vector3());
  screenCenter.z = screenBox.max.z;
  return { screenCenter, screenSize, frontDir: new THREE.Vector3(0, 0, 1) };
};

export default function ClassicMacScreenModel({
  className = '',
  zoomProgress = 0,
  zoomDriveRef,
  snapZoomRef,
  liteRef,
  transparentBackground = false,
}) {
  const mountRef = useRef(null);
  const zoomRef = useRef(zoomProgress);
  const driveRef = useRef(zoomDriveRef);
  const snapRef = useRef(snapZoomRef);
  const qualityRef = useRef(liteRef);
  const transparentBgRef = useRef(transparentBackground);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  zoomRef.current = zoomProgress;
  driveRef.current = zoomDriveRef;
  snapRef.current = snapZoomRef;
  qualityRef.current = liteRef;
  transparentBgRef.current = transparentBackground;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    const clearBehind = transparentBgRef.current;

    const scene = new THREE.Scene();
    scene.background = clearBehind ? null : new THREE.Color('#050505');

    const camera = new THREE.PerspectiveCamera(34, 1, 0.08, 80);
    camera.position.set(0, 1.28, 8.9);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: (window.devicePixelRatio || 1) <= 1,
        alpha: clearBehind,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
      });
      if (clearBehind) renderer.setClearColor(0x000000, 0);
    } catch (err) {
      setStatus('error');
      setError(err?.message || 'WebGL is unavailable');
      console.error('[ClassicMacScreenModel] WebGLRenderer', err);
      return undefined;
    }
    const narrowMq = window.matchMedia(MOBILE_MQ);
    const maxPixelRatio = () => (narrowMq.matches ? 1.25 : 1.5);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio()));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.78;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute('aria-label', 'Classic Macintosh 3D model');
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'pan-y';
    mount.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.16;
    scene.add(new THREE.AmbientLight('#f3eee6', 0.30));
    scene.add(new THREE.HemisphereLight('#f0ebe3', '#2a261f', 0.58));
    const key = new THREE.DirectionalLight('#f2eee8', 0.82);
    key.position.set(2.4, 6.2, 5.8);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    key.shadow.autoUpdate = false;
    key.shadow.needsUpdate = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight('#ddd6cc', 0.30);
    fill.position.set(-4.2, 2.4, 3.2);
    scene.add(fill);
    const rim = new THREE.PointLight('#e8d8c4', 1.15, 18, 2);
    rim.position.set(-2.2, 1.6, -3.4);
    scene.add(rim);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(6, 48),
      new THREE.ShadowMaterial({ opacity: 0.22 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const pivot = new THREE.Group();
    scene.add(pivot);

    const rig = {
      ready: false,
      mid: new THREE.Vector3(0, 1.2, 0),
      size: new THREE.Vector3(2, 2.4, 2),
      screenCenter: new THREE.Vector3(0, 1.55, 0.7),
      screenSize: new THREE.Vector3(1.1, 0.82, 0.04),
      frontDir: new THREE.Vector3(0, 0, 1),
      overviewDist: 8.9,
      closeDist: 1.6,
    };

    const state = {
      targetYaw: 0,
      followYaw: 0,
      currentYaw: 0,
      down: false,
      axis: null,
      capturedId: null,
      lastX: 0,
      lastY: 0,
    };

    const updateDistances = () => {
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const halfTan = Math.tan(fov / 2);
      const aspect = Math.max(camera.aspect, 0.2);
      const lookY = rig.screenCenter.y;
      const top = rig.mid.y + rig.size.y * 0.5;
      const halfH = Math.max(lookY - 0, top - lookY, rig.size.y * 0.5) * 1.08;
      const halfW = Math.max(rig.size.x * 0.54, rig.screenSize.x * 0.58);
      const overviewPad = narrowMq.matches ? 1.72 : 1.38;
      const overviewFloor = narrowMq.matches ? 9.4 : 7.6;
      rig.overviewDist = Math.max(overviewFloor, Math.max(halfH / halfTan, halfW / (halfTan * aspect)) * overviewPad);
      const screenW = Math.max(rig.screenSize.x, 0.01);
      const screenH = Math.max(rig.screenSize.y, 0.01);
      const distH = (screenH * 0.5) / halfTan;
      const distW = (screenW * 0.5) / (halfTan * aspect);
      rig.closeDist = Math.max(0.42, Math.min(distH, distW) * 0.94);
    };

    const focus = new THREE.Vector3();
    const offset = new THREE.Vector3();
    const viewRect = { left: 0, top: 0, right: 1, bottom: 1, width: 1, height: 1 };

    const syncViewRect = () => {
      const next = renderer.domElement.getBoundingClientRect();
      viewRect.left = next.left;
      viewRect.top = next.top;
      viewRect.right = next.right;
      viewRect.bottom = next.bottom;
      viewRect.width = next.width;
      viewRect.height = next.height;
    };

    const placeCamera = (zoom, yaw, direct = false) => {
      const raw = THREE.MathUtils.clamp(zoom, 0, 1);
      const t = direct ? raw : easeInOutQuad(raw);
      focus.copy(rig.screenCenter);
      focus.y -= (MODEL_LIFT - LOOK_LIFT) * (1 - t);
      if (narrowMq.matches) {
        focus.y -= MOBILE_OVERVIEW_LOOK_DROP * (1 - t);
      }
      const dist = THREE.MathUtils.lerp(rig.overviewDist, rig.closeDist, t);
      const dampedYaw = yaw * (1 - t);
      offset.set(0, 0, dist);
      offset.applyAxisAngle(Y_AXIS, dampedYaw);
      camera.position.copy(focus).add(offset);
      camera.lookAt(focus);
    };

    const onPointerMove = (event) => {
      const zoom = zoomRef.current;
      if (zoom > 0.28) return;
      if (state.down) {
        const dx = event.clientX - state.lastX;
        const dy = event.clientY - state.lastY;
        if (!state.axis) {
          if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
          state.axis = Math.abs(dx) > Math.abs(dy) * 1.05 ? 'orbit' : 'scroll';
          if (state.axis === 'orbit' && narrowMq.matches && event.pointerId != null) {
            try {
              renderer.domElement.setPointerCapture(event.pointerId);
              state.capturedId = event.pointerId;
            } catch {
              state.capturedId = null;
            }
          }
        }
        if (state.axis !== 'orbit') return;
        state.targetYaw = THREE.MathUtils.clamp(state.targetYaw - dx * 0.006, -YAW_LIMIT, YAW_LIMIT);
        state.lastX = event.clientX;
        state.lastY = event.clientY;
        return;
      }
      if (!viewRect.width) syncViewRect();
      const inside = event.clientX >= viewRect.left
        && event.clientX <= viewRect.right
        && event.clientY >= viewRect.top
        && event.clientY <= viewRect.bottom;
      if (!inside) {
        state.followYaw = 0;
        return;
      }
      const nx = THREE.MathUtils.clamp(((event.clientX - viewRect.left) / viewRect.width) * 2 - 1, -1, 1);
      state.followYaw = -nx * FOLLOW_YAW;
    };
    const onPointerDown = (event) => {
      if (zoomRef.current > 0.28) return;
      state.down = true;
      state.axis = null;
      state.capturedId = null;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
    };
    const onPointerUp = () => {
      if (state.capturedId != null) {
        try {
          renderer.domElement.releasePointerCapture(state.capturedId);
        } catch {
          /* already released */
        }
      }
      state.down = false;
      state.axis = null;
      state.capturedId = null;
    };
    const onPointerLeave = () => {
      if (!state.down) state.followYaw = 0;
    };
    const onTouchMove = (event) => {
      if (!narrowMq.matches || !state.down || state.axis !== 'orbit') return;
      if (event.cancelable) event.preventDefault();
    };

    window.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    let frame;
    const loader = new GLTFLoader();
    loader.load(
      CLASSIC_MAC_SCREEN_URL,
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (!child.isMesh) return;
          child.castShadow = true;
          child.receiveShadow = true;
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => {
            if (!material) return;
            if (material.map) material.map.colorSpace = THREE.SRGBColorSpace;
            if (material.emissiveMap) material.emissiveMap.colorSpace = THREE.SRGBColorSpace;
            restorePlastic(material);
          });
        });
        const screenLocal = new THREE.Box3(RAW_SCREEN.min.clone(), RAW_SCREEN.max.clone());
        const fitted = fitModelToScreen(model, screenLocal);
        pivot.rotation.set(0, 0, 0);
        pivot.position.set(0, MODEL_LIFT, 0);
        pivot.add(model);
        pivot.updateWorldMatrix(true, true);
        const screenBox = findScreenBox(pivot) || transformBox(screenLocal, model);
        const inferred = inferFront(fitted, screenBox);
        rig.mid.copy(fitted.getCenter(new THREE.Vector3()));
        rig.mid.y += MODEL_LIFT;
        rig.size.copy(fitted.getSize(new THREE.Vector3()));
        rig.screenCenter.copy(inferred.screenCenter);
        rig.screenCenter.x = 0;
        rig.screenSize.copy(inferred.screenSize);
        rig.frontDir.set(0, 0, 1);
        updateDistances();
        placeCamera(zoomRef.current, 0);
        rig.ready = true;
        setStatus('ready');
      },
      undefined,
      (err) => {
        setStatus('error');
        setError(err?.message || `Failed to load ${CLASSIC_MAC_SCREEN_URL}`);
        console.error('[ClassicMacScreenModel]', err);
      },
    );

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      syncViewRect();
      if (rig.ready) updateDistances();
    };
    const onNarrowChange = () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio()));
      resize();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    narrowMq.addEventListener('change', onNarrowChange);
    resize();

    let appliedZoom = THREE.MathUtils.clamp(zoomRef.current, 0, 1);
    let liteApplied = false;
    let lastFrame = performance.now();
    const applyLite = (lite) => {
      if (liteApplied === lite) return;
      liteApplied = lite;
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      renderer.setPixelRatio(lite ? 1 : Math.min(window.devicePixelRatio || 1, maxPixelRatio()));
      renderer.setSize(width, height, false);
      renderer.shadowMap.enabled = !lite;
      if (!lite) key.shadow.needsUpdate = true;
    };
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      const drive = driveRef.current;
      const targetZoom = THREE.MathUtils.clamp(
        drive ? drive.current : zoomRef.current,
        0,
        1,
      );
      const snap = !!snapRef.current?.current;
      applyLite(!!qualityRef.current?.current);
      if (snap) {
        appliedZoom = targetZoom;
      } else {
        const catchup = 1 - Math.exp(-(targetZoom >= 0.82 ? 8 : targetZoom >= 0.45 ? 4.5 : 1.2) * dt);
        appliedZoom += (targetZoom - appliedZoom) * catchup;
        if (Math.abs(targetZoom - appliedZoom) < 0.0008) appliedZoom = targetZoom;
      }
      const zoom = appliedZoom;
      const settle = 1 - Math.exp(-14 * dt);
      if (zoom > 0.05) {
        state.targetYaw += (0 - state.targetYaw) * settle;
        state.followYaw += (0 - state.followYaw) * settle;
      }
      const followScale = zoom > 0.12 ? 0 : 1;
      const desired = THREE.MathUtils.clamp(
        state.targetYaw + state.followYaw * followScale,
        -YAW_LIMIT,
        YAW_LIMIT,
      );
      state.currentYaw += (desired - state.currentYaw) * settle;
      if (rig.ready) placeCamera(zoom, state.currentYaw, snap);
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      narrowMq.removeEventListener('change', onNarrowChange);
      window.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      renderer.domElement.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            material.map?.dispose();
            material.emissiveMap?.dispose();
            material.dispose();
          });
        }
      });
    };
  }, []);

  return (
    <div
      className={`classic-mac-model ${className}`}
      data-mac-ready={status === 'ready' ? '1' : '0'}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      {status === 'loading' && (
        <p className="classic-mac-model__status">Loading Macintosh…</p>
      )}
      {status === 'error' && (
        <p className="classic-mac-model__status classic-mac-model__status--error">{error}</p>
      )}
    </div>
  );
}
