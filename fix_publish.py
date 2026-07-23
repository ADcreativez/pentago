import sys

with open('static/js/app.js', 'r') as f:
    appjs = f.read()

# 1. Update saveThreatModelDraft to accept isPublished
old_save = """async function saveThreatModelDraft() {"""
new_save = """async function saveThreatModelDraft(isPublished = false) {"""
appjs = appjs.replace(old_save, new_save)

old_status = """        threats: studioThreats,
        status: 'Draft' // Saved as draft
    };"""
new_status = """        threats: studioThreats,
        status: isPublished ? 'Published' : 'Draft',
        type: currentStudioType
    };"""
appjs = appjs.replace(old_status, new_status)

# 2. Update publishThreatModelDrawing to pass true and download image
old_publish = """async function publishThreatModelDrawing() {
    await saveThreatModelDraft();
    alert("Diagram published successfully!");
    document.getElementById('threat-model-view').style.display = 'none';
    viewProject(currentProjectId);
}"""

new_publish = """async function publishThreatModelDrawing() {
    await saveThreatModelDraft(true);
    
    // Download image
    const canvas = document.getElementById('threat-model-canvas');
    if (canvas) {
        try {
            // Fill background white before export to avoid transparent PNG issues
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = canvas.width;
            exportCanvas.height = canvas.height;
            const ctx = exportCanvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
            ctx.drawImage(canvas, 0, 0);
            
            const dataURL = exportCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = (currentDiagramName || 'Diagram') + '.png';
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error("Error generating image download:", e);
        }
    }
    
    alert("Diagram published & downloaded successfully!");
    document.getElementById('threat-model-view').style.display = 'none';
    viewProject(currentProjectId);
}"""
appjs = appjs.replace(old_publish, new_publish)

with open('static/js/app.js', 'w') as f:
    f.write(appjs)
print("app.js patched for publish")
