import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const makeRoundedShape = (width, depth, radius) => {
  const x = -width / 2;
  const y = -depth / 2;
  const r = Math.min(radius, width / 2, depth / 2);
  const shape = new THREE.Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + depth - r);
  shape.quadraticCurveTo(x + width, y + depth, x + width - r, y + depth);
  shape.lineTo(x + r, y + depth);
  shape.quadraticCurveTo(x, y + depth, x, y + depth - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
};

const roundedBox = (width, depth, height, radius, material) => {
  const geometry = new THREE.ExtrudeGeometry(makeRoundedShape(width, depth, radius), {
    depth: height,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: Math.min(0.08, height * 0.35),
    bevelThickness: Math.min(0.08, height * 0.35),
    curveSegments: 6,
  });
  geometry.translate(0, 0, -height / 2);
  return new THREE.Mesh(geometry, material);
};

const createScreenTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 1024, 640);
  gradient.addColorStop(0, '#101c3d');
  gradient.addColorStop(0.48, '#1b3b63');
  gradient.addColorStop(1, '#0a0d1c');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const glow = ctx.createRadialGradient(720, 120, 20, 720, 120, 520);
  glow.addColorStop(0, 'rgba(101, 211, 255, .58)');
  glow.addColorStop(1, 'rgba(101, 211, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,.12)';
  ctx.lineWidth = 2;
  for (let i = -640; i < 1200; i += 90) {
    ctx.beginPath();
    ctx.moveTo(i, 640);
    ctx.lineTo(i + 430, 0);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const createKey = (group, x, y, width, material, height = 0.105) => {
  const key = roundedBox(width, 0.38, height, 0.07, material);
  key.position.set(x, y, 0.29);
  key.castShadow = true;
  key.receiveShadow = true;
  group.add(key);
};

const createKeyboard = (group, keyMaterial, accentMaterial) => {
  // MacBook-style six-row layout. The positive Y edge is the user-facing edge.
  const rows = [
    { y: -1.83, widths: Array(14).fill(0.46), gap: 0.12 },
    { y: -1.25, widths: Array(14).fill(0.48), gap: 0.1 },
    { y: -0.66, widths: [0.72, ...Array(12).fill(0.48), 0.72], gap: 0.1 },
    { y: -0.07, widths: [0.86, ...Array(11).fill(0.48), 0.86], gap: 0.1 },
    { y: 0.52, widths: [1.02, ...Array(10).fill(0.48), 1.02], gap: 0.1 },
    { y: 1.11, widths: [0.62, 0.62, 0.62, 0.62, 2.78, 0.62, 0.62, 0.62], gap: 0.14 },
  ];
  rows.forEach((row) => {
    const total = row.widths.reduce((sum, width) => sum + width, 0) + row.gap * (row.widths.length - 1);
    let cursor = -total / 2;
    row.widths.forEach((width, index) => {
      createKey(group, cursor + width / 2, row.y, width, index === 4 && width > 2 ? accentMaterial : keyMaterial);
      cursor += width + row.gap;
    });
  });
};

const createSpeakerGrille = (group, x) => {
  const slotMaterial = new THREE.MeshStandardMaterial({ color: '#5a6068', metalness: 0.55, roughness: 0.52 });
  for (let i = 0; i < 12; i += 1) {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.24, 0.035), slotMaterial);
    slot.position.set(x, -0.45 + i * 0.34, 0.3);
    slot.rotation.z = Math.PI / 2;
    group.add(slot);
  }
};

