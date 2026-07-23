import sys

with open('static/js/app.js', 'r') as f:
    appjs = f.read()

# 1. Update deleteThreatModelDiagram
old_delete_func = """async function deleteThreatModelDiagram(diagramId) {
    if (currentProject && !canEditProject(currentProject)) {
        alert("Unauthorized: Only assigned Pentest Consultant, Team Leader, or Admin can delete threat model diagrams.");
        return;
    }
    if (!confirm("Are you sure you want to delete this Threat Model Diagram? This action cannot be undone.")) return;
    
    const res = await fetch(`/api/projects/${currentProjectId}`);
    const p = await res.json();
    
    let diagrams = [];
    if (p.threat_model) {
        const cleaned = p.threat_model.trim();
        if (cleaned.startsWith('[')) {
            try {
                diagrams = JSON.parse(cleaned);
            } catch (e) {
                console.error(e);
            }
        }
    }
    
    diagrams = diagrams.filter(d => d.id !== diagramId);
    
    await fetch(`/api/projects/${currentProjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            threat_model: JSON.stringify(diagrams)
        })
    });
    
    alert("Diagram deleted successfully.");
    viewProject(currentProjectId);
}"""

new_delete_func = """async function deleteThreatModelDiagram(diagramId, type = 'threat') {
    if (currentProject && !canEditProject(currentProject)) {
        alert("Unauthorized: Only assigned Pentest Consultant, Team Leader, or Admin can delete diagrams.");
        return;
    }
    if (!confirm("Are you sure you want to delete this Diagram? This action cannot be undone.")) return;
    
    const res = await fetch(`/api/projects/${currentProjectId}`);
    const p = await res.json();
    
    let diagrams = [];
    const targetField = type === 'killchain' ? p.cyber_kill_chain : p.threat_model;
    
    if (targetField) {
        const cleaned = targetField.trim();
        if (cleaned.startsWith('[')) {
            try {
                diagrams = JSON.parse(cleaned);
            } catch (e) {
                console.error(e);
            }
        }
    }
    
    diagrams = diagrams.filter(d => d.id !== diagramId);
    
    const payload = {};
    if (type === 'killchain') {
        payload.cyber_kill_chain = JSON.stringify(diagrams);
    } else {
        payload.threat_model = JSON.stringify(diagrams);
    }
    
    await fetch(`/api/projects/${currentProjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    alert("Diagram deleted successfully.");
    viewProject(currentProjectId);
}"""
appjs = appjs.replace(old_delete_func, new_delete_func)

# 2. Add keyboard event listener for delete node
keyboard_listener = """
function handleStudioKeyDown(e) {
    if (document.getElementById('threat-model-view').style.display === 'none') return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
            studioElements = studioElements.filter(item => item.id !== selectedNodeId);
            studioFlows = studioFlows.filter(flow => flow.fromId !== selectedNodeId && flow.toId !== selectedNodeId);
            selectedNodeId = null;
            renderStudioDiagram();
            autoSaveDraftLocally();
            e.preventDefault();
        }
    }
}
document.addEventListener('keydown', handleStudioKeyDown);
"""
if "function handleStudioKeyDown" not in appjs:
    appjs += keyboard_listener

# 3. Update onclick for renderProjectKillChains
old_kc_del = """<button class="btn btn-danger" onclick="deleteThreatModelDiagram('${diag.id}')" style="width: auto; height: 32px; display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.75rem; font-size: 0.8rem; white-space: nowrap; border-color: #fecdd3; background: #fff1f2; cursor: pointer;">❌ Delete</button>"""
new_kc_del = """<button class="btn btn-danger" onclick="deleteThreatModelDiagram('${diag.id}', '${type}')" style="width: auto; height: 32px; display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.75rem; font-size: 0.8rem; white-space: nowrap; border-color: #fecdd3; background: #fff1f2; cursor: pointer;">❌ Delete</button>"""
appjs = appjs.replace(old_kc_del, new_kc_del)

with open('static/js/app.js', 'w') as f:
    f.write(appjs)
print("app.js patched for delete")
