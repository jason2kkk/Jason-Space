import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const MODEL_URL = '/models/Mac.glb';
const BODY_BEIGE = new THREE.Color('#d4c4ae');

const restoreBlenderLook = (material) => {
  if (!material) return;
  const name = material.name || '';
  material.metalness = 0;
  material.envMapIntensity = 0.2;
  if (name === 'Material #0' || name === 'Material #1') {
    material.color.copy(BODY_BEIGE);
    material.roughness = 0.64;
  }
  if (name === 'Material #3') {
    material.color.set('#111111');
    material.emissive?.set('#000000');
    material.roughness = 0.48;
  }
  if (name === 'Material #10') {
    material.color.set('#b7aa97');
    material.roughness = 0.58;
  }
  material.needsUpdate = true;
};

const fitModel = (object) => {
  object.position.set(0, 0, 0);
  object.scale.setScalar(1);
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const longest = Math.max(size.x, size.y, size.z, 0.001);
  const scale = 3.4 / longest;
  object.scale.setScalar(scale);
  object.position.copy(center).multiplyScalar(-scale);
  const fitted = new THREE.Box3().setFromObject(object);
  object.position.y -= fitted.min.y;
  return new THREE.Box3().setFromObject(object);
};

export default function ClassicMacModel({ className = '' }) {
  const mountRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b0d10');

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
    camera.position.set(2.8, 2.2, 4.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-label', 'Interactive classic Macintosh model');
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    mount.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.28;
    scene.add(new THREE.AmbientLight('#fff4e8', 0.22));
    scene.add(new THREE.HemisphereLight('#fff6ea', '#2a241c', 0.55));
    const key = new THREE.DirectionalLight('#fff5ea', 1.05);
    key.position.set(4.2, 6.4, 5.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const fill = new THREE.DirectionalLight('#c9d7e8', 0.35);
    fill.position.set(-4.5, 2.2, 2.4);
    scene.add(fill);
    const rim = new THREE.PointLight('#ffd9a8', 2.2, 18, 2);
    rim.position.set(-2.4, 1.8, -3.2);
    scene.add(rim);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(6, 48),
      new THREE.ShadowMaterial({ opacity: 0.28 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.2;
    controls.maxDistance = 9;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.target.set(0, 1.15, 0);

    let frame;

    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) => {
              if (!material) return;
              if (material.map) material.map.colorSpace = THREE.SRGBColorSpace;
              restoreBlenderLook(material);
            });
          }
        });
        const fitted = fitModel(model);
        scene.add(model);
        const mid = fitted.getCenter(new THREE.Vector3());
        const size = fitted.getSize(new THREE.Vector3());
        const radius = Math.max(size.x, size.y, size.z) * 2.05;
        camera.position.set(mid.x + radius * 0.55, mid.y + radius * 0.38, mid.z + radius * 0.82);
        controls.target.copy(mid);
        controls.update();
        setStatus('ready');
      },
      undefined,
      (err) => {
        setStatus('error');
        setError(err?.message || 'Failed to load Mac.glb');
      },
    );

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

    const animate = () => {
      frame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
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
            material.dispose();
          });
        }
      });
    };
  }, []);

  return (
    <div className={`classic-mac-model ${className}`} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      {status === 'loading' && (
        <p className="classic-mac-model__status">Loading Mac.glb…</p>
      )}
      {status === 'error' && (
        <p className="classic-mac-model__status classic-mac-model__status--error">{error}</p>
      )}
    </div>
  );
}