const buildMacBook = () => {
  const root = new THREE.Group();
  const aluminum = new THREE.MeshPhysicalMaterial({ color: '#aeb4bc', metalness: 0.94, roughness: 0.2, clearcoat: 0.28, clearcoatRoughness: 0.18 });
  const edge = new THREE.MeshPhysicalMaterial({ color: '#737b86', metalness: 0.9, roughness: 0.24, clearcoat: 0.32 });
  const dark = new THREE.MeshStandardMaterial({ color: '#171b21', metalness: 0.38, roughness: 0.46 });
  const keyMaterial = new THREE.MeshPhysicalMaterial({ color: '#30353c', metalness: 0.2, roughness: 0.62, clearcoat: 0.2 });
  const accentKeyMaterial = new THREE.MeshPhysicalMaterial({ color: '#404750', metalness: 0.24, roughness: 0.56, clearcoat: 0.24 });
  // Keep a subtle glass reflection while letting the screen artwork remain visible.
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#b9d8ef',
    metalness: 0.05,
    roughness: 0.12,
    clearcoat: 0.8,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
  });
  const screenMaterial = new THREE.MeshBasicMaterial({ map: createScreenTexture(), toneMapped: false });
  screenMaterial.color.set('#d8efff');

  const base = roundedBox(10, 7, 0.38, 0.52, aluminum);
  base.position.z = 0;
  base.castShadow = true;
  base.receiveShadow = true;
  root.add(base);

  const deck = roundedBox(9.42, 5.75, 0.08, 0.32, aluminum);
  deck.position.z = 0.235;
  root.add(deck);
  const keyboardWell = roundedBox(8.78, 3.72, 0.045, 0.2, dark);
  keyboardWell.position.set(0, -0.4, 0.285);
  root.add(keyboardWell);
  createKeyboard(root, keyMaterial, accentKeyMaterial);
  createSpeakerGrille(root, -4.08);
  createSpeakerGrille(root, 4.08);

  const trackpad = roundedBox(4.1, 2.2, 0.045, 0.22, new THREE.MeshStandardMaterial({ color: '#b9bdc3', metalness: 0.35, roughness: 0.36 }));
  trackpad.position.set(0, 2.25, 0.27);
  root.add(trackpad);

  const trackpadHighlight = roundedBox(3.72, 1.84, 0.012, 0.18, new THREE.MeshPhysicalMaterial({ color: '#d4d8dd', metalness: 0.15, roughness: 0.26, transparent: true, opacity: 0.5 }));
  trackpadHighlight.position.set(0, 2.25, 0.305);
  root.add(trackpadHighlight);

  const hinge = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.34, 0.22), edge);
  hinge.position.set(0, -3.22, 0.32);
  root.add(hinge);

  const lid = new THREE.Group();
  lid.position.set(0, -3.1, 0.35);
  lid.rotation.x = -0.1;
  root.add(lid);

  const lidShell = new THREE.Mesh(new THREE.BoxGeometry(10, 0.34, 6.35), aluminum);
  lidShell.position.z = 3.17;
  lidShell.castShadow = true;
  lidShell.receiveShadow = true;
  lid.add(lidShell);

  const bezel = new THREE.Mesh(new THREE.BoxGeometry(9.42, 0.07, 5.78), dark);
  bezel.position.set(0, 0.2, 3.2);
  lid.add(bezel);

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(8.92, 5.24), screenMaterial);
  screen.rotation.x = -Math.PI / 2;
  screen.position.set(0, 0.25, 3.2);
  lid.add(screen);

  const glassLayer = new THREE.Mesh(new THREE.PlaneGeometry(9.1, 5.4), glass);
  glassLayer.rotation.x = -Math.PI / 2;
  glassLayer.position.set(0, 0.285, 3.2);
  lid.add(glassLayer);

  const camera = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), new THREE.MeshBasicMaterial({ color: '#0b0b0d' }));
  camera.position.set(0, 0.3, 5.85);
  lid.add(camera);

  const logo = new THREE.Mesh(new THREE.CircleGeometry(0.54, 40), new THREE.MeshBasicMaterial({ color: '#e3e6ea', transparent: true, opacity: 0.82 }));
  logo.rotation.x = Math.PI / 2;
  logo.position.set(0, -0.2, 3.25);
  lid.add(logo);

  root.scale.setScalar(0.92);
  // The mesh construction above uses Z as the local up axis. Convert once to
  // Three.js' Y-up world so the lid is vertical and the keyboard is horizontal.
  const modelSpace = new THREE.Group();
  modelSpace.rotation.x = -Math.PI / 2;
  modelSpace.add(root);
  return modelSpace;
};

export default function MacBookModel({ className = '', onReady }) {
  const mountRef = useRef(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(11.8, 15.8, 9.6);
    camera.lookAt(0, -0.15, 1.55);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-label', 'Interactive 3D MacBook Pro model');
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight('#ffffff', '#1a2030', 2.5));
    const keyLight = new THREE.DirectionalLight('#ffffff', 4.2);
    keyLight.position.set(5, 8, 14);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight('#5ad7ff', 7, 30, 2);
    rimLight.position.set(-7, -2, 8);
    scene.add(rimLight);

    const model = buildMacBook();
    scene.add(model);

    const state = { targetX: 0.08, targetY: 0.02, currentX: 0.08, currentY: 0.02, down: false, lastX: 0, lastY: 0 };
    const onPointerMove = (event) => {
      const rect = mount.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      if (state.down) {
        state.targetY += (event.clientX - state.lastX) * 0.006;
        state.targetX += (event.clientY - state.lastY) * 0.004;
      } else {
        state.targetY = 0.08 + x * 0.11;
        state.targetX = -0.18 + y * 0.07;
      }
      state.lastX = event.clientX;
      state.lastY = event.clientY;
    };
    const onPointerDown = (event) => {
      state.down = true;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      renderer.domElement.setPointerCapture?.(event.pointerId);
    };
    const onPointerUp = (event) => {
      state.down = false;
      renderer.domElement.releasePointerCapture?.(event.pointerId);
    };
    const onPointerLeave = () => { state.down = false; };
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();
    onReadyRef.current?.();

    let frame;
    const animate = (time) => {
      frame = requestAnimationFrame(animate);
      if (!state.down) state.targetY += Math.sin(time * 0.00035) * 0.00012;
      state.currentX += (state.targetX - state.currentX) * 0.055;
      state.currentY += (state.targetY - state.currentY) * 0.055;
      model.rotation.x = -0.18 + state.currentX;
      model.rotation.y = state.currentY;
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            material.map?.dispose();
            material.dispose();
          });
        }
      });
    };
  }, []);

  return <div ref={mountRef} className={`macbook-model ${className}`} />;
}
