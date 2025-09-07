// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize loader
    const loader = document.getElementById('loader');
    
    // Simulate loading time
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            // Start initial animations after the loader is gone
            startInitialAnimations();
        }, 800);
    }, 1500);
    
    // Initialize AOS (Animate on Scroll)
    AOS.init({
        duration: 1000,
        once: false,
        mirror: true
    });
    
    // Navigation toggle functionality
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking a nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Sticky navbar on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Show back to top button
        const backToTopBtn = document.getElementById('backToTop');
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
        
        // Parallax effect for sections
        applyParallaxEffect();
    });
    
    // Back to top button click event
    document.getElementById('backToTop').addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Initialize statistics counter animation
    initCounterAnimation();
    
    // Initialize 3D Globe
    initGlobe();
    
    // Create particles for background
    createParticles();
    
    // Animate service cards on hover
    animateServiceCards();
    
    // Add 3D tilt effect to cards
    initTiltEffect();
    
    // Add ripple effect to buttons
    initRippleEffect();
    
    // Add scroll indicator functionality
    document.querySelector('.scroll-indicator').addEventListener('click', () => {
        document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Add active state to navigation based on scroll position
    window.addEventListener('scroll', () => {
        updateActiveNavLink();
    });
});

// Start initial animations
function startInitialAnimations() {
    // Apply typing effect to hero text
    const heroTitle = document.querySelector('.hero-text h1');
    heroTitle.classList.add('gradient-text');
    
    // Add glow effect to important elements
    document.querySelectorAll('.feature-icon, .service-icon, .info-icon').forEach(element => {
        element.classList.add('glow');
    });
    
    // Add pulse animation to CTA buttons
    document.querySelector('.btn-primary').classList.add('pulsing-btn');
    
    // Add floating animation to hero media
    document.querySelector('.hero-media').style.animation = 'floatAnimation 6s ease-in-out infinite';
}

// Initialize counter animation
function initCounterAnimation() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200;
    
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const increment = target / speed;
            
            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCount, 1);
            } else {
                counter.innerText = target;
            }
        };
        
        // Start counting when element is in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCount();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

// Initialize 3D Globe
function initGlobe() {
    // Create a scene
    const scene = new THREE.Scene();
    
    // Create a camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2;
    
    // Create a WebGL renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    // Add the renderer to the DOM
    const globeContainer = document.getElementById('globe-map');
    globeContainer.appendChild(renderer.domElement);
    
    // Create a sphere geometry for the globe
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Create texture loader
    const textureLoader = new THREE.TextureLoader();
    
    // Create materials
    const material = new THREE.MeshPhongMaterial({
        map: textureLoader.load('/api/placeholder/1024/512'),
        bumpMap: textureLoader.load('/api/placeholder/1024/512'),
        bumpScale: 0.05,
        specularMap: textureLoader.load('/api/placeholder/1024/512'),
        specular: new THREE.Color(0x333333),
        shininess: 5,
        transparent: true,
        opacity: 0.9
    });
    
    // Create a mesh (the globe)
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    
    // Create a light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x3f51b5, 1);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);
    
    // Create markers for office locations
    const locations = [
        { lat: 16.5062, lng: 80.6480, name: "Vijayawada" },  // Vijayawada
        { lat: 19.0760, lng: 72.8777, name: "Mumbai" },      // Mumbai
        { lat: 22.3193, lng: 114.1694, name: "Hong Kong" },  // Hong Kong
        { lat: 40.7128, lng: -74.0060, name: "New York" }    // New York
    ];
    
    // Add location markers
    locations.forEach(location => {
        // Convert latitude and longitude to 3D coordinates
        const phi = (90 - location.lat) * (Math.PI / 180);
        const theta = (location.lng + 180) * (Math.PI / 180);
        
        const x = -1.02 * Math.sin(phi) * Math.cos(theta);
        const y = 1.02 * Math.cos(phi);
        const z = 1.02 * Math.sin(phi) * Math.sin(theta);
        
        // Create the marker
        const markerGeometry = new THREE.SphereGeometry(0.03, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff4081 });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        
        marker.position.set(x, y, z);
        scene.add(marker);
        
        // Create a pulsing halo effect for each marker
        const pulseGeometry = new THREE.SphereGeometry(0.04, 16, 16);
        const pulseMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff4081,
            transparent: true,
            opacity: 0.4
        });
        
        const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
        pulse.position.set(x, y, z);
        pulse.scale.set(1, 1, 1);
        pulse.userData = { originalScale: { x: 1, y: 1, z: 1 } };
        scene.add(pulse);
        
        // Add this pulse to an array to animate later
        if (!window.pulses) window.pulses = [];
        window.pulses.push(pulse);
    });
    
    // Add atmosphere glow
    const glowGeometry = new THREE.SphereGeometry(1.01, 64, 64);
    const glowMaterial = new THREE.MeshPhongMaterial({ 
        map: textureLoader.load('/api/placeholder/1024/512'),
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.3
    });
    
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);
    
    // Add particle ring
    const ringGeometry = new THREE.RingGeometry(1.5, 1.8, 64);
    const ringMaterial = new THREE.PointsMaterial({
        color: 0x00bcd4,
        size: 0.05,
        transparent: true,
        opacity: 0.4
    });
    
    const ring = new THREE.Points(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);
        
        // Rotate the globe
        globe.rotation.y += 0.002;
        glowMesh.rotation.y += 0.002;
        ring.rotation.z += 0.001;
        
        // Animate the pulses
        if (window.pulses) {
            window.pulses.forEach((pulse, index) => {
                pulse.scale.x = pulse.userData.originalScale.x + 0.5 * Math.sin(Date.now() * 0.003 + index * 0.5);
                pulse.scale.y = pulse.userData.originalScale.y + 0.5 * Math.sin(Date.now() * 0.003 + index * 0.5);
                pulse.scale.z = pulse.userData.originalScale.z + 0.5 * Math.sin(Date.now() * 0.003 + index * 0.5);
                
                pulse.material.opacity = 0.4 - 0.2 * Math.sin(Date.now() * 0.003 + index * 0.5);
            });
        }
        
        renderer.render(scene, camera);
    };
    
    animate();
}

