/**
 * 3D Canvas Module
 * Handles Three.js visualization
 */

/**
 * Initialize the 3D scene
 */
function init3D() {
    const container = Elements.canvas3d;
    const rect = container.getBoundingClientRect();
    
    // Create scene
    ThreeState.scene = new THREE.Scene();
    ThreeState.scene.background = new THREE.Color(0x0a0a15);
    
    // Create camera
    ThreeState.camera = new THREE.PerspectiveCamera(
        60, 
        rect.width / rect.height, 
        0.1, 
        1000
    );
    updateCameraPosition();
    
    // Create renderer
    ThreeState.renderer = new THREE.WebGLRenderer({ antialias: true });
    ThreeState.renderer.setSize(rect.width, rect.height);
    ThreeState.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(ThreeState.renderer.domElement);
    
    // Add lights
    addLights();
    
    // Add helpers
    addHelpers();
    
    // Create projector mesh
    createProjectorMesh();
    
    // Create cone and screen
    createCone();
    createScreen();
    
    // Setup mouse/touch controls
    setup3DControls();
    
    // Start animation loop
    animate();
}

/**
 * Add lights to the scene
 */
function addLights() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    ThreeState.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    ThreeState.scene.add(directionalLight);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-5, 5, -5);
    ThreeState.scene.add(directionalLight2);
}

/**
 * Add grid and axes helpers
 */
function addHelpers() {
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    ThreeState.scene.add(gridHelper);
    
    const axesHelper = new THREE.AxesHelper(2);
    ThreeState.scene.add(axesHelper);
}

/**
 * Create the projector mesh
 */
function createProjectorMesh() {
    // Projector body
    const projectorGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.4);
    const projectorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x00d9ff,
        shininess: 100
    });
    ThreeState.projectorMesh = new THREE.Mesh(projectorGeometry, projectorMaterial);
    ThreeState.projectorMesh.position.set(0, 0.15, 0);
    ThreeState.scene.add(ThreeState.projectorMesh);
    
    // Lens
    const lensGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.08, 16);
    const lensMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x333333,
        shininess: 150
    });
    ThreeState.lensMesh = new THREE.Mesh(lensGeometry, lensMaterial);
    ThreeState.lensMesh.rotation.z = Math.PI / 2;
    ThreeState.lensMesh.position.set(0.29, 0.15, 0);
    ThreeState.scene.add(ThreeState.lensMesh);
}

/**
 * Create or update the projection cone
 */
function createCone() {
    // Remove existing cone
    if (ThreeState.projectorCone) {
        ThreeState.scene.remove(ThreeState.projectorCone);
        ThreeState.projectorCone.geometry.dispose();
        ThreeState.projectorCone.material.dispose();
    }
    if (ThreeState.projectorConeWireframe) {
        ThreeState.scene.remove(ThreeState.projectorConeWireframe);
        ThreeState.projectorConeWireframe.geometry.dispose();
        ThreeState.projectorConeWireframe.material.dispose();
    }
    
    // Calculate dimensions
    const throwRatio = AppState.mode === 'ratio-to-fov' 
        ? AppState.throwRatio 
        : hFovToThrowRatio(AppState.hFov);
    const screenWidth = AppState.distance / throwRatio;
    const screenHeight = screenWidth * (AppState.aspectHeight / AppState.aspectWidth);
    const halfWidth = screenWidth / 2;
    const halfHeight = screenHeight / 2;
    
    // Create cone geometry
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        // Apex
        0.3, 0.15, 0,
        // Base corners
        AppState.distance, halfHeight, halfWidth,
        AppState.distance, halfHeight, -halfWidth,
        AppState.distance, -halfHeight, -halfWidth,
        AppState.distance, -halfHeight, halfWidth
    ]);
    
    const indices = [
        0, 1, 2,
        0, 2, 3,
        0, 3, 4,
        0, 4, 1
    ];
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    // Cone material
    const material = new THREE.MeshPhongMaterial({
        color: 0x00d9ff,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide
    });
    
    ThreeState.projectorCone = new THREE.Mesh(geometry, material);
    ThreeState.scene.add(ThreeState.projectorCone);
    
    // Create wireframe
    createConeWireframe(halfWidth, halfHeight);
}

/**
 * Create wireframe edges for the cone
 */
