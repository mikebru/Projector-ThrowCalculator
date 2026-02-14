/**
 * 2D Canvas Drawing Module
 * Handles all 2D visualization rendering
 */

/**
 * Main 2D drawing function
 */
function draw2D() {
    const canvas = Elements.canvas2d;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size for high DPI displays
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    const width = rect.width;
    const height = rect.height;
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, width, height);
    
    // Get current values
    const throwRatio = AppState.mode === 'ratio-to-fov' 
        ? AppState.throwRatio 
        : hFovToThrowRatio(AppState.hFov);
    const hFov = throwRatioToHFov(throwRatio);
    const vFov = calculateVFov(hFov, AppState.aspectWidth, AppState.aspectHeight);
    const screenWidth = AppState.distance / throwRatio;
    const screenHeight = screenWidth * (AppState.aspectHeight / AppState.aspectWidth);
    
    // Calculate scale
    const padding = 40;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;
    
    const currentSpread = AppState.view2d === 'top' ? screenWidth : screenHeight;
    const maxDim = Math.max(AppState.distance, currentSpread);
    const scale = Math.min(availableWidth, availableHeight) / (maxDim * 1.3);
    
    // Positions
    const projectorX = padding + 40;
    const projectorY = height / 2;
    const screenX = projectorX + AppState.distance * scale;
    
    // Draw based on current view
    if (AppState.view2d === 'top') {
        drawTopView(ctx, projectorX, projectorY, screenX, screenWidth, scale, hFov);
    } else {
        drawSideView(ctx, projectorX, projectorY, screenX, screenHeight, scale, vFov);
    }
}

/**
 * Draw top view (horizontal FOV)
 */
function drawTopView(ctx, projectorX, projectorY, screenX, screenWidth, scale, hFov) {
    const halfWidth = (screenWidth / 2) * scale;
    
    drawCone(ctx, projectorX, projectorY, screenX, halfWidth);
    drawScreenLine(ctx, screenX, projectorY, halfWidth);
    drawProjector(ctx, projectorX, projectorY);
    drawCenterLine(ctx, projectorX, projectorY, screenX);
    drawFovArc(ctx, projectorX, projectorY, hFov);
    drawLabels(
        ctx, projectorX, projectorY, screenX, halfWidth, hFov,
        formatDistance(AppState.distance, AppState.unit),
        formatDistance(screenWidth, AppState.unit),
        'TOP VIEW (Horizontal FOV)'
    );
}

/**
 * Draw side view (vertical FOV)
 */
function drawSideView(ctx, projectorX, projectorY, screenX, screenHeight, scale, vFov) {
    const halfHeight = (screenHeight / 2) * scale;
    
    drawCone(ctx, projectorX, projectorY, screenX, halfHeight);
    drawScreenLine(ctx, screenX, projectorY, halfHeight);
    drawProjector(ctx, projectorX, projectorY);
    drawCenterLine(ctx, projectorX, projectorY, screenX);
    drawFovArc(ctx, projectorX, projectorY, vFov);
    drawLabels(
        ctx, projectorX, projectorY, screenX, halfHeight, vFov,
        formatDistance(AppState.distance, AppState.unit),
        formatDistance(screenHeight, AppState.unit),
        'SIDE VIEW (Vertical FOV)'
    );
}

/**
 * Draw the projection cone
 */
