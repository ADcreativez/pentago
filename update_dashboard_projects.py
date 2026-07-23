import sys

# Update app.py
with open('app.py', 'r') as f:
    app_py = f.read()

old_app_py = """        status_counts = {'In Progress': 0, 'Completed': 0, 'Retest Pending': 0, 'Retest Completed': 0}
        for p in c_projects:
            if p.status in status_counts:
                status_counts[p.status] += 1
                
        consultants_progress.append({
            'id': c.id,
            'name': c.name,
            'role': c.role or 'Cybersecurity Consultant',
            'email': c.email or '-',
            'total_projects': len(c_projects),
            'status_counts': status_counts
        })"""

new_app_py = """        status_counts = {'In Progress': 0, 'Completed': 0, 'Retest Pending': 0, 'Retest Completed': 0}
        projects_by_status = {'In Progress': [], 'Completed': [], 'Retest Pending': [], 'Retest Completed': []}
        for p in c_projects:
            if p.status in status_counts:
                status_counts[p.status] += 1
                projects_by_status[p.status].append({'id': p.id, 'name': p.name})
                
        consultants_progress.append({
            'id': c.id,
            'name': c.name,
            'role': c.role or 'Cybersecurity Consultant',
            'email': c.email or '-',
            'total_projects': len(c_projects),
            'status_counts': status_counts,
            'projects_by_status': projects_by_status
        })"""

app_py = app_py.replace(old_app_py, new_app_py)
with open('app.py', 'w') as f:
    f.write(app_py)


# Update app.js
with open('static/js/app.js', 'r') as f:
    app_js = f.read()

old_app_js = """                            if (counts['In Progress'] > 0) {
                                breakdownHTML += `<span class="badge status-inprogress" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; margin-right: 0.5rem; font-weight: 600;">In Progress: ${counts['In Progress']}</span>`;
                            }
                            if (counts['Completed'] > 0) {
                                breakdownHTML += `<span class="badge status-completed" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; margin-right: 0.5rem; font-weight: 600;">Completed: ${counts['Completed']}</span>`;
                            }
                            if (counts['Retest Pending'] > 0) {
                                breakdownHTML += `<span class="badge status-retestpending" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; margin-right: 0.5rem; font-weight: 600;">Retest Pending: ${counts['Retest Pending']}</span>`;
                            }
                            if (counts['Retest Completed'] > 0) {
                                breakdownHTML += `<span class="badge status-retestcompleted" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; margin-right: 0.5rem; font-weight: 600;">Retest Completed: ${counts['Retest Completed']}</span>`;
                            }"""

new_app_js = """                            const renderBadge = (status, cssClass) => {
                                if (counts[status] > 0) {
                                    const encodedProjects = encodeURIComponent(JSON.stringify(c.projects_by_status[status] || []));
                                    breakdownHTML += `<span class="badge ${cssClass}" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; margin-right: 0.5rem; font-weight: 600; cursor: pointer;" onclick="showConsultantProjectsByStatus('${c.name}', '${status}', '${encodedProjects}')" title="Click to view projects">${status}: ${counts[status]}</span>`;
                                }
                            };
                            
                            renderBadge('In Progress', 'status-inprogress');
                            renderBadge('Completed', 'status-completed');
                            renderBadge('Retest Pending', 'status-retestpending');
                            renderBadge('Retest Completed', 'status-retestcompleted');"""

app_js = app_js.replace(old_app_js, new_app_js)

modal_js = """
window.showConsultantProjectsByStatus = function(name, status, encodedProjects) {
    const projects = JSON.parse(decodeURIComponent(encodedProjects));
    document.getElementById('consultant-projects-title').innerText = `${name} - ${status} Projects`;
    const list = document.getElementById('consultant-projects-list');
    list.innerHTML = '';
    
    if (projects.length === 0) {
        list.innerHTML = '<li style="color: var(--text-secondary); font-style: italic;">No projects found.</li>';
    } else {
        projects.forEach(p => {
            list.innerHTML += `<li style="padding: 0.5rem; background: #f8fafc; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.9rem;">
                <a href="#" onclick="closeConsultantProjectsModal(); viewProject(${p.id}); event.preventDefault();" style="color: var(--accent-blue); font-weight: 600; text-decoration: none;">${p.name}</a>
            </li>`;
        });
    }
    document.getElementById('consultant-projects-modal').classList.add('active');
};

window.closeConsultantProjectsModal = function() {
    document.getElementById('consultant-projects-modal').classList.remove('active');
};
"""

if 'window.showConsultantProjectsByStatus' not in app_js:
    app_js += modal_js

with open('static/js/app.js', 'w') as f:
    f.write(app_js)

print("Updated app.py and app.js")