function createConeWireframe(halfWidth, halfHeight) {
    const wireframeGeometry = new THREE.BufferGeometry();
    const wireframeVertices = new Float32Array([
        // Lines from apex to corners
        0.3, 0.15, 0, AppState.distance, halfHeight, halfWidth,
        0.3, 0.15, 0, AppState.distance, halfHeight, -halfWidth,
        0.3, 0.15, 0, AppState.distance, -halfHeight, -halfWidth,
        0.3, 0.15, 0, AppState.distance, -halfHeight, halfWidth,
        // Rectangle at screen
        AppState.distance, halfHeight, halfWidth, AppState.distance, halfHeight, -halfWidth,
        AppState.distance, halfHeight, -halfWidth, AppState.distance, -halfHeight, -halfWidth,
        AppState.distance, -halfHeight, -halfWidth, AppState.distance, -halfHeight, halfWidth,
        AppState.distance, -halfHeight, halfWidth, AppState.distance, halfHeight, halfWidth
    ]);
    
    wireframeGeometry.setAttribute('position', new THREE.BufferAttribute(wireframeVertices, 3));
    
    const wireframeMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00d9ff, 
        linewidth: 2 
    });
    
    ThreeState.projectorConeWireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    ThreeState.scene.add(ThreeState.projectorConeWireframe);
}

/**
 * Create or update the screen mesh
 */
function createScreen() {
    // Remove existing screen
    if (ThreeState.screenMesh) {
        ThreeState.scene.remove(ThreeState.screenMesh);
        ThreeState.screenMesh.geometry.dispose();
        ThreeState.screenMesh.material.dispose();
        ThreeState.screenMesh = null;
    }
    
    // Remove existing screen border
    if (ThreeState.screenBorder) {
        ThreeState.scene.remove(ThreeState.screenBorder);
        ThreeState.screenBorder.geometry.dispose();
        ThreeState.screenBorder.material.dispose();
        ThreeState.screenBorder = null;
    }
    
    // Calculate dimensions
    const throwRatio = AppState.mode === 'ratio-to-fov' 
        ? AppState.throwRatio 
        : hFovToThrowRatio(AppState.hFov);
    const screenWidth = AppState.distance / throwRatio;
    const screenHeight = screenWidth * (AppState.aspectHeight / AppState.aspectWidth);
    
    // Create screen geometry
    const screenGeometry = new THREE.PlaneGeometry(screenHeight, screenWidth);
    const screenMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        emissive: 0x00ff88,
        emissiveIntensity: 0.2
    });
    
    ThreeState.screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
    ThreeState.screenMesh.rotation.z = Math.PI / 2;
    ThreeState.screenMesh.rotation.y = Math.PI / 2;
    ThreeState.screenMesh.position.set(AppState.distance, 0, 0);
    ThreeState.scene.add(ThreeState.screenMesh);
    
    // Add screen border
    createScreenBorder(screenWidth, screenHeight);
}

/**
 * Create a border around the screen
 */
function createScreenBorder(screenWidth, screenHeight) {
    const halfWidth = screenWidth / 2;
    const halfHeight = screenHeight / 2;
    
    const borderGeometry = new THREE.BufferGeometry();
    const borderVertices = new Float32Array([
        AppState.distance, halfHeight, halfWidth,
        AppState.distance, halfHeight, -halfWidth,
        AppState.distance, halfHeight, -halfWidth,
        AppState.distance, -halfHeight, -halfWidth,
        AppState.distance, -halfHeight, -halfWidth,
        AppState.distance, -halfHeight, halfWidth,
        AppState.distance, -halfHeight, halfWidth,
        AppState.distance, halfHeight, halfWidth
    ]);
    
    borderGeometry.setAttribute('position', new THREE.BufferAttribute(borderVertices, 3));
    
    const borderMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00ff88, 
        linewidth: 3 
    });
    
    ThreeState.screenBorder = new THREE.LineSegments(borderGeometry, borderMaterial);
    ThreeState.scene.add(ThreeState.screenBorder);
}

/**
 * Update the 3D scene when values change
 */
function update3D() {
    if (!ThreeState.scene) return;
    
    createCone();
    createScreen();
    
    // Adjust camera distance based on throw distance
    const minDistance = Math.max(8, AppState.distance * 1.5);
    if (CameraState.distance < minDistance) {
        CameraState.distance = minDistance;
        updateCameraPosition();
    }
}

/**
 * Update camera position based on angles and distance
 */
