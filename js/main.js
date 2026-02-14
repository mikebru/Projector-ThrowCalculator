/**
 * Main Application Module
 * Entry point and initialization
 */

/**
 * Initialize the application when DOM is ready
 */
function initApp() {
    console.log('Initializing Projector Calculator...');
    
    // Initialize DOM element references
    initElements();
    
    // Initialize event listeners
    initEvents();
    
    // Prevent scroll on number inputs
    initScrollPrevention();
    
    // Initialize 3D visualization
    init3D();
    
    // Sync inputs with initial state
    syncInputsWithState();
    
    // Perform initial calculation
    calculate();
    
    console.log('Projector Calculator initialized successfully!');
}

/**
 * Wait for DOM to be ready, then initialize
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM is already ready
    initApp();
}