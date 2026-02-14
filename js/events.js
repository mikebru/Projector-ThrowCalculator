/**
 * Events Module
 * Handles all UI event bindings and handlers
 */

/**
 * Initialize all event listeners
 */
function initEvents() {
    // Mode tabs
    initModeTabs();
    
    // View tabs (2D)
    initViewTabs();
    
    // Unit toggle
    initUnitToggle();
    
    // Throw ratio controls
    initThrowRatioControls();
    
    // FOV controls
    initFovControls();
    
    // Distance controls
    initDistanceControls();
    
    // Aspect ratio controls
    initAspectRatioControls();
    
    // Window resize
    initResizeHandler();
}

/**
 * Initialize mode tab buttons
 */
function initModeTabs() {
    const tabs = Elements.modeTabs.querySelectorAll('.viz-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const mode = this.dataset.mode;
            setMode(mode);
        });
    });
}

/**
 * Initialize 2D view tab buttons
 */
function initViewTabs() {
    const tabs = Elements.viewTabs.querySelectorAll('.viz-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const view = this.dataset.view;
            setView2D(view);
        });
    });
}

/**
 * Initialize unit toggle buttons
 */
function initUnitToggle() {
    const buttons = Elements.unitToggle.querySelectorAll('.unit-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            const unit = this.dataset.unit;
            setUnit(unit);
        });
    });
}

/**
 * Initialize throw ratio input and slider
 */
function initThrowRatioControls() {
    // Number input
    Elements.throwRatio.addEventListener('input', function() {
        let value = parseFloat(this.value);
        if (isNaN(value) || value < 0.1) value = 0.1;
        if (value > 5) value = 5;
        
        AppState.throwRatio = value;
        Elements.throwRatioSlider.value = value;
        Elements.throwRatioValue.textContent = value.toFixed(2) + ':1';
        
        calculate();
    });
    
    // Slider
    Elements.throwRatioSlider.addEventListener('input', function() {
        const value = parseFloat(this.value);
        
        AppState.throwRatio = value;
        Elements.throwRatio.value = value;
        Elements.throwRatioValue.textContent = value.toFixed(2) + ':1';
        
        calculate();
    });
}

/**
 * Initialize FOV input and slider
 */
function initFovControls() {
    // Number input
    Elements.fovInput.addEventListener('input', function() {
        let value = parseFloat(this.value);
        if (isNaN(value) || value < 5) value = 5;
        if (value > 170) value = 170;
        
        AppState.hFov = value;
        Elements.fovSlider.value = value;
        Elements.fovValue.textContent = value.toFixed(2) + '°';
        
        calculate();
    });
    
    // Slider
    Elements.fovSlider.addEventListener('input', function() {
        const value = parseFloat(this.value);
        
        AppState.hFov = value;
        Elements.fovInput.value = value.toFixed(2);
        Elements.fovValue.textContent = value.toFixed(2) + '°';
        
        calculate();
    });
}

/**
 * Initialize distance slider
 */
function initDistanceControls() {
    Elements.throwDistance.addEventListener('input', function() {
        const value = parseFloat(this.value);
        
        AppState.distance = value;
        Elements.throwDistanceValue.textContent = formatDistance(value, AppState.unit);
        
        calculate();
    });
}

/**
 * Initialize aspect ratio dropdown and custom inputs
 */
function initAspectRatioControls() {
    // Dropdown
    Elements.aspectRatio.addEventListener('change', function() {
        const value = this.value;
        
        if (value === 'custom') {
            Elements.customAspect.classList.add('visible');
            updateCustomAspect();
        } else {
            Elements.customAspect.classList.remove('visible');
            const parsed = parseAspectRatio(value);
            AppState.aspectWidth = parsed.width;
            AppState.aspectHeight = parsed.height;
            calculate();
        }
    });
    
    // Custom width input
    Elements.customWidth.addEventListener('input', function() {
        updateCustomAspect();
    });
    
    // Custom height input
    Elements.customHeight.addEventListener('input', function() {
        updateCustomAspect();
    });
}

/**
 * Update aspect ratio from custom inputs
 */
function updateCustomAspect() {
    let width = parseFloat(Elements.customWidth.value);
    let height = parseFloat(Elements.customHeight.value);
    
    if (isNaN(width) || width < 0.1) width = 0.1;
    if (isNaN(height) || height < 0.1) height = 0.1;
    
    AppState.aspectWidth = width;
    AppState.aspectHeight = height;
    
    calculate();
}

/**
 * Initialize window resize handler
 */
function initResizeHandler() {
    let resizeTimeout;
    
    window.addEventListener('resize', function() {
        // Debounce resize events
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            draw2D();
            resize3D();
        }, 100);
    });
}

/**
 * Prevent default on number input scroll (to avoid accidental changes)
 */
function initScrollPrevention() {
    const numberInputs = document.querySelectorAll('input[type="number"]');
    
    numberInputs.forEach(input => {
        input.addEventListener('wheel', function(e) {
            if (document.activeElement === this) {
                e.preventDefault();
            }
        }, { passive: false });
    });
}