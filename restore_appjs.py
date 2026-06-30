import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

# 1. Add populateReportTemplatesSelect inside openProjectModal and editProject
if 'await populateReportTemplatesSelect()' not in content:
    content = content.replace("await populateConsultantSelect('project-sales', null, 'Sales');", "await populateConsultantSelect('project-sales', null, 'Sales');\n    await populateReportTemplatesSelect();")
    content = content.replace("await populateConsultantSelect('project-sales', p.sales_id, 'Sales');", "await populateConsultantSelect('project-sales', p.sales_id, 'Sales');\n    await populateReportTemplatesSelect();\n    document.getElementById('project-template-select').value = p.report_template_id || '';")

# 2. Add report_template_id to saveProject payload
if "report_template_id: document.getElementById('project-template-select').value" not in content:
    content = content.replace("access_info: document.getElementById('project-access').value,", "access_info: document.getElementById('project-access').value,\n        report_template_id: document.getElementById('project-template-select').value,")

# 3. Add loadReportTemplates() in switchTab
if "loadReportTemplates()" not in content:
    content = content.replace("document.getElementById('report-templates-view').style.display = 'block';", "document.getElementById('report-templates-view').style.display = 'block';\n        loadReportTemplates();")

# 4. Inject all the report template logic at the bottom of app.js
if "async function loadReportTemplates()" not in content:
    template_logic = """
// ==========================================
// REPORT TEMPLATE CRUD LISTING
// ==========================================

let currentEditingTemplateId = null;

async function populateReportTemplatesSelect() {
    const select = document.getElementById('report-template');
    const projectSelect = document.getElementById('project-template-select');
    let htmlStr = '<option value="">-- No Template --</option>';
    try {
        const res = await fetch('/api/report_templates');
        const templates = await res.json();
        templates.forEach(t => {
            htmlStr += `<option value="${t.id}">${t.name} (${t.template_type})</option>`;
        });
        if (select) select.innerHTML = htmlStr;
        if (projectSelect) projectSelect.innerHTML = htmlStr;
    } catch(e) {
        console.error(e);
    }
}

async function loadReportTemplates() {
    const tbody = document.getElementById('report-template-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading templates...</td></tr>';
    try {
        const res = await fetch('/api/report_templates');
        const templates = await res.json();
        tbody.innerHTML = '';
        if (templates.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary);">No report templates found. Click "New Template" to add one.</td></tr>';
            return;
        }
        templates.forEach(t => {
            tbody.innerHTML += `
                <tr>
                    <td style="font-weight: 500; color: var(--text-primary);">${t.name}</td>
                    <td style="text-transform: capitalize;">${t.template_type}</td>
                    <td><span class="badge badge-status" style="background:#f1f5f9;color:#334155;">${t.classification}</span></td>
                    <td>${t.footer_text || '-'}</td>
                    <td>
                        <div style="display:flex;gap:0.4rem;align-items:center;">
                            <button class="btn btn-action-edit" onclick="openReportTemplateModal(${t.id})" title="Edit Template Info & Outline">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="btn btn-action-delete" onclick="deleteReportTemplate(${t.id})" title="Delete Template">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    } catch(e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--severity-critical);">Failed to load templates.</td></tr>';
    }
}

let templateStructure = [];
const defaultTemplateStructure = [
    { id: 'sec-1', title: 'Bab 1: Ringkasan Eksekutif (Executive Summary)', subsections: [
        { id: 'sub-1-1', title: '1.1 Latar Belakang' },
        { id: 'sub-1-2', title: '1.2 Tujuan' },
        { id: 'sub-1-3', title: '1.3 Ruang Lingkup' },
        { id: 'sub-1-4', title: '1.4 Batasan Pekerjaan' }
    ]},
    { id: 'sec-2', title: 'Bab 2: Metodologi (Methodology)', subsections: [
        { id: 'sub-2-1', title: '2.1 Fase Metodologi' }
    ]}
];

async function openReportTemplateModal(id = null) {
    const modal = document.getElementById('report-template-modal');
    if (!modal) return;
    modal.classList.add('active');
    
    const form = document.getElementById('report-template-form');
    form.reset();
    document.getElementById('report-template-id').value = '';
    
    if (id) {
        document.getElementById('report-template-modal-title').innerText = 'Edit Report Template';
        try {
            const res = await fetch(`/api/report_templates/${id}`);
            const t = await res.json();
            document.getElementById('report-template-id').value = t.id;
            document.getElementById('rt-name').value = t.name;
            document.getElementById('rt-type').value = t.template_type;
            document.getElementById('rt-classification').value = t.classification;
            document.getElementById('rt-footer').value = t.footer_text || '';
            
            try {
                templateStructure = JSON.parse(t.structure || '[]');
            } catch(e) {
                templateStructure = defaultTemplateStructure;
            }
            if (!templateStructure || templateStructure.length === 0) templateStructure = defaultTemplateStructure;
            renderRtStructureEditor();
        } catch(e) {
            console.error(e);
        }
    } else {
        document.getElementById('report-template-modal-title').innerText = 'Add Report Template';
        document.getElementById('rt-classification').value = "Confidential";
        document.getElementById('rt-footer').value = "PentaGO Security Assessment Report";
        templateStructure = JSON.parse(JSON.stringify(defaultTemplateStructure));
        renderRtStructureEditor();
    }
}

function closeReportTemplateModal() {
    const modal = document.getElementById('report-template-modal');
    if (modal) modal.classList.remove('active');
}

function renderRtStructureEditor() {
    const container = document.getElementById('rt-outline-editor');
    if (!container) return;
    
    let html = '';
    templateStructure.forEach((sec, sIdx) => {
        html += `
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 1rem; margin-bottom: 1rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                <input type="text" class="form-control" value="${sec.title}" onchange="rtUpdateSectionTitle(${sIdx}, this.value)" style="font-weight: 600; font-size: 0.95rem; width: 80%;">
                <button type="button" class="btn btn-action-delete" onclick="rtDeleteSection(${sIdx})">Delete Chapter</button>
            </div>
            <div style="padding-left: 1.5rem; margin-top: 1rem;">
        `;
        
        if (sec.subsections) {
            sec.subsections.forEach((sub, subIdx) => {
                html += `
                <div style="display:flex; align-items:center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <span style="color:var(--text-secondary);">↳</span>
                    <input type="text" class="form-control" value="${sub.title}" onchange="rtUpdateSubsectionTitle(${sIdx}, ${subIdx}, this.value)" style="font-size: 0.85rem; padding: 0.35rem 0.5rem; flex: 1;">
                    <button type="button" class="btn-helper" style="color:var(--severity-critical); border-color:var(--severity-critical); padding: 0.25rem 0.5rem; font-size:0.75rem;" onclick="rtDeleteSubsection(${sIdx}, ${subIdx})">x</button>
                </div>
                `;
            });
        }
        
        html += `
                <button type="button" class="btn-helper" onclick="rtAddSubsection(${sIdx})" style="font-size:0.75rem; padding:0.25rem 0.5rem; margin-top: 0.5rem;">+ Add Sub-chapter</button>
            </div>
        </div>
        `;
    });
    
    container.innerHTML = html;
}

function rtAddSection() {
    const newId = 'sec-' + Date.now();
    templateStructure.push({ id: newId, title: 'New Chapter', subsections: [] });
    renderRtStructureEditor();
}

function rtUpdateSectionTitle(sIdx, val) {
    templateStructure[sIdx].title = val;
}

function rtDeleteSection(sIdx) {
    if(confirm("Delete this chapter?")) {
        templateStructure.splice(sIdx, 1);
        renderRtStructureEditor();
    }
}

function rtAddSubsection(sIdx) {
    const newId = 'sub-' + Date.now();
    if(!templateStructure[sIdx].subsections) templateStructure[sIdx].subsections = [];
    templateStructure[sIdx].subsections.push({ id: newId, title: 'New Sub-chapter' });
    renderRtStructureEditor();
}

function rtUpdateSubsectionTitle(sIdx, subIdx, val) {
    templateStructure[sIdx].subsections[subIdx].title = val;
}

function rtDeleteSubsection(sIdx, subIdx) {
    if(confirm("Delete this sub-chapter?")) {
        templateStructure[sIdx].subsections.splice(subIdx, 1);
        renderRtStructureEditor();
    }
}

async function saveReportTemplate(event) {
    if (event) event.preventDefault();
    const id = document.getElementById('report-template-id').value;
    const payload = {
        name: document.getElementById('rt-name').value.trim(),
        template_type: document.getElementById('rt-type').value,
        classification: document.getElementById('rt-classification').value,
        footer_text: document.getElementById('rt-footer').value,
        structure: JSON.stringify(templateStructure)
    };
    
    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/report_templates/${id}` : '/api/report_templates';
        
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            closeReportTemplateModal();
            loadReportTemplates();
            populateReportTemplatesSelect();
            alert("Report template saved successfully!");
        } else {
            const data = await res.json();
            alert("Error: " + data.message);
        }
    } catch (e) {
        console.error(e);
        alert("Failed to save report template.");
    }
}

async function deleteReportTemplate(id) {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
        const res = await fetch(`/api/report_templates/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadReportTemplates();
            populateReportTemplatesSelect();
        } else {
            alert("Failed to delete template.");
        }
    } catch(e) {
        console.error(e);
    }
}
"""
    content += "\n" + template_logic

with open('static/js/app.js', 'w') as f:
    f.write(content)
