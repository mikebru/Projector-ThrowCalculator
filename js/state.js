/**
 * State Management Module
 * Contains application state and configuration
 */

// Application state object
const AppState = {
    mode: 'ratio-to-fov',
    throwRatio: 1.0,
    hFov: 53.13,
    distance: 3,
    unit: 'm',
    aspectWidth: 16,
    aspectHeight: 9,
    view2d: 'top'
};

// Three.js related state
const ThreeState = {
    scene: null,
    camera: null,
    renderer: null,
    projectorCone: null,
    projectorConeWireframe: null,
    screenMesh: null,
    screenBorder: null,  // Added this line
    projectorMesh: null,
    lensMesh: null
};

// Camera control state
const CameraState = {
    isMouseDown: false,
    prevMouseX: 0,
    prevMouseY: 0,
    angleX: 0.8,
    angleY: 0.4,
    distance: 12
};

// DOM element references cache
const Elements = {
    throwRatio: null,
    throwRatioSlider: null,
    throwRatioValue: null,
    throwRatioGroup: null,
    fovInput: null,
    fovSlider: null,
    fovValue: null,
    fovGroup: null,
    throwDistance: null,
    throwDistanceValue: null,
    aspectRatio: null,
    customAspect: null,
    customWidth: null,
    customHeight: null,
    resultHFov: null,
    resultVFov: null,
    resultRatio: null,
    resultWidth: null,
    resultHeight: null,
    resultDiagonal: null,
    canvas2d: null,
    canvas3d: null,
    screenBox: null,
    screenDimensions: null,
    modeTabs: null,
    viewTabs: null,
    unitToggle: null
};

/**
 * Initialize DOM element references
 */
function initElements() {
    Elements.throwRatio = document.getElementById('throwRatio');
    Elements.throwRatioSlider = document.getElementById('throwRatioSlider');
    Elements.throwRatioValue = document.getElementById('throwRatioValue');
    Elements.throwRatioGroup = document.getElementById('throwRatioGroup');
    Elements.fovInput = document.getElementById('fovInput');
    Elements.fovSlider = document.getElementById('fovSlider');
    Elements.fovValue = document.getElementById('fovValue');
    Elements.fovGroup = document.getElementById('fovGroup');
    Elements.throwDistance = document.getElementById('throwDistance');
    Elements.throwDistanceValue = document.getElementById('throwDistanceValue');
    Elements.aspectRatio = document.getElementById('aspectRatio');
    Elements.customAspect = document.getElementById('customAspect');
    Elements.customWidth = document.getElementById('customWidth');
    Elements.customHeight = document.getElementById('customHeight');
    Elements.resultHFov = document.getElementById('resultHFov');
    Elements.resultVFov = document.getElementById('resultVFov');
    Elements.resultRatio = document.getElementById('resultRatio');
    Elements.resultWidth = document.getElementById('resultWidth');
    Elements.resultHeight = document.getElementById('resultHeight');
    Elements.resultDiagonal = document.getElementById('resultDiagonal');
    Elements.canvas2d = document.getElementById('canvas2d');
    Elements.canvas3d = document.getElementById('canvas3d');
    Elements.screenBox = document.getElementById('screenBox');
    Elements.screenDimensions = document.getElementById('screenDimensions');
    Elements.modeTabs = document.getElementById('modeTabs');
    Elements.viewTabs = document.getElementById('viewTabs');
    Elements.unitToggle = document.getElementById('unitToggle');
}

/**
 * Parse aspect ratio string into width and height values
 * @param {string} ratioString - Aspect ratio string like "16:9"
 * @returns {object} Object with width and height properties
 */
function parseAspectRatio(ratioString) {
    const parts = ratioString.split(':');
    return {
        width: parseFloat(parts[0]),
        height: parseFloat(parts[1])
    };
}