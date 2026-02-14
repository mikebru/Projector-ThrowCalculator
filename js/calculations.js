/**
 * Calculations Module
 * Main calculation logic and UI updates
 */

/**
 * Perform all calculations and update the UI
 */
function calculate() {
    let hFov, throwRatio;

    // Calculate based on current mode
    if (AppState.mode === 'ratio-to-fov') {
        throwRatio = AppState.throwRatio;
        hFov = throwRatioToHFov(throwRatio);
        AppState.hFov = hFov;
    } else {
        hFov = AppState.hFov;
        throwRatio = hFovToThrowRatio(hFov);
        AppState.throwRatio = throwRatio;
    }

    // Calculate all derived values
    const vFov = calculateVFov(hFov, AppState.aspectWidth, AppState.aspectHeight);
    const screen = calculateScreenDimensions(
        throwRatio, 
        AppState.distance, 
        AppState.aspectWidth, 
        AppState.aspectHeight
    );

    // Update results display
    updateResultsDisplay(hFov, vFov, throwRatio, screen);
    
    // Update screen preview
    updateScreenPreview(screen);
    
    // Update visualizations
    draw2D();
    update3D();
}

/**
 * Update the results panel with calculated values
 * @param {number} hFov - Horizontal FOV in degrees
 * @param {number} vFov - Vertical FOV in degrees
 * @param {number} throwRatio - Calculated throw ratio
 * @param {object} screen - Screen dimensions object
 */
function updateResultsDisplay(hFov, vFov, throwRatio, screen) {
    Elements.resultHFov.textContent = hFov.toFixed(2) + '°';
    Elements.resultVFov.textContent = vFov.toFixed(2) + '°';
    Elements.resultRatio.textContent = throwRatio.toFixed(2) + ':1';
    Elements.resultWidth.textContent = formatDistance(screen.width, AppState.unit);
    Elements.resultHeight.textContent = formatDistance(screen.height, AppState.unit);
    Elements.resultDiagonal.textContent = formatDistance(screen.diagonal, AppState.unit) + 
        ' (' + screen.diagonalInches.toFixed(1) + '")';
}

/**
 * Update the screen preview box dimensions and text
 * @param {object} screen - Screen dimensions object
 */
function updateScreenPreview(screen) {
    const maxBoxWidth = 250;
    const maxBoxHeight = 150;
    const aspectRatio = AppState.aspectWidth / AppState.aspectHeight;
    
    let boxWidth, boxHeight;
    if (aspectRatio > maxBoxWidth / maxBoxHeight) {
        boxWidth = maxBoxWidth;
        boxHeight = maxBoxWidth / aspectRatio;
    } else {
        boxHeight = maxBoxHeight;
        boxWidth = maxBoxHeight * aspectRatio;
    }

    Elements.screenBox.style.width = boxWidth + 'px';
    Elements.screenBox.style.height = boxHeight + 'px';
    
    const widthDisplay = AppState.unit === 'ft' 
        ? metersToFeet(screen.width).toFixed(2) + 'ft' 
        : screen.width.toFixed(2) + 'm';
    const heightDisplay = AppState.unit === 'ft' 
        ? metersToFeet(screen.height).toFixed(2) + 'ft' 
        : screen.height.toFixed(2) + 'm';
    
    Elements.screenDimensions.textContent = widthDisplay + ' × ' + heightDisplay;
}

/**
 * Update slider display values
 */
function updateSliderDisplays() {
    Elements.throwRatioValue.textContent = AppState.throwRatio.toFixed(2) + ':1';
    Elements.fovValue.textContent = AppState.hFov.toFixed(2) + '°';
    Elements.throwDistanceValue.textContent = formatDistance(AppState.distance, AppState.unit);
}

/**
 * Sync input fields with sliders
 */
function syncInputsWithState() {
    Elements.throwRatio.value = AppState.throwRatio;
    Elements.throwRatioSlider.value = AppState.throwRatio;
    Elements.fovInput.value = AppState.hFov.toFixed(2);
    Elements.fovSlider.value = AppState.hFov;
    Elements.throwDistance.value = AppState.distance;
    
    updateSliderDisplays();
}

/**
 * Toggle between ratio-to-fov and fov-to-ratio modes
 * @param {string} mode - The mode to switch to
 */
function setMode(mode) {
    AppState.mode = mode;
    
    if (mode === 'ratio-to-fov') {
        Elements.throwRatioGroup.style.display = 'block';
        Elements.fovGroup.style.display = 'none';
    } else {
        Elements.throwRatioGroup.style.display = 'none';
        Elements.fovGroup.style.display = 'block';
    }
    
    // Update tab buttons
    const tabs = Elements.modeTabs.querySelectorAll('.viz-tab');
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === mode);
    });
    
    calculate();
}

/**
 * Set the 2D view mode (top or side)
 * @param {string} view - The view to switch to ('top' or 'side')
 */
function setView2D(view) {
    AppState.view2d = view;
    
    // Update tab buttons
    const tabs = Elements.viewTabs.querySelectorAll('.viz-tab');
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === view);
    });
    
    draw2D();
}

/**
 * Set the distance unit
 * @param {string} unit - The unit to use ('m' or 'ft')
 */
function setUnit(unit) {
    AppState.unit = unit;
    
    // Update unit buttons
    const buttons = Elements.unitToggle.querySelectorAll('.unit-btn');
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.unit === unit);
    });
    
    updateSliderDisplays();
    calculate();
}