import sys

with open('static/js/app.js', 'r') as f:
    content = f.read()

# 1. Variables and createNewDiagramFlow
old1 = """let currentDiagramId = null;
let currentDiagramName = "";

function createNewDiagramFlow() {
    if (currentProject && !canEditProject(currentProject)) {
        alert("Unauthorized: Only assigned Pentest Consultant, Team Leader, or Admin can create threat model diagrams.");
        return;
    }
    const name = prompt("Enter a name for the new Threat Model Diagram:", "New Threat Model");
    if (!name || name.trim() === "") return;
    const newId = Date.now().toString() + Math.random().toString().substr(2, 5);
    openThreatModelStudio(newId, name.trim());
}"""

new1 = """let currentDiagramId = null;
let currentDiagramName = "";
let currentStudioType = 'threat';

function createNewDiagramFlow(type = 'threat') {
    if (currentProject && !canEditProject(currentProject)) {
        alert("Unauthorized: Only assigned Pentest Consultant, Team Leader, or Admin can create diagrams.");
        return;
    }
    const promptText = type === 'killchain' ? "Enter a name for the new Cyber Kill Chain:" : "Enter a name for the new Threat Model Diagram:";
    const defaultName = type === 'killchain' ? "New Cyber Kill Chain" : "New Threat Model";
    const name = prompt(promptText, defaultName);
    if (!name || name.trim() === "") return;
    const newId = Date.now().toString() + Math.random().toString().substr(2, 5);
    openThreatModelStudio(newId, name.trim(), type);
}"""
content = content.replace(old1, new1)

# 2. openThreatModelStudio
old2 = """function openThreatModelStudio(diagramId, name) {
    if (currentProject && !canEditProject(currentProject)) {
        alert("Unauthorized: Only assigned Pentest Consultant, Team Leader, or Admin can edit threat model diagrams.");
        return;
    }
    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
    document.getElementById('threat-model-view').style.display = 'block';
    
    studioCanvas = document.getElementById('studio-canvas');
    studioCtx = studioCanvas.getContext('2d');
    
    // Scale canvas to match device pixel ratio for high DPI / Retina screens
    const dpr = window.devicePixelRatio || 2;
    studioCanvas.width = 1200 * dpr;
    studioCanvas.height = 700 * dpr;
    studioCanvas.style.width = "100%";
    studioCanvas.style.height = "auto";
    studioCanvas.style.maxWidth = "1200px";
    
    selectedNodeId = null;
    isDraggingNode = false;
    isResizingNode = false;
    flowStartNode = null;
    
    currentDiagramId = diagramId;
    currentDiagramName = name || "New Threat Model";
    
    // Set headers
    const studioTitleEl = document.querySelector('#threat-model-view h2');
    if (studioTitleEl) {
        studioTitleEl.innerText = `Threat Modelling Studio: ${currentDiagramName}`;
    }"""

new2 = """function openThreatModelStudio(diagramId, name, type = 'threat') {
    if (currentProject && !canEditProject(currentProject)) {
        alert("Unauthorized: Only assigned Pentest Consultant, Team Leader, or Admin can edit diagrams.");
        return;
    }
    currentStudioType = type;
    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
    document.getElementById('threat-model-view').style.display = 'block';
    
    studioCanvas = document.getElementById('studio-canvas');
    studioCtx = studioCanvas.getContext('2d');
    
    // Scale canvas to match device pixel ratio for high DPI / Retina screens
    const dpr = window.devicePixelRatio || 2;
    
    const canvasWidth = type === 'killchain' ? 2200 : 1200;
    studioCanvas.width = canvasWidth * dpr;
    studioCanvas.height = 700 * dpr;
    studioCanvas.style.width = type === 'killchain' ? "2200px" : "100%";
    studioCanvas.style.height = "auto";
    studioCanvas.style.maxWidth = type === 'killchain' ? "none" : "1200px";
    
    selectedNodeId = null;
    isDraggingNode = false;
    isResizingNode = false;
    flowStartNode = null;
    
    currentDiagramId = diagramId;
    currentDiagramName = name || "New Threat Model";
    
    // Set headers
    const studioTitleEl = document.querySelector('#threat-model-view h2');
    if (studioTitleEl) {
        studioTitleEl.innerText = type === 'killchain' ? `Cyber Kill Chain: ${currentDiagramName}` : `Threat Modelling Studio: ${currentDiagramName}`;
    }"""
