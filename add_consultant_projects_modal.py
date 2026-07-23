import sys

with open('templates/index.html', 'r') as f:
    html = f.read()

modal = """
    <!-- Consultant Projects Modal -->
    <div id="consultant-projects-modal" class="modal-overlay">
        <div class="modal" style="max-width: 500px; width: 90%;">
            <div class="modal-header">
                <h3 id="consultant-projects-title">Consultant Projects</h3>
                <button type="button" class="close-btn" onclick="closeConsultantProjectsModal()">&times;</button>
            </div>
            <div class="modal-body">
                <ul id="consultant-projects-list" style="list-style-type: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem;">
                </ul>
            </div>
            <div class="modal-footer" style="margin-top: 1rem; text-align: right;">
                <button type="button" class="btn btn-secondary" onclick="closeConsultantProjectsModal()">Close</button>
            </div>
        </div>
    </div>
"""

if 'id="consultant-projects-modal"' not in html:
    html = html.replace('</body>', modal + '\n</body>')

with open('templates/index.html', 'w') as f:
    f.write(html)
print("Added modal to index.html")
