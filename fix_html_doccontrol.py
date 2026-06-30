import re

with open('templates/index.html', 'r') as f:
    content = f.read()

doc_control_html = """                <div id="project-doc-control-card" class="sysreptor-report-card" style="margin-top: 2rem;">
                    <div class="sysreptor-report-title" style="display:flex; justify-content:space-between; align-items:center;">
                        <span>Document Control (Revision & Approvals)</span>
                        <button class="btn btn-secondary" onclick="saveDocumentControl()" style="font-size:0.78rem;padding:0.25rem 0.65rem;height:28px; display:inline-flex; align-items:center;">💾 Save</button>
                    </div>
                    <div class="sysreptor-content" style="padding: 1.5rem; background: #ffffff; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 8px 8px;">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;">
                            <!-- Revision History -->
                            <div>
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                                    <h4 style="margin:0;font-size:0.95rem;font-weight:700;">Revision History</h4>
                                    <button class="btn btn-primary" onclick="addRevisionRow()" style="font-size:0.75rem;padding:0.2rem 0.5rem;height:24px;">+ Add Revision</button>
                                </div>
                                <div id="revision-rows-container">
                                    <!-- Dynamic rows -->
                                </div>
                            </div>
                            <!-- Approvals -->
                            <div>
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                                    <h4 style="margin:0;font-size:0.95rem;font-weight:700;">Approvals</h4>
                                    <button class="btn btn-primary" onclick="addApprovalRow()" style="font-size:0.75rem;padding:0.2rem 0.5rem;height:24px;">+ Add Approval</button>
                                </div>
                                <div id="approval-rows-container">
                                    <!-- Dynamic rows -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
"""

content = content.replace("                </div>\n                \n                <div id=\"project-appendix-preview-card\"", 
                          "                </div>\n\n" + doc_control_html + "\n                <div id=\"project-appendix-preview-card\"")

with open('templates/index.html', 'w') as f:
    f.write(content)
