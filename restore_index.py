import re

with open('templates/index.html', 'r') as f:
    content = f.read()

# 1. Add "Report Templates" tab
if 'onclick="switchTab(\'report-templates\')"' not in content:
    content = content.replace("onclick=\"switchTab('testing-guide')\">Testing Guide</button>", "onclick=\"switchTab('report-templates')\">Report Templates</button>\n            <button class=\"tab-btn\" onclick=\"switchTab('testing-guide')\">Testing Guide</button>")

# 2. Add "report-templates-view" container
if '<div id="report-templates-view"' not in content:
    view_html = """
        <!-- Report Templates View -->
        <div id="report-templates-view" class="view-section" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <h2 class="section-title">Report Templates</h2>
                    <p class="section-subtitle">Manage standard outlines and structures for your reports.</p>
                </div>
                <button class="btn btn-primary" onclick="openReportTemplateModal()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    New Template
                </button>
            </div>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>TEMPLATE NAME</th>
                            <th>TYPE</th>
                            <th>CLASSIFICATION</th>
                            <th>FOOTER TEXT</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody id="report-template-table-body">
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Testing Guide View -->"""
    content = content.replace("<!-- Testing Guide View -->", view_html.strip() + "\n\n        <!-- Testing Guide View -->")

# 3. Add dropdown to project-modal
if '<select id="project-template-select"' not in content:
    select_html = """
                    <div class="form-group" style="grid-column: span 2;">
                        <label>Load Report Template (Optional)</label>
                        <select id="project-template-select" class="form-control">
                            <option value="">-- No Template --</option>
                        </select>
                        <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.25rem;">Selecting a template will populate the Project Workspace with predefined chapters and structures.</p>
                    </div>
                    """
    content = content.replace('<label>Out of Scope</label>', select_html.strip() + '\n                    </div>\n                    <div class="form-group" style="grid-column: span 2;">\n                        <label>Out of Scope</label>')

# 4. Add Report Template Modal
if '<div id="report-template-modal"' not in content:
    modal_html = """
    <!-- Report Template Modal -->
    <div id="report-template-modal" class="modal">
        <div class="modal-content" style="max-width: 900px;">
            <div class="modal-header">
                <h3 id="report-template-modal-title" style="margin: 0; font-family: var(--font-title); font-size: 1.25rem; color: var(--text-primary);">Add Report Template</h3>
                <span class="close-modal" onclick="closeReportTemplateModal()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="report-template-form" onsubmit="saveReportTemplate(event)">
                    <input type="hidden" id="report-template-id">
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                        <div class="form-group" style="grid-column: span 2;">
                            <label>Template Name</label>
                            <input type="text" id="rt-name" class="form-control" required placeholder="e.g. Standard Web Assessment">
                        </div>
                        <div class="form-group">
                            <label>Template Type</label>
                            <input type="text" id="rt-type" class="form-control" value="Vulnerability Assessment">
                        </div>
                        <div class="form-group">
                            <label>Classification</label>
                            <input type="text" id="rt-classification" class="form-control" value="Confidential">
                        </div>
                        <div class="form-group" style="grid-column: span 2;">
                            <label>Footer Text</label>
                            <input type="text" id="rt-footer" class="form-control" value="PentaGO Security Assessment Report">
                        </div>
                    </div>
                    
                    <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 2rem 0;">
                    
                    <h4 style="font-family: var(--font-title); font-size: 1.1rem; margin-bottom: 1rem; color: var(--text-primary);">Document Outline (Chapters & Sub-chapters)</h4>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Susun kerangka Bab dan Sub-Bab untuk template ini. Nantinya akan diubah menjadi Editor saat template di-load ke Project Workspace.</p>
                    
                    <div id="rt-outline-editor" style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem;">
                        <!-- JS akan merender kotak drag-and-drop outline di sini -->
                    </div>
                    
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button type="button" class="btn btn-secondary" onclick="rtAddSection()" style="font-size: 0.85rem; display: flex; align-items: center; gap: 0.25rem;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Add New Chapter
                        </button>
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2.5rem;">
                        <button type="button" class="btn btn-secondary" onclick="closeReportTemplateModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Template</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    """
    content = content.replace("</body>", modal_html.strip() + "\n</body>")

with open('templates/index.html', 'w') as f:
    f.write(content)
