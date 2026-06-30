import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

# Add functions at the end
js_functions = """
// ==========================================
// Document Control (Revision & Approvals)
// ==========================================

function addRevisionRow(author = '', date = '', version = 'v1.0', reference = 'Initial Draft') {
    const container = document.getElementById('revision-rows-container');
    if (!container) return;
    const div = document.createElement('div');
    div.style = 'display:flex;gap:0.5rem;margin-bottom:0.5rem;align-items:center;';
    div.setAttribute('data-revision-row', '');
    if (!author && typeof currentUser !== 'undefined' && currentUser) {
        author = currentUser.username;
    }
    if (!date) {
        date = new Date().toLocaleDateString('id-ID');
    }
    div.innerHTML = `
        <input name="rev_author" class="form-control" placeholder="Author" value="${author}" style="font-size:0.85rem;flex:2;">
        <input name="rev_date" class="form-control" placeholder="Date" value="${date}" style="font-size:0.85rem;flex:2;">
        <input name="rev_version" class="form-control" placeholder="Version" value="${version}" style="font-size:0.85rem;flex:1.5;">
        <input name="rev_reference" class="form-control" placeholder="Change Reference" value="${reference}" style="font-size:0.85rem;flex:4;">
        <button type="button" class="btn btn-action-delete" onclick="this.parentElement.remove()" style="padding:0;width:28px;height:28px;">&times;</button>
    `;
    container.appendChild(div);
}

function addApprovalRow(name = '', company = '', status = 'Approved') {
    const container = document.getElementById('approval-rows-container');
    if (!container) return;
    const div = document.createElement('div');
    div.style = 'display:flex;gap:0.5rem;margin-bottom:0.5rem;align-items:center;';
    div.setAttribute('data-approval-row', '');
    div.innerHTML = `
        <input name="app_name" class="form-control" placeholder="Name" value="${name}" style="font-size:0.85rem;flex:3;">
        <input name="app_company" class="form-control" placeholder="Company" value="${company}" style="font-size:0.85rem;flex:3;">
        <input name="app_status" class="form-control" placeholder="Status" value="${status}" style="font-size:0.85rem;flex:3;">
        <button type="button" class="btn btn-action-delete" onclick="this.parentElement.remove()" style="padding:0;width:28px;height:28px;">&times;</button>
    `;
    container.appendChild(div);
}

async function saveDocumentControl() {
    if (!currentProjectId) return;
    
    const revisions = [];
    document.querySelectorAll('#revision-rows-container [data-revision-row]').forEach(row => {
        revisions.push({
            author: row.querySelector('input[name="rev_author"]').value,
            date: row.querySelector('input[name="rev_date"]').value,
            version: row.querySelector('input[name="rev_version"]').value,
            reference: row.querySelector('input[name="rev_reference"]').value
        });
    });

    const approvals = [];
    document.querySelectorAll('#approval-rows-container [data-approval-row]').forEach(row => {
        approvals.push({
            name: row.querySelector('input[name="app_name"]').value,
            company: row.querySelector('input[name="app_company"]').value,
            status: row.querySelector('input[name="app_status"]').value
        });
    });

    try {
        const payload = {
            change_reference: JSON.stringify(revisions),
            client_approver_name: JSON.stringify(approvals)
        };
        const res = await fetch(`/api/projects/${currentProjectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            alert('Document Control saved successfully!');
            // Update the currentProject locally so we don't lose it if we re-render without fetching
            if (currentProject) {
                currentProject.change_reference = payload.change_reference;
                currentProject.client_approver_name = payload.client_approver_name;
            }
        } else {
            alert('Failed to save Document Control');
        }
    } catch(e) {
        console.error(e);
        alert('Error saving Document Control: ' + e.message);
    }
}
"""

content += "\n" + js_functions

# Now inject parsing logic in viewProject
view_proj_injection = """
    // Render Document Control
    const revContainer = document.getElementById('revision-rows-container');
    const appContainer = document.getElementById('approval-rows-container');
    if (revContainer) revContainer.innerHTML = '';
    if (appContainer) appContainer.innerHTML = '';
    
    let revisions = [];
    try { revisions = JSON.parse(p.change_reference || '[]'); } catch(e) {}
    if (revisions.length === 0) {
        addRevisionRow(); // add one empty by default
    } else {
        revisions.forEach(r => addRevisionRow(r.author, r.date, r.version, r.reference));
    }

    let approvals = [];
    try { approvals = JSON.parse(p.client_approver_name || '[]'); } catch(e) {}
    if (approvals.length === 0) {
        addApprovalRow('', p.company_name || '', 'Approved');
    } else {
        approvals.forEach(a => addApprovalRow(a.name, a.company, a.status));
    }
"""

content = content.replace("    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');\n    document.getElementById('project-detail-view').style.display = 'block';", 
                          view_proj_injection + "\n    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');\n    document.getElementById('project-detail-view').style.display = 'block';")

with open('static/js/app.js', 'w') as f:
    f.write(content)