// Create background particles
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    document.querySelector('#hero').appendChild(particlesContainer);
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        // Random size
        const size = Math.random() * 5 + 1;
        
        // Random opacity
        const opacity = Math.random() * 0.5 + 0.3;
        
        // Set particle styles
        particle.style.top = `${posY}%`;
        particle.style.left = `${posX}%`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.opacity = opacity;
        
        // Add animation
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.animation = `floatAnimation ${duration}s infinite ${delay}s`;
        
        particlesContainer.appendChild(particle);
    }
}

// Apply parallax effect to sections
function applyParallaxEffect() {
    const scrollY = window.scrollY;
    
    // Apply parallax to hero section
    const heroSection = document.getElementById('hero');
    heroSection.style.backgroundPositionY = `${scrollY * 0.5}px`;
    
    // Apply parallax to floating shapes
    document.querySelectorAll('.floating-shape').forEach(shape => {
        const speed = shape.classList.contains('shape-1') ? 0.2 : 
                      shape.classList.contains('shape-2') ? 0.1 : 0.15;
        const yPos = -scrollY * speed;
        shape.style.transform = `translateY(${yPos}px)`;
    });
}

// Animate service cards
function animateServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.querySelector('.service-icon').style.animation = 'pulse 1.5s infinite';
        });
        
        card.addEventListener('mouseleave', () => {
            card.querySelector('.service-icon').style.animation = '';
        });
    });
}

// Initialize 3D tilt effect on cards
function initTiltEffect() {
    const cards = document.querySelectorAll('.branch-card, .media-box, .info-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', tiltCard);
        card.addEventListener('mouseleave', resetTilt);
    });
    
    function tiltCard(e) {
        const card = this;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const tiltX = (centerY - y) / 10;
        const tiltY = (x - centerX) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.05, 1.05, 1.05)`;
        
        // Add highlight effect
        const intensity = 255;
        card.style.background = `
            linear-gradient(
                ${Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 90}deg,
                rgba(255, 255, 255, 0) 0%,
                rgba(255, 255, 255, 0.2) 50%,
                rgba(255, 255, 255, 0) 100%
            )
        `;
    }
    
    function resetTilt() {
        this.style.transform = '';
        this.style.background = '';
    }
}

// Initialize ripple effect for buttons
function initRippleEffect() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.classList.add('ripple');
        
        button.addEventListener('click', createRipple);
    });
    
    function createRipple(e) {
        const button = this;
        
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - button.getBoundingClientRect().left - diameter / 2}px`;
        circle.style.top = `${e.clientY - button.getBoundingClientRect().top - diameter / 2}px`;
        circle.classList.add('ripple-circle');
        
        const rippleCircle = button.querySelector('.ripple-circle');
        if (rippleCircle) {
            rippleCircle.remove();
        }
        
        button.appendChild(circle);
        
        // Remove the circle after animation
        setTimeout(() => {
            circle.remove();
        }, 600);
    }
}

// Update active navigation link based on scroll position
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Add CSS rule for ripple circle animation
const style = document.createElement('style');
style.textContent = `
    .ripple-circle {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .pulsing-btn {
        animation: pulse 2s infinite;
    }
`;
document.head.appendChild(style);