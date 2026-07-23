import sys

with open('static/js/app.js', 'r') as f:
    appjs = f.read()

# 1. Update drawArrowhead
old_arrow = """function drawArrowhead(ctx, x, y, angle) {
    const arrowLength = 12;
    const arrowWidth = 6;"""
new_arrow = """function drawArrowhead(ctx, x, y, angle) {
    const arrowLength = currentStudioType === 'killchain' ? 8 : 12;
    const arrowWidth = currentStudioType === 'killchain' ? 4 : 6;"""
appjs = appjs.replace(old_arrow, new_arrow)

# 2. Update line width in flow
old_line = """            studioCtx.beginPath();
            studioCtx.moveTo(cx1, cy1);
            studioCtx.lineTo(targetPt.x, targetPt.y);
            studioCtx.strokeStyle = '#475569';
            studioCtx.lineWidth = 2;
            studioCtx.stroke();"""
new_line = """            studioCtx.beginPath();
            studioCtx.moveTo(cx1, cy1);
            studioCtx.lineTo(targetPt.x, targetPt.y);
            studioCtx.strokeStyle = '#475569';
            studioCtx.lineWidth = currentStudioType === 'killchain' ? 1 : 2;
            studioCtx.stroke();"""
appjs = appjs.replace(old_line, new_line)

# 3. Hide label for killchain
old_label = """            const mx = (cx1 + targetPt.x) / 2;
            const my = (cy1 + targetPt.y) / 2;
            
            studioCtx.font = '10px Inter, Roboto, Arial, sans-serif';
            studioCtx.textAlign = 'center';
            studioCtx.textBaseline = 'middle';
            const textWidth = studioCtx.measureText(flow.label).width;
            
            studioCtx.fillStyle = '#ffffff';
            studioCtx.fillRect(mx - textWidth / 2 - 4, my - 8, textWidth + 8, 16);
            
            studioCtx.fillStyle = '#0f172a';
            studioCtx.fillText(flow.label, mx, my);"""
new_label = """            const mx = (cx1 + targetPt.x) / 2;
            const my = (cy1 + targetPt.y) / 2;
            
            if (currentStudioType !== 'killchain') {
                studioCtx.font = '10px Inter, Roboto, Arial, sans-serif';
                studioCtx.textAlign = 'center';
                studioCtx.textBaseline = 'middle';
                const textWidth = studioCtx.measureText(flow.label).width;
                
                studioCtx.fillStyle = '#ffffff';
                studioCtx.fillRect(mx - textWidth / 2 - 4, my - 8, textWidth + 8, 16);
                
                studioCtx.fillStyle = '#0f172a';
                studioCtx.fillText(flow.label, mx, my);
            }"""
appjs = appjs.replace(old_label, new_label)

with open('static/js/app.js', 'w') as f:
    f.write(appjs)
print("app.js patched for flow lines")
