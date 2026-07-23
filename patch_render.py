import sys

with open('static/js/app.js', 'r') as f:
    content = f.read()

# 1. Parsing logic
old_parse = """    }
    renderProjectThreatModels(diagrams);
    
    // Dynamic back button behavior"""

new_parse = """    }
    renderProjectThreatModels(diagrams);
    
    // Render Cyber Kill Chain List
    let kcDiagrams = [];
    if (p.cyber_kill_chain) {
        const cleanedKC = p.cyber_kill_chain.trim();
        if (cleanedKC.startsWith('[')) {
            try {
                kcDiagrams = JSON.parse(cleanedKC);
            } catch (e) {
                console.error("Error parsing kill chain JSON", e);
            }
        } else if (cleanedKC.startsWith('{')) {
            try {
                const parsedKC = JSON.parse(cleanedKC);
                kcDiagrams = [{
                    id: 'default_kc',
                    name: 'Default Cyber Kill Chain',
                    image: parsedKC.image || "",
                    elements: parsedKC.elements || [],
                    flows: parsedKC.flows || [],
                    type: 'killchain'
                }];
            } catch (e) {
                console.error("Error parsing single KC diagram JSON", e);
            }
        }
    }
    renderProjectKillChains(kcDiagrams);
    
    // Dynamic back button behavior"""
content = content.replace(old_parse, new_parse)

# 2. Add renderProjectKillChains function
func_to_add = """

function renderProjectKillChains(diagrams) {
    const container = document.getElementById('project-killchain-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!diagrams || diagrams.length === 0) {
        container.innerHTML = `
            <div class="sysreptor-report-card" style="margin-top: 2rem;">
                <div class="sysreptor-report-title">
                    <span>Cyber Kill Chain</span>
                </div>
                <div class="sysreptor-content" style="padding: 2rem; background: #ffffff; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 8px 8px; text-align: center; color: var(--text-secondary); font-style: italic;">
                    No Cyber Kill Chain diagrams have been designed for this project yet. Click "Draw Cyber Kill Chain" above to create one.
                </div>
            </div>
        `;
        return;
    }
    
    const card = document.createElement('div');
    card.className = 'sysreptor-report-card';
    card.style.marginTop = '2rem';
    
    let rowsHTML = '';
    diagrams.forEach((diag, idx) => {
        const num = idx + 1;
        const type = diag.type || 'killchain';
        
        rowsHTML += `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.75rem 1rem; color: var(--text-primary); font-weight: 500;">${num}</td>
                <td style="padding: 0.75rem 1rem; color: var(--text-primary); font-weight: 600;">${diag.name}</td>
                <td style="padding: 0.75rem 1rem; text-align: center;">
                    <span class="badge" style="font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid ${diag.status === 'Published' ? '#bbf7d0' : '#fed7aa'}; background: ${diag.status === 'Published' ? '#dcfce7' : '#ffedd5'}; color: ${diag.status === 'Published' ? '#15803d' : '#d97706'}; text-transform: uppercase;">
                        ${diag.status || 'Draft'}
                    </span>
                </td>
                <td style="padding: 0.75rem 1rem; text-align: center;">
                    <div style="display: flex; gap: 0.5rem; justify-content: center; align-items: center;">
                        ${(currentProject && canEditProject(currentProject)) ? `
                        <button class="btn btn-secondary" onclick="editThreatModelDiagram('${diag.id}', '${type}')" style="width: auto; height: 32px; display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.75rem; font-size: 0.8rem; white-space: nowrap; cursor: pointer;">✏️ Edit</button>
                        <button class="btn btn-danger" onclick="deleteThreatModelDiagram('${diag.id}', '${type}')" style="width: auto; height: 32px; display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.75rem; font-size: 0.8rem; white-space: nowrap; border-color: #fecdd3; background: #fff1f2; cursor: pointer;">❌ Delete</button>
                        ` : `
                        <span style="color: var(--text-secondary); font-size: 0.8rem;">Read Only</span>
                        `}
                    </div>
                </td>
            </tr>
        `;
    });
    
    card.innerHTML = `
        <div class="sysreptor-report-title">
            <span>Cyber Kill Chain</span>
        </div>
        <div class="sysreptor-content" style="padding: 0; background: #ffffff; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 8px 8px; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                <thead>
                    <tr style="background: #f8fafc; border-bottom: 1px solid var(--border-color);">
                        <th style="padding: 0.75rem 1rem; font-weight: 600; color: var(--text-secondary); width: 60px;">No</th>
                        <th style="padding: 0.75rem 1rem; font-weight: 600; color: var(--text-secondary);">Diagram Title</th>
                        <th style="padding: 0.75rem 1rem; font-weight: 600; color: var(--text-secondary); width: 120px; text-align: center;">Status</th>
                        <th style="padding: 0.75rem 1rem; font-weight: 600; color: var(--text-secondary); width: 180px; text-align: center;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHTML}
                </tbody>
            </table>
        </div>
    `;
    container.appendChild(card);
}
"""

content = content + func_to_add

with open('static/js/app.js', 'w') as f:
    f.write(content)
print("Done")
