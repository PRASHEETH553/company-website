// Three.js MES-Related Background Animation
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas'), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Add fog for depth
scene.fog = new THREE.FogExp2(0x18253c, 0.008);

// Particle texture for data streams
function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(96, 165, 250, 1)');
  gradient.addColorStop(0.5, 'rgba(96, 165, 250, 0.5)');
  gradient.addColorStop(1, 'rgba(96, 165, 250, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(canvas);
}

// Data Stream Particles
const particleCount = 1500;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleVelocities = new Float32Array(particleCount * 3);
const particleOpacities = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 200;
  particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 200;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
  particleVelocities[i * 3] = (Math.random() - 0.5) * 0.05;
  particleVelocities[i * 3 + 1] = Math.random() * 0.1 + 0.05;
  particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
  particleOpacities[i] = Math.random() * 0.5 + 0.5;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeometry.setAttribute('opacity', new THREE.BufferAttribute(particleOpacities, 1));

const particleMaterial = new THREE.PointsMaterial({
  size: 1.2,
  map: createParticleTexture(),
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// MES Module Nodes
const nodeGeometry = new THREE.SphereGeometry(0.8, 16, 16);
const nodeCount = 12;
const nodes = [];
const nodeGlows = [];

for (let i = 0; i < nodeCount; i++) {
  const nodeMaterial = new THREE.MeshBasicMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.8
  });
  const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
  node.position.set(
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100
  );
  node.scale.setScalar(Math.random() * 1.0 + 0.5);
  scene.add(node);
  nodes.push(node);

  // Glow effect
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 16), glowMaterial);
  glow.position.copy(node.position);
  glow.scale.copy(node.scale).multiplyScalar(1.8);
  scene.add(glow);
  nodeGlows.push(glow);
}

// Connection Lines Between Nodes
const lineMaterial = new THREE.LineBasicMaterial({
  color: 0x60a5fa,
  transparent: true,
  opacity: 0.2,
  blending: THREE.AdditiveBlending
});
const lines = [];
for (let i = 0; i < nodeCount; i++) {
  for (let j = i + 1; j < nodeCount; j++) {
    if (Math.random() > 0.6) {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        nodes[i].position,
        nodes[j].position
      ]);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
      lines.push(line);
    }
  }
}

// Industrial Grid Background
const gridGeometry = new THREE.BufferGeometry();
const gridVertices = [];
const gridSize = 200;
const gridStep = 20;
for (let x = -gridSize; x <= gridSize; x += gridStep) {
  gridVertices.push(x, -gridSize, -100);
  gridVertices.push(x, gridSize, -100);
  gridVertices.push(-gridSize, x, -100);
  gridVertices.push(gridSize, x, -100);
}
gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridVertices, 3));
const gridMaterial = new THREE.LineBasicMaterial({
  color: 0x60a5fa,
  transparent: true,
  opacity: 0.1
});
const grid = new THREE.LineSegments(gridGeometry, gridMaterial);
scene.add(grid);

// Ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Camera position
camera.position.z = 50;

// Mouse interaction
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Scroll interaction
let scrollY = 0;
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
});

// Link nodes to cards
const cards = document.querySelectorAll('.card');
cards.forEach((card, index) => {
  card.addEventListener('mouseenter', () => {
    if (nodes[index]) {
      nodes[index].scale.setScalar(1.5);
      nodeGlows[index].material.opacity = 0.6;
    }
  });
  card.addEventListener('mouseleave', () => {
    if (nodes[index]) {
      nodes[index].scale.setScalar(1.0);
      nodeGlows[index].material.opacity = 0.3;
    }
  });

  // Initial visibility animation
  setTimeout(() => {
    card.classList.add('visible');
  }, index * 400);

  // 3D Tilt Effect
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = (y - centerY) / centerY * 15;
    const tiltY = (centerX - x) / centerX * 15;

    card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.05)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
  });
});

function animateBackground() {
  requestAnimationFrame(animateBackground);

  // Animate particles (data streams)
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] += particleVelocities[i * 3];
    particlePositions[i * 3 + 1] += particleVelocities[i * 3 + 1];
    particlePositions[i * 3 + 2] += particleVelocities[i * 3 + 2];
    if (particlePositions[i * 3 + 1] > 100) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 200;
      particlePositions[i * 3 + 1] = -100;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    particleOpacities[i] = Math.sin(Date.now() * 0.002 + i) * 0.3 + 0.7;
  }
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute('opacity', new THREE.BufferAttribute(particleOpacities, 1));

  // Animate nodes (MES modules)
  nodes.forEach((node, i) => {
    node.position.y += Math.sin(Date.now() * 0.002 + i) * 0.01;
    nodeGlows[i].position.copy(node.position);
  });

  // Update connection lines
  lines.forEach((line, i) => {
    const index1 = Math.floor(i / nodeCount);
    const index2 = i % nodeCount;
    if (nodes[index1] && nodes[index2]) {
      line.geometry.setFromPoints([nodes[index1].position, nodes[index2].position]);
    }
  });

  // Animate grid
  grid.rotation.y += 0.0005;

  // Camera movement
  camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
  camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
  camera.position.z = 50 + scrollY * 0.02;

  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}
animateBackground();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 100) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Fade-in animation for elements
document.addEventListener('DOMContentLoaded', function() {
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1
  });

  const fadeElements = document.querySelectorAll('.card, .demo-section p, .demo-section a');
  fadeElements.forEach(el => fadeObserver.observe(el));
});