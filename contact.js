// template/new.js
// --- Global Variables ---
let scene, camera, renderer, globe, stars;
let markers = []; // Stores { mesh, name, lat, lon, info, branchId, worldPos (Vector3 for label) }
let labels = [];  // Stores { element, markerData (reference to object in markers array) }

let autoRotate = true;
let targetRotation = { x: 0, y: 0 }; // For globe rotation
let focusedLocation = null; // { lat, lon, name, info } of the currently focused location
let zoomedIn = false;

// --- Camera Positions ---
const DEFAULT_CAMERA_POSITION = new THREE.Vector3(0, 0, 300); // Default Z distance
const ZOOM_DISTANCE = 180; // Distance from origin when zoomed to a location

// --- DOM Elements ---
const backButton = document.querySelector('.back-button');
const locationInfoDiv = document.querySelector('.location-info');
const locationNameP = locationInfoDiv ? locationInfoDiv.querySelector('.location-name') : null;
const locationCoordsP = locationInfoDiv ? locationInfoDiv.querySelector('.location-coords') : null;
const globeContainerElement = document.getElementById('globe-container');

// --- Location Data (from your HTML/previous JS) ---
const locations = [
  { coords: [16.5062, 80.6480], name: "Vijayawada, India", info: "Jhainsha Technologies, India Operations & Global Delivery Center.", branchId: "vijayawada" },
  { coords: [19.0760, 72.8777], name: "Mumbai, India", info: "Jhainsha Technologies, West India Business Hub.", branchId: "mumbai" },
  { coords: [22.3193, 114.1694], name: "Hong Kong", info: "Jhainsha Technologies, APAC Regional Office.", branchId: "hongkong" },
  { coords: [40.7128, -74.0060], name: "New York, USA", info: "Jhainsha Technologies, Americas Headquarters.", branchId: "newyork" },
  { coords: [0, 0], name: "Equator/Prime Meridian Test", info: "Diagnostic Point (0° Lat, 0° Lon)", branchId: "testpoint00" }
];

// --- Initialize Scene ---
document.addEventListener('DOMContentLoaded', () => {
  if (!globeContainerElement) {
    console.error("CRITICAL: The #globe-container element was not found. Globe cannot be initialized.");
    return;
  }
  init();
  animate();
  setupScrollDownButton(); 
  setupSmoothScrollForAnchors(); 
});

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, globeContainerElement.clientWidth / globeContainerElement.clientHeight, 0.1, 1000);
  camera.position.copy(DEFAULT_CAMERA_POSITION);
  camera.lookAt(scene.position); 

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(globeContainerElement.clientWidth, globeContainerElement.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  globeContainerElement.appendChild(renderer.domElement);

  createEarth();
  createStars();
  addLocationMarkers();
  createLabels();

  window.addEventListener('resize', onWindowResize, false);
  setupLocationButtons();

  if (backButton) backButton.addEventListener('click', resetView);
}

function createEarth() {
  const textureLoader = new THREE.TextureLoader();
  const earthTexture = textureLoader.load('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg');
  const bumpMap = textureLoader.load('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png');
  
  const globeGeometry = new THREE.SphereGeometry(100, 64, 64); 
  const globeMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    bumpMap: bumpMap,
    bumpScale: 1.0, 
    shininess: 5 
  });

  globe = new THREE.Mesh(globeGeometry, globeMaterial);
  scene.add(globe);

  const ambientLight = new THREE.AmbientLight(0x606060); 
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); 
  directionalLight.position.set(5, 3, 5); 
  scene.add(directionalLight);
}

function createStars() {
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, sizeAttenuation: true });
  const starsVertices = [];
  for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starsVertices.push(x, y, z);
  }
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
  stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
}

function latLongToVector3(lat, lon, radius) {
  const latRad = lat * Math.PI / 180;
  const lonRad = lon * Math.PI / 180;
  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);
  const z = -radius * Math.cos(latRad) * Math.sin(lonRad);
  return new THREE.Vector3(x, y, z);
}

function addLocationMarkers() {
  const markerGeometry = new THREE.SphereGeometry(1.5, 16, 16); 
  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff3333 }); 

  markers = []; 
  locations.forEach(location => {
    const position = latLongToVector3(location.coords[0], location.coords[1], 100 + 1); 
    const markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);
    markerMesh.position.copy(position);
    globe.add(markerMesh); 

    const markerData = {
      mesh: markerMesh,
      name: location.name,
      lat: location.coords[0],
      lon: location.coords[1],
      info: location.info || "No additional information available.",
      branchId: location.branchId,
      worldPosition: new THREE.Vector3() 
    };
    markers.push(markerData);

    const glowGeometry = new THREE.SphereGeometry(3, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff3333, transparent: true, opacity: 0.5
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.copy(position);
    globe.add(glow);
  });
}

function createLabels() {
  labels.forEach(l => { if (l.element && l.element.parentNode) l.element.parentNode.removeChild(l.element); });
  labels = [];
  const labelContainer = document.getElementById('globe-section-wrapper'); 
  markers.forEach(markerData => {
    const labelDiv = document.createElement('div');
    labelDiv.className = 'label';
    labelDiv.textContent = markerData.name;
    labelDiv.style.display = 'none';
    if (labelContainer) {
      labelContainer.appendChild(labelDiv);
    } else {
      document.body.appendChild(labelDiv); 
    }
    labels.push({
      element: labelDiv,
      markerData: markerData 
    });
  });
}

