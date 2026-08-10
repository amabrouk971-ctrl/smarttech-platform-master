import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Interactive3DHeroCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene, Camera, Renderer
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 10);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL initialization failed, fallback active:', e);
      return;
    }

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xef4444, 2, 50); // Red accent light
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 2, 50); // Blue tech light
    blueLight.position.set(-5, -5, 5);
    scene.add(blueLight);

    // 3. 3D Floating Geometry Elements
    const group = new THREE.Group();
    scene.add(group);

    // Main Tech Cube / Core Engine
    const coreGeo = new THREE.IcosahedronGeometry(1.8, 1);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0xd97706,
      wireframe: true,
      emissive: 0xd97706,
      emissiveIntensity: 0.2
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // Outer Orbit Ring 1 (AI Network Node)
    const ringGeo1 = new THREE.TorusGeometry(3.2, 0.05, 16, 100);
    const ringMat1 = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.8 });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.rotation.x = Math.PI / 3;
    group.add(ringMesh1);

    // Outer Orbit Ring 2 (Robotics Node)
    const ringGeo2 = new THREE.TorusGeometry(4.2, 0.04, 16, 100);
    const ringMat2 = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3, metalness: 0.7 });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.y = Math.PI / 4;
    group.add(ringMesh2);

    // Small Floating Tech Cubes around orbit
    const cubes: THREE.Mesh[] = [];
    const cubeGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const cubeMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.1 });

    for (let i = 0; i < 8; i++) {
      const cube = new THREE.Mesh(cubeGeo, cubeMat);
      const angle = (i / 8) * Math.PI * 2;
      cube.position.set(Math.cos(angle) * 3.8, Math.sin(angle) * 3.8, (Math.random() - 0.5) * 2);
      group.add(cube);
      cubes.push(cube);
    }

    // Background Particle Starfield
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 25;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.06,
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Mouse Move & Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      mouseX = x * 0.002;
      mouseY = y * 0.002;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 5. Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        // Continuous gentle rotation
        coreMesh.rotation.x += 0.005;
        coreMesh.rotation.y += 0.008;

        ringMesh1.rotation.z += 0.006;
        ringMesh2.rotation.z -= 0.004;

        cubes.forEach((c, idx) => {
          c.rotation.x += 0.02;
          c.rotation.y += 0.02;
        });

        particles.rotation.y += 0.0005;
      }

      // Parallax smooth interpolation
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      group.rotation.y = targetX * 1.5;
      group.rotation.x = targetY * 1.5;

      renderer.render(scene, camera);
    };

    animate();

    // 6. Handle Container Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 600;
      const newH = container.clientHeight || 500;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[450px] lg:h-[550px] flex items-center justify-center pointer-events-auto">
      <div ref={mountRef} className="w-full h-full relative cursor-grab active:cursor-grabbing" />
      {/* Decorative ambient backdrop overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};