function updateCameraPosition() {
    if (!ThreeState.camera) return;
    
    const x = CameraState.distance * Math.sin(CameraState.angleX) * Math.cos(CameraState.angleY);
    const y = CameraState.distance * Math.sin(CameraState.angleY);
    const z = CameraState.distance * Math.cos(CameraState.angleX) * Math.cos(CameraState.angleY);
    
    // Look at center of the scene (midpoint between projector and screen)
    const lookAtX = AppState.distance / 2;
    
    ThreeState.camera.position.set(x + lookAtX, y + 1, z);
    ThreeState.camera.lookAt(lookAtX, 0, 0);
}

/**
 * Setup 3D mouse and touch controls
 */
function setup3DControls() {
    const canvas = ThreeState.renderer.domElement;
    
    // Mouse events
    canvas.addEventListener('mousedown', on3DMouseDown);
    canvas.addEventListener('mousemove', on3DMouseMove);
    canvas.addEventListener('mouseup', on3DMouseUp);
    canvas.addEventListener('mouseleave', on3DMouseUp);
    canvas.addEventListener('wheel', on3DWheel);
    
    // Touch events
    canvas.addEventListener('touchstart', on3DTouchStart, { passive: false });
    canvas.addEventListener('touchmove', on3DTouchMove, { passive: false });
    canvas.addEventListener('touchend', on3DTouchEnd);
}

/**
 * Handle mouse down on 3D canvas
 */
function on3DMouseDown(event) {
    CameraState.isMouseDown = true;
    CameraState.prevMouseX = event.clientX;
    CameraState.prevMouseY = event.clientY;
}

/**
 * Handle mouse move on 3D canvas
 */
function on3DMouseMove(event) {
    if (!CameraState.isMouseDown) return;
    
    const deltaX = event.clientX - CameraState.prevMouseX;
    const deltaY = event.clientY - CameraState.prevMouseY;
    
    CameraState.angleX += deltaX * 0.01;
    CameraState.angleY += deltaY * 0.01;
    
    // Clamp vertical angle
    CameraState.angleY = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, CameraState.angleY));
    
    CameraState.prevMouseX = event.clientX;
    CameraState.prevMouseY = event.clientY;
    
    updateCameraPosition();
}

/**
 * Handle mouse up on 3D canvas
 */
function on3DMouseUp() {
    CameraState.isMouseDown = false;
}

/**
 * Handle mouse wheel on 3D canvas
 */
function on3DWheel(event) {
    event.preventDefault();
    
    CameraState.distance += event.deltaY * 0.01;
    CameraState.distance = Math.max(3, Math.min(50, CameraState.distance));
    
    updateCameraPosition();
}

/**
 * Handle touch start on 3D canvas
 */
function on3DTouchStart(event) {
    event.preventDefault();
    
    if (event.touches.length === 1) {
        CameraState.isMouseDown = true;
        CameraState.prevMouseX = event.touches[0].clientX;
        CameraState.prevMouseY = event.touches[0].clientY;
    }
}

/**
 * Handle touch move on 3D canvas
 */
function on3DTouchMove(event) {
    event.preventDefault();
    
    if (!CameraState.isMouseDown || event.touches.length !== 1) return;
    
    const deltaX = event.touches[0].clientX - CameraState.prevMouseX;
    const deltaY = event.touches[0].clientY - CameraState.prevMouseY;
    
    CameraState.angleX += deltaX * 0.01;
    CameraState.angleY += deltaY * 0.01;
    
    // Clamp vertical angle
    CameraState.angleY = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, CameraState.angleY));
    
    CameraState.prevMouseX = event.touches[0].clientX;
    CameraState.prevMouseY = event.touches[0].clientY;
    
    updateCameraPosition();
}

/**
 * Handle touch end on 3D canvas
 */
function on3DTouchEnd() {
    CameraState.isMouseDown = false;
}

/**
 * Animation loop
 */
function animate() {
    requestAnimationFrame(animate);
    
    if (ThreeState.renderer && ThreeState.scene && ThreeState.camera) {
        ThreeState.renderer.render(ThreeState.scene, ThreeState.camera);
    }
}

/**
 * Handle window resize for 3D canvas
 */
function resize3D() {
    if (!ThreeState.renderer || !ThreeState.camera) return;
    
    const container = Elements.canvas3d;
    const rect = container.getBoundingClientRect();
    
    ThreeState.camera.aspect = rect.width / rect.height;
    ThreeState.camera.updateProjectionMatrix();
    ThreeState.renderer.setSize(rect.width, rect.height);
}