function isFrontSide(object) {
  const worldPos = new THREE.Vector3();
  object.getWorldPosition(worldPos);
  const globeCenter = new THREE.Vector3(); 
  globe.getWorldPosition(globeCenter);     
  const cameraToGlobeCenter = globeCenter.clone().sub(camera.position);
  const globeCenterToMarker = worldPos.clone().sub(globeCenter);
  const dot = cameraToGlobeCenter.normalize().dot(globeCenterToMarker.normalize());
  return dot < -0.1; 
}

function updateLabels() {
  if (!camera || !globeContainerElement || !renderer) return;
  const viewportRect = globeContainerElement.getBoundingClientRect();
  labels.forEach(labelObj => {
    if (!labelObj.markerData || !labelObj.markerData.mesh || !labelObj.element) return;
    const markerMesh = labelObj.markerData.mesh;
    markerMesh.getWorldPosition(labelObj.markerData.worldPosition);
    const screenPosition = labelObj.markerData.worldPosition.clone().project(camera);
    const isCandidate = screenPosition.z < 1;
    let showThisLabel = false;
    if (isCandidate && isFrontSide(markerMesh)) {
        showThisLabel = true;
    }
    if (showThisLabel) {
      const x = (screenPosition.x * 0.5 + 0.5) * viewportRect.width + viewportRect.left;
      const y = (-screenPosition.y * 0.5 + 0.5) * viewportRect.height + viewportRect.top;
      labelObj.element.style.left = `${x}px`;
      labelObj.element.style.top = `${y}px`;
      labelObj.element.style.display = 'block';
    } else {
      labelObj.element.style.display = 'none';
    }
  });
}

function setupLocationButtons() {
  document.querySelectorAll('.location-button').forEach(button => {
    button.addEventListener('click', () => {
      const lat = parseFloat(button.dataset.lat);
      const lon = parseFloat(button.dataset.lon);
      const locData = locations.find(l => l.coords[0] === lat && l.coords[1] === lon);
      if (locData) {
        zoomToLocation(locData); 
      } else {
        zoomToLocation({ coords: [lat, lon], name: "Selected Location", info: "" });
      }
    });
  });
}

function zoomToLocation(locationData) { 
  if (!locationData || !locationData.coords) return;
  const lat = locationData.coords[0];
  const lon = locationData.coords[1];
  const latRad = lat * Math.PI / 180;
  const lonRad = lon * Math.PI / 180;
  autoRotate = false;
  zoomedIn = true;
  focusedLocation = locationData; 
  targetRotation.x = (Math.PI / 2) - latRad;
  targetRotation.y = lonRad;
  if (backButton) backButton.style.display = 'block';
  if (locationInfoDiv) {
    locationInfoDiv.style.display = 'block';
    if (locationNameP) locationNameP.textContent = `Name: ${locationData.name}`;
    if (locationCoordsP) locationCoordsP.textContent = `Coordinates: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
    const existingInfoContent = locationInfoDiv.querySelector('.location-info-content');
    if (existingInfoContent) existingInfoContent.remove();
    if (locationData.info) {
        const infoP = document.createElement('p');
        infoP.className = 'location-info-content';
        infoP.textContent = `Info: ${locationData.info}`;
        locationInfoDiv.appendChild(infoP);
    }
  }
}

function resetView() {
  zoomedIn = false;
  autoRotate = true;
  focusedLocation = null;
  if (backButton) backButton.style.display = 'none';
  if (locationInfoDiv) locationInfoDiv.style.display = 'none';
}

function onWindowResize() {
  if (globeContainerElement && camera && renderer) {
    const width = globeContainerElement.clientWidth;
    const height = globeContainerElement.clientHeight;
    if (width > 0 && height > 0) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (!globe || !scene || !camera || !renderer) return; 
  const lerpFactor = 0.05; 
  if (focusedLocation && zoomedIn) {
    globe.rotation.x += (targetRotation.x - globe.rotation.x) * lerpFactor;
    globe.rotation.y += (targetRotation.y - globe.rotation.y) * lerpFactor;
    const markerData = markers.find(m => m.lat === focusedLocation.coords[0] && m.lon === focusedLocation.coords[1]);
    if (markerData && markerData.mesh) {
      const markerWorldPosition = new THREE.Vector3();
      markerData.mesh.getWorldPosition(markerWorldPosition); 
      const direction = markerWorldPosition.clone().normalize();
      const targetCameraPos = direction.multiplyScalar(ZOOM_DISTANCE);
      camera.position.lerp(targetCameraPos, lerpFactor);
    }
     camera.lookAt(globe.position); 
  } else { 
    if (autoRotate) {
      globe.rotation.y += 0.001; 
      globe.rotation.x += (0 - globe.rotation.x) * lerpFactor * 0.5;
    }
    camera.position.lerp(DEFAULT_CAMERA_POSITION, lerpFactor);
    camera.lookAt(globe.position); 
  }
  updateLabels();
  renderer.render(scene, camera);
}

function setupScrollDownButton() {
  const scrollButton = document.querySelector('.scroll-down-button');
  if (scrollButton) {
    scrollButton.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

function setupSmoothScrollForAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    if (anchor.classList.contains('scroll-down-button')) return; // Already handled
    // Exclude dropdown toggles if they are also <a> tags
    if (anchor.classList.contains('dropbtn')) return; 

    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href.length <= 1) return;
      try {
        const targetElement = document.querySelector(href);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (error) {
        console.warn("Smooth scroll target not found or invalid:", href, error);
      }
    });
  });
}