/**
 * Conversion Functions Module
 * Contains all unit and FOV conversion utilities
 */

/**
 * Convert throw ratio to horizontal field of view
 * @param {number} throwRatio - The throw ratio value
 * @returns {number} Horizontal FOV in degrees
 */
function throwRatioToHFov(throwRatio) {
    return 2 * Math.atan(1 / (2 * throwRatio)) * (180 / Math.PI);
}

/**
 * Convert horizontal field of view to throw ratio
 * @param {number} fovDeg - Horizontal FOV in degrees
 * @returns {number} Throw ratio value
 */
function hFovToThrowRatio(fovDeg) {
    const fovRad = fovDeg * (Math.PI / 180);
    return 1 / (2 * Math.tan(fovRad / 2));
}

/**
 * Calculate vertical FOV from horizontal FOV and aspect ratio
 * @param {number} hFovDeg - Horizontal FOV in degrees
 * @param {number} aspectWidth - Aspect ratio width component
 * @param {number} aspectHeight - Aspect ratio height component
 * @returns {number} Vertical FOV in degrees
 */
function calculateVFov(hFovDeg, aspectWidth, aspectHeight) {
    const hFovRad = hFovDeg * (Math.PI / 180);
    const aspectRatio = aspectWidth / aspectHeight;
    const vFovRad = 2 * Math.atan(Math.tan(hFovRad / 2) / aspectRatio);
    return vFovRad * (180 / Math.PI);
}

/**
 * Convert meters to feet
 * @param {number} meters - Distance in meters
 * @returns {number} Distance in feet
 */
function metersToFeet(meters) {
    return meters * 3.28084;
}

/**
 * Convert feet to meters
 * @param {number} feet - Distance in feet
 * @returns {number} Distance in meters
 */
function feetToMeters(feet) {
    return feet / 3.28084;
}

/**
 * Convert meters to inches
 * @param {number} meters - Distance in meters
 * @returns {number} Distance in inches
 */
function metersToInches(meters) {
    return meters * 39.3701;
}

/**
 * Format distance with appropriate unit
 * @param {number} meters - Distance in meters
 * @param {string} unit - Target unit ('m' or 'ft')
 * @returns {string} Formatted distance string
 */
function formatDistance(meters, unit) {
    if (unit === 'ft') {
        return metersToFeet(meters).toFixed(2) + ' ft';
    }
    return meters.toFixed(2) + ' m';
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

/**
 * Calculate screen dimensions from throw ratio and distance
 * @param {number} throwRatio - The throw ratio
 * @param {number} distance - Throw distance in meters
 * @param {number} aspectWidth - Aspect ratio width
 * @param {number} aspectHeight - Aspect ratio height
 * @returns {object} Object with width, height, and diagonal
 */
function calculateScreenDimensions(throwRatio, distance, aspectWidth, aspectHeight) {
    const screenWidth = distance / throwRatio;
    const screenHeight = screenWidth * (aspectHeight / aspectWidth);
    const diagonal = Math.sqrt(screenWidth * screenWidth + screenHeight * screenHeight);
    
    return {
        width: screenWidth,
        height: screenHeight,
        diagonal: diagonal,
        diagonalInches: metersToInches(diagonal)
    };
}