function drawCone(ctx, projectorX, projectorY, screenX, halfSpread) {
    ctx.beginPath();
    ctx.moveTo(projectorX, projectorY);
    ctx.lineTo(screenX, projectorY - halfSpread);
    ctx.lineTo(screenX, projectorY + halfSpread);
    ctx.closePath();
    
    // Gradient fill
    const gradient = ctx.createLinearGradient(projectorX, projectorY, screenX, projectorY);
    gradient.addColorStop(0, 'rgba(0, 217, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 255, 136, 0.2)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Stroke
    ctx.strokeStyle = 'rgba(0, 217, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

/**
 * Draw the screen line
 */
function drawScreenLine(ctx, screenX, projectorY, halfSpread) {
    ctx.beginPath();
    ctx.moveTo(screenX, projectorY - halfSpread);
    ctx.lineTo(screenX, projectorY + halfSpread);
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Screen end caps
    ctx.beginPath();
    ctx.arc(screenX, projectorY - halfSpread, 4, 0, Math.PI * 2);
    ctx.arc(screenX, projectorY + halfSpread, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.fill();
}

/**
 * Draw the projector icon
 */
function drawProjector(ctx, projectorX, projectorY) {
    // Projector body
    ctx.beginPath();
    ctx.arc(projectorX, projectorY, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#00d9ff';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Lens indicator
    ctx.beginPath();
    ctx.arc(projectorX + 8, projectorY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
}

/**
 * Draw the center/optical axis line
 */
function drawCenterLine(ctx, projectorX, projectorY, screenX) {
    ctx.beginPath();
    ctx.moveTo(projectorX, projectorY);
    ctx.lineTo(screenX, projectorY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
}

/**
 * Draw the FOV arc indicator
 */
function drawFovArc(ctx, projectorX, projectorY, fov) {
    const arcRadius = 50;
    const halfAngleRad = (fov / 2) * (Math.PI / 180);
    
    ctx.beginPath();
    ctx.arc(projectorX, projectorY, arcRadius, -halfAngleRad, halfAngleRad);
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Arc end lines
    ctx.beginPath();
    ctx.moveTo(projectorX, projectorY);
    ctx.lineTo(
        projectorX + arcRadius * Math.cos(-halfAngleRad),
        projectorY + arcRadius * Math.sin(-halfAngleRad)
    );
    ctx.moveTo(projectorX, projectorY);
    ctx.lineTo(
        projectorX + arcRadius * Math.cos(halfAngleRad),
        projectorY + arcRadius * Math.sin(halfAngleRad)
    );
    ctx.strokeStyle = 'rgba(255, 204, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

/**
 * Draw all labels
 */
function drawLabels(ctx, projectorX, projectorY, screenX, halfSpread, fov, distLabel, sizeLabel, viewLabel) {
    ctx.fillStyle = '#fff';
    ctx.font = '12px Segoe UI';
    ctx.textAlign = 'center';
    
    // Distance label
    const midX = (projectorX + screenX) / 2;
    ctx.fillText(distLabel, midX, projectorY + halfSpread + 35);
    
    // Draw distance line with arrows
    drawDistanceIndicator(ctx, projectorX, screenX, projectorY + halfSpread + 20);
    
    // Size label (width or height)
    ctx.save();
    ctx.translate(screenX + 35, projectorY);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(sizeLabel, 0, 0);
    ctx.restore();
    
    // FOV label
    ctx.fillStyle = '#ffcc00';
    ctx.fillText(fov.toFixed(1) + '°', projectorX + 70, projectorY - 15);
    
    // View label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '14px Segoe UI';
    ctx.textAlign = 'left';
    ctx.fillText(viewLabel, 10, 20);
    
    // Projector label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '11px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('Projector', projectorX, projectorY + 30);
    
    // Screen label
    ctx.fillText('Screen', screenX, projectorY - halfSpread - 10);
}

/**
 * Draw distance indicator with arrows
 */
function drawDistanceIndicator(ctx, startX, endX, y) {
    ctx.beginPath();
    ctx.moveTo(startX + 15, y);
    ctx.lineTo(endX - 5, y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Left arrow
    ctx.beginPath();
    ctx.moveTo(startX + 15, y);
    ctx.lineTo(startX + 22, y - 4);
    ctx.lineTo(startX + 22, y + 4);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();
    
    // Right arrow
    ctx.beginPath();
    ctx.moveTo(endX - 5, y);
    ctx.lineTo(endX - 12, y - 4);
    ctx.lineTo(endX - 12, y + 4);
    ctx.closePath();
    ctx.fill();
}