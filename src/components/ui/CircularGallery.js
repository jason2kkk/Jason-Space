import { useEffect, useRef } from "react";
import {
  Renderer,
  Camera,
  Transform,
  Plane,
  Mesh,
  Program,
  Texture,
} from "ogl";

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform float uAlpha;
  varying vec2 vUv;
  void main() {
    vec4 color = texture2D(tMap, vUv);
    gl_FragColor = vec4(color.rgb, color.a * uAlpha);
  }
`;

class CircularGalleryGL {
  constructor(container, items, options = {}) {
    this.container = container;
    this.items = items;
    this.options = {
      bend: options.bend || 1,
      borderRadius: options.borderRadius || 0.05,
      scrollSpeed: options.scrollSpeed || 2,
      scrollEase: options.scrollEase || 0.05,
      textColor: options.textColor || "#ffffff",
      ...options,
    };

    this.scroll = {
      current: 0,
      target: 0,
      ease: this.options.scrollEase,
    };

    this.meshes = [];
    this.init();
  }

  init() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
    });
    this.gl = this.renderer.gl;
    this.container.appendChild(this.gl.canvas);

    this.camera = new Camera(this.gl, { fov: 45 });
    this.camera.position.z = 5;

    this.scene = new Transform();

    this.resize();
    this.addItems();
    this.addEvents();
    this.animate();
  }

  addItems() {
    const geometry = new Plane(this.gl, {
      width: 1.5,
      height: 1,
      widthSegments: 20,
      heightSegments: 20,
    });

    this.items.forEach((item, index) => {
      const texture = new Texture(this.gl);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = item.image;
      img.onload = () => {
        texture.image = img;
      };

      const program = new Program(this.gl, {
        vertex,
        fragment,
        uniforms: {
          tMap: { value: texture },
          uAlpha: { value: 1 },
        },
        transparent: true,
      });

      const mesh = new Mesh(this.gl, { geometry, program });
      mesh.index = index;
      mesh.setParent(this.scene);
      this.meshes.push(mesh);
    });

    this.updatePositions();
  }

  updatePositions() {
    const total = this.meshes.length;
    const radius = 3;

    this.meshes.forEach((mesh, index) => {
      const angle =
        (index / total) * Math.PI * 2 + this.scroll.current * 0.01;
      mesh.position.x = Math.sin(angle) * radius;
      mesh.position.z = Math.cos(angle) * radius - radius;
      mesh.rotation.y = -angle;

      // Bend effect
      const bend = this.options.bend * 0.1;
      mesh.position.y = Math.sin(angle * 2) * bend;
    });
  }

  addEvents() {
    this.onWheel = this.onWheel.bind(this);
    this.onResize = debounce(this.resize.bind(this), 100);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);

    window.addEventListener("wheel", this.onWheel, { passive: true });
    window.addEventListener("resize", this.onResize);
    this.container.addEventListener("touchstart", this.onTouchStart);
    this.container.addEventListener("touchmove", this.onTouchMove);
  }

  onWheel(e) {
    this.scroll.target += e.deltaY * this.options.scrollSpeed * 0.01;
  }

  onTouchStart(e) {
    this.touchStart = e.touches[0].clientY;
  }

  onTouchMove(e) {
    const delta = this.touchStart - e.touches[0].clientY;
    this.scroll.target += delta * this.options.scrollSpeed * 0.01;
    this.touchStart = e.touches[0].clientY;
  }

  resize() {
    const { width, height } = this.container.getBoundingClientRect();
    this.renderer.setSize(width, height);
    this.camera.perspective({ aspect: width / height });
  }

  animate() {
    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );

    this.updatePositions();
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.raf = requestAnimationFrame(this.animate.bind(this));
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("resize", this.onResize);
    this.container.removeEventListener("touchstart", this.onTouchStart);
    this.container.removeEventListener("touchmove", this.onTouchMove);
    this.gl.canvas.remove();
  }
}

export default function CircularGallery({
  items = [],
  bend = 1,
  textColor = "#ffffff",
  borderRadius = 0.05,
  scrollSpeed = 2,
  scrollEase = 0.05,
}) {
  const containerRef = useRef(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || items.length === 0) return;

    galleryRef.current = new CircularGalleryGL(containerRef.current, items, {
      bend,
      textColor,
      borderRadius,
      scrollSpeed,
      scrollEase,
    });

    return () => {
      if (galleryRef.current) {
        galleryRef.current.destroy();
      }
    };
  }, [items, bend, textColor, borderRadius, scrollSpeed, scrollEase]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
}