content = content.replace(old2, new2)

# 3. getMousePos
old3 = """function getMousePos(e) {
    const rect = studioCanvas.getBoundingClientRect();
    return {
        x: ((e.clientX - rect.left) / rect.width) * 1200,
        y: ((e.clientY - rect.top) / rect.height) * 700
    };
}"""
new3 = """function getMousePos(e) {
    const rect = studioCanvas.getBoundingClientRect();
    const canvasWidth = currentStudioType === 'killchain' ? 2200 : 1200;
    return {
        x: ((e.clientX - rect.left) / rect.width) * canvasWidth,
        y: ((e.clientY - rect.top) / rect.height) * 700
    };
}"""
content = content.replace(old3, new3)

# 4. Drag constraint
old4 = """node.x = Math.max(0, Math.min(1200 - node.width, pos.x - dragOffset.x));"""
new4 = """const cW = currentStudioType === 'killchain' ? 2200 : 1200;
            node.x = Math.max(0, Math.min(cW - node.width, pos.x - dragOffset.x));"""
content = content.replace(old4, new4)

# 5. renderStudioDiagram background
old5 = """    if (forExport) {
        // Draw solid white background for final PNG export
        studioCtx.fillStyle = '#ffffff';
        studioCtx.fillRect(0, 0, 1200, 700);
    } else {
        // Draw professional grid background for editing
        studioCtx.strokeStyle = '#f1f5f9';
        studioCtx.lineWidth = 1;
        const gridSpacing = 20;
        for (let x = 0; x < 1200; x += gridSpacing) {
            studioCtx.beginPath();
            studioCtx.moveTo(x, 0);
            studioCtx.lineTo(x, 700);
            studioCtx.stroke();
        }
        for (let y = 0; y < 700; y += gridSpacing) {
            studioCtx.beginPath();
            studioCtx.moveTo(0, y);
            studioCtx.lineTo(1200, y);
            studioCtx.stroke();
        }
    }"""

new5 = """    const cW = currentStudioType === 'killchain' ? 2200 : 1200;
    if (forExport) {
        studioCtx.fillStyle = '#ffffff';
        studioCtx.fillRect(0, 0, cW, 700);
    } else {
        if (currentStudioType === 'killchain') {
            const columns = [
                "Reconnaissance", "Initial Access", "Execution", "Persistence", 
                "Privilege Escalation", "Defense Evasion", "Credential Access", 
                "Discovery", "Collection", "Command & Control"
            ];
            const colWidth = cW / columns.length;
            
            studioCtx.fillStyle = '#fafafa';
            studioCtx.fillRect(0, 0, cW, 700);
            
            for (let i = 0; i < columns.length; i++) {
                const x = i * colWidth;
                if (i > 0) {
                    studioCtx.beginPath();
                    studioCtx.setLineDash([5, 5]);
                    studioCtx.strokeStyle = '#cbd5e1';
                    studioCtx.moveTo(x, 0);
                    studioCtx.lineTo(x, 700);
                    studioCtx.stroke();
                    studioCtx.setLineDash([]);
                }
                studioCtx.fillStyle = '#64748b';
                studioCtx.font = '11px sans-serif';
                studioCtx.textAlign = 'center';
                studioCtx.fillText(columns[i], x + (colWidth / 2), 30);
            }
            studioCtx.textAlign = 'left';
        } else {
            studioCtx.strokeStyle = '#f1f5f9';
            studioCtx.lineWidth = 1;
            const gridSpacing = 20;
            for (let x = 0; x < cW; x += gridSpacing) {
                studioCtx.beginPath();
                studioCtx.moveTo(x, 0);
                studioCtx.lineTo(x, 700);
                studioCtx.stroke();
            }
            for (let y = 0; y < 700; y += gridSpacing) {
                studioCtx.beginPath();
                studioCtx.moveTo(0, y);
                studioCtx.lineTo(cW, y);
                studioCtx.stroke();
            }
        }
    }"""
content = content.replace(old5, new5)

# 6. Icons properties in addStudioElement
old6 = """    } else if (type === 'firewall') {
        label = "Firewall";
        width = 80;
        height = 70;
    }
    
    const x = Math.floor(1200 / 2 - width / 2);"""
    
new6 = """    } else if (type === 'firewall') {
        label = "Firewall";
        width = 80;
        height = 70;
    } else if (type === 'phishing') {
        label = "Phishing";
        width = 80;
        height = 70;
    } else if (type === 'exploit') {
        label = "Exploit";
        width = 80;
        height = 70;
    } else if (type === 'malware') {
        label = "Malware";
        width = 80;
        height = 70;
    } else if (type === 'c2') {
        label = "C2 Server";
        width = 80;
        height = 70;
    }
    
    const cW = currentStudioType === 'killchain' ? 2200 : 1200;
    const x = Math.floor(cW / 2 - width / 2);"""
content = content.replace(old6, new6)

# 7. Rendering generic icons
old7 = """        } else if (['user', 'server', 'device', 'cloud', 'attacker', 'virus', 'switch', 'router', 'database', 'firewall'].includes(node.type)) {
            studioCtx.fillStyle = '#ffffff';
            studioCtx.fillRect(node.x, node.y, node.width, node.height);
            studioCtx.strokeStyle = '#334155';
            studioCtx.lineWidth = 1.5;
            studioCtx.strokeRect(node.x, node.y, node.width, node.height);
            
            let emoji = '👤';
            if (node.type === 'server') emoji = '🖥️';
            else if (node.type === 'device') emoji = '📱';
            else if (node.type === 'cloud') emoji = '☁️';
            else if (node.type === 'attacker') emoji = '👨‍💻';
            else if (node.type === 'virus') emoji = '🦠';
            else if (node.type === 'switch') emoji = '🎛️';
            else if (node.type === 'router') emoji = '📶';
            else if (node.type === 'database') emoji = '🗄️';
            else if (node.type === 'firewall') emoji = '🧱';"""

new7 = """        } else if (['user', 'server', 'device', 'cloud', 'attacker', 'virus', 'switch', 'router', 'database', 'firewall', 'phishing', 'exploit', 'malware', 'c2'].includes(node.type)) {
            studioCtx.fillStyle = '#ffffff';
            studioCtx.fillRect(node.x, node.y, node.width, node.height);
            studioCtx.strokeStyle = '#334155';
            studioCtx.lineWidth = 1.5;
            studioCtx.strokeRect(node.x, node.y, node.width, node.height);
            
            let emoji = '👤';
            if (node.type === 'server') emoji = '🖥️';
            else if (node.type === 'device') emoji = '📱';
            else if (node.type === 'cloud') emoji = '☁️';
            else if (node.type === 'attacker') emoji = '👨‍💻';
            else if (node.type === 'virus') emoji = '🦠';
            else if (node.type === 'switch') emoji = '🎛️';
            else if (node.type === 'router') emoji = '📶';
            else if (node.type === 'database') emoji = '🗄️';
            else if (node.type === 'firewall') emoji = '🧱';
            else if (node.type === 'phishing') emoji = '🎣';
            else if (node.type === 'exploit') emoji = '⚡';
            else if (node.type === 'malware') emoji = '🕷️';
            else if (node.type === 'c2') emoji = '📡';"""
content = content.replace(old7, new7)

# 8. Save/publish logic in saveThreatModelDraft
old8 = """    const res = await fetch(`/api/projects/${currentProjectId}`);
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
        } else if (cleaned.startsWith('{')) {
            try {
                const parsed = JSON.parse(cleaned);
                diagrams = [{
                    id: 'default',
                    name: 'Default Threat Model',
                    image: parsed.image || "",
                    elements: parsed.elements || [],
                    flows: parsed.flows || [],
                    threats: parsed.threats || [],
                    status: parsed.status || 'Published'
                }];
            } catch (e) {
                console.error(e);
            }
        } else if (cleaned.startsWith('data:image/png;base64,')) {
            diagrams = [{
                id: 'default',
                name: 'Default Threat Model',
                image: p.threat_model,
                elements: [],
                flows: [],
                threats: [],
                status: 'Published'
            }];
        }
    }
    
    // Find if we are updating an existing diagram or adding a new one
    const diagramIndex = diagrams.findIndex(d => d.id === currentDiagramId);
    const diagramData = {
        id: currentDiagramId,
        name: currentDiagramName,
        image: imgData,
        elements: studioElements,
        flows: studioFlows,
        threats: studioThreats,
        status: 'Draft' // Saved as draft
    };
    
    if (diagramIndex > -1) {
        diagrams[diagramIndex] = diagramData;
    } else {
        diagrams.push(diagramData);
    }
    
    // Save updated array to database
    await fetch(`/api/projects/${currentProjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            threat_model: JSON.stringify(diagrams)
        })
    });"""

new8 = """    const res = await fetch(`/api/projects/${currentProjectId}`);
    const p = await res.json();
    
    let diagrams = [];
    const targetField = currentStudioType === 'killchain' ? p.cyber_kill_chain : p.threat_model;
    
    if (targetField) {
        try {
            diagrams = JSON.parse(targetField);
            if (!Array.isArray(diagrams)) diagrams = []; // Handle old formats
        } catch (e) {
            console.error(e);
        }
    }
    
    const diagramIndex = diagrams.findIndex(d => d.id === currentDiagramId);
    const diagramData = {
        id: currentDiagramId,
        name: currentDiagramName,
        image: imgData,
        elements: studioElements,
        flows: studioFlows,
        threats: studioThreats,
        status: 'Draft' // Saved as draft
    };
    
    if (diagramIndex > -1) {
        diagrams[diagramIndex] = diagramData;
    } else {
        diagrams.push(diagramData);
    }
    
    const payload = {};
    if (currentStudioType === 'killchain') {
        payload.cyber_kill_chain = JSON.stringify(diagrams);
    } else {
        payload.threat_model = JSON.stringify(diagrams);
    }
    
    await fetch(`/api/projects/${currentProjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });"""
content = content.replace(old8, new8)

# publishThreatModelDrawing
old9 = """async function publishThreatModelDrawing() {
    if (!studioCanvas || !currentDiagramId) return;
    
    // Render clean view for export (white background, no grids, no highlights)
    renderStudioDiagram(true);
    const imgData = studioCanvas.toDataURL('image/png');
    
    // Restore editor view with grid
    renderStudioDiagram(false);
    
    // Trigger download
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `${currentDiagramName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Fetch current list of diagrams from server
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
        } else if (cleaned.startsWith('{')) {
            try {
                const parsed = JSON.parse(cleaned);
                diagrams = [{
                    id: 'default',
                    name: 'Default Threat Model',
                    image: parsed.image || "",
                    elements: parsed.elements || [],
                    flows: parsed.flows || [],
                    threats: parsed.threats || [],
                    status: parsed.status || 'Published'
                }];
            } catch (e) {
                console.error(e);
            }
        } else if (cleaned.startsWith('data:image/png;base64,')) {
            diagrams = [{
                id: 'default',
                name: 'Default Threat Model',
                image: p.threat_model,
                elements: [],
                flows: [],
                threats: [],
                status: 'Published'
            }];
        }
    }
    
    // Find if we are updating an existing diagram or adding a new one
    const diagramIndex = diagrams.findIndex(d => d.id === currentDiagramId);
    const diagramData = {
        id: currentDiagramId,
        name: currentDiagramName,
        image: imgData,
        elements: studioElements,
        flows: studioFlows,
        threats: studioThreats,
        status: 'Published' // Saved as published
    };
    
    if (diagramIndex > -1) {
        diagrams[diagramIndex] = diagramData;
    } else {
        diagrams.push(diagramData);
    }
    
    // Save updated array to database
    await fetch(`/api/projects/${currentProjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            threat_model: JSON.stringify(diagrams)
        })
    });
    
    // Clear localStorage drafts for this specific diagram
    localStorage.removeItem(`threat_model_json_${currentProjectId}_${currentDiagramId}`);
    localStorage.removeItem(`threat_model_draft_${currentProjectId}_${currentDiagramId}`);
    localStorage.removeItem(`threat_model_threats_${currentProjectId}_${currentDiagramId}`);
    
    alert("Threat model diagram published and downloaded successfully!");
    goBackToProjectFromThreatModel();
}"""

new9 = """async function publishThreatModelDrawing() {
    await saveThreatModelDraft();
    alert("Diagram published successfully!");
    document.getElementById('threat-model-view').style.display = 'none';
    viewProject(currentProjectId);
}"""
content = content.replace(old9, new9)

# 10. List threat models and kill chains in viewProject
# We need to inject kill_chains array display in workspace HTML, but that's handled in frontend.
# Let's check viewProject in app.js where it renders the list of diagrams.
old10 = """    let diagrams = [];
    if (project.threat_model) {
        const cleaned = project.threat_model.trim();
        if (cleaned.startsWith('[')) {
            try {
                diagrams = JSON.parse(cleaned);
            } catch (e) {
                console.error(e);
            }
        }
    }
    
    let rowsHTML = '';
    diagrams.forEach((diag, idx) => {
        const num = idx + 1;
        const totalThreats = diag.threats ? diag.threats.length : 0;
        
        rowsHTML += `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.75rem 1rem; color: var(--text-secondary); text-align: center;">${num}</td>
                <td style="padding: 0.75rem 1rem; color: var(--text-primary); font-weight: 600;">${diag.name}</td>
                <td style="padding: 0.75rem 1rem; text-align: center;">
                    <span class="badge" style="font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid ${diag.status === 'Published' ? '#bbf7d0' : '#fed7aa'}; background: ${diag.status === 'Published' ? '#dcfce7' : '#ffedd5'}; color: ${diag.status === 'Published' ? '#15803d' : '#d97706'}; text-transform: uppercase;">
                        ${diag.status || 'Draft'}
                    </span>
                </td>
                <td style="padding: 0.75rem 1rem; color: var(--text-primary); text-align: center;">${totalThreats} threats</td>
                <td style="padding: 0.75rem 1rem; text-align: center;">
                    <div style="display: flex; gap: 0.5rem; justify-content: center;">
                        <button class="btn btn-sm btn-secondary" onclick="editThreatModelDiagram('${diag.id}')" title="Edit">✏️ Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteThreatModelDiagram('${diag.id}')" title="Delete">🗑️ Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });"""

new10 = """    let diagrams = [];
    try { diagrams = JSON.parse(project.threat_model || '[]'); } catch(e) {}
    let killChains = [];
    try { killChains = JSON.parse(project.cyber_kill_chain || '[]'); } catch(e) {}
    
    const allDiagrams = [
        ...diagrams.map(d => ({...d, type: 'threat'})), 
        ...killChains.map(d => ({...d, type: 'killchain'}))
    ];
    
    let rowsHTML = '';
    allDiagrams.forEach((diag, idx) => {
        const num = idx + 1;
        const totalThreats = diag.threats ? diag.threats.length : 0;
        const typeLabel = diag.type === 'killchain' ? '⚔️ Kill Chain' : '🎨 Threat Model';
        
        rowsHTML += `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.75rem 1rem; color: var(--text-secondary); text-align: center;">${num}</td>
                <td style="padding: 0.75rem 1rem; color: var(--text-primary); font-weight: 600;">
                    ${diag.name} <br>
                    <span style="font-size: 0.75rem; color: #64748b; font-weight: 400;">${typeLabel}</span>
                </td>
                <td style="padding: 0.75rem 1rem; text-align: center;">
                    <span class="badge" style="font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid ${diag.status === 'Published' ? '#bbf7d0' : '#fed7aa'}; background: ${diag.status === 'Published' ? '#dcfce7' : '#ffedd5'}; color: ${diag.status === 'Published' ? '#15803d' : '#d97706'}; text-transform: uppercase;">
                        ${diag.status || 'Draft'}
                    </span>
                </td>
                <td style="padding: 0.75rem 1rem; color: var(--text-primary); text-align: center;">${totalThreats} threats</td>
                <td style="padding: 0.75rem 1rem; text-align: center;">
                    <div style="display: flex; gap: 0.5rem; justify-content: center;">
                        <button class="btn btn-sm btn-secondary" onclick="editThreatModelDiagram('${diag.id}', '${diag.type}')" title="Edit">✏️ Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteThreatModelDiagram('${diag.id}', '${diag.type}')" title="Delete">🗑️ Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });"""
content = content.replace(old10, new10)

# editThreatModelDiagram
old11 = """function editThreatModelDiagram(diagramId) {
    let diagrams = [];
    try {
        diagrams = JSON.parse(currentProject.threat_model || '[]');
    } catch(e) {}
    
    const diag = diagrams.find(d => d.id === diagramId);
    if (!diag) return;
    
    // Set current state
    currentDiagramId = diagramId;
    currentDiagramName = diag.name;
    
    // Load elements
    studioElements = diag.elements || [];
    studioFlows = diag.flows || [];
    studioThreats = diag.threats || [];
    
    // Open studio
    openThreatModelStudio(diagramId, diag.name);
    
    // Override elements
    studioElements = diag.elements || [];
    studioFlows = diag.flows || [];
    studioThreats = diag.threats || [];
    
    renderStudioDiagram();
    renderStudioThreats();
}"""

new11 = """function editThreatModelDiagram(diagramId, type = 'threat') {
    let diagrams = [];
    try {
        const fieldName = type === 'killchain' ? currentProject.cyber_kill_chain : currentProject.threat_model;
        diagrams = JSON.parse(fieldName || '[]');
    } catch(e) {}
    
    const diag = diagrams.find(d => d.id === diagramId);
    if (!diag) return;
    
    // Set current state
    currentDiagramId = diagramId;
    currentDiagramName = diag.name;
    currentStudioType = type;
    
    // Open studio
    openThreatModelStudio(diagramId, diag.name, type);
    
    // Override elements
    studioElements = diag.elements || [];
    studioFlows = diag.flows || [];
    studioThreats = diag.threats || [];
    
    renderStudioDiagram();
    renderStudioThreats();
}"""
content = content.replace(old11, new11)


# deleteThreatModelDiagram
old12 = """async function deleteThreatModelDiagram(diagramId) {
    if (!confirm("Are you sure you want to delete this threat model diagram?")) return;
    
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
    
    localStorage.removeItem(`threat_model_json_${currentProjectId}_${diagramId}`);
    localStorage.removeItem(`threat_model_draft_${currentProjectId}_${diagramId}`);
    localStorage.removeItem(`threat_model_threats_${currentProjectId}_${diagramId}`);
    
    viewProject(currentProjectId);
}"""

new12 = """async function deleteThreatModelDiagram(diagramId, type = 'threat') {
    if (!confirm("Are you sure you want to delete this diagram?")) return;
    
    const res = await fetch(`/api/projects/${currentProjectId}`);
    const p = await res.json();
    
    let diagrams = [];
    const fieldName = type === 'killchain' ? p.cyber_kill_chain : p.threat_model;
    if (fieldName) {
        try {
            diagrams = JSON.parse(fieldName);
        } catch (e) {}
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
    
    localStorage.removeItem(`threat_model_json_${currentProjectId}_${diagramId}`);
    localStorage.removeItem(`threat_model_draft_${currentProjectId}_${diagramId}`);
    localStorage.removeItem(`threat_model_threats_${currentProjectId}_${diagramId}`);
    
    viewProject(currentProjectId);
}"""
content = content.replace(old12, new12)

with open('static/js/app.js', 'w') as f:
    f.write(content)

print("App.js patched successfully.")
