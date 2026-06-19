let activeTab = 'dashboard';
let currentCompanyId = null;
let currentProjectId = null;
let currentProject = null;
let severityChartInstance = null;
let statusChartInstance = null;
let projectSeverityChartInstance = null;
let consultantProgressChartInstance = null;
let currentUser = null;
let globalUsersList = [];
let activeConfigSubTab = 'users';
let testingGuideData = {};
let currentDashboardYear = 'all';
let currentProjectFindings = [];
let mfaCountdownInterval = null;

const cacheStore = {
    dashboard: {},
    companies: null,
    projects: null,
    findingTemplates: null,
    testingGuides: null,
    frameworks: null,
    references: null,
    consultants: null
};

function clearCacheStore() {
    cacheStore.dashboard = {};
    cacheStore.companies = null;
    cacheStore.projects = null;
    cacheStore.findingTemplates = null;
    cacheStore.testingGuides = null;
    cacheStore.frameworks = null;
    cacheStore.references = null;
    cacheStore.consultants = null;
}

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', adminOnly: false },
    { id: 'companies', label: 'Clients', icon: '🏢', adminOnly: false },
    { id: 'projects', label: 'Projects', icon: '📋', adminOnly: false },
    { id: 'findings', label: 'Findings', icon: '🔍', adminOnly: false },
    { id: 'testing-guide', label: 'Testing Guide', icon: '📖', adminOnly: false },
    { id: 'framework', label: 'Framework', icon: '📋', adminOnly: false },
    { id: 'reference', label: 'Reference', icon: '📚', adminOnly: false },
    { id: 'consultants', label: 'Members', icon: '👥', adminOnly: false },
    { id: 'config', label: 'System', icon: '⚙️', adminOnly: true }
];

// CVSS state
let cvss3Metrics = { AV: '', AC: '', PR: '', UI: '', S: '', C: '', I: '', A: '' };
let cvss4Metrics = { AV4: '', AC4: '', AT4: '', PR4: '', UI4: '', VC4: '', VI4: '', VA4: '' };

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        document.body.classList.add('sidebar-collapsed');
    }
    checkAuth();
    setupCvssSelectors();
    initCweAutocomplete();
    setupImagePaste();
    startWibClock();

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('top-nav-profile-box');
        if (dropdown && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
});

function checkAuth() {
    fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
            if (data.logged_in) {
                currentUser = data;
                document.getElementById('login-overlay').style.display = 'none';
                
                const topNavBar = document.getElementById('top-nav-bar');
                if (topNavBar) topNavBar.style.display = 'flex';
                
                const sidebarUserBox = document.getElementById('sidebar-user-box');
                if (sidebarUserBox) sidebarUserBox.style.display = 'flex';
                
                // Populate elements
                const avatarEl = document.getElementById('top-user-avatar');
                if (avatarEl && currentUser.username) {
                    avatarEl.innerText = currentUser.username.charAt(0).toUpperCase();
                }
                const nameEl = document.getElementById('top-user-name');
                if (nameEl) nameEl.innerText = currentUser.username;
                
                const roleEl = document.getElementById('top-user-role');
                if (roleEl) roleEl.innerText = currentUser.role;
                
                const dropRoleEl = document.getElementById('dropdown-user-role');
                if (dropRoleEl) dropRoleEl.innerText = currentUser.role;
                
                const dropNameEl = document.getElementById('dropdown-user-name');
                if (dropNameEl) dropNameEl.innerText = currentUser.username;
                
                renderSidebarNav();
                checkAdminUI();
                switchTab(activeTab);
                
                startMfaCountdown(currentUser);
            } else {
                currentUser = null;
                if (mfaCountdownInterval) {
                    clearInterval(mfaCountdownInterval);
                    mfaCountdownInterval = null;
                }
                const banner = document.getElementById('mfa-warning-banner');
                if (banner) banner.style.display = 'none';
                
                document.getElementById('login-overlay').style.display = 'flex';
                const topNavBar = document.getElementById('top-nav-bar');
                if (topNavBar) topNavBar.style.display = 'none';
                const sidebarUserBox = document.getElementById('sidebar-user-box');
                if (sidebarUserBox) sidebarUserBox.style.display = 'none';
            }
        })
        .catch(err => {
            console.error("Auth check failed:", err);
            currentUser = null;
            if (mfaCountdownInterval) {
                clearInterval(mfaCountdownInterval);
                mfaCountdownInterval = null;
            }
            const banner = document.getElementById('mfa-warning-banner');
            if (banner) banner.style.display = 'none';
            
            document.getElementById('login-overlay').style.display = 'flex';
            const topNavBar = document.getElementById('top-nav-bar');
            if (topNavBar) topNavBar.style.display = 'none';
            const sidebarUserBox = document.getElementById('sidebar-user-box');
            if (sidebarUserBox) sidebarUserBox.style.display = 'none';
        });
}

function startMfaCountdown(user) {
    const banner = document.getElementById('mfa-warning-banner');
    if (!banner) return;
    
    if (mfaCountdownInterval) {
        clearInterval(mfaCountdownInterval);
        mfaCountdownInterval = null;
    }
    
    if (user.mfa_enabled) {
        banner.style.display = 'none';
        return;
    }
    
    banner.style.display = 'flex';
    
    const createdDate = new Date(user.created_at.replace(' ', 'T') + 'Z');
    const targetTime = createdDate.getTime() + 24 * 60 * 60 * 1000;
    
    function updateTimer() {
        const now = new Date().getTime();
        const remaining = targetTime - now;
        
        if (remaining <= 0) {
            clearInterval(mfaCountdownInterval);
            mfaCountdownInterval = null;
            banner.style.display = 'none';
            
            // Force logout
            fetch('/api/auth/logout', { method: 'POST' })
                .then(() => {
                    currentUser = null;
                    checkAuth();
                    const errorMsg = document.getElementById('login-error-msg');
                    if (errorMsg) {
                        errorMsg.innerText = 'Akun dinonaktifkan karena tidak mengaktifkan MFA dalam waktu 24 jam.';
                        errorMsg.style.display = 'block';
                        errorMsg.style.color = 'var(--severity-critical)';
                    }
                })
                .catch(err => console.error("Auto logout failed:", err));
            return;
        }
        
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        
        const pad = (num) => String(num).padStart(2, '0');
        const timerEl = document.getElementById('mfa-countdown-timer');
        if (timerEl) {
            timerEl.innerText = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        }
    }
    
    updateTimer();
    mfaCountdownInterval = setInterval(updateTimer, 1000);
}

function canEditProject(p) {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;
    
    const consultants = cacheStore.consultants || [];
    const userConsultant = consultants.find(c => 
        c.name.toLowerCase() === currentUser.username.toLowerCase() || 
        (c.email && c.email.split('@')[0].toLowerCase() === currentUser.username.toLowerCase())
    );
    
    if (userConsultant) {
        const roleLower = (userConsultant.role || '').toLowerCase();
        if (roleLower.includes('leader') || roleLower.includes('lead')) {
            return true;
        }
        if (p.pentest_consultant_id && userConsultant.id === p.pentest_consultant_id) {
            return true;
        }
        if (p.retest_consultant_id && userConsultant.id === p.retest_consultant_id) {
            return true;
        }
    }
    
    const userLower = currentUser.username.toLowerCase();
    if (p.pentest_consultant_name && p.pentest_consultant_name.toLowerCase() === userLower) {
        return true;
    }
    if (p.retest_consultant_name && p.retest_consultant_name.toLowerCase() === userLower) {
        return true;
    }
    
    return false;
}

function isTeamLeaderOrAdmin() {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;
    
    const consultants = cacheStore.consultants || [];
    const userConsultant = consultants.find(c => 
        c.name.toLowerCase() === currentUser.username.toLowerCase() || 
        (c.email && c.email.split('@')[0].toLowerCase() === currentUser.username.toLowerCase())
    );
    
    if (userConsultant) {
        const roleLower = (userConsultant.role || '').toLowerCase();
        if (roleLower.includes('leader') || roleLower.includes('lead')) {
            return true;
        }
    }
    return false;
}

async function showAssignedProjects() {
    let projects = cacheStore.projects;
    if (!projects) {
        try {
            const res = await fetch('/api/projects');
            projects = await res.json();
            cacheStore.projects = projects;
        } catch (e) {
            console.error("Failed to load projects for assignments:", e);
            projects = [];
        }
    }
    
    const consultants = cacheStore.consultants || [];
    const userConsultant = consultants.find(c => 
        c.name.toLowerCase() === currentUser.username.toLowerCase() || 
        (c.email && c.email.split('@')[0].toLowerCase() === currentUser.username.toLowerCase())
    );
    
    const isLeadOrAdmin = currentUser.role === 'Admin' || (userConsultant && ((userConsultant.role || '').toLowerCase().includes('leader') || (userConsultant.role || '').toLowerCase().includes('lead')));
    
    let assigned = [];
    if (isLeadOrAdmin) {
        assigned = projects;
        document.getElementById('assigned-projects-modal-title').innerText = 'All Active Projects & Progress';
        document.getElementById('assigned-projects-modal-subtitle').innerText = 'Daftar semua proyek pengetesan aktif dalam sistem beserta perkembangannya.';
    } else {
        const userLower = currentUser.username.toLowerCase();
        assigned = projects.filter(p => {
            const isPentester = p.pentest_consultant_name && p.pentest_consultant_name.toLowerCase() === userLower;
            const isRetester = p.retest_consultant_name && p.retest_consultant_name.toLowerCase() === userLower;
            const isPentesterId = userConsultant && p.pentest_consultant_id && p.pentest_consultant_id === userConsultant.id;
            const isRetesterId = userConsultant && p.retest_consultant_id && p.retest_consultant_id === userConsultant.id;
            return isPentester || isRetester || isPentesterId || isRetesterId;
        });
        document.getElementById('assigned-projects-modal-title').innerText = 'My Assigned Projects & Progress';
        document.getElementById('assigned-projects-modal-subtitle').innerText = 'Daftar proyek pengetesan yang ditugaskan kepada Anda beserta status perkembangannya.';
    }
    
    const tbody = document.getElementById('assigned-projects-tbody');
    tbody.innerHTML = '';
    
    if (assigned.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 2.5rem;">Tidak ada proyek pengetesan aktif yang ditugaskan saat ini.</td></tr>';
    } else {
        let tbodyHTML = '';
        assigned.forEach(p => {
            let roleLabel = '-';
            const userLower = currentUser.username.toLowerCase();
            const isPentester = p.pentest_consultant_name && p.pentest_consultant_name.toLowerCase() === userLower;
            const isRetester = p.retest_consultant_name && p.retest_consultant_name.toLowerCase() === userLower;
            const isPentesterId = userConsultant && p.pentest_consultant_id && p.pentest_consultant_id === userConsultant.id;
            const isRetesterId = userConsultant && p.retest_consultant_id && p.retest_consultant_id === userConsultant.id;
            
            if ((isPentester || isPentesterId) && (isRetester || isRetesterId)) {
                roleLabel = '<span class="badge" style="background-color: #ede9fe; color: #7c3aed; border: 1px solid rgba(124, 58, 237, 0.2);">Pentester & Retester</span>';
            } else if (isPentester || isPentesterId) {
                roleLabel = '<span class="badge" style="background-color: #e0f2fe; color: #0369a1; border: 1px solid rgba(3, 105, 161, 0.2);">Pentester</span>';
            } else if (isRetester || isRetesterId) {
                roleLabel = '<span class="badge" style="background-color: #f3e8ff; color: #6b21a8; border: 1px solid rgba(107, 33, 168, 0.2);">Retester</span>';
            } else if (isLeadOrAdmin) {
                roleLabel = '<span class="badge" style="background-color: #f1f5f9; color: #475569; border: 1px solid rgba(71, 85, 105, 0.2);">Observer / Lead</span>';
            }
            
            const statusClass = p.status === 'Completed' ? 'badge-low' : 'badge-high';
            
            tbodyHTML += `
                <tr style="border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="closeAssignedProjectsModal(); viewProject(${p.id});">
                    <td style="padding: 0.75rem 1rem;"><a href="#" style="color: var(--accent-blue); font-weight: 600; text-decoration: none;" onclick="event.preventDefault(); closeAssignedProjectsModal(); viewProject(${p.id});">${p.name}</a></td>
                    <td style="padding: 0.75rem 1rem; color: var(--text-primary);">${p.company_name || '-'}</td>
                    <td style="padding: 0.75rem 1rem;">${roleLabel}</td>
                    <td style="padding: 0.75rem 1rem; text-align: center;">
                        <span style="font-weight: 600; color: var(--text-primary);">${p.active_findings || 0} Open</span>
                        <span style="font-size: 0.75rem; color: var(--text-secondary);"> / ${p.total_findings || 0} Total</span>
                    </td>
                    <td style="padding: 0.75rem 1rem; text-align: center;">
                        <span class="badge badge-status ${statusClass}">${p.status}</span>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = tbodyHTML;
    }
    
    document.getElementById('assigned-projects-modal').classList.add('active');
}

function closeAssignedProjectsModal() {
    document.getElementById('assigned-projects-modal').classList.remove('active');
}

function updateBellNotificationStatus() {
    if (!currentUser) return;
    
    let projects = cacheStore.projects;
    if (!projects) return;
    
    const consultants = cacheStore.consultants || [];
    const userConsultant = consultants.find(c => 
        c.name.toLowerCase() === currentUser.username.toLowerCase() || 
        (c.email && c.email.split('@')[0].toLowerCase() === currentUser.username.toLowerCase())
    );
    
    const isLeadOrAdmin = currentUser.role === 'Admin' || (userConsultant && ((userConsultant.role || '').toLowerCase().includes('leader') || (userConsultant.role || '').toLowerCase().includes('lead')));
    
    let assigned = [];
    if (isLeadOrAdmin) {
        assigned = projects;
    } else {
        const userLower = currentUser.username.toLowerCase();
        assigned = projects.filter(p => {
            const isPentester = p.pentest_consultant_name && p.pentest_consultant_name.toLowerCase() === userLower;
            const isRetester = p.retest_consultant_name && p.retest_consultant_name.toLowerCase() === userLower;
            const isPentesterId = userConsultant && p.pentest_consultant_id && p.pentest_consultant_id === userConsultant.id;
            const isRetesterId = userConsultant && p.retest_consultant_id && p.retest_consultant_id === userConsultant.id;
            return isPentester || isRetester || isPentesterId || isRetesterId;
        });
    }
    
    const storageKey = `viewed_projects_${currentUser.username}`;
    let viewedIds = [];
    try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            viewedIds = JSON.parse(stored);
        }
    } catch (e) {
        console.error(e);
    }
    
    const unreadProjects = assigned.filter(p => !viewedIds.includes(p.id));
    
    const bellBtn = document.getElementById('btn-notification-bell');
    if (bellBtn) {
        if (unreadProjects.length > 0) {
            bellBtn.classList.add('unread');
            bellBtn.title = `Notifications (${unreadProjects.length} unread projects)`;
        } else {
            bellBtn.classList.remove('unread');
            bellBtn.title = 'Notifications';
        }
    }
}

function startWibClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const clockEl = document.getElementById('wib-clock');
    if (!clockEl) return;
    const now = new Date();
    
    const optionsDate = {
        timeZone: 'Asia/Jakarta',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    
    const optionsTime = {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    try {
        const dateStr = now.toLocaleDateString('id-ID', optionsDate);
        const timeStr = now.toLocaleTimeString('id-ID', optionsTime);
        clockEl.innerText = `${dateStr} • ${timeStr} WIB`;
    } catch (e) {
        clockEl.innerText = now.toUTCString();
    }
}

function toggleProfileDropdown(event) {
    if (event) {
        event.stopPropagation();
    }
    const dropdown = document.getElementById('top-nav-profile-box');
    if (dropdown) {
        dropdown.classList.toggle('open');
    }
}

const TAB_ICONS = {
    'dashboard': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>`,
    'companies': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="16"></line><line x1="15" y1="22" x2="15" y2="16"></line><line x1="9" y1="16" x2="15" y2="16"></line><path d="M8 6h2v2H8V6zm0 4h2v2H8v-2zm8-4h-2v2h2V6zm0 4h-2v2h2v-2z"></path></svg>`,
    'projects': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    'findings': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`,
    'testing-guide': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
    'framework': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path><line x1="9" y1="3" x2="9" y2="21"></line><line x1="2" y1="9" x2="22" y2="9"></line><line x1="2" y1="15" x2="22" y2="15"></line></svg>`,
    'reference': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
    'consultants': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    'config': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
};

function renderSidebarNav() {
    const container = document.getElementById('sidebar-nav-links');
    if (!container) return;
    
    container.innerHTML = '';
    TABS.forEach(tab => {
        if (tab.adminOnly && currentUser && currentUser.role !== 'Admin') {
            return;
        }
        
        const li = document.createElement('li');
        const activeClass = activeTab === tab.id ? 'active' : '';
        const iconSVG = TAB_ICONS[tab.id] || '';
        li.innerHTML = `<a class="nav-item ${activeClass}" onclick="switchTab('${tab.id}')">
            ${iconSVG} <span>${tab.label}</span>
        </a>`;
        container.appendChild(li);
    });
}

function toggleSidebar() {
    document.body.classList.toggle('sidebar-collapsed');
    localStorage.setItem('sidebarCollapsed', document.body.classList.contains('sidebar-collapsed'));
}

function switchTab(tab) {
    activeTab = tab;
    
    // Re-render sidebar to highlight active menu
    renderSidebarNav();

    // Toggle views
    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
    
    if (tab === 'dashboard') {
        document.getElementById('dashboard-view').style.display = 'block';
        loadDashboard();
    } else if (tab === 'companies') {
        document.getElementById('companies-view').style.display = 'block';
        loadCompanies();
    } else if (tab === 'projects') {
        document.getElementById('projects-view').style.display = 'block';
        loadProjects();
    } else if (tab === 'findings') {
        document.getElementById('findings-view').style.display = 'block';
        loadFindings();
    } else if (tab === 'consultants') {
        document.getElementById('consultants-view').style.display = 'block';
        loadConsultants();
    } else if (tab === 'testing-guide') {
        loadTestingGuide();
    } else if (tab === 'framework') {
        loadFrameworks();
    } else if (tab === 'reference') {
        loadReferences();
    } else if (tab === 'config') {
        if (!currentUser || currentUser.role !== 'Admin') {
            switchTab('dashboard');
            return;
        }
        document.getElementById('config-view').style.display = 'block';
        if (activeConfigSubTab === 'users') {
            loadUsers();
        } else if (activeConfigSubTab === 'logs') {
            loadAuditLogs();
        } else if (activeConfigSubTab === 'blocklist') {
            loadBlocklist();
        }
    }
}

// Fetch dashboard stats & draw charts
async function loadDashboard() {
    try {
        let stats = cacheStore.dashboard[currentDashboardYear];
        if (!stats) {
            const response = await fetch(`/api/dashboard?year=${currentDashboardYear}`);
            stats = await response.json();
            cacheStore.dashboard[currentDashboardYear] = stats;
        }

        // Populate available years in the select element
        const yearSelect = document.getElementById('dashboard-year-select');
        if (yearSelect && stats.available_years) {
            const currentVal = yearSelect.value || currentDashboardYear;
            yearSelect.innerHTML = '<option value="all" style="color: #333;">All Years</option>';
            stats.available_years.forEach(yr => {
                const opt = document.createElement('option');
                opt.value = yr;
                opt.textContent = yr;
                opt.style.color = '#333';
                yearSelect.appendChild(opt);
            });
            yearSelect.value = currentVal;
        }

        document.getElementById('stat-companies').innerText = stats.total_companies;
        document.getElementById('stat-projects').innerText = stats.total_projects;
        document.getElementById('stat-findings').innerText = stats.open_findings;
        
        const consultants = stats.consultants_progress || [];
        document.getElementById('stat-consultants').innerText = consultants.length;

        // Render date
        const dateEl = document.getElementById('dashboard-date');
        if (dateEl) {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateEl.innerText = now.toLocaleDateString('en-US', options);
        }

        // Render Severity Distribution Chart
        if (severityChartInstance) severityChartInstance.destroy();
        const sevCtx = document.getElementById('severityChart').getContext('2d');
        severityChartInstance = new Chart(sevCtx, {
            type: 'bar',
            data: {
                labels: ['Critical', 'High', 'Medium', 'Low', 'Info'],
                datasets: [{
                    label: 'Findings',
                    data: [
                        stats.severity_distribution.Critical || 0,
                        stats.severity_distribution.High || 0,
                        stats.severity_distribution.Medium || 0,
                        stats.severity_distribution.Low || 0,
                        stats.severity_distribution.Info || 0
                    ],
                    backgroundColor: [
                        '#7c3aed', '#e11d48', '#d97706', '#16a34a', '#0284c7'
                    ],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#e2e8f0' } },
                    x: { grid: { display: false } }
                }
            }
        });

        // Render Status Pie Chart
        if (statusChartInstance) statusChartInstance.destroy();
        const statusCtx = document.getElementById('statusChart').getContext('2d');
        statusChartInstance = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(stats.project_statuses),
                datasets: [{
                    data: Object.values(stats.project_statuses),
                    backgroundColor: ['#0f62fe', '#16a34a', '#ea580c', '#8257e5'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#475569' } }
                }
            }
        });

        // Render Consultant Progress Table
        const consTbody = document.getElementById('dashboard-consultants-progress-body');
        if (consTbody) {
            consTbody.innerHTML = '';
            const consultants = stats.consultants_progress || [];
            if (consultants.length === 0) {
                consTbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 2rem;">No members registered yet.</td></tr>';
            } else {
                // Group consultants by role category
                const categories = {
                    'Consultants': [],
                    'PMs': [],
                    'Sales': []
                };
                consultants.forEach(c => {
                    const cat = getMemberCategory(c.role);
                    categories[cat].push(c);
                });

                let tbodyHTML = '';
                const catNames = {
                    'Consultants': 'Cybersecurity Consultants',
                    'PMs': 'Project Managers',
                    'Sales': 'Sales & Account Managers'
                };

                Object.keys(categories).forEach(catKey => {
                    const list = categories[catKey];
                    if (list.length === 0) return;

                    // Render category subheader row
                    tbodyHTML += `
                        <tr class="category-header-row" style="background-color: #f8fafc; font-weight: bold; border-top: 1px solid var(--border-color);">
                            <td colspan="4" style="padding: 0.75rem 1rem; color: var(--text-primary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; background-color: var(--accent-light, #e0e7ff); color: #1e3a8a;">
                                ${catNames[catKey]}
                            </td>
                        </tr>
                    `;

                    list.forEach(c => {
                        const counts = c.status_counts || {};
                        let breakdownHTML = '';

                        if (c.total_projects === 0) {
                            breakdownHTML = '<span style="color: var(--text-secondary); font-style: italic; font-size: 0.85rem;">No active assignments</span>';
                        } else {
                            if (counts['In Progress'] > 0) {
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
                            }
                        }

                        tbodyHTML += `
                            <tr>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                                        <a href="#" style="color: var(--accent-blue); font-weight: 600; text-decoration: none;" onclick="event.preventDefault(); switchTab('consultants'); viewConsultant(${c.id});">
                                            ${c.name}
                                        </a>
                                    </div>
                                </td>
                                <td>${c.role}</td>
                                <td style="text-align: center;"><span style="display: inline-block; background: #e0e7ff; color: #4f46e5; border-radius: 9999px; padding: 0.25rem 0.75rem; font-weight: 600; font-size: 0.85rem;">${c.total_projects}</span></td>
                                <td>${breakdownHTML}</td>
                            </tr>
                        `;
                    });
                });
                consTbody.innerHTML = tbodyHTML;
            }
        }

    } catch (err) {
        console.error('Failed to load dashboard statistics', err);
    }
}

function filterDashboardByYear(year) {
    currentDashboardYear = year;
    loadDashboard();
}

// Company Actions
async function loadCompanies() {
    let companies = cacheStore.companies;
    if (!companies) {
        const res = await fetch('/api/companies');
        companies = await res.json();
        cacheStore.companies = companies;
    }
    const container = document.getElementById('companies-grouped-container');
    container.innerHTML = '';
    
    if (companies.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 2rem; border: 1px dashed var(--border-color); border-radius: 8px;">No clients added yet. Click "+ Add Client" to create one.</div>';
        return;
    }

    // Group companies by Year
    const groups = {};
    companies.forEach(c => {
        let year = 'Unknown Year';
        if (c.created_at) {
            year = c.created_at.substring(0, 4);
        }
        if (!groups[year]) {
            groups[year] = [];
        }
        groups[year].push(c);
    });

    // Sort years descending
    const sortedYears = Object.keys(groups).sort((a, b) => b - a);

    sortedYears.forEach(year => {
        const yearSection = document.createElement('div');
        yearSection.style.marginBottom = '2.5rem';
        yearSection.innerHTML = `<h3 style="font-family: var(--font-title); font-size: 1.4rem; color: var(--text-primary); border-bottom: 2px solid var(--accent-blue); padding-bottom: 0.5rem; margin-bottom: 1.5rem;">${year}</h3>`;
        
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        
        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Industry</th>
                        <th>Sales Name</th>
                        <th>Active Projects</th>
                        <th>Open Findings</th>
                        <th>Overall Risk Score</th>
                        <th>Max Severity</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Sort companies in this year alphabetically by name
        groups[year].sort((a, b) => a.name.localeCompare(b.name));

        groups[year].forEach(c => {
            let badgeClass = getSeverityBadgeClass(c.overall_max_severity);
            tableHTML += `
                <tr>
                    <td><a href="#" style="color: var(--accent-blue); font-weight: 600; text-decoration: none;" onclick="viewCompany(${c.id})">${c.name}</a></td>
                    <td>${c.industry || '-'}</td>
                    <td>${c.sales_name || '-'}</td>
                    <td>${c.total_projects}</td>
                    <td>${c.active_findings}</td>
                    <td><strong style="color: var(--accent-purple);">${c.overall_risk_score}</strong></td>
                    <td><span class="badge ${badgeClass}">${c.overall_max_severity}</span></td>
                    <td>
                        <div style="display: flex; gap: 0.4rem; align-items: center;">
                            <button class="btn btn-action-edit" onclick="editCompany(${c.id})" title="Edit Client">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="btn btn-action-delete" onclick="deleteCompany(${c.id})" title="Delete Client">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;
        tableContainer.innerHTML = tableHTML;
        yearSection.appendChild(tableContainer);
        container.appendChild(yearSection);
    });
}

function populateCompanyYearDropdown(selectedYear) {
    const select = document.getElementById('company-year');
    if (!select) return;
    
    select.innerHTML = '';
    const currentYear = new Date().getFullYear();
    const startYear = 2020;
    const endYear = currentYear + 15; // Dynamically allow up to currentYear + 15 years
    
    for (let yr = endYear; yr >= startYear; yr--) {
        const opt = document.createElement('option');
        opt.value = yr.toString();
        opt.textContent = yr.toString();
        select.appendChild(opt);
    }
    
    if (selectedYear) {
        select.value = selectedYear.toString();
    } else {
        select.value = currentYear.toString();
    }
}

function openCompanyModal() {
    document.getElementById('company-form').reset();
    document.getElementById('company-id').value = '';
    document.getElementById('company-sales-name').value = '';
    populateCompanyYearDropdown();
    document.getElementById('company-modal-title').innerText = 'Add Company';
    document.getElementById('company-modal').classList.add('active');
}

function closeCompanyModal() {
    document.getElementById('company-modal').classList.remove('active');
}

async function saveCompany(e) {
    e.preventDefault();
    const id = document.getElementById('company-id').value;
    const name = document.getElementById('company-name').value;
    const industry = document.getElementById('company-industry').value;
    const sales_name = document.getElementById('company-sales-name').value;
    const year = document.getElementById('company-year').value;
    
    const payload = { name, industry, sales_name, year };
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/companies/${id}` : '/api/companies';

    await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    cacheStore.companies = null;
    cacheStore.dashboard = {};
    
    closeCompanyModal();
    if (currentCompanyId) {
        viewCompany(currentCompanyId);
    } else {
        loadCompanies();
    }
}

async function editCompany(id) {
    const res = await fetch(`/api/companies/${id}`);
    const c = await res.json();
    document.getElementById('company-id').value = c.id;
    document.getElementById('company-name').value = c.name;
    document.getElementById('company-industry').value = c.industry;
    document.getElementById('company-sales-name').value = c.sales_name || '';
    
    const year = c.created_at ? c.created_at.substring(0, 4) : new Date().getFullYear().toString();
    populateCompanyYearDropdown(year);
    
    document.getElementById('company-modal-title').innerText = 'Edit Company';
    document.getElementById('company-modal').classList.add('active');
}

async function deleteCompany(id) {
    if (confirm('Are you sure you want to delete this company? All associated projects and findings will be deleted.')) {
        await fetch(`/api/companies/${id}`, { method: 'DELETE' });
        cacheStore.companies = null;
        cacheStore.projects = null;
        cacheStore.dashboard = {};
        loadCompanies();
    }
}

function getSeverityBreakdownHTML(severityCounts) {
    if (!severityCounts) return '';
    const items = [];
    if (severityCounts.Critical > 0) items.push(`<span style="color: #7c3aed; font-weight: 700;">${severityCounts.Critical}C</span>`);
    if (severityCounts.High > 0) items.push(`<span style="color: #e11d48; font-weight: 700;">${severityCounts.High}H</span>`);
    if (severityCounts.Medium > 0) items.push(`<span style="color: #d97706; font-weight: 700;">${severityCounts.Medium}M</span>`);
    if (severityCounts.Low > 0) items.push(`<span style="color: #16a34a; font-weight: 700;">${severityCounts.Low}L</span>`);
    if (severityCounts.Info > 0) items.push(`<span style="color: #0284c7; font-weight: 700;">${severityCounts.Info}I</span>`);
    
    if (items.length === 0) return '';
    return `<div style="font-size: 0.72rem; margin-top: 0.15rem; display: flex; gap: 0.25rem;">${items.join(' ')}</div>`;
}

async function viewCompany(companyId) {
    currentCompanyId = companyId;
    const resCompany = await fetch(`/api/companies/${companyId}`);
    const company = await resCompany.json();
    
    const resProj = await fetch(`/api/projects?company_id=${companyId}`);
    const projects = await resProj.json();

    document.getElementById('detail-company-name').innerText = company.name;
    document.getElementById('detail-company-risk-badge').innerText = `Overall Risk: ${company.overall_risk_score} (${company.overall_max_severity})`;
    document.getElementById('detail-company-risk-badge').className = `badge ${getSeverityBadgeClass(company.overall_max_severity)}`;

    const tbody = document.getElementById('detail-company-projects-body');
    tbody.innerHTML = '';
    let tbodyHTML = '';
    projects.forEach(p => {
        tbodyHTML += `
            <tr>
                <td>
                    <a href="#" style="color: var(--accent-blue); text-decoration: none; font-weight: 600;" onclick="viewProject(${p.id})">${p.name}</a>
                    <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 0.15rem;">PO: ${p.po_number || '-'}</div>
                </td>
                <td><span class="badge badge-status ${getStatusBadgeClass(p.status)}">${p.status}</span></td>
                <td>${p.methodology || '-'}</td>
                <td>${p.project_type || '-'}</td>
                <td>${p.start_date || '-'}</td>
                <td>${p.end_date || '-'}</td>
                <td><strong style="color: var(--text-secondary); font-size: 0.85rem;">${p.pentest_consultant_name || '-'}</strong></td>
                <td>
                    <div>${p.active_findings} / ${p.total_findings}</div>
                    ${getSeverityBreakdownHTML(p.severity_counts)}
                </td>
                <td><strong style="color: var(--accent-purple);">${p.risk_score}</strong></td>
                <td><span class="badge ${getSeverityBadgeClass(p.max_severity)}">${p.max_severity}</span></td>
                <td>
                    <div style="display: flex; gap: 0.4rem; align-items: center;">
                        <button class="btn btn-action-play" onclick="viewProject(${p.id})" title="Lanjutkan Project">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        </button>
                        ${canEditProject(p) ? `
                        <button class="btn btn-action-edit" onclick="editProject(${p.id})" title="Edit Project">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn btn-action-delete" onclick="deleteProject(${p.id})" title="Delete Project">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = tbodyHTML;

    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
    document.getElementById('company-detail-view').style.display = 'block';
}

// Project Actions
async function loadProjects() {
    let projects = cacheStore.projects;
    if (!projects) {
        const res = await fetch('/api/projects');
        projects = await res.json();
        cacheStore.projects = projects;
    }
    
    const btnAddProject = document.getElementById('btn-add-project');
    if (btnAddProject) {
        btnAddProject.style.display = isTeamLeaderOrAdmin() ? 'inline-block' : 'none';
    }
    updateBellNotificationStatus();
    const container = document.getElementById('projects-grouped-container');
    container.innerHTML = '';

    if (projects.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 2rem; border: 1px dashed var(--border-color); border-radius: 8px;">No projects added yet. Click "+ Add Project" to create one.</div>';
        return;
    }

    // Group projects by Year first, then Company Name
    const groups = {};
    projects.forEach(p => {
        let year = 'Unknown Year';
        if (p.start_date) {
            year = p.start_date.substring(0, 4);
        } else if (p.created_at) {
            year = p.created_at.substring(0, 4);
        }
        
        const company = p.company_name || 'No Company';
        
        if (!groups[year]) groups[year] = {};
        if (!groups[year][company]) groups[year][company] = [];
        groups[year][company].push(p);
    });

    // Sort years descending
    const sortedYears = Object.keys(groups).sort((a, b) => b - a);

    sortedYears.forEach(year => {
        const yearSection = document.createElement('div');
        yearSection.style.marginBottom = '2.5rem';
        yearSection.innerHTML = `<h3 style="font-family: var(--font-title); font-size: 1.4rem; color: var(--text-primary); border-bottom: 2px solid var(--accent-blue); padding-bottom: 0.5rem; margin-bottom: 1.5rem;">${year}</h3>`;
        
        const sortedCompanies = Object.keys(groups[year]).sort();
        
        sortedCompanies.forEach(company => {
            const companyProjects = groups[year][company];
            let totalOpen = 0;
            let totalRiskScore = 0;
            let highestSeverityVal = 0;

            const severityMap = {'Info': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Critical': 5};
            const revSeverityMap = {0: 'None', 1: 'Info', 2: 'Low', 3: 'Medium', 4: 'High', 5: 'Critical'};

            companyProjects.forEach(p => {
                let active = 0;
                if (typeof p.active_findings === 'number') {
                    active = p.active_findings;
                } else if (typeof p.active_findings === 'string') {
                    active = parseInt(p.active_findings.split('/')[0].trim()) || 0;
                }
                totalOpen += active;
                totalRiskScore += p.risk_score || 0;

                if (active > 0) {
                    const val = severityMap[p.max_severity] || 0;
                    if (val > highestSeverityVal) {
                        highestSeverityVal = val;
                    }
                }
            });

            const overallSeverity = totalOpen > 0 ? revSeverityMap[highestSeverityVal] : 'None';

            const compSection = document.createElement('div');
            compSection.style.marginLeft = '1rem';
            compSection.style.marginBottom = '1.5rem';
            compSection.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
                    <h4 style="font-family: var(--font-title); font-size: 1.15rem; color: var(--text-secondary); margin: 0;">🏢 ${company}</h4>
                    <span class="badge ${getSeverityBadgeClass(overallSeverity)}" style="font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 4px;">Overall Risk: ${overallSeverity}</span>
                    <span class="badge" style="font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: #faf5ff; color: #7c3aed; border: 1px solid rgba(124, 58, 237, 0.2);">Total Risk Score: ${totalRiskScore}</span>
                </div>
            `;
            
            const tableContainer = document.createElement('div');
            tableContainer.className = 'table-container';
            
            let tableHTML = `
                <table class="project-list-table">
                    <thead>
                        <tr>
                            <th>Project Name</th>
                            <th>Status</th>
                            <th>Methodology</th>
                            <th>Project Type</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Consultant</th>
                            <th>Open Findings</th>
                            <th>Risk Score</th>
                            <th>Max Severity</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            groups[year][company].forEach(p => {
                tableHTML += `
                    <tr>
                        <td>
                            <a href="#" style="color: var(--accent-blue); font-weight: 600; text-decoration: none;" onclick="viewProject(${p.id})">${p.name}</a>
                            <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 0.15rem;">PO: ${p.po_number || '-'}</div>
                        </td>
                        <td><span class="badge badge-status ${getStatusBadgeClass(p.status)}">${p.status}</span></td>
                        <td>${p.methodology || '-'}</td>
                        <td>${p.project_type || '-'}</td>
                        <td>${p.start_date || '-'}</td>
                        <td>${p.end_date || '-'}</td>
                        <td><strong style="color: var(--text-secondary); font-size: 0.85rem;">${p.pentest_consultant_name || '-'}</strong></td>
                        <td>
                            <div>${p.active_findings} / ${p.total_findings}</div>
                            ${getSeverityBreakdownHTML(p.severity_counts)}
                        </td>
                        <td><strong style="color: var(--accent-purple);">${p.risk_score}</strong></td>
                        <td><span class="badge ${getSeverityBadgeClass(p.max_severity)}">${p.max_severity}</span></td>
                        <td>
                            <div style="display: flex; gap: 0.4rem; align-items: center;">
                                <button class="btn btn-action-play" onclick="viewProject(${p.id})" title="Lanjutkan Project">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                </button>
                                ${canEditProject(p) ? `
                                <button class="btn btn-action-edit" onclick="editProject(${p.id})" title="Edit Project">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button class="btn btn-action-delete" onclick="deleteProject(${p.id})" title="Delete Project">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            tableHTML += `
                    </tbody>
                </table>
            `;
            
            tableContainer.innerHTML = tableHTML;
            compSection.appendChild(tableContainer);
            yearSection.appendChild(compSection);
        });
        
        container.appendChild(yearSection);
    });
}

async function populateCompanySelect(selectId, selectedId = null) {
    const res = await fetch('/api/companies');
    const companies = await res.json();
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Select Company</option>';
    companies.forEach(c => {
        select.innerHTML += `<option value="${c.id}" ${selectedId == c.id ? 'selected' : ''}>${c.name}</option>`;
    });
}

async function openProjectModal() {
    if (!isTeamLeaderOrAdmin()) {
        alert("Unauthorized: Only Team Leaders or Admins can create projects.");
        return;
    }
    document.getElementById('project-form').reset();
    document.getElementById('project-id').value = '';
    
    document.getElementById('project-company').disabled = false;
    document.getElementById('project-pentester').disabled = false;
    document.getElementById('project-retester').disabled = false;
    
    // Always hide lock hints for authorized users
    ['project-company-lock-hint', 'project-pentester-lock-hint', 'project-retester-lock-hint'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    document.getElementById('project-summary').value = '';
    document.getElementById('project-appendix').value = '';
    document.getElementById('project-methodology').value = 'Blackbox';
    document.getElementById('project-scope').value = '';
    document.getElementById('project-out-of-scope').value = '';
    document.getElementById('project-access').value = '';
    document.getElementById('project-location').value = 'Remote';
    document.getElementById('project-po-number').value = '';
    document.getElementById('project-type-input').value = 'Project Based';
    document.getElementById('project-modal-title').innerText = 'Add Project';
    await populateCompanySelect('project-company', currentCompanyId);
    await populateConsultantSelect('project-pentester');
    await populateConsultantSelect('project-retester');
    await populateConsultantSelect('project-pm', null, 'PMs');
    await populateConsultantSelect('project-sales', null, 'Sales');
    document.getElementById('project-modal').classList.add('active');
}

function closeProjectModal() {
    document.getElementById('project-modal').classList.remove('active');
}

async function saveProject(e) {
    e.preventDefault();
    const id = document.getElementById('project-id').value;
    if (!id && !isTeamLeaderOrAdmin()) {
        alert("Unauthorized: Only Team Leaders or Admins can create new projects.");
        return;
    }
    const company_id = document.getElementById('project-company').value;
    const name = document.getElementById('project-name-input').value;
    const status = document.getElementById('project-status-input').value;
    const start_date = document.getElementById('project-start').value;
    const end_date = document.getElementById('project-end').value;
    const description = document.getElementById('project-description').value;
    const summary = document.getElementById('project-summary').value;
    const appendix = document.getElementById('project-appendix').value;
    const pentest_consultant_id = document.getElementById('project-pentester').value || null;
    const retest_consultant_id = document.getElementById('project-retester').value || null;
    const project_manager_id = document.getElementById('project-pm').value || null;
    const sales_id = document.getElementById('project-sales').value || null;
    const methodology = document.getElementById('project-methodology').value;
    const scope = document.getElementById('project-scope').value;
    const out_of_scope = document.getElementById('project-out-of-scope').value;
    const access_info = document.getElementById('project-access').value;
    const location_type = document.getElementById('project-location').value;
    const po_number = document.getElementById('project-po-number').value;
    const project_type = document.getElementById('project-type-input').value;

    const payload = { company_id, name, status, start_date, end_date, description, summary, appendix, pentest_consultant_id, retest_consultant_id, project_manager_id, sales_id, methodology, scope, out_of_scope, access_info, location_type, po_number, project_type };
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/projects/${id}` : '/api/projects';

    await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    cacheStore.projects = null;
    cacheStore.companies = null;
    cacheStore.dashboard = {};

    closeProjectModal();
    if (currentCompanyId) {
        viewCompany(currentCompanyId);
    } else {
        loadProjects();
    }
}

async function editProject(id, focusField = null) {
    const res = await fetch(`/api/projects/${id}`);
    const p = await res.json();
    if (!canEditProject(p)) {
        alert("Unauthorized: Only assigned Pentest Consultant, Team Leader, or Admin can edit this project.");
        return;
    }
    document.getElementById('project-id').value = p.id;
    document.getElementById('project-name-input').value = p.name;
    document.getElementById('project-status-input').value = p.status;
    document.getElementById('project-start').value = p.start_date;
    document.getElementById('project-end').value = p.end_date;
    document.getElementById('project-description').value = p.description;
    document.getElementById('project-summary').value = p.summary || '';
    document.getElementById('project-appendix').value = p.appendix || '';
    document.getElementById('project-methodology').value = p.methodology || 'Blackbox';
    document.getElementById('project-scope').value = p.scope || '';
    document.getElementById('project-out-of-scope').value = p.out_of_scope || '';
    document.getElementById('project-access').value = p.access_info || '';
    document.getElementById('project-location').value = p.location_type || 'Remote';
    document.getElementById('project-po-number').value = p.po_number || '';
    document.getElementById('project-type-input').value = p.project_type || 'Project Based';
    await populateCompanySelect('project-company', p.company_id);
    await populateConsultantSelect('project-pentester', p.pentest_consultant_id);
    await populateConsultantSelect('project-retester', p.retest_consultant_id);
    await populateConsultantSelect('project-pm', p.project_manager_id, 'PMs');
    await populateConsultantSelect('project-sales', p.sales_id, 'Sales');
    
    // Disable assignment/company fields if not Admin or Team Leader
    const isLeadOrAdmin = isTeamLeaderOrAdmin();
    document.getElementById('project-company').disabled = !isLeadOrAdmin;
    document.getElementById('project-pentester').disabled = !isLeadOrAdmin;
    document.getElementById('project-retester').disabled = !isLeadOrAdmin;
    
    // Show or hide lock hints accordingly
    const lockHintDisplay = isLeadOrAdmin ? 'none' : 'flex';
    const companyHint = document.getElementById('project-company-lock-hint');
    const pentesterHint = document.getElementById('project-pentester-lock-hint');
    const retesterHint = document.getElementById('project-retester-lock-hint');
    if (companyHint) companyHint.style.display = lockHintDisplay;
    if (pentesterHint) pentesterHint.style.display = lockHintDisplay;
    if (retesterHint) retesterHint.style.display = lockHintDisplay;
    
    document.getElementById('project-modal-title').innerText = 'Edit Project';
    document.getElementById('project-modal').classList.add('active');

    if (focusField) {
        setTimeout(() => {
            const field = document.getElementById(focusField);
            if (field) {
                field.focus();
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 150);
    }
}

async function deleteProject(id) {
    const res = await fetch(`/api/projects/${id}`);
    const p = await res.json();
    if (!canEditProject(p)) {
        alert("Unauthorized: Only assigned Pentest Consultant, Team Leader, or Admin can delete this project.");
        return;
    }
    if (confirm('Are you sure you want to delete this project and all findings?')) {
        await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        cacheStore.projects = null;
        cacheStore.companies = null;
        cacheStore.dashboard = {};
        if (currentCompanyId) {
            viewCompany(currentCompanyId);
        } else {
            loadProjects();
        }
    }
}

async function viewProject(projectId) {
    currentProjectId = projectId;
    const resProj = await fetch(`/api/projects/${projectId}`);
    const p = await resProj.json();
    currentProject = p;

    if (currentUser) {
        const storageKey = `viewed_projects_${currentUser.username}`;
        try {
            let viewedIds = [];
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                viewedIds = JSON.parse(stored);
            }
            if (!viewedIds.includes(projectId)) {
                viewedIds.push(projectId);
                localStorage.setItem(storageKey, JSON.stringify(viewedIds));
            }
            updateBellNotificationStatus();
        } catch (e) {
            console.error(e);
        }
    }

    const resFindings = await fetch(`/api/findings?project_id=${projectId}`);
    const findings = await resFindings.json();

    // Ensure findings are always explicitly sorted by CVSS Score descending
    findings.sort((a, b) => b.cvss_score - a.cvss_score);
    currentProjectFindings = findings;

    document.getElementById('detail-project-name').innerText = p.name;
    document.getElementById('detail-project-status').innerText = p.status;
    document.getElementById('detail-project-status').className = `badge badge-status ${getStatusBadgeClass(p.status)}`;
    document.getElementById('detail-project-company').innerText = p.company_name || 'No Company';
    document.getElementById('detail-project-timeline').innerText = `${p.start_date || '-'} s/d ${p.end_date || '-'}`;
    document.getElementById('detail-project-location').innerText = p.location_type || '-';
    document.getElementById('detail-project-methodology').innerText = p.methodology || '-';
    document.getElementById('detail-project-access').innerText = p.access_info || '-';
    document.getElementById('detail-project-scope').innerText = p.scope || '-';
    document.getElementById('detail-project-out-of-scope').innerText = p.out_of_scope || '-';
    document.getElementById('detail-project-pentester').innerText = p.pentest_consultant_name || '-';
    document.getElementById('detail-project-retester').innerText = p.retest_consultant_name || '-';
    document.getElementById('detail-project-pm').innerText = p.project_manager_name || '-';
    document.getElementById('detail-project-sales').innerText = p.sales_name || '-';
    document.getElementById('detail-project-pentest-activity').value = p.pentest_activity || 'Not Started';
    document.getElementById('detail-project-retest-activity').value = p.retest_activity || 'Not Started';
    const riskScoreEl = document.getElementById('detail-project-risk-score');
    if (riskScoreEl) {
        const maxSev = p.max_severity || 'Info';
        riskScoreEl.innerText = maxSev;
        riskScoreEl.className = `badge ${getSeverityBadgeClass(maxSev)}`;
    }
    document.getElementById('detail-project-desc').innerText = p.description || 'No description provided.';

    // Render Used Tools Preview Card
    const toolsCard = document.getElementById('project-tools-preview-card');
    const toolsContent = document.getElementById('project-tools-preview-content');
    if (p.used_tools) {
        toolsCard.style.display = 'block';
        const toolsList = p.used_tools.split(',').map(t => t.trim()).filter(Boolean);
        if (toolsList.length > 0) {
            let listHtml = `<ul style="margin: 0; padding-left: 1.5rem; color: var(--text-primary); font-size: 0.95rem; line-height: 1.8;">`;
            toolsList.forEach(t => {
                listHtml += `<li style="margin-bottom: 0.25rem;">${t}</li>`;
            });
            listHtml += `</ul>`;
            toolsContent.innerHTML = listHtml;
        } else {
            toolsContent.innerHTML = '<span style="color: var(--text-secondary); font-style: italic;">No tools specified.</span>';
        }
    } else {
        toolsCard.style.display = 'none';
    }

    // Render Threat Model Diagrams List
    let diagrams = [];
    if (p.threat_model) {
        const cleaned = p.threat_model.trim();
        if (cleaned.startsWith('[')) {
            try {
                diagrams = JSON.parse(cleaned);
            } catch (e) {
                console.error("Error parsing diagrams JSON", e);
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
                    threats: parsed.threats || []
                }];
            } catch (e) {
                console.error("Error parsing single diagram JSON", e);
            }
        } else if (cleaned.startsWith('data:image/png;base64,')) {
            diagrams = [{
                id: 'default',
                name: 'Default Threat Model',
                image: p.threat_model,
                elements: [],
                flows: [],
                threats: []
            }];
        }
    }
    renderProjectThreatModels(diagrams);
    
    // Dynamic back button behavior
    if (currentCompanyId) {
        document.getElementById('project-back-link').onclick = () => viewCompany(currentCompanyId);
    } else {
        document.getElementById('project-back-link').onclick = () => switchTab('projects');
    }

    // Render Project Severity Chart
    const severityDist = { Critical: 0, High: 0, Medium: 0, Low: 0, Info: 0 };
    findings.forEach(f => {
        if (f.status === 'Open') {
            severityDist[f.severity] = (severityDist[f.severity] || 0) + 1;
        }
    });

    if (projectSeverityChartInstance) projectSeverityChartInstance.destroy();
    const projCtx = document.getElementById('projectSeverityChart').getContext('2d');
    projectSeverityChartInstance = new Chart(projCtx, {
        type: 'doughnut',
        data: {
            labels: [
                `Critical (${severityDist.Critical})`,
                `High (${severityDist.High})`,
                `Medium (${severityDist.Medium})`,
                `Low (${severityDist.Low})`,
                `Info (${severityDist.Info})`
            ],
            datasets: [{
                data: [
                    severityDist.Critical,
                    severityDist.High,
                    severityDist.Medium,
                    severityDist.Low,
                    severityDist.Info
                ],
                backgroundColor: ['#7c3aed', '#e11d48', '#d97706', '#16a34a', '#0284c7'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#475569',
                        boxWidth: 10,
                        padding: 6,
                        font: {
                            size: 10,
                            family: 'var(--font-sans)',
                            weight: '500'
                        }
                    }
                }
            }
        }
    });

    // Render findings table list
    const tbody = document.getElementById('detail-project-findings-body');
    tbody.innerHTML = '';
    let tbodyHTML = '';
    findings.forEach(f => {
        let affectedPreview = '-';
        if (f.affected_system) {
            const systems = f.affected_system.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
            if (systems.length > 0) {
                affectedPreview = systems.map(sys => {
                    if (sys.startsWith('http://') || sys.startsWith('https://')) {
                        return `<div style="margin-bottom: 0.25rem;"><a href="${sys}" target="_blank" style="color: var(--accent-blue); word-break: break-all; font-weight: 500; text-decoration: none;">🔗 ${sys}</a></div>`;
                    } else {
                        return `<div style="margin-bottom: 0.25rem; font-family: monospace; font-size: 0.85rem; background: #f1f5f9; display: inline-block; padding: 0.15rem 0.4rem; border-radius: 4px; border: 1px solid var(--border-color);">${sys}</div>`;
                    }
                }).join('');
            }
        }
        tbodyHTML += `
            <tr>
                <td><strong>${f.title}</strong></td>
                <td>${affectedPreview}</td>
                <td><strong>${f.cvss_score.toFixed(1)}</strong> <span style="font-size:0.75rem; color:var(--text-secondary);">(${f.cvss_version})</span></td>
                <td><span class="badge ${getSeverityBadgeClass(f.severity)}">${f.severity}</span></td>
                <td><span class="badge badge-status ${f.finding_status === 'Open' ? 'badge-high' : 'badge-low'}">${f.finding_status || 'Open'}</span></td>
                <td><span class="badge badge-status ${f.status === 'Open' ? 'badge-high' : 'badge-low'}">${f.status}</span></td>
                <td>
                    ${canEditProject(p) ? `
                    <div style="display: flex; gap: 0.4rem; align-items: center;">
                        <button class="btn btn-action-edit" onclick="editFinding(${f.id})" title="Edit Finding">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn btn-action-delete" onclick="deleteFinding(${f.id})" title="Delete Finding">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                    ` : '-'}
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = tbodyHTML;

    // Safe markdown renderer helper
    const renderMd = (txt) => {
        const imgCounterObj = { val: imageCounter };
        const res = renderMarkdownToHtml(txt, imgCounterObj);
        imageCounter = imgCounterObj.val;
        return res;
    };

    // Render SysReptor-Style preview cards
    const reportsContainer = document.getElementById('sysreptor-report-cards-container');
    reportsContainer.innerHTML = '';
    
    let imageCounter = 0;
    
    if (findings.length === 0) {
        reportsContainer.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 2rem; border: 1px dashed var(--border-color); border-radius: 8px;">No findings added yet. Add a finding to preview report workspace.</div>';
    } else {
        let reportsHTML = '';
        findings.forEach((f, idx) => {
            const sevClass = f.severity.toLowerCase() + '-label';
            
            // Build multi-system HTML lists
            let affectedHTML = '-';
            if (f.affected_system) {
                const systems = f.affected_system.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
                affectedHTML = systems.map(sys => {
                    const isUrl = sys.startsWith('http://') || sys.startsWith('https://');
                    if (isUrl) {
                        return `<div style="margin-bottom: 0.35rem;"><a href="${sys}" target="_blank" style="color: var(--accent-blue); word-break: break-all; font-weight: 500; text-decoration: none;">🔗 ${sys}</a></div>`;
                    } else {
                        return `<div style="margin-bottom: 0.35rem; color: var(--text-primary); font-family: monospace; font-size: 0.85rem; background: #f1f5f9; display: inline-block; padding: 0.2rem 0.6rem; border-radius: 4px; border: 1px solid var(--border-color); margin-right: 0.5rem;">🖥️ ${sys}</div>`;
                    }
                }).join('');
            }

            const tableRows = getFindingTableRows(f, sevClass, false);
            let rowsHTML = '';
            tableRows.forEach(row => {
                rowsHTML += `
                    <tr>
                        <td class="sysreptor-label ${sevClass}">${row.label}</td>
                        <td class="sysreptor-content">${row.content}</td>
                    </tr>
                `;
            });

            reportsHTML += `
                <div class="sysreptor-report-card">
                    <div class="sysreptor-report-title">
                        <span>${idx + 1}. ${f.title}</span>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <button class="btn-helper" onclick="copyFindingToClipboard(this, ${f.id})" style="font-weight: 600; display: inline-flex; align-items: center; gap: 0.25rem; height: 28px; font-size: 0.75rem; background: #ffffff; color: var(--accent-blue); border-color: rgba(15, 98, 254, 0.2); cursor: pointer; border-radius: 4px; padding: 0.25rem 0.5rem;">
                                📋 Copy Finding
                            </button>
                            <span class="badge ${getSeverityBadgeClass(f.severity)}">${f.severity}</span>
                        </div>
                    </div>
                    <table class="sysreptor-table">
                        ${rowsHTML}
                    </table>
                </div>
            `;
        });
        reportsContainer.innerHTML = reportsHTML;
    }

    // Render Project Summary and Appendix cards if they exist
    const summaryCard = document.getElementById('project-summary-preview-card');
    const summaryContent = document.getElementById('project-summary-preview-content');
    const appendixCard = document.getElementById('project-appendix-preview-card');
    const appendixContent = document.getElementById('project-appendix-preview-content');

    if (p.summary && p.summary.trim()) {
        summaryContent.innerHTML = renderMd(p.summary);
    } else {
        summaryContent.innerHTML = '<div style="color: var(--text-secondary); font-style: italic; text-align: center; padding: 1.5rem; background: #fafafa; border-radius: 4px; border: 1px dashed var(--border-color);">No summary (kesimpulan) added yet. Click "+ Add Summary" above to write one.</div>';
    }
    summaryCard.style.display = 'block';

    if (p.appendix && p.appendix.trim()) {
        appendixContent.innerHTML = renderMd(p.appendix);
    } else {
        appendixContent.innerHTML = '<div style="color: var(--text-secondary); font-style: italic; text-align: center; padding: 1.5rem; background: #fafafa; border-radius: 4px; border: 1px dashed var(--border-color);">No appendix (catatan pengetesan) added yet. Click "+ Add Appendix" above to write one.</div>';
    }
    appendixCard.style.display = 'block';

    // Configure and wire Summary & Appendix buttons
    const btnSummary = document.getElementById('btn-project-edit-summary');
    const btnAppendix = document.getElementById('btn-project-edit-appendix');
    const btnTools = document.getElementById('btn-project-edit-tools');
    const btnThreatModel = document.getElementById('btn-project-draw-threat-model');
    const btnAddFinding = document.getElementById('btn-add-finding-to-project');
    
    if (canEditProject(p)) {
        btnSummary.style.display = 'inline-flex';
        btnAppendix.style.display = 'inline-flex';
        if (btnTools) btnTools.style.display = 'inline-flex';
        if (btnThreatModel) btnThreatModel.style.display = 'inline-flex';
        if (btnAddFinding) btnAddFinding.style.display = 'inline-flex';
        
        if (p.summary && p.summary.trim()) {
            btnSummary.innerHTML = 'Edit Summary';
        } else {
            btnSummary.innerHTML = '➕ Add Summary';
        }

        if (p.appendix && p.appendix.trim()) {
            btnAppendix.innerHTML = 'Edit Appendix';
        } else {
            btnAppendix.innerHTML = '➕ Add Appendix';
        }

        btnSummary.onclick = () => editProject(p.id, 'project-summary');
        btnAppendix.onclick = () => editProject(p.id, 'project-appendix');
        if (btnAddFinding) btnAddFinding.onclick = () => openFindingModal('project');
    } else {
        btnSummary.style.display = 'none';
        btnAppendix.style.display = 'none';
        if (btnTools) btnTools.style.display = 'none';
        if (btnThreatModel) btnThreatModel.style.display = 'none';
        if (btnAddFinding) btnAddFinding.style.display = 'none';
    }

    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
    document.getElementById('project-detail-view').style.display = 'block';
}

async function updateProjectActivity(field, value) {
    if (!currentProjectId) return;
    const payload = {};
    payload[field] = value;
    
    try {
        const response = await fetch(`/api/projects/${currentProjectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errData = await response.json();
            alert(errData.message || "Failed to update project activity status.");
            viewProject(currentProjectId);
        } else {
            currentProject[field] = value;
        }
    } catch (err) {
        console.error("Error updating project activity:", err);
        alert("Failed to connect to the server.");
        viewProject(currentProjectId);
    }
}

// Finding Template select helper
async function populateTemplatesSelect() {
    const select = document.getElementById('finding-template-select');
    select.innerHTML = '<option value="">-- Select Template --</option>';
    try {
        const res = await fetch('/api/finding_templates');
        const templates = await res.json();
        templates.forEach(t => {
            select.innerHTML += `<option value="${t.id}">${t.title} (${t.severity})</option>`;
        });
    } catch (err) {
        console.error("Failed to load templates:", err);
    }
}

async function loadFromTemplate(templateId) {
    if (!templateId) return;
    try {
        const res = await fetch(`/api/finding_templates/${templateId}`);
        const t = await res.json();

        document.getElementById('finding-title').value = t.title || '';
        document.getElementById('finding-desc').value = t.description || '';
        document.getElementById('finding-exploitation').value = t.exploitation || '';
        document.getElementById('finding-impact').value = t.impact || '';
        document.getElementById('finding-solution').value = t.solution || '';
        document.getElementById('finding-reference').value = t.reference || '';
        document.getElementById('finding-step-reproduce').value = t.step_reproduce || '';

        populateDynamicRows('cwe', t.cwe || '');
        populateDynamicRows('mitre', t.mitre_attack || '');
        populateDynamicRows('iso', t.iso_27001 || '');
        populateDynamicRows('nist', t.nist_control || '');
        populateDynamicRows('ptes', t.ptes_phase || '');

        document.getElementById('cvss-version-select').value = t.cvss_version || 'v3.1';
        toggleCvssCalculator();

        // Highlight CVSS buttons
        cvss3Metrics = { AV: '', AC: '', PR: '', UI: '', S: '', C: '', I: '', A: '' };
        cvss4Metrics = { AV4: '', AC4: '', AT4: '', PR4: '', UI4: '', VC4: '', VI4: '', VA4: '' };

        if (t.cvss_version === 'v3.1') {
            const parts = t.cvss_vector.split('/');
            parts.forEach(p => {
                const [metric, val] = p.split(':');
                if (metric in cvss3Metrics) {
                    cvss3Metrics[metric] = val;
                    const selector = document.querySelector(`.cvss-selector[data-metric="${metric}"]`);
                    if (selector) {
                        selector.querySelectorAll('.cvss-btn').forEach(btn => {
                            if (btn.getAttribute('data-val') === val) btn.classList.add('active');
                            else btn.classList.remove('active');
                        });
                    }
                }
            });
        } else {
            const parts = t.cvss_vector.split('/');
            parts.forEach(p => {
                const [metric, val] = p.split(':');
                const map4 = metric + '4';
                if (map4 in cvss4Metrics) {
                    cvss4Metrics[map4] = val;
                    const selector = document.querySelector(`.cvss-selector[data-metric="${map4}"]`);
                    if (selector) {
                        selector.querySelectorAll('.cvss-btn').forEach(btn => {
                            if (btn.getAttribute('data-val') === val) btn.classList.add('active');
                            else btn.classList.remove('active');
                        });
                    }
                }
            });
        }
        calculateCvss();
    } catch (err) {
        console.error("Failed to load template details:", err);
    }
}

// Finding Actions
async function loadFindings() {
    let templates = cacheStore.findingTemplates;
    if (!templates) {
        const res = await fetch('/api/finding_templates');
        templates = await res.json();
        cacheStore.findingTemplates = templates;
    }
    const tbody = document.getElementById('finding-table-body');
    tbody.innerHTML = '';

    let tbodyHTML = '';
    templates.forEach(t => {
        tbodyHTML += `
            <tr>
                <td><strong>${t.title}</strong></td>
                <td>${t.cwe || '-'}</td>
                <td><strong>${t.cvss_score.toFixed(1)}</strong> <span style="font-size:0.75rem; color:var(--text-secondary);">(${t.cvss_version})</span></td>
                <td><span class="badge ${getSeverityBadgeClass(t.severity)}">${t.severity}</span></td>
                <td>
                    <div style="display: flex; gap: 0.4rem; align-items: center;">
                        <button class="btn btn-action-edit" onclick="editFindingTemplate(${t.id})" title="Edit Template">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn btn-action-delete" onclick="deleteFindingTemplate(${t.id})" title="Delete Template">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = tbodyHTML;
}

async function populateProjectSelect(selectId, selectedId = null) {
    const res = await fetch('/api/projects');
    const projects = await res.json();
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Select Project</option>';
    projects.forEach(p => {
        select.innerHTML += `<option value="${p.id}" ${selectedId == p.id ? 'selected' : ''}>${p.name} (${p.company_name})</option>`;
    });
}

function selectDefaultCvss() {
    // CVSS 3.1 Defaults
    cvss3Metrics = { AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'U', C: 'H', I: 'H', A: 'H' };
    // CVSS 4.0 Defaults
    cvss4Metrics = { AV4: 'N', AC4: 'L', AT4: 'N', PR4: 'N', UI4: 'N', VC4: 'H', VI4: 'H', VA4: 'H' };

    // Highlight defaults in UI
    document.querySelectorAll('.cvss-selector').forEach(selector => {
        const metric = selector.getAttribute('data-metric');
        selector.querySelectorAll('.cvss-btn').forEach(btn => {
            const val = btn.getAttribute('data-val');
            let isDefault = false;
            
            if (metric.endsWith('4')) {
                isDefault = cvss4Metrics[metric] === val;
            } else {
                isDefault = cvss3Metrics[metric] === val;
            }
            
            if (isDefault) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    });
    
    calculateCvss();
}

async function openFindingModal(mode = 'project') {
    if (mode === 'project' && currentProject && !canEditProject(currentProject)) {
        alert("Unauthorized: Only assigned Pentest Consultant, Team Leader, or Admin can add findings to this project.");
        return;
    }
    document.getElementById('finding-form').reset();
    document.getElementById('finding-id').value = '';
    
    const modal = document.getElementById('finding-modal');
    modal.dataset.mode = mode;

    // Reset dynamic framework rows
    populateDynamicRows('cwe', '');
    populateDynamicRows('mitre', '');
    populateDynamicRows('iso', '');
    populateDynamicRows('nist', '');
    populateDynamicRows('ptes', '');

    document.getElementById('finding-status-select').value = 'Open';
    document.getElementById('finding-retest-evidence').value = '';
    const customContainer = document.getElementById('custom-fields-container');
    if (customContainer) customContainer.innerHTML = '';

    selectDefaultCvss();

    const projContainer = document.getElementById('finding-project-container');
    const templateContainer = document.getElementById('finding-template-select-container');
    const affectedContainer = document.getElementById('finding-affected-system-container');
    const statusSelectContainer = document.getElementById('finding-status-select-container');
    const statusContainer = document.getElementById('finding-status-container');
    const retestEvidenceContainer = document.getElementById('finding-retest-evidence-container');

    const projectSelect = document.getElementById('finding-project');
    const affectedInput = document.getElementById('finding-affected-system');

    if (mode === 'template') {
        document.getElementById('finding-modal-title').innerText = 'Add Finding Template';
        
        projContainer.style.display = 'none';
        templateContainer.style.display = 'none';
        affectedContainer.style.display = 'none';
        statusSelectContainer.style.display = 'none';
        statusContainer.style.display = 'none';
        retestEvidenceContainer.style.display = 'none';

        projectSelect.removeAttribute('required');
        affectedInput.removeAttribute('required');
    } else {
        document.getElementById('finding-modal-title').innerText = 'Add Finding';
        
        projContainer.style.display = 'block';
        templateContainer.style.display = 'block';
        affectedContainer.style.display = 'block';
        statusSelectContainer.style.display = 'block';
        statusContainer.style.display = 'block';
        retestEvidenceContainer.style.display = 'block';

        projectSelect.setAttribute('required', 'required');
        affectedInput.setAttribute('required', 'required');

        await populateProjectSelect('finding-project', currentProjectId);
        await populateTemplatesSelect();
    }

    modal.classList.add('active');
}

function closeFindingModal() {
    document.getElementById('finding-modal').classList.remove('active');
}

async function editFindingTemplate(id) {
    cvss3Metrics = { AV: '', AC: '', PR: '', UI: '', S: '', C: '', I: '', A: '' };
    cvss4Metrics = { AV4: '', AC4: '', AT4: '', PR4: '', UI4: '', VC4: '', VI4: '', VA4: '' };
    
    const res = await fetch(`/api/finding_templates/${id}`);
    const t = await res.json();
    
    document.getElementById('finding-id').value = t.id;
    document.getElementById('finding-title').value = t.title;
    document.getElementById('finding-desc').value = t.description || '';
    document.getElementById('cvss-version-select').value = t.cvss_version || 'v3.1';
    
    document.getElementById('finding-exploitation').value = t.exploitation || '';
    document.getElementById('finding-impact').value = t.impact || '';
    document.getElementById('finding-solution').value = t.solution || '';
    document.getElementById('finding-reference').value = t.reference || '';
    document.getElementById('finding-step-reproduce').value = t.step_reproduce || '';
    
    populateDynamicRows('cwe', t.cwe || '');
    populateDynamicRows('mitre', t.mitre_attack || '');
    populateDynamicRows('iso', t.iso_27001 || '');
    populateDynamicRows('nist', t.nist_control || '');
    populateDynamicRows('ptes', t.ptes_phase || '');

    // Load custom fields
    const customContainer = document.getElementById('custom-fields-container');
    if (customContainer) customContainer.innerHTML = '';
    if (t.custom_fields) {
        try {
            const fields = JSON.parse(t.custom_fields);
            if (Array.isArray(fields)) {
                fields.forEach(field => {
                    addCustomFieldRow(field.label, field.value, field.position);
                });
            }
        } catch (e) {
            console.error("Error parsing custom fields for template", e);
        }
    }

    toggleCvssCalculator();

    if (t.cvss_version === 'v3.1') {
        const parts = t.cvss_vector.split('/');
        parts.forEach(p => {
            const [metric, val] = p.split(':');
            if (metric in cvss3Metrics) {
                cvss3Metrics[metric] = val;
                const selector = document.querySelector(`.cvss-selector[data-metric="${metric}"]`);
                if (selector) {
                    selector.querySelectorAll('.cvss-btn').forEach(btn => {
                        if (btn.getAttribute('data-val') === val) btn.classList.add('active');
                        else btn.classList.remove('active');
                    });
                }
            }
        });
    } else {
        const parts = t.cvss_vector.split('/');
        parts.forEach(p => {
            const [metric, val] = p.split(':');
            const map4 = metric + '4';
            if (map4 in cvss4Metrics) {
                cvss4Metrics[map4] = val;
                const selector = document.querySelector(`.cvss-selector[data-metric="${map4}"]`);
                if (selector) {
                    selector.querySelectorAll('.cvss-btn').forEach(btn => {
                        if (btn.getAttribute('data-val') === val) btn.classList.add('active');
                        else btn.classList.remove('active');
                    });
                }
            }
        });
    }

    calculateCvss();
    
    const modal = document.getElementById('finding-modal');
    modal.dataset.mode = 'template';

    const projContainer = document.getElementById('finding-project-container');
    const templateContainer = document.getElementById('finding-template-select-container');
    const affectedContainer = document.getElementById('finding-affected-system-container');
    const statusSelectContainer = document.getElementById('finding-status-select-container');
    const statusContainer = document.getElementById('finding-status-container');
    const retestEvidenceContainer = document.getElementById('finding-retest-evidence-container');

    const projectSelect = document.getElementById('finding-project');
    const affectedInput = document.getElementById('finding-affected-system');

    projContainer.style.display = 'none';
    templateContainer.style.display = 'none';
    affectedContainer.style.display = 'none';
    statusSelectContainer.style.display = 'none';
    statusContainer.style.display = 'none';
    retestEvidenceContainer.style.display = 'none';

    projectSelect.removeAttribute('required');
    affectedInput.removeAttribute('required');

    document.getElementById('finding-modal-title').innerText = 'Edit Finding Template';
    modal.classList.add('active');
}

async function deleteFindingTemplate(id) {
    if (confirm('Are you sure you want to delete this template finding?')) {
        await fetch(`/api/finding_templates/${id}`, { method: 'DELETE' });
        cacheStore.findingTemplates = null;
        loadFindings();
    }
}

async function editFinding(id) {
    if (currentProject && !canEditProject(currentProject)) {
        alert("Unauthorized: Only assigned Pentest Consultant, Team Leader, or Admin can edit findings for this project.");
        return;
    }
    cvss3Metrics = { AV: '', AC: '', PR: '', UI: '', S: '', C: '', I: '', A: '' };
    cvss4Metrics = { AV4: '', AC4: '', AT4: '', PR4: '', UI4: '', VC4: '', VI4: '', VA4: '' };
    
    const res = await fetch(`/api/findings/${id}`);
    const f = await res.json();
    
    document.getElementById('finding-id').value = f.id;
    document.getElementById('finding-title').value = f.title;
    document.getElementById('finding-affected-system').value = f.affected_system || '';
    document.getElementById('finding-desc').value = f.description || '';
    document.getElementById('finding-poc').value = f.poc || '';
    document.getElementById('finding-status-select').value = f.finding_status || 'Open';
    document.getElementById('finding-status').value = f.status || 'Open';
    document.getElementById('cvss-version-select').value = f.cvss_version || 'v3.1';
    
    document.getElementById('finding-exploitation').value = f.exploitation || '';
    document.getElementById('finding-impact').value = f.impact || '';
    document.getElementById('finding-script-payload').value = f.script_payload || '';
    document.getElementById('finding-solution').value = f.solution || '';
    document.getElementById('finding-reference').value = f.reference || '';
    document.getElementById('finding-step-reproduce').value = f.step_reproduce || '';
    document.getElementById('finding-retest-evidence').value = f.retest_evidence || '';

    populateDynamicRows('cwe', f.cwe || '');
    populateDynamicRows('mitre', f.mitre_attack || '');
    populateDynamicRows('iso', f.iso_27001 || '');
    populateDynamicRows('nist', f.nist_control || '');
    populateDynamicRows('ptes', f.ptes_phase || '');

    // Load custom fields
    const customContainer = document.getElementById('custom-fields-container');
    if (customContainer) customContainer.innerHTML = '';
    if (f.custom_fields) {
        try {
            const fields = JSON.parse(f.custom_fields);
            if (Array.isArray(fields)) {
                fields.forEach(field => {
                    addCustomFieldRow(field.label, field.value, field.position);
                });
            }
        } catch (e) {
            console.error("Error parsing custom fields for finding", e);
        }
    }

    await populateProjectSelect('finding-project', f.project_id);
    toggleCvssCalculator();

    if (f.cvss_version === 'v3.1') {
        const parts = f.cvss_vector.split('/');
        parts.forEach(p => {
            const [metric, val] = p.split(':');
            if (metric in cvss3Metrics) {
                cvss3Metrics[metric] = val;
                const selector = document.querySelector(`.cvss-selector[data-metric="${metric}"]`);
                if (selector) {
                    selector.querySelectorAll('.cvss-btn').forEach(btn => {
                        if (btn.getAttribute('data-val') === val) btn.classList.add('active');
                        else btn.classList.remove('active');
                    });
                }
            }
        });
    } else {
        const parts = f.cvss_vector.split('/');
        parts.forEach(p => {
            const [metric, val] = p.split(':');
            const map4 = metric + '4';
            if (map4 in cvss4Metrics) {
                cvss4Metrics[map4] = val;
                const selector = document.querySelector(`.cvss-selector[data-metric="${map4}"]`);
                if (selector) {
                    selector.querySelectorAll('.cvss-btn').forEach(btn => {
                        if (btn.getAttribute('data-val') === val) btn.classList.add('active');
                        else btn.classList.remove('active');
                    });
                }
            }
        });
    }

    calculateCvss();
    
    const modal = document.getElementById('finding-modal');
    modal.dataset.mode = 'project';

    const projContainer = document.getElementById('finding-project-container');
    const templateContainer = document.getElementById('finding-template-select-container');
    const affectedContainer = document.getElementById('finding-affected-system-container');
    const statusSelectContainer = document.getElementById('finding-status-select-container');
    const statusContainer = document.getElementById('finding-status-container');
    const retestEvidenceContainer = document.getElementById('finding-retest-evidence-container');

    const projectSelect = document.getElementById('finding-project');
    const affectedInput = document.getElementById('finding-affected-system');

    projContainer.style.display = 'block';
    templateContainer.style.display = 'none';
    affectedContainer.style.display = 'block';
    statusSelectContainer.style.display = 'block';
    statusContainer.style.display = 'block';
    retestEvidenceContainer.style.display = 'block';

    projectSelect.setAttribute('required', 'required');
    affectedInput.setAttribute('required', 'required');

    document.getElementById('finding-modal-title').innerText = 'Edit Finding';
    modal.classList.add('active');
}

async function saveFinding(e) {
    e.preventDefault();
    const modal = document.getElementById('finding-modal');
    const mode = modal.dataset.mode || 'project';

    const id = document.getElementById('finding-id').value;
    const title = document.getElementById('finding-title').value;
    const description = document.getElementById('finding-desc').value;
    
    const exploitation = document.getElementById('finding-exploitation').value;
    const impact = document.getElementById('finding-impact').value;
    const solution = document.getElementById('finding-solution').value;
    const reference = document.getElementById('finding-reference').value;
    const step_reproduce = document.getElementById('finding-step-reproduce').value;

    const cwe = getDynamicValues('cwe');
    const mitre_attack = getDynamicValues('mitre');
    const iso_27001 = getDynamicValues('iso');
    const nist_control = getDynamicValues('nist');
    const ptes_phase = getDynamicValues('ptes');

    const version = document.getElementById('cvss-version-select').value;
    let score = 0.0;
    let vector = '';
    
    if (version === 'v3.1') {
        vector = `CVSS:3.1/AV:${cvss3Metrics.AV}/AC:${cvss3Metrics.AC}/PR:${cvss3Metrics.PR}/UI:${cvss3Metrics.UI}/S:${cvss3Metrics.S}/C:${cvss3Metrics.C}/I:${cvss3Metrics.I}/A:${cvss3Metrics.A}`;
        score = parseFloat(document.getElementById('cvss-score-badge').innerText.replace('Score: ', '')) || 0.0;
    } else {
        vector = `CVSS:4.0/AV:${cvss4Metrics.AV4}/AC:${cvss4Metrics.AC4}/AT:${cvss4Metrics.AT4}/PR:${cvss4Metrics.PR4}/UI:${cvss4Metrics.UI4}/VC:${cvss4Metrics.VC4}/VI:${cvss4Metrics.VI4}/VA:${cvss4Metrics.VA4}`;
        score = parseFloat(document.getElementById('cvss-score-badge').innerText.replace('Score: ', '')) || 0.0;
    }

    const severity = getSeverityFromScore(score);

    const customFields = [];
    document.querySelectorAll('.custom-field-row').forEach(row => {
        const label = row.querySelector('.custom-field-label').value.trim();
        const value = row.querySelector('.custom-field-value').value.trim();
        const position = row.querySelector('.custom-field-position').value;
        if (label) {
            customFields.push({ label, value, position });
        }
    });
    const custom_fields = JSON.stringify(customFields);

    let payload = {
        title, description, exploitation, impact, solution, reference, step_reproduce,
        cwe, mitre_attack, iso_27001, nist_control, ptes_phase,
        cvss_version: version, cvss_vector: vector, cvss_score: score, severity,
        custom_fields
    };

    let url = '';
    if (mode === 'template') {
        url = id ? `/api/finding_templates/${id}` : '/api/finding_templates';
    } else {
        const project_id = document.getElementById('finding-project').value;
        const affected_system = document.getElementById('finding-affected-system').value;
        const status = document.getElementById('finding-status').value;
        const finding_status = document.getElementById('finding-status-select').value;
        const retest_evidence = document.getElementById('finding-retest-evidence').value;
        const poc = document.getElementById('finding-poc').value;
        const script_payload = document.getElementById('finding-script-payload').value;

        payload = {
            ...payload,
            project_id, affected_system, status, finding_status, retest_evidence, poc, script_payload,
            poc_image: '', poc_image_align: 'center', poc_image_caption: ''
        };
        url = id ? `/api/findings/${id}` : '/api/findings';
    }

    const method = id ? 'PUT' : 'POST';

    await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    cacheStore.findingTemplates = null;
    cacheStore.projects = null;
    cacheStore.companies = null;
    cacheStore.dashboard = {};

    closeFindingModal();
    if (mode === 'project' && currentProjectId) {
        viewProject(currentProjectId);
    } else {
        loadFindings();
    }
}

async function deleteFinding(id) {
    if (currentProject && !canEditProject(currentProject)) {
        alert("Unauthorized: Only assigned Pentest Consultant, Team Leader, or Admin can delete findings for this project.");
        return;
    }
    if (confirm('Are you sure you want to delete this finding?')) {
        await fetch(`/api/findings/${id}`, { method: 'DELETE' });
        cacheStore.projects = null;
        cacheStore.companies = null;
        cacheStore.dashboard = {};
        if (currentProjectId) {
            viewProject(currentProjectId);
        } else {
            loadFindings();
        }
    }
}

// CVSS Calculator Actions
function toggleCvssCalculator() {
    const version = document.getElementById('cvss-version-select').value;
    if (version === 'v3.1') {
        document.getElementById('cvss-3-calc').style.display = 'block';
        document.getElementById('cvss-4-calc').style.display = 'none';
    } else {
        document.getElementById('cvss-3-calc').style.display = 'none';
        document.getElementById('cvss-4-calc').style.display = 'block';
    }
    calculateCvss();
}

function setupCvssSelectors() {
    document.querySelectorAll('.cvss-selector').forEach(selector => {
        const metric = selector.getAttribute('data-metric');
        selector.querySelectorAll('.cvss-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selector.querySelectorAll('.cvss-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const val = btn.getAttribute('data-val');
                
                if (metric.endsWith('4')) {
                    cvss4Metrics[metric] = val;
                } else {
                    cvss3Metrics[metric] = val;
                }
                calculateCvss();
            });
        });
    });
}

function calculateCvss() {
    const version = document.getElementById('cvss-version-select').value;
    let score = 0.0;
    let vector = '';

    if (version === 'v3.1') {
        const { AV, AC, PR, UI, S, C, I, A } = cvss3Metrics;
        if (!AV || !AC || !PR || !UI || !S || !C || !I || !A) {
            document.getElementById('cvss-vector-display').innerText = 'Select all CVSS v3.1 metrics';
            return;
        }

        // Coefficients
        const avVal = { N: 0.85, A: 0.62, L: 0.55, P: 0.20 }[AV];
        const acVal = { L: 0.77, H: 0.44 }[AC];
        const uiVal = { N: 0.85, R: 0.62 }[UI];
        const cVal = { N: 0.0, L: 0.22, H: 0.56 }[C];
        const iVal = { N: 0.0, L: 0.22, H: 0.56 }[I];
        const aVal = { N: 0.0, L: 0.22, H: 0.56 }[A];
        
        let prVal = 0.0;
        if (S === 'U') {
            prVal = { N: 0.85, L: 0.62, H: 0.27 }[PR];
        } else {
            prVal = { N: 0.85, L: 0.68, H: 0.50 }[PR];
        }

        const iss = 1 - (1 - cVal) * (1 - iVal) * (1 - aVal);
        let impact = 0.0;
        if (S === 'U') {
            impact = 6.42 * iss;
        } else {
            impact = 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
        }

        const exploitability = 8.22 * avVal * acVal * prVal * uiVal;
        
        if (impact <= 0) {
            score = 0.0;
        } else {
            if (S === 'U') {
                score = Math.min(10, impact + exploitability);
            } else {
                score = Math.min(10, 1.08 * (impact + exploitability));
            }
            // Round Up 1 decimal
            score = Math.ceil(score * 10) / 10;
        }

        vector = `CVSS:3.1/AV:${AV}/AC:${AC}/PR:${PR}/UI:${UI}/S:${S}/C:${C}/I:${I}/A:${A}`;
    } else {
        // CVSS v4.0 simplified exact baseline score
        const { AV4, AC4, AT4, PR4, UI4, VC4, VI4, VA4 } = cvss4Metrics;
        if (!AV4 || !AC4 || !AT4 || !PR4 || !UI4 || !VC4 || !VI4 || !VA4) {
            document.getElementById('cvss-vector-display').innerText = 'Select all CVSS v4.0 metrics';
            return;
        }

        // Standard simplified mapping for CVSS v4.0 Base Score calculation
        const avVal = { N: 1.0, A: 0.8, L: 0.5, P: 0.2 }[AV4];
        const acVal = { L: 1.0, H: 0.7 }[AC4];
        const atVal = { N: 1.0, P: 0.8 }[AT4];
        const prVal = { N: 1.0, L: 0.8, H: 0.5 }[PR4];
        const uiVal = { N: 1.0, P: 0.8, A: 0.6 }[UI4];

        // Impact Value
        const vcVal = { H: 0.56, L: 0.22, N: 0.0 }[VC4];
        const viVal = { H: 0.56, L: 0.22, N: 0.0 }[VI4];
        const vaVal = { H: 0.45, L: 0.15, N: 0.0 }[VA4];

        const baseImpact = vcVal + viVal + vaVal;
        const exploitability = avVal * acVal * atVal * prVal * uiVal;

        if (baseImpact === 0) {
            score = 0.0;
        } else {
            score = Math.min(10.0, (baseImpact * 6.5) + (exploitability * 2.5));
            score = Math.round(score * 10) / 10;
        }

        vector = `CVSS:4.0/AV:${AV4}/AC:${AC4}/AT:${AT4}/PR:${PR4}/UI:${UI4}/VC:${VC4}/VI:${VI4}/VA:${VA4}`;
    }

    document.getElementById('cvss-vector-display').innerText = vector;
    document.getElementById('cvss-score-badge').innerText = `Score: ${score.toFixed(1)}`;
    document.getElementById('cvss-score-badge').className = `badge badge-${getSeverityFromScore(score).toLowerCase()}`;
}

// Helpers
function getSeverityFromScore(score) {
    if (score >= 9.0) return 'Critical';
    if (score >= 7.0) return 'High';
    if (score >= 4.0) return 'Medium';
    if (score >= 0.1) return 'Low';
    return 'Info';
}

function getSeverityBadgeClass(sev) {
    if (!sev) return 'badge-info';
    return `badge-${sev.toLowerCase()}`;
}

function getStatusBadgeClass(status) {
    if (status === 'In Progress') return 'status-inprogress';
    if (status === 'Completed') return 'status-completed';
    if (status === 'Retest Pending') return 'status-retestpending';
    if (status === 'Retest Completed') return 'status-retestcompleted';
    return '';
}

// Dynamic Inputs Helper Functions
function addDynamicRow(type, val = '') {
    const container = document.getElementById(`${type}-inputs-container`);
    if (!container) return;
    
    const row = document.createElement('div');
    row.className = 'dynamic-input-row';
    row.style.display = 'flex';
    row.style.gap = '0.5rem';
    row.style.marginBottom = '0.5rem';
    
    let placeholder = '';
    if (type === 'cwe') placeholder = 'e.g. CWE-89: Improper Neutralization...';
    else if (type === 'mitre') placeholder = 'e.g. T1190 - Exploit Public-Facing Application';
    else if (type === 'iso') placeholder = 'e.g. A.12.6.1 - Technical Vulnerability Management';
    else if (type === 'nist') placeholder = 'e.g. RA-5 - Vulnerability Monitoring and Scanning';
    else if (type === 'ptes') placeholder = 'e.g. Exploitation';
    
    row.innerHTML = `
        <div style="flex: 1; position: relative;">
            <input type="text" class="form-control dynamic-input-${type}" value="${val}" placeholder="${placeholder}" autocomplete="off" style="margin-bottom: 0;">
            <div class="autocomplete-items" style="display: none;"></div>
        </div>
        <button type="button" class="btn-remove-row" title="Remove">&times;</button>
    `;
    container.appendChild(row);
    
    const input = row.querySelector('input');
    const listContainer = row.querySelector('.autocomplete-items');
    
    if (type === 'cwe') {
        attachCweAutocomplete(input, listContainer);
    } else {
        attachFrameworkAutocomplete(type, input, listContainer);
    }
    
    row.querySelector('.btn-remove-row').addEventListener('click', () => {
        row.remove();
        if (container.querySelectorAll('.dynamic-input-row').length === 0) {
            addDynamicRow(type);
        }
    });
}

function autoAddFrameworkValue(type, newVal) {
    if (!newVal) return;
    const container = document.getElementById(`${type}-inputs-container`);
    if (!container) return;
    
    const inputs = container.querySelectorAll(`.dynamic-input-${type}`);
    let exists = false;
    let emptyInput = null;
    
    inputs.forEach(input => {
        const val = input.value.trim();
        if (val === newVal) exists = true;
        if (!val) emptyInput = input;
    });
    
    if (exists) return;
    
    if (emptyInput) {
        emptyInput.value = newVal;
    } else {
        addDynamicRow(type, newVal);
    }
}

function getDynamicValues(type) {
    const container = document.getElementById(`${type}-inputs-container`);
    if (!container) return '';
    const inputs = container.querySelectorAll(`.dynamic-input-${type}`);
    const values = [];
    inputs.forEach(input => {
        const val = input.value.trim();
        if (val) values.push(val);
    });
    return values.join(', ');
}

function populateDynamicRows(type, str) {
    const container = document.getElementById(`${type}-inputs-container`);
    if (!container) return;
    container.innerHTML = '';
    
    if (!str || !str.trim()) {
        addDynamicRow(type);
        return;
    }
    
    const values = str.split(/,+/).map(v => v.trim()).filter(v => v.length > 0);
    if (values.length === 0) {
        addDynamicRow(type);
        return;
    }
    
    values.forEach(val => {
        addDynamicRow(type, val);
    });
}

function attachCweAutocomplete(input, listContainer) {
    if (!input || !listContainer) return;
    
    input.addEventListener('focus', () => {
        renderCweList(input.value.trim(), listContainer, input);
    });
    
    input.addEventListener('input', () => {
        renderCweList(input.value.trim(), listContainer, input);
    });
    
    document.addEventListener('click', (e) => {
        if (e.target !== input && e.target !== listContainer && !listContainer.contains(e.target)) {
            listContainer.innerHTML = '';
            listContainer.style.display = 'none';
        }
    });
}

function renderCweList(query, listContainer, input) {
    listContainer.innerHTML = '';
    const lowerQuery = query.toLowerCase();
    
    const filtered = typeof CWE_DB !== 'undefined' ? CWE_DB.filter(item => {
        return !query || 
               item.id.toLowerCase().includes(lowerQuery) || 
               item.name.toLowerCase().includes(lowerQuery) ||
               item.description.toLowerCase().includes(lowerQuery);
    }) : [];
    
    if (filtered.length === 0) {
        listContainer.style.display = 'none';
        return;
    }
    
    listContainer.style.display = 'block';
    
    const displayList = query ? filtered : filtered.slice(0, 20);
    
    displayList.forEach(item => {
        const div = document.createElement('div');
        div.className = 'autocomplete-item';
        div.innerHTML = `<strong>${item.id}</strong>: ${item.name}`;
        
        div.addEventListener('click', () => {
            input.value = `${item.id}: ${item.name}`;
            listContainer.innerHTML = '';
            listContainer.style.display = 'none';
            
            // Auto add framework values
            autoAddFrameworkValue('mitre', item.mitre);
            autoAddFrameworkValue('iso', item.iso);
            autoAddFrameworkValue('nist', item.nist);
            autoAddFrameworkValue('ptes', item.ptes);
            
            // For template fields, check if they already have content
            const titleField = document.getElementById('finding-title');
            const descField = document.getElementById('finding-desc');
            const exploitationField = document.getElementById('finding-exploitation');
            const impactField = document.getElementById('finding-impact');
            const solutionField = document.getElementById('finding-solution');
            const refField = document.getElementById('finding-reference');
            
            const hasExistingContent = 
                (titleField && titleField.value.trim() !== '' && titleField.value !== 'New Finding' && titleField.value !== 'Edit Finding') ||
                (descField && descField.value.trim() !== '') ||
                (exploitationField && exploitationField.value.trim() !== '') ||
                (impactField && impactField.value.trim() !== '') ||
                (solutionField && solutionField.value.trim() !== '') ||
                (refField && refField.value.trim() !== '');
            
            if (!hasExistingContent) {
                autofillFindingFields(item);
            } else {
                const confirmAutofill = confirm(`Form sudah memiliki data. Apakah Anda ingin menimpa judul, deskripsi, dampak, solusi, dan referensi dengan template standar dari ${item.id}?`);
                if (confirmAutofill) {
                    autofillFindingFields(item);
                }
            }
        });
        
        listContainer.appendChild(div);
    });
}

function attachFrameworkAutocomplete(type, input, listContainer) {
    if (!input || !listContainer) return;
    
    input.addEventListener('focus', () => {
        renderFrameworkList(type, input.value.trim(), listContainer, input);
    });
    
    input.addEventListener('input', () => {
        renderFrameworkList(type, input.value.trim(), listContainer, input);
    });
    
    document.addEventListener('click', (e) => {
        if (e.target !== input && e.target !== listContainer && !listContainer.contains(e.target)) {
            listContainer.innerHTML = '';
            listContainer.style.display = 'none';
        }
    });
}

function renderFrameworkList(type, query, listContainer, input) {
    listContainer.innerHTML = '';
    
    const optionsSet = new Set();
    if (typeof CWE_DB !== 'undefined') {
        CWE_DB.forEach(item => {
            const val = item[type];
            if (val) {
                optionsSet.add(val.trim());
            }
        });
    }
    const options = Array.from(optionsSet);
    
    const lowerQuery = query.toLowerCase();
    const filtered = options.filter(opt => {
        return opt.toLowerCase().includes(lowerQuery);
    });
    
    const displayList = query ? filtered : options;
    
    if (displayList.length === 0) {
        listContainer.style.display = 'none';
        return;
    }
    
    listContainer.style.display = 'block';
    
    displayList.forEach(opt => {
        const div = document.createElement('div');
        div.className = 'autocomplete-item';
        div.innerHTML = opt;
        
        div.addEventListener('click', () => {
            input.value = opt;
            listContainer.innerHTML = '';
            listContainer.style.display = 'none';
        });
        
        listContainer.appendChild(div);
    });
}

// CWE Autocomplete & Template autofill
function initCweAutocomplete() {
    // Initial populate of empty rows when the app loads
    populateDynamicRows('cwe', '');
    populateDynamicRows('mitre', '');
    populateDynamicRows('iso', '');
    populateDynamicRows('nist', '');
    populateDynamicRows('ptes', '');
}

function autofillFindingFields(cweItem) {
    const titleField = document.getElementById('finding-title');
    const descField = document.getElementById('finding-desc');
    const exploitationField = document.getElementById('finding-exploitation');
    const impactField = document.getElementById('finding-impact');
    const solutionField = document.getElementById('finding-solution');
    const refField = document.getElementById('finding-reference');
    
    const mitreField = document.getElementById('finding-mitre');
    const isoField = document.getElementById('finding-iso');
    const nistField = document.getElementById('finding-nist');
    const ptesField = document.getElementById('finding-ptes');
    
    if (titleField && (!titleField.value || titleField.value.trim() === '')) {
        titleField.value = cweItem.name.replace(/\('([^']+)'\)/, '$1');
    }
    
    if (descField) descField.value = cweItem.description;
    if (exploitationField) exploitationField.value = cweItem.exploitation;
    if (impactField) impactField.value = cweItem.impact;
    if (solutionField) solutionField.value = cweItem.solution;
    if (refField) refField.value = cweItem.reference;
    
    if (mitreField) mitreField.value = cweItem.mitre;
    if (isoField) isoField.value = cweItem.iso;
    if (nistField) nistField.value = cweItem.nist;
    if (ptesField) ptesField.value = cweItem.ptes;
}

// Support direct screenshot pasting from Clipboard globally while finding modal is active
function setPocImageAlign(alignVal) {
    const hiddenInput = document.getElementById('finding-poc-image-align');
    if (hiddenInput) {
        hiddenInput.value = alignVal;
    }
    document.querySelectorAll('.poc-image-align-buttons .btn-helper').forEach(btn => {
        if (btn.getAttribute('data-align') === alignVal) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function setupImagePaste() {
    // Setup event listeners for the inline helper alignment buttons under each textarea
    document.querySelectorAll('.image-helper-row').forEach(row => {
        row.querySelectorAll('.btn-helper:not(.upload-btn):not(.insert-code-btn)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                row.querySelectorAll('.btn-helper:not(.upload-btn):not(.insert-code-btn)').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    });

    // Setup event listeners for the file upload button and file inputs under each textarea
    document.querySelectorAll('.image-helper-row').forEach(row => {
        const uploadBtn = row.querySelector('.upload-btn');
        const uploadMultipleBtn = row.querySelector('.upload-multiple-btn');
        const fileInput = row.querySelector('.image-file-helper');
        const fileMultipleInput = row.querySelector('.image-file-multiple-helper');
        const textarea = row.previousElementSibling;

        // Dynamically inject the Code button next to the upload multiple button
        if (uploadMultipleBtn && textarea && !row.querySelector('.insert-code-btn')) {
            const codeBtn = document.createElement('button');
            codeBtn.type = 'button';
            codeBtn.className = 'btn-helper insert-code-btn';
            codeBtn.style.marginLeft = '0.5rem';
            codeBtn.style.fontWeight = 'bold';
            codeBtn.title = 'Insert Script/Code Block';
            codeBtn.innerText = '💻 Code';
            
            codeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const originalVal = textarea.value;
                const selectionStart = textarea.selectionStart || 0;
                const selectionEnd = textarea.selectionEnd || 0;
                const selectedText = originalVal.substring(selectionStart, selectionEnd);
                
                const wrappedText = `\n\`\`\`http\n${selectedText || "Masukkan script / HTTP request di sini"}\n\`\`\`\n`;
                textarea.value = originalVal.substring(0, selectionStart) + wrappedText + originalVal.substring(selectionEnd);
                
                // Refocus and select
                textarea.focus();
                textarea.selectionStart = selectionStart + 9; // length of "\n```http\n"
                textarea.selectionEnd = selectionStart + 9 + (selectedText ? selectedText.length : 36);
            });
            
            uploadMultipleBtn.parentNode.insertBefore(codeBtn, uploadMultipleBtn.nextSibling);
        }

        if (uploadBtn && fileInput && textarea) {
            uploadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                fileInput.click();
            });

            fileInput.addEventListener('change', async () => {
                if (fileInput.files.length === 0) return;
                const file = fileInput.files[0];
                
                const originalVal = textarea.value;
                const selectionStart = textarea.selectionStart || 0;
                const selectionEnd = textarea.selectionEnd || 0;
                
                textarea.value = originalVal.substring(0, selectionStart) + " [Uploading image...] " + originalVal.substring(selectionEnd);
                textarea.disabled = true;

                const formData = new FormData();
                formData.append('file', file, file.name);

                try {
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    const result = await response.json();
                    if (result.url) {
                        const fullUrl = window.location.origin + result.url;
                        let caption = 'Screenshot';
                        let alignment = 'center';

                        const captionInput = row.querySelector('.image-caption-helper');
                        if (captionInput && captionInput.value.trim()) {
                            caption = captionInput.value.trim();
                        }
                        const activeAlignBtn = row.querySelector('.btn-helper.active');
                        if (activeAlignBtn) {
                            if (activeAlignBtn.classList.contains('align-left')) alignment = 'left';
                            else if (activeAlignBtn.classList.contains('align-right')) alignment = 'right';
                        }

                        const imgMarkdown = `\n![${caption} | ${alignment}](${fullUrl})\n`;
                        textarea.value = originalVal.substring(0, selectionStart) + imgMarkdown + originalVal.substring(selectionEnd);
                        textarea.selectionStart = textarea.selectionEnd = selectionStart + imgMarkdown.length;
                    } else {
                        textarea.value = originalVal;
                        alert("Upload failed. Please try again.");
                    }
                } catch (err) {
                    console.error("File upload failed:", err);
                    textarea.value = originalVal;
                    alert("Upload error occurred.");
                } finally {
                    textarea.disabled = false;
                    fileInput.value = ''; // Reset file input
                    textarea.focus();
                }
            });
        }

        if (uploadMultipleBtn && fileMultipleInput && textarea) {
            uploadMultipleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                fileMultipleInput.click();
            });

            fileMultipleInput.addEventListener('change', async () => {
                if (fileMultipleInput.files.length === 0) return;
                const files = Array.from(fileMultipleInput.files);
                
                const originalVal = textarea.value;
                const selectionStart = textarea.selectionStart || 0;
                const selectionEnd = textarea.selectionEnd || 0;
                
                textarea.value = originalVal.substring(0, selectionStart) + " [Uploading images...] " + originalVal.substring(selectionEnd);
                textarea.disabled = true;

                let uploadedMarkdowns = [];
                let failedCount = 0;

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const formData = new FormData();
                    formData.append('file', file, file.name);

                    try {
                        const response = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData
                        });
                        const result = await response.json();
                        if (result.url) {
                            const fullUrl = window.location.origin + result.url;
                            let caption = 'Screenshot';
                            let alignment = 'center';

                            const captionInput = row.querySelector('.image-caption-helper');
                            if (captionInput && captionInput.value.trim()) {
                                caption = captionInput.value.trim();
                                if (files.length > 1) {
                                    caption += ` (${i + 1})`;
                                }
                            } else if (files.length > 1) {
                                caption = `Screenshot ${i + 1}`;
                            }
                            const activeAlignBtn = row.querySelector('.btn-helper.active');
                            if (activeAlignBtn) {
                                if (activeAlignBtn.classList.contains('align-left')) alignment = 'left';
                                else if (activeAlignBtn.classList.contains('align-right')) alignment = 'right';
                            }

                            uploadedMarkdowns.push(`\n![${caption} | ${alignment}](${fullUrl})\n`);
                        } else {
                            failedCount++;
                        }
                    } catch (err) {
                        console.error("Multiple file upload failed:", err);
                        failedCount++;
                    }
                }

                if (uploadedMarkdowns.length > 0) {
                    const imgMarkdown = uploadedMarkdowns.join('');
                    textarea.value = originalVal.substring(0, selectionStart) + imgMarkdown + originalVal.substring(selectionEnd);
                    textarea.selectionStart = textarea.selectionEnd = selectionStart + imgMarkdown.length;
                } else {
                    textarea.value = originalVal;
                }

                if (failedCount > 0) {
                    alert(`${failedCount} upload(s) failed. Please try again.`);
                }

                textarea.disabled = false;
                fileMultipleInput.value = ''; // Reset file input
                textarea.focus();
            });
        }
    });

    document.addEventListener('paste', async (e) => {
        // Only trigger if the finding modal, project modal, or reference item modal is open
        const findingModal = document.getElementById('finding-modal');
        const projectModal = document.getElementById('project-modal');
        const refItemModal = document.getElementById('reference-item-modal');
        const isFindingActive = findingModal && findingModal.classList.contains('active');
        const isProjectActive = projectModal && projectModal.classList.contains('active');
        const isRefItemActive = refItemModal && refItemModal.classList.contains('active');
        if (!isFindingActive && !isProjectActive && !isRefItemActive) return;
        
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                
                // Prevent binary data dump pasting into normal form text fields
                e.preventDefault();
                
                // Determine target input element
                const activeEl = document.activeElement;
                if (!activeEl || activeEl.tagName !== 'TEXTAREA') return;
                
                const targetInput = activeEl;
                const originalVal = targetInput.value;
                const selectionStart = targetInput.selectionStart || 0;
                const selectionEnd = targetInput.selectionEnd || 0;
                
                targetInput.value = originalVal.substring(0, selectionStart) + " [Uploading image...] " + originalVal.substring(selectionEnd);
                targetInput.disabled = true;
                
                const formData = new FormData();
                formData.append('file', blob, 'screenshot.png');
                
                try {
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    const result = await response.json();
                    if (result.url) {
                        const fullUrl = window.location.origin + result.url;
                        
                        // Find the helper row associated with this textarea (it's the next sibling element)
                        let caption = 'Screenshot';
                        let alignment = 'center';
                        
                        const helperRow = targetInput.nextElementSibling;
                        if (helperRow && helperRow.classList.contains('image-helper-row')) {
                            const captionInput = helperRow.querySelector('.image-caption-helper');
                            if (captionInput && captionInput.value.trim()) {
                                caption = captionInput.value.trim();
                            }
                            const activeAlignBtn = helperRow.querySelector('.btn-helper.active');
                            if (activeAlignBtn) {
                                if (activeAlignBtn.classList.contains('align-left')) alignment = 'left';
                                else if (activeAlignBtn.classList.contains('align-right')) alignment = 'right';
                            }
                        }
                        
                        // Insert markdown image tag directly at cursor position
                        const imgMarkdown = `\n![${caption} | ${alignment}](${fullUrl})\n`;
                        targetInput.value = originalVal.substring(0, selectionStart) + imgMarkdown + originalVal.substring(selectionEnd);
                        targetInput.selectionStart = targetInput.selectionEnd = selectionStart + imgMarkdown.length;
                    } else {
                        targetInput.value = originalVal;
                        alert("Upload failed. Please try again.");
                    }
                } catch (err) {
                    console.error("Paste upload failed:", err);
                    targetInput.value = originalVal;
                    alert("Upload error occurred.");
                } finally {
                    targetInput.disabled = false;
                    targetInput.focus();
                }
                break;
            }
        }
    });
}

function getMemberCategory(role) {
    if (!role) return 'Consultants';
    const r = role.toLowerCase();
    if (r.includes('sales') || r.includes('marketing') || r.includes('account') || r.includes('bd') || r.includes('business development')) {
        return 'Sales';
    }
    if (r.includes('pm') || r.includes('project manager') || r.includes('manager') || r.includes('coordinator')) {
        return 'PMs';
    }
    return 'Consultants';
}

async function populateConsultantSelect(selectId, selectedId = null, roleFilter = null) {
    const res = await fetch('/api/consultants');
    const consultants = await res.json();
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Select Member</option>';
    consultants.forEach(c => {
        if (roleFilter) {
            const cat = getMemberCategory(c.role);
            if (cat !== roleFilter) return;
        }
        select.innerHTML += `<option value="${c.id}" ${selectedId == c.id ? 'selected' : ''}>${c.name} (${c.role || 'Consultant'})</option>`;
    });
}

async function loadConsultants() {
    let consultants = cacheStore.consultants;
    if (!consultants) {
        const res = await fetch('/api/consultants');
        consultants = await res.json();
        cacheStore.consultants = consultants;
    }
    
    let refs = cacheStore.references;
    if (!refs) {
        try {
            const resRefs = await fetch('/api/references');
            refs = await resRefs.json();
            cacheStore.references = refs;
        } catch (e) {
            console.error("Failed to load references for contribution count:", e);
        }
    }
    
    const isAdmin = currentUser && currentUser.role === 'Admin';
    const btnAddMember = document.getElementById('btn-add-member');
    if (btnAddMember) {
        btnAddMember.style.display = isAdmin ? 'inline-block' : 'none';
    }

    const tbodyConsultants = document.getElementById('member-consultants-table-body');
    const tbodyPMs = document.getElementById('member-pm-table-body');
    const tbodySales = document.getElementById('member-sales-table-body');
    
    if (tbodyConsultants) tbodyConsultants.innerHTML = '';
    if (tbodyPMs) tbodyPMs.innerHTML = '';
    if (tbodySales) tbodySales.innerHTML = '';

    const groups = {
        Consultants: [],
        PMs: [],
        Sales: []
    };

    consultants.forEach(c => {
        const cat = getMemberCategory(c.role);
        groups[cat].push(c);
    });

    const renderGroup = (members, tbody, emptyMsg, showLibraryContrib = false) => {
        if (!tbody) return;
        if (members.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 1.5rem;">${emptyMsg}</td></tr>`;
            return;
        }
        
        let html = '';
        members.forEach(c => {
            let refCount = 0;
            if (showLibraryContrib && refs && refs.categories) {
                const nameLower = c.name ? c.name.trim().toLowerCase() : '';
                const emailPrefix = c.email ? c.email.split('@')[0].trim().toLowerCase() : '';
                Object.values(refs.categories).forEach(cat => {
                    if (cat.items) {
                        cat.items.forEach(item => {
                            if (item.consultant) {
                                const itemRefLower = item.consultant.trim().toLowerCase();
                                if (itemRefLower === nameLower || (emailPrefix && itemRefLower === emailPrefix)) {
                                    refCount++;
                                }
                            }
                        });
                    }
                });
            }

            const contribBadge = refCount > 0 
                ? `<span class="badge" style="background-color: var(--severity-info-bg); color: var(--severity-info); border: 1px solid rgba(2, 132, 199, 0.2); font-weight: 600;">${refCount} items</span>`
                : `<span class="badge" style="background-color: #f1f5f9; color: #475569; border: 1px solid rgba(71, 85, 105, 0.15); font-weight: 500;">0 items</span>`;

            const actionsTdContent = isAdmin ? `
                <div style="display: flex; gap: 0.4rem; align-items: center;">
                    <button class="btn btn-action-edit" onclick="editConsultant(${c.id})" title="Edit Member">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn btn-action-delete" onclick="deleteConsultant(${c.id})" title="Delete Member">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            ` : '-';

            html += `
                <tr>
                    <td><a href="#" style="color: var(--accent-blue); font-weight: 600; text-decoration: none;" onclick="viewConsultant(${c.id})">${c.name}</a></td>
                    <td>${c.role || '-'}</td>
                    <td>${c.email || '-'}</td>
                    ${showLibraryContrib ? `<td>${contribBadge}</td>` : '<td></td>'}
                    <td>${actionsTdContent}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    };

    renderGroup(groups.Consultants, tbodyConsultants, 'No consultants registered yet.', true);
    renderGroup(groups.PMs, tbodyPMs, 'No project managers registered yet.', false);
    renderGroup(groups.Sales, tbodySales, 'No sales team members registered yet.', false);
}

function toggleCustomRoleInput(val) {
    const customRoleGroup = document.getElementById('custom-role-group');
    if (val === 'Custom') {
        customRoleGroup.style.display = 'block';
        document.getElementById('consultant-role').required = true;
    } else {
        customRoleGroup.style.display = 'none';
        document.getElementById('consultant-role').required = false;
    }
}

function openConsultantModal() {
    if (!currentUser || currentUser.role !== 'Admin') {
        alert("Only Admins can perform this action.");
        return;
    }
    document.getElementById('consultant-form').reset();
    document.getElementById('consultant-id').value = '';
    document.getElementById('custom-role-group').style.display = 'none';
    document.getElementById('consultant-role').required = false;
    document.getElementById('consultant-modal-title').innerText = 'Add Member';
    document.getElementById('consultant-modal').classList.add('active');
}

function closeConsultantModal() {
    document.getElementById('consultant-modal').classList.remove('active');
}

async function saveConsultant(e) {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'Admin') {
        alert("Only Admins can perform this action.");
        return;
    }
    const id = document.getElementById('consultant-id').value;
    const name = document.getElementById('consultant-name').value;
    
    const roleSelect = document.getElementById('consultant-role-select').value;
    let role = roleSelect;
    if (roleSelect === 'Custom') {
        role = document.getElementById('consultant-role').value;
    }
    
    const email = document.getElementById('consultant-email').value;
    
    const payload = { name, role, email };
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/consultants/${id}` : '/api/consultants';

    await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    cacheStore.consultants = null;
    cacheStore.projects = null;
    cacheStore.dashboard = {};
    
    closeConsultantModal();
    loadConsultants();
}

async function editConsultant(id) {
    if (!currentUser || currentUser.role !== 'Admin') {
        alert("Only Admins can perform this action.");
        return;
    }
    const res = await fetch(`/api/consultants/${id}`);
    const c = await res.json();
    document.getElementById('consultant-id').value = c.id;
    document.getElementById('consultant-name').value = c.name;
    
    const roleSelect = document.getElementById('consultant-role-select');
    const customRoleInput = document.getElementById('consultant-role');
    const customRoleGroup = document.getElementById('custom-role-group');
    
    if (['Consultant', 'Project Manager', 'Sales'].includes(c.role)) {
        roleSelect.value = c.role;
        customRoleGroup.style.display = 'none';
        customRoleInput.value = '';
        customRoleInput.required = false;
    } else {
        roleSelect.value = 'Custom';
        customRoleGroup.style.display = 'block';
        customRoleInput.value = c.role || '';
        customRoleInput.required = true;
    }
    
    document.getElementById('consultant-email').value = c.email;
    document.getElementById('consultant-modal-title').innerText = 'Edit Member';
    document.getElementById('consultant-modal').classList.add('active');
}

async function deleteConsultant(id) {
    if (!currentUser || currentUser.role !== 'Admin') {
        alert("Only Admins can perform this action.");
        return;
    }
    if (confirm('Are you sure you want to delete this member?')) {
        await fetch(`/api/consultants/${id}`, { method: 'DELETE' });
        cacheStore.consultants = null;
        cacheStore.projects = null;
        cacheStore.dashboard = {};
        loadConsultants();
    }
}

async function viewConsultant(consultantId) {
    const res = await fetch(`/api/consultants/${consultantId}`);
    const c = await res.json();

    document.getElementById('detail-consultant-name').innerText = c.name;
    document.getElementById('detail-consultant-role').innerText = c.role || 'Team Member';
    document.getElementById('detail-consultant-email').innerText = c.email || '-';

    const tbody = document.getElementById('detail-consultant-projects-body');
    tbody.innerHTML = '';

    const statusCounts = { 'In Progress': 0, 'Completed': 0, 'Retest Pending': 0, 'Retest Completed': 0 };
    let totalAssigned = 0;

    if (!c.projects || c.projects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 2rem;">No projects currently assigned to this member.</td></tr>';
    } else {
        let tbodyHTML = '';
        c.projects.forEach(p => {
            tbodyHTML += `
                <tr>
                    <td><a href="#" style="color: var(--accent-blue); font-weight: 600; text-decoration: none;" onclick="viewProject(${p.id})">${p.name}</a></td>
                    <td><strong style="color: var(--accent-blue);">${p.assigned_role}</strong></td>
                    <td><span class="badge badge-status ${getStatusBadgeClass(p.status)}">${p.status}</span></td>
                    <td>${p.start_date || '-'} to ${p.end_date || '-'}</td>
                    <td><strong>${p.active_findings}</strong> / ${p.total_findings}</td>
                </tr>
            `;
            if (statusCounts.hasOwnProperty(p.status)) {
                statusCounts[p.status]++;
                totalAssigned++;
            }
        });
        tbody.innerHTML = tbodyHTML;
    }

    // Render Consultant Progress Chart
    if (consultantProgressChartInstance) {
        consultantProgressChartInstance.destroy();
    }
    const chartCtx = document.getElementById('consultantProgressChart').getContext('2d');
    
    let chartData, chartLabels, chartColors;
    if (totalAssigned === 0) {
        chartData = [1];
        chartLabels = ['No Projects'];
        chartColors = ['#cbd5e1'];
    } else {
        chartData = [
            statusCounts['In Progress'],
            statusCounts['Completed'],
            statusCounts['Retest Pending'],
            statusCounts['Retest Completed']
        ];
        chartLabels = ['In Progress', 'Completed', 'Retest Pending', 'Retest Completed'];
        chartColors = ['#0369a1', '#15803d', '#b45309', '#6b21a8'];
    }

    consultantProgressChartInstance = new Chart(chartCtx, {
        type: 'doughnut',
        data: {
            labels: chartLabels,
            datasets: [{
                data: chartData,
                backgroundColor: chartColors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (totalAssigned === 0) {
                                return ' No projects assigned';
                            }
                            return ` ${context.label}: ${context.raw} project(s)`;
                        }
                    }
                }
            }
        }
    });

    document.getElementById('consultant-detail-view').style.display = 'block';
}

// --- Authentication & User Management JS Handlers ---

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const tokenInput = document.getElementById('login-mfa-token');
    const token = tokenInput.value.trim();
    const errorMsg = document.getElementById('login-error-msg');
    
    errorMsg.style.display = 'none';
    
    const payload = { username, password };
    if (token) {
        payload.token = token;
    }
    
    fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(async res => {
        const data = await res.json();
        if (res.ok) {
            if (data.status === 'mfa_required') {
                document.getElementById('login-mfa-container').style.display = 'block';
                tokenInput.required = true;
                tokenInput.focus();
                errorMsg.innerText = 'Silakan masukkan token MFA Anda.';
                errorMsg.style.color = 'var(--accent-blue)';
                errorMsg.style.display = 'block';
            } else {
                document.getElementById('login-username').value = '';
                document.getElementById('login-password').value = '';
                tokenInput.value = '';
                tokenInput.required = false;
                document.getElementById('login-mfa-container').style.display = 'none';
                clearCacheStore();
                checkAuth();
            }
        } else {
            errorMsg.innerText = data.message || 'Login failed';
            errorMsg.style.color = 'var(--severity-critical)';
            errorMsg.style.display = 'block';
        }
    })
    .catch(err => {
        console.error("Login request error:", err);
        errorMsg.innerText = 'Server connection error';
        errorMsg.style.color = 'var(--severity-critical)';
        errorMsg.style.display = 'block';
    });
}

function handleLogout() {
    if (!confirm("Are you sure you want to logout?")) return;
    fetch('/api/auth/logout', { method: 'POST' })
        .then(() => {
            currentUser = null;
            activeTab = 'dashboard';
            clearCacheStore();
            checkAuth();
        })
        .catch(err => console.error("Logout failed:", err));
}

function openChangePasswordModal(targetUserId = null) {
    document.getElementById('change-password-form').reset();
    document.getElementById('password-error-msg').style.display = 'none';
    
    const targetInput = document.getElementById('change-password-target-id');
    const oldGroup = document.getElementById('password-old-group');
    const title = document.getElementById('change-password-title');
    
    if (targetUserId) {
        // Admin resetting another user's password
        targetInput.value = targetUserId;
        oldGroup.style.display = 'none';
        title.innerText = "Reset User Password";
    } else {
        // Current user changing their own password
        targetInput.value = "";
        oldGroup.style.display = 'block';
        title.innerText = "Change Your Password";
    }
    
    document.getElementById('change-password-modal').classList.add('active');
    document.getElementById('change-password-modal').style.opacity = '1';
    document.getElementById('change-password-modal').style.pointerEvents = 'all';
}

function closeChangePasswordModal() {
    document.getElementById('change-password-modal').classList.remove('active');
    document.getElementById('change-password-modal').style.opacity = '0';
    document.getElementById('change-password-modal').style.pointerEvents = 'none';
}

function saveChangePassword(e) {
    e.preventDefault();
    const targetUserId = document.getElementById('change-password-target-id').value;
    const newPassword = document.getElementById('password-new').value;
    const errorMsg = document.getElementById('password-error-msg');
    
    errorMsg.style.display = 'none';
    
    if (targetUserId) {
        // Admin reset call
        fetch(`/api/admin/users/${targetUserId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword })
        })
        .then(async res => {
            const data = await res.json();
            if (res.ok) {
                alert("Password reset successfully");
                closeChangePasswordModal();
            } else {
                errorMsg.innerText = data.message || "Failed to reset password";
                errorMsg.style.display = 'block';
            }
        });
    } else {
        // Current user change call
        const oldPassword = document.getElementById('password-old').value;
        fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
        })
        .then(async res => {
            const data = await res.json();
            if (res.ok) {
                alert("Password updated successfully");
                closeChangePasswordModal();
            } else {
                errorMsg.innerText = data.message || "Failed to update password";
                errorMsg.style.display = 'block';
            }
        });
    }
}

function switchConfigSubTab(subtab) {
    activeConfigSubTab = subtab;
    
    document.querySelectorAll('.config-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Hide all config sections
    document.getElementById('config-users-section').style.display = 'none';
    document.getElementById('config-logs-section').style.display = 'none';
    document.getElementById('config-blocklist-section').style.display = 'none';
    
    if (subtab === 'users') {
        document.getElementById('tab-users-btn').classList.add('active');
        document.getElementById('config-users-section').style.display = 'block';
        loadUsers();
    } else if (subtab === 'logs') {
        document.getElementById('tab-logs-btn').classList.add('active');
        document.getElementById('config-logs-section').style.display = 'block';
        loadAuditLogs();
    } else if (subtab === 'blocklist') {
        document.getElementById('tab-blocklist-btn').classList.add('active');
        document.getElementById('config-blocklist-section').style.display = 'block';
        loadBlocklist();
    }
}

function loadUsers() {
    fetch('/api/admin/users')
        .then(res => res.json())
        .then(users => {
            globalUsersList = users;
            const tbody = document.getElementById('user-table-body');
            tbody.innerHTML = '';
            users.forEach(user => {
                const tr = document.createElement('tr');
                const isSelf = currentUser && currentUser.id === user.id;
                
                const mfaBadge = user.mfa_enabled 
                    ? '<span class="badge badge-low" style="background: #dcfce7; color: #15803d; border: 1px solid rgba(22, 163, 74, 0.2); padding: 2px 6px; font-size: 0.75rem; font-weight: 600; border-radius: 4px;">Enabled</span>' 
                    : '<span class="badge badge-high" style="background: #ffe4e6; color: #e11d48; border: 1px solid rgba(225, 29, 72, 0.2); padding: 2px 6px; font-size: 0.75rem; font-weight: 600; border-radius: 4px;">Disabled</span>';
                
                const statusBadge = user.is_disabled
                    ? '<span class="badge badge-high" style="background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; padding: 2px 6px; font-size: 0.75rem; font-weight: 600; border-radius: 4px;">Disabled</span>'
                    : '<span class="badge badge-low" style="background: #dcfce7; color: #15803d; border: 1px solid rgba(22, 163, 74, 0.2); padding: 2px 6px; font-size: 0.75rem; font-weight: 600; border-radius: 4px;">Active</span>';

                tr.innerHTML = `
                    <td style="font-weight: 600;">${user.username} ${isSelf ? ' <span style="font-size:0.75rem; color: var(--accent-blue);">(You)</span>' : ''}</td>
                    <td style="font-weight: 500; color: var(--text-primary);">${user.fullname || user.username}</td>
                    <td><span class="badge-status ${user.role === 'Admin' ? 'status-completed' : 'status-retestcompleted'}">${user.role}</span></td>
                    <td style="font-weight: 500; color: var(--text-secondary);">${user.member_role || 'Consultant'}</td>
                    <td>${mfaBadge}</td>
                    <td>${statusBadge}</td>
                    <td>${user.created_at}</td>
                    <td>
                        <div style="display:flex; gap: 0.4rem; align-items: center;">
                            <button class="btn btn-action-edit" onclick="openChangePasswordModal(${user.id})" title="Reset Password">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            </button>
                            ${!isSelf ? `
                                <button class="btn btn-action-view" onclick="openEditUserModal(${user.id})" title="Edit Access">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                </button>
                                <button class="btn btn-action-lock" onclick="adminToggleUserStatus(${user.id}, ${user.is_disabled})" title="${user.is_disabled ? 'Enable User' : 'Disable User'}">
                                    ${user.is_disabled ? '🔓' : '🔒'}
                                </button>
                                ${user.mfa_enabled ? `
                                    <button class="btn btn-action-mfa" onclick="adminResetMfa(${user.id})" title="Reset MFA">
                                        ♻️
                                    </button>
                                ` : ''}
                                <button class="btn btn-action-delete" onclick="deleteUser(${user.id}, '${user.username}')" title="Delete User">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        });
}

async function adminToggleUserStatus(userId, currentDisabledState) {
    const action = currentDisabledState ? 'mengaktifkan' : 'menonaktifkan';
    if (!confirm(`Apakah Anda yakin ingin ${action} user ini?`)) return;
    
    try {
        await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_disabled: !currentDisabledState })
        });
        loadUsers();
    } catch (err) {
        console.error("Failed to toggle user status:", err);
    }
}

async function adminResetMfa(userId) {
    if (!confirm('Apakah Anda yakin ingin me-reset MFA untuk user ini? User harus men-scan ulang QR code MFA.')) return;
    
    try {
        await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reset_mfa: true })
        });
        loadUsers();
    } catch (err) {
        console.error("Failed to reset user MFA:", err);
    }
}

function populateAllowedClientsList(allowedCompanyIds = []) {
    const listDiv = document.getElementById('user-allowed-clients-list');
    if (!listDiv) return;
    listDiv.innerHTML = '<span style="font-size: 0.75rem; color: var(--text-secondary); font-style: italic;">Loading clients...</span>';
    
    fetch('/api/companies')
        .then(res => res.json())
        .then(companies => {
            listDiv.innerHTML = '';
            if (companies.length === 0) {
                listDiv.innerHTML = '<span style="font-size: 0.75rem; color: var(--text-secondary); font-style: italic;">No clients created yet</span>';
                return;
            }
            companies.forEach(c => {
                const checked = allowedCompanyIds.includes(c.id) ? 'checked' : '';
                const item = document.createElement('div');
                item.style.display = 'flex';
                item.style.alignItems = 'center';
                item.style.gap = '0.5rem';
                item.innerHTML = `
                    <input type="checkbox" class="user-client-checkbox" id="allow-client-${c.id}" value="${c.id}" ${checked}>
                    <label for="allow-client-${c.id}" style="font-size: 0.8rem; margin: 0; cursor: pointer;">${c.name}</label>
                `;
                listDiv.appendChild(item);
            });
        });
}

// Add event listener for role change on user form
document.addEventListener('DOMContentLoaded', () => {
    const roleSelect = document.getElementById('user-role');
    if (roleSelect) {
        roleSelect.addEventListener('change', (e) => {
            const group = document.getElementById('user-allowed-clients-group');
            if (group) {
                group.style.display = e.target.value === 'Admin' ? 'none' : 'block';
            }
        });
    }
});

function toggleUserCustomRoleInput(val) {
    const customRoleGroup = document.getElementById('user-custom-role-group');
    if (customRoleGroup) {
        if (val === 'Custom') {
            customRoleGroup.style.display = 'block';
            document.getElementById('user-member-role').required = true;
        } else {
            customRoleGroup.style.display = 'none';
            document.getElementById('user-member-role').required = false;
        }
    }
}

async function openAddUserModal() {
    document.getElementById('user-form').reset();
    document.getElementById('user-id').value = '';
    document.getElementById('user-modal-title').innerText = "Add User";
    document.getElementById('user-username-group').style.display = 'block';
    document.getElementById('user-password-group').style.display = 'block';
    document.getElementById('user-username').required = true;
    document.getElementById('user-password').required = true;
    
    document.getElementById('user-member-role-select').value = 'Consultant';
    toggleUserCustomRoleInput('Consultant');
    
    const clientsGroup = document.getElementById('user-allowed-clients-group');
    if (clientsGroup) clientsGroup.style.display = 'block'; // defaults to User role -> show list
    
    populateAllowedClientsList([]);
    
    document.getElementById('user-modal').classList.add('active');
    document.getElementById('user-modal').style.opacity = '1';
    document.getElementById('user-modal').style.pointerEvents = 'all';
}

async function openEditUserModal(userId) {
    const user = globalUsersList.find(u => u.id === userId);
    if (!user) return;
    
    document.getElementById('user-form').reset();
    document.getElementById('user-id').value = user.id;
    document.getElementById('user-modal-title').innerText = `Edit User: ${user.username}`;
    
    document.getElementById('user-fullname').value = user.fullname || '';
    document.getElementById('user-email').value = user.email || '';
    
    const roleSelect = document.getElementById('user-member-role-select');
    const customRoleInput = document.getElementById('user-member-role');
    
    if (['Consultant', 'Project Manager', 'Sales'].includes(user.member_role)) {
        roleSelect.value = user.member_role;
        toggleUserCustomRoleInput(user.member_role);
        customRoleInput.value = '';
    } else {
        roleSelect.value = 'Custom';
        toggleUserCustomRoleInput('Custom');
        customRoleInput.value = user.member_role || '';
    }
    
    // Hide username and password fields for edit mode
    document.getElementById('user-username-group').style.display = 'none';
    document.getElementById('user-password-group').style.display = 'none';
    document.getElementById('user-username').required = false;
    document.getElementById('user-password').required = false;
    
    document.getElementById('user-role').value = user.role;
    
    const clientsGroup = document.getElementById('user-allowed-clients-group');
    if (clientsGroup) {
        clientsGroup.style.display = user.role === 'Admin' ? 'none' : 'block';
    }
    
    populateAllowedClientsList(user.allowed_companies || []);
    
    document.getElementById('user-modal').classList.add('active');
    document.getElementById('user-modal').style.opacity = '1';
    document.getElementById('user-modal').style.pointerEvents = 'all';
}

function closeUserModal() {
    document.getElementById('user-modal').classList.remove('active');
    document.getElementById('user-modal').style.opacity = '0';
    document.getElementById('user-modal').style.pointerEvents = 'none';
}

function saveUser(e) {
    e.preventDefault();
    const userId = document.getElementById('user-id').value;
    const role = document.getElementById('user-role').value;
    const fullname = document.getElementById('user-fullname').value;
    const email = document.getElementById('user-email').value;
    
    const roleSelect = document.getElementById('user-member-role-select').value;
    let member_role = roleSelect;
    if (roleSelect === 'Custom') {
        member_role = document.getElementById('user-member-role').value;
    }
    
    // Parse allowed clients
    const allowedCompanies = [];
    if (role !== 'Admin') {
        document.querySelectorAll('.user-client-checkbox:checked').forEach(cb => {
            allowedCompanies.push(parseInt(cb.value));
        });
    }
    
    const payload = { role, fullname, email, member_role, allowed_companies: allowedCompanies };
    
    if (userId) {
        // Edit Mode
        fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(async res => {
            const data = await res.json();
            if (res.ok) {
                closeUserModal();
                loadUsers();
            } else {
                alert(data.message || "Failed to update user");
            }
        });
    } else {
        // Add Mode
        const username = document.getElementById('user-username').value;
        const password = document.getElementById('user-password').value;
        
        const createPayload = { username, password, ...payload };
        
        fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createPayload)
        })
        .then(async res => {
            const data = await res.json();
            if (res.ok) {
                closeUserModal();
                loadUsers();
            } else {
                alert(data.message || "Failed to create user");
            }
        });
    }
}

function deleteUser(userId, username) {
    if (!confirm(`Are you sure you want to delete user: ${username}?`)) return;
    fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
    })
    .then(async res => {
        if (res.ok) {
            loadUsers();
        } else {
            const data = await res.json();
            alert(data.message || "Failed to delete user");
        }
    });
}

function loadAuditLogs() {
    const searchVal = document.getElementById('log-search-input').value;
    const url = `/api/admin/audit-logs${searchVal ? `?search=${encodeURIComponent(searchVal)}` : ''}`;
    
    fetch(url)
        .then(res => res.json())
        .then(logs => {
            const tbody = document.getElementById('log-table-body');
            tbody.innerHTML = '';
            
            if (logs.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-secondary); padding: 1.5rem;">No logs found</td></tr>`;
                return;
            }
            
            logs.forEach(log => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="white-space: nowrap; color: var(--text-secondary); font-size: 0.8rem;">${log.timestamp}</td>
                    <td style="font-weight: 600;">${log.username}</td>
                    <td style="color: var(--text-secondary); font-size: 0.85rem;">${log.ip_address}</td>
                    <td><span class="badge ${getLogActionBadgeClass(log.action)}">${log.action}</span></td>
                    <td style="font-size: 0.85rem; line-height: 1.4; max-width: 400px; word-break: break-word;">${log.details}</td>
                `;
                tbody.appendChild(tr);
            });
        });
}

function clearAuditLogs() {
    if (!confirm('Apakah Anda yakin ingin menghapus semua audit log? Tindakan ini tidak dapat dibatalkan.')) return;
    
    fetch('/api/admin/audit-logs', { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            alert(data.message || 'Audit logs cleared successfully');
            loadAuditLogs();
        })
        .catch(err => {
            console.error('Error clearing audit logs:', err);
            alert('Failed to clear audit logs.');
        });
}

function getLogActionBadgeClass(action) {
    if (action.includes('FAIL') || action.includes('DELETE')) {
        return 'badge-critical';
    }
    if (action.includes('LOGIN') || action.includes('LOGOUT')) {
        return 'badge-info';
    }
    if (action.includes('CREATE')) {
        return 'badge-low';
    }
    return 'badge-medium';
}

// --- IP Blocklist JS Handlers ---

function loadBlocklist() {
    fetch('/api/admin/blocklist')
        .then(res => res.json())
        .then(blocks => {
            const tbody = document.getElementById('blocklist-table-body');
            tbody.innerHTML = '';
            
            if (blocks.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-secondary); padding: 1.5rem;">No blocked IP addresses</td></tr>`;
                return;
            }
            
            blocks.forEach(block => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-weight: 600;">${block.ip_address}</td>
                    <td>${block.reason}</td>
                    <td>${block.blocked_at}</td>
                    <td><span class="badge ${block.expires_at === 'Permanent' ? 'badge-critical' : 'badge-medium'}">${block.expires_at}</span></td>
                    <td>
                        <button class="btn btn-action-play" onclick="unblockIP(${block.id}, '${block.ip_address}')" title="Unblock IP">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        });
}

function openBlockIPModal() {
    document.getElementById('block-ip-form').reset();
    document.getElementById('block-ip-modal').classList.add('active');
    document.getElementById('block-ip-modal').style.opacity = '1';
    document.getElementById('block-ip-modal').style.pointerEvents = 'all';
}

function closeBlockIPModal() {
    document.getElementById('block-ip-modal').classList.remove('active');
    document.getElementById('block-ip-modal').style.opacity = '0';
    document.getElementById('block-ip-modal').style.pointerEvents = 'none';
}

function saveBlockedIP(e) {
    e.preventDefault();
    const ip_address = document.getElementById('block-ip-address').value;
    const reason = document.getElementById('block-ip-reason').value;
    const expires_val = document.getElementById('block-ip-expiry').value;
    
    const body = {
        ip_address: ip_address,
        reason: reason
    };
    
    if (expires_val !== "0") {
        body.expires_in = parseInt(expires_val);
    }
    
    fetch('/api/admin/blocklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    .then(async res => {
        const data = await res.json();
        if (res.ok) {
            closeBlockIPModal();
            loadBlocklist();
        } else {
            alert(data.message || "Failed to block IP");
        }
    });
}

function unblockIP(blockId, ipAddress) {
    if (!confirm(`Are you sure you want to unblock IP: ${ipAddress}?`)) return;
    fetch(`/api/admin/blocklist/${blockId}`, {
        method: 'DELETE'
    })
    .then(async res => {
        if (res.ok) {
            loadBlocklist();
        } else {
            const data = await res.json();
            alert(data.message || "Failed to unblock IP");
        }
    });
}

// Whiteboard Globals
let wbCanvas = null;
let wbCtx = null;
let wbDrawing = false;
let wbColor = '#0f172a';
let wbSize = 5;
let wbTool = 'pencil'; // pencil or eraser

function openUsedToolsModal() {
    fetch(`/api/projects/${currentProjectId}`)
        .then(res => res.json())
        .then(p => {
            document.getElementById('used-tools-form').reset();
            const toolsChecked = (p.used_tools || '').split(',').map(t => t.trim());
            const checkboxes = document.querySelectorAll('#tools-checkboxes-container input[name="tools"]');
            const standardTools = Array.from(checkboxes).map(c => c.value);
            
            checkboxes.forEach(cb => {
                cb.checked = toolsChecked.includes(cb.value);
            });
            
            const customTools = toolsChecked.filter(t => t && !standardTools.includes(t));
            document.getElementById('custom-tools-input').value = customTools.join(', ');
            
            document.getElementById('used-tools-modal').classList.add('active');
        });
}

function closeUsedToolsModal() {
    document.getElementById('used-tools-modal').classList.remove('active');
}

async function saveUsedTools(e) {
    e.preventDefault();
    const checkedBoxes = Array.from(document.querySelectorAll('#tools-checkboxes-container input[name="tools"]:checked')).map(c => c.value);
    const customVal = document.getElementById('custom-tools-input').value;
    const customTools = customVal.split(',').map(t => t.trim()).filter(Boolean);
    const allTools = [...checkedBoxes, ...customTools].join(', ');
    
    await fetch(`/api/projects/${currentProjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            used_tools: allTools
        })
    });
    
    closeUsedToolsModal();
    viewProject(currentProjectId);
}

let studioCanvas = null;
let studioCtx = null;
let studioTool = 'select'; // select or flow
let studioElements = []; // { id, type, x, y, label, width, height }
let studioFlows = [];    // { id, fromId, toId, label }
let studioThreats = [];  // { id, title, category, priority, mitigation, description, mitigation_desc }

let selectedNodeId = null;
let isDraggingNode = false;
let isResizingNode = false;
let flowStartNode = null;
let dragOffset = { x: 0, y: 0 };
let tempMousePos = { x: 0, y: 0 };

let currentDiagramId = null;
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
}

function openThreatModelModal() {
    createNewDiagramFlow();
}

function openThreatModelStudio(diagramId, name) {
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
    }
    
    studioElements = [];
    studioFlows = [];
    studioThreats = [];
    
    // Load elements, flows, and threats from localStorage specific to this diagram
    const jsonKey = `threat_model_json_${currentProjectId}_${currentDiagramId}`;
    const localJson = localStorage.getItem(jsonKey);
    const threatsKey = `threat_model_threats_${currentProjectId}_${currentDiagramId}`;
    const localThreats = localStorage.getItem(threatsKey);
    
    if (localJson) {
        try {
            const data = JSON.parse(localJson);
            studioElements = data.elements || [];
            studioFlows = data.flows || [];
        } catch (e) {
            console.error("Error parsing local draft json", e);
        }
        try {
            if (localThreats) {
                studioThreats = JSON.parse(localThreats) || [];
            }
        } catch (e) {
            console.error("Error parsing local threats json", e);
        }
        updateDraftStatusLabel("Draft restored from local storage", "#ea580c");
        renderStudioDiagram();
        renderStudioThreats();
    } else {
        fetch(`/api/projects/${currentProjectId}`)
            .then(res => res.json())
            .then(p => {
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
                                threats: parsed.threats || []
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
                            threats: []
                        }];
                    }
                }
                
                const diagram = diagrams.find(d => d.id === currentDiagramId);
                if (diagram) {
                    studioElements = diagram.elements || [];
                    studioFlows = diagram.flows || [];
                    studioThreats = diagram.threats || [];
                    updateDraftStatusLabel("Loaded published diagram & threats", "#15803d");
                } else {
                    updateDraftStatusLabel("New threat model diagram", "#64748b");
                }
                renderStudioDiagram();
                renderStudioThreats();
            });
    }
    
    // Add event listeners
    studioCanvas.removeEventListener('mousedown', handleStudioMouseDown);
    studioCanvas.removeEventListener('mousemove', handleStudioMouseMove);
    studioCanvas.removeEventListener('mouseup', handleStudioMouseUp);
    studioCanvas.removeEventListener('mouseout', handleStudioMouseOut);
    studioCanvas.removeEventListener('dblclick', handleStudioDblClick);
    
    studioCanvas.addEventListener('mousedown', handleStudioMouseDown);
    studioCanvas.addEventListener('mousemove', handleStudioMouseMove);
    studioCanvas.addEventListener('mouseup', handleStudioMouseUp);
    studioCanvas.addEventListener('mouseout', handleStudioMouseOut);
    studioCanvas.addEventListener('dblclick', handleStudioDblClick);
}

function goBackToProjectFromThreatModel() {
    document.getElementById('threat-model-view').style.display = 'none';
    viewProject(currentProjectId);
}

function setStudioTool(tool) {
    studioTool = tool;
    document.querySelectorAll('[id^="studio-tool-"]').forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.getElementById(`studio-tool-${tool}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    flowStartNode = null;
    renderStudioDiagram();
}

function addStudioElement(type) {
    const id = Date.now().toString() + Math.random().toString().substr(2, 5);
    let width = 120;
    let height = 60;
    let label = "";
    
    if (type === 'actor') {
        label = "Actor";
        width = 120;
        height = 60;
    } else if (type === 'process') {
        label = "Process";
        width = 80;
        height = 80;
    } else if (type === 'datastore') {
        label = "Data Store";
        width = 120;
        height = 60;
    } else if (type === 'boundary') {
        label = "Trust Boundary";
        width = 240;
        height = 140;
    } else if (type === 'text') {
        label = "Text Label";
        width = 100;
        height = 30;
    } else if (type === 'user') {
        label = "User";
        width = 80;
        height = 70;
    } else if (type === 'server') {
        label = "Server";
        width = 80;
        height = 70;
    } else if (type === 'device') {
        label = "Device";
        width = 80;
        height = 70;
    } else if (type === 'cloud') {
        label = "Cloud";
        width = 80;
        height = 70;
    } else if (type === 'attacker') {
        label = "Hacker";
        width = 80;
        height = 70;
    } else if (type === 'virus') {
        label = "Virus";
        width = 80;
        height = 70;
    } else if (type === 'switch') {
        label = "Switch";
        width = 80;
        height = 70;
    } else if (type === 'router') {
        label = "Router";
        width = 80;
        height = 70;
    } else if (type === 'database') {
        label = "Database";
        width = 80;
        height = 70;
    } else if (type === 'firewall') {
        label = "Firewall";
        width = 80;
        height = 70;
    }
    
    const x = Math.floor(1200 / 2 - width / 2);
    const y = Math.floor(700 / 2 - height / 2);
    
    const elem = { id, type, x, y, label, width, height };
    studioElements.push(elem);
    selectedNodeId = id;
    
    renderStudioDiagram();
    autoSaveDraftLocally();
}

function clearStudioCanvas() {
    if (confirm("Are you sure you want to clear the diagram? This will reset all elements and lines.")) {
        studioElements = [];
        studioFlows = [];
        selectedNodeId = null;
        flowStartNode = null;
        renderStudioDiagram();
        autoSaveDraftLocally();
    }
}

function getMousePos(e) {
    const rect = studioCanvas.getBoundingClientRect();
    return {
        x: ((e.clientX - rect.left) / rect.width) * 1200,
        y: ((e.clientY - rect.top) / rect.height) * 700
    };
}

function findElementAt(x, y) {
    // Check resize handle of selected element first
    if (selectedNodeId) {
        const el = studioElements.find(item => item.id === selectedNodeId);
        if (el) {
            // handle is at bottom-right corner, 8x8 pixels
            if (x >= el.x + el.width - 6 && x <= el.x + el.width + 8 &&
                y >= el.y + el.height - 6 && y <= el.y + el.height + 8) {
                return { type: 'resize', node: el };
            }
        }
    }
    
    // Check processes, actors, datastores (backwards for Z-order)
    for (let i = studioElements.length - 1; i >= 0; i--) {
        const el = studioElements[i];
        if (el.type !== 'boundary') {
            if (el.type === 'process') {
                const cx = el.x + el.width / 2;
                const cy = el.y + el.height / 2;
                const r = el.width / 2;
                const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                if (d <= r) return { type: 'node', node: el };
            } else {
                if (x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height) {
                    return { type: 'node', node: el };
                }
            }
        }
    }
    
    // Check trust boundaries last
    for (let i = studioElements.length - 1; i >= 0; i--) {
        const el = studioElements[i];
        if (el.type === 'boundary') {
            if (x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height) {
                return { type: 'node', node: el };
            }
        }
    }
    
    return null;
}

function handleStudioMouseDown(e) {
    const pos = getMousePos(e);
    const target = findElementAt(pos.x, pos.y);
    
    if (studioTool === 'flow') {
        if (target && target.type === 'node' && target.node.type !== 'boundary') {
            flowStartNode = target.node;
            tempMousePos = pos;
        } else {
            flowStartNode = null;
        }
    } else {
        if (target) {
            if (target.type === 'resize') {
                isResizingNode = true;
                selectedNodeId = target.node.id;
            } else {
                isDraggingNode = true;
                selectedNodeId = target.node.id;
                dragOffset.x = pos.x - target.node.x;
                dragOffset.y = pos.y - target.node.y;
            }
        } else {
            selectedNodeId = null;
        }
    }
    renderStudioDiagram();
}

function handleStudioMouseMove(e) {
    const pos = getMousePos(e);
    tempMousePos = pos;
    
    if (isDraggingNode && selectedNodeId) {
        const node = studioElements.find(item => item.id === selectedNodeId);
        if (node) {
            node.x = Math.max(0, Math.min(1200 - node.width, pos.x - dragOffset.x));
            node.y = Math.max(0, Math.min(700 - node.height, pos.y - dragOffset.y));
            renderStudioDiagram();
        }
    } else if (isResizingNode && selectedNodeId) {
        const node = studioElements.find(item => item.id === selectedNodeId);
        if (node) {
            if (node.type === 'process') {
                const size = Math.max(40, Math.max(pos.x - node.x, pos.y - node.y));
                node.width = size;
                node.height = size;
            } else {
                node.width = Math.max(50, pos.x - node.x);
                node.height = Math.max(30, pos.y - node.y);
            }
            renderStudioDiagram();
        }
    } else if (flowStartNode) {
        renderStudioDiagram();
    }
}

function handleStudioMouseUp(e) {
    if (flowStartNode) {
        const pos = getMousePos(e);
        const target = findElementAt(pos.x, pos.y);
        
        if (target && target.type === 'node' && target.node.type !== 'boundary' && target.node.id !== flowStartNode.id) {
            const flowLabel = prompt("Enter description for this Data Flow:", "Data Flow");
            if (flowLabel !== null) {
                const id = Date.now().toString() + Math.random().toString().substr(2, 5);
                studioFlows.push({
                    id,
                    fromId: flowStartNode.id,
                    toId: target.node.id,
                    label: flowLabel || "Data Flow"
                });
                setStudioTool('select');
            }
        }
        flowStartNode = null;
    }
    
    isDraggingNode = false;
    isResizingNode = false;
    renderStudioDiagram();
    autoSaveDraftLocally();
}

function handleStudioMouseOut() {
    isDraggingNode = false;
    isResizingNode = false;
    flowStartNode = null;
    renderStudioDiagram();
}

function handleStudioDblClick(e) {
    const pos = getMousePos(e);
    const target = findElementAt(pos.x, pos.y);
    
    if (target && target.type === 'node') {
        const node = target.node;
        const newLabel = prompt("Edit element name (leave empty to delete element):", node.label);
        if (newLabel === null) return;
        
        if (newLabel.trim() === "") {
            // Delete node
            studioElements = studioElements.filter(item => item.id !== node.id);
            // Delete associated flows
            studioFlows = studioFlows.filter(flow => flow.fromId !== node.id && flow.toId !== node.id);
            if (selectedNodeId === node.id) selectedNodeId = null;
        } else {
            node.label = newLabel;
        }
        renderStudioDiagram();
        autoSaveDraftLocally();
    } else {
        // Check if double-clicked on a flow line
        for (let i = 0; i < studioFlows.length; i++) {
            const flow = studioFlows[i];
            const fromNode = studioElements.find(item => item.id === flow.fromId);
            const toNode = studioElements.find(item => item.id === flow.toId);
            
            if (fromNode && toNode) {
                const x1 = fromNode.x + fromNode.width / 2;
                const y1 = fromNode.y + fromNode.height / 2;
                const x2 = toNode.x + toNode.width / 2;
                const y2 = toNode.y + toNode.height / 2;
                
                const d = getDistanceToSegment(pos.x, pos.y, x1, y1, x2, y2);
                if (d <= 15) {
                    const newLabel = prompt("Edit Data Flow name (leave empty to delete line):", flow.label);
                    if (newLabel === null) return;
                    
                    if (newLabel.trim() === "") {
                        studioFlows = studioFlows.filter(item => item.id !== flow.id);
                    } else {
                        flow.label = newLabel;
                    }
                    renderStudioDiagram();
                    autoSaveDraftLocally();
                    break;
                }
            }
        }
    }
}

function getDistanceToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x1 - x2) ** 2 + (y1 - y2) ** 2;
    if (l2 === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.sqrt((px - (x1 + t * (x2 - x1))) ** 2 + (py - (y1 + t * (y2 - y1))) ** 2);
}

// Intersections and draw helper
function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom === 0) return null;
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        return {
            x: x1 + ua * (x2 - x1),
            y: y1 + ua * (y2 - y1)
        };
    }
    return null;
}

function getRectIntersection(x1, y1, x2, y2, rx, ry, rw, rh) {
    const points = [];
    const left = lineIntersection(x1, y1, x2, y2, rx, ry, rx, ry + rh);
    if (left) points.push(left);
    const right = lineIntersection(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
    if (right) points.push(right);
    const top = lineIntersection(x1, y1, x2, y2, rx, ry, rx + rw, ry);
    if (top) points.push(top);
    const bottom = lineIntersection(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);
    if (bottom) points.push(bottom);
    
    if (points.length === 0) {
        return { x: x2, y: y2 };
    }
    let minD = Infinity;
    let closest = { x: x2, y: y2 };
    for (const p of points) {
        const d = (p.x - x1) ** 2 + (p.y - y1) ** 2;
        if (d < minD) {
            minD = d;
            closest = p;
        }
    }
    return closest;
}

function getIntersectionPoint(fromNode, toNode) {
    const cx1 = fromNode.x + fromNode.width / 2;
    const cy1 = fromNode.y + fromNode.height / 2;
    const cx2 = toNode.x + toNode.width / 2;
    const cy2 = toNode.y + toNode.height / 2;
    
    if (toNode.type === 'process') {
        const r = toNode.width / 2;
        const dx = cx1 - cx2;
        const dy = cy1 - cy2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return { x: cx2, y: cy2 };
        return {
            x: cx2 + (dx / dist) * r,
            y: cy2 + (dy / dist) * r
        };
    } else {
        return getRectIntersection(cx1, cy1, cx2, cy2, toNode.x, toNode.y, toNode.width, toNode.height);
    }
}

function drawArrowhead(ctx, x, y, angle) {
    const arrowLength = 12;
    const arrowWidth = 6;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-arrowLength, -arrowWidth);
    ctx.lineTo(-arrowLength, arrowWidth);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function renderStudioDiagram(forExport = false) {
    if (!studioCanvas || !studioCtx) return;
    
    studioCtx.clearRect(0, 0, studioCanvas.width, studioCanvas.height);
    
    const dpr = window.devicePixelRatio || 2;
    studioCtx.save();
    studioCtx.scale(dpr, dpr);
    
    if (forExport) {
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
    }
    
    // 1. Draw trust boundaries first
    studioElements.forEach(node => {
        if (node.type === 'boundary') {
            studioCtx.save();
            studioCtx.strokeStyle = '#ef4444';
            studioCtx.lineWidth = 2;
            studioCtx.setLineDash([6, 6]);
            studioCtx.strokeRect(node.x, node.y, node.width, node.height);
            studioCtx.restore();
            
            studioCtx.fillStyle = '#ef4444';
            studioCtx.font = 'bold 11px Inter, Roboto, Arial, sans-serif';
            studioCtx.textAlign = 'left';
            studioCtx.textBaseline = 'top';
            studioCtx.fillText(node.label, node.x + 8, node.y + 8);
        }
    });
    
    // 2. Draw connections (flows)
    studioFlows.forEach(flow => {
        const fromNode = studioElements.find(item => item.id === flow.fromId);
        const toNode = studioElements.find(item => item.id === flow.toId);
        
        if (fromNode && toNode) {
            const cx1 = fromNode.x + fromNode.width / 2;
            const cy1 = fromNode.y + fromNode.height / 2;
            const targetPt = getIntersectionPoint(fromNode, toNode);
            
            studioCtx.beginPath();
            studioCtx.moveTo(cx1, cy1);
            studioCtx.lineTo(targetPt.x, targetPt.y);
            studioCtx.strokeStyle = '#475569';
            studioCtx.lineWidth = 2;
            studioCtx.stroke();
            
            const angle = Math.atan2(targetPt.y - cy1, targetPt.x - cx1);
            drawArrowhead(studioCtx, targetPt.x, targetPt.y, angle);
            
            const mx = (cx1 + targetPt.x) / 2;
            const my = (cy1 + targetPt.y) / 2;
            
            studioCtx.font = '10px Inter, Roboto, Arial, sans-serif';
            studioCtx.textAlign = 'center';
            studioCtx.textBaseline = 'middle';
            const textWidth = studioCtx.measureText(flow.label).width;
            
            studioCtx.fillStyle = '#ffffff';
            studioCtx.fillRect(mx - textWidth / 2 - 4, my - 8, textWidth + 8, 16);
            
            studioCtx.fillStyle = '#0f172a';
            studioCtx.fillText(flow.label, mx, my);
        }
    });
    
    // Draw temporary flow line
    if (!forExport && flowStartNode && tempMousePos) {
        const cx = flowStartNode.x + flowStartNode.width / 2;
        const cy = flowStartNode.y + flowStartNode.height / 2;
        studioCtx.beginPath();
        studioCtx.moveTo(cx, cy);
        studioCtx.lineTo(tempMousePos.x, tempMousePos.y);
        studioCtx.strokeStyle = '#3b82f6';
        studioCtx.lineWidth = 1.5;
        studioCtx.setLineDash([4, 4]);
        studioCtx.stroke();
        studioCtx.setLineDash([]);
    }
    
    // 3. Draw nodes
    studioElements.forEach(node => {
        if (node.type === 'boundary') return;
        
        if (node.type === 'actor') {
            studioCtx.fillStyle = '#ffffff';
            studioCtx.fillRect(node.x, node.y, node.width, node.height);
            studioCtx.strokeStyle = '#334155';
            studioCtx.lineWidth = 2;
            studioCtx.strokeRect(node.x, node.y, node.width, node.height);
            
            studioCtx.fillStyle = '#0f172a';
            studioCtx.font = '12px Inter, Roboto, Arial, sans-serif';
            studioCtx.textAlign = 'center';
            studioCtx.textBaseline = 'middle';
            studioCtx.fillText(node.label, node.x + node.width / 2, node.y + node.height / 2);
        } else if (node.type === 'process') {
            const cx = node.x + node.width / 2;
            const cy = node.y + node.height / 2;
            const r = node.width / 2;
            
            studioCtx.beginPath();
            studioCtx.arc(cx, cy, r, 0, 2 * Math.PI);
            studioCtx.fillStyle = '#ffffff';
            studioCtx.fill();
            studioCtx.strokeStyle = '#334155';
            studioCtx.lineWidth = 2;
            studioCtx.stroke();
            
            studioCtx.fillStyle = '#0f172a';
            studioCtx.font = '12px Inter, Roboto, Arial, sans-serif';
            studioCtx.textAlign = 'center';
            studioCtx.textBaseline = 'middle';
            studioCtx.fillText(node.label, cx, cy);
        } else if (node.type === 'datastore') {
            studioCtx.fillStyle = '#ffffff';
            studioCtx.fillRect(node.x, node.y, node.width, node.height);
            
            studioCtx.beginPath();
            studioCtx.moveTo(node.x, node.y);
            studioCtx.lineTo(node.x + node.width, node.y);
            studioCtx.moveTo(node.x, node.y + node.height);
            studioCtx.lineTo(node.x + node.width, node.y + node.height);
            studioCtx.strokeStyle = '#334155';
            studioCtx.lineWidth = 2;
            studioCtx.stroke();
            
            studioCtx.fillStyle = '#0f172a';
            studioCtx.font = '12px Inter, Roboto, Arial, sans-serif';
            studioCtx.textAlign = 'center';
            studioCtx.textBaseline = 'middle';
            studioCtx.fillText(node.label, node.x + node.width / 2, node.y + node.height / 2);
        } else if (node.type === 'text') {
            studioCtx.fillStyle = '#0f172a';
            studioCtx.font = '14px Inter, Roboto, Arial, sans-serif';
            studioCtx.textAlign = 'center';
            studioCtx.textBaseline = 'middle';
            studioCtx.fillText(node.label, node.x + node.width / 2, node.y + node.height / 2);
        } else if (['user', 'server', 'device', 'cloud', 'attacker', 'virus', 'switch', 'router', 'database', 'firewall'].includes(node.type)) {
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
            
            studioCtx.font = '24px Inter, Roboto, Arial, sans-serif';
            studioCtx.textAlign = 'center';
            studioCtx.textBaseline = 'middle';
            studioCtx.fillText(emoji, node.x + node.width / 2, node.y + node.height / 2 - 8);
            
            studioCtx.fillStyle = '#0f172a';
            studioCtx.font = '10px Inter, Roboto, Arial, sans-serif';
            studioCtx.fillText(node.label, node.x + node.width / 2, node.y + node.height - 12);
        }
        
        // Selected highlight and resize handle
        if (!forExport && selectedNodeId === node.id) {
            studioCtx.save();
            studioCtx.strokeStyle = '#3b82f6';
            studioCtx.lineWidth = 1.5;
            studioCtx.setLineDash([3, 3]);
            studioCtx.strokeRect(node.x - 4, node.y - 4, node.width + 8, node.height + 8);
            studioCtx.restore();
            
            studioCtx.fillStyle = '#3b82f6';
            studioCtx.fillRect(node.x + node.width - 3, node.y + node.height - 3, 6, 6);
        }
    });
    
    // Highlight selected boundary resizing
    if (!forExport && selectedNodeId) {
        const boundary = studioElements.find(item => item.id === selectedNodeId && item.type === 'boundary');
        if (boundary) {
            studioCtx.save();
            studioCtx.strokeStyle = '#3b82f6';
            studioCtx.lineWidth = 1.5;
            studioCtx.setLineDash([3, 3]);
            studioCtx.strokeRect(boundary.x - 4, boundary.y - 4, boundary.width + 8, boundary.height + 8);
            studioCtx.restore();
            
            studioCtx.fillStyle = '#3b82f6';
            studioCtx.fillRect(boundary.x + boundary.width - 3, boundary.y + boundary.height - 3, 6, 6);
        }
    }
    
    studioCtx.restore();
}

function autoSaveDraftLocally() {
    if (!studioCanvas || !currentDiagramId) return;
    const jsonKey = `threat_model_json_${currentProjectId}_${currentDiagramId}`;
    const imgKey = `threat_model_draft_${currentProjectId}_${currentDiagramId}`;
    const threatsKey = `threat_model_threats_${currentProjectId}_${currentDiagramId}`;
    
    const data = {
        elements: studioElements,
        flows: studioFlows
    };
    
    localStorage.setItem(jsonKey, JSON.stringify(data));
    localStorage.setItem(threatsKey, JSON.stringify(studioThreats));
    
    // Render for export (clean white background, no grids, no highlights)
    renderStudioDiagram(true);
    const imgData = studioCanvas.toDataURL('image/png');
    localStorage.setItem(imgKey, imgData);
    
    // Restore editor view with grid
    renderStudioDiagram(false);
    
    updateDraftStatusLabel("Draft autosaved locally", "#ea580c");
}

async function saveThreatModelDraft() {
    if (!studioCanvas || !currentDiagramId) return;
    autoSaveDraftLocally();
    
    // Render clean view for export (white background, no grids, no highlights)
    renderStudioDiagram(true);
    const imgData = studioCanvas.toDataURL('image/png');
    
    // Restore editor view with grid
    renderStudioDiagram(false);
    
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
    });
    
    // Clear localStorage drafts for this specific diagram
    localStorage.removeItem(`threat_model_json_${currentProjectId}_${currentDiagramId}`);
    localStorage.removeItem(`threat_model_draft_${currentProjectId}_${currentDiagramId}`);
    localStorage.removeItem(`threat_model_threats_${currentProjectId}_${currentDiagramId}`);
    
    updateDraftStatusLabel("Draft saved successfully!", "#2563eb");
    alert("Threat model draft saved to your project workspace!");
    goBackToProjectFromThreatModel();
}

async function publishThreatModelDrawing() {
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
}

function updateDraftStatusLabel(msg, color) {
    const label = document.getElementById('studio-draft-status');
    if (label) {
        label.innerText = msg;
        label.style.color = color;
    }
}

// Threats Management Functions
function openAddThreatModal() {
    const form = document.getElementById('threat-form');
    const hiddenId = document.getElementById('threat-id-hidden');
    const modalTitle = document.getElementById('threat-modal-title');
    const modal = document.getElementById('threat-modal');
    
    if (!modal) { console.error('threat-modal element not found'); return; }
    if (form) form.reset();
    if (hiddenId) hiddenId.value = '';
    if (modalTitle) modalTitle.innerText = 'New Threat';
    modal.classList.add('active');
}

function openEditThreatModal(id) {
    const threat = studioThreats.find(t => t.id === id);
    if (!threat) return;
    
    document.getElementById('threat-id-hidden').value = threat.id;
    document.getElementById('threat-title').value = threat.title || '';
    document.getElementById('threat-category').value = threat.category || 'Spoofing';
    document.getElementById('threat-priority').value = threat.priority || 'Medium';
    document.getElementById('threat-mitigation').value = threat.mitigation || 'Not Mitigated';
    document.getElementById('threat-description').value = threat.description || '';
    document.getElementById('threat-mitigation-desc').value = threat.mitigation_desc || '';
    
    document.getElementById('threat-modal-title').innerText = 'Edit Threat';
    document.getElementById('threat-modal').classList.add('active');
}

function closeThreatModal() {
    document.getElementById('threat-modal').classList.remove('active');
}

function saveThreat(e) {
    e.preventDefault();
    const id = document.getElementById('threat-id-hidden').value;
    const title = document.getElementById('threat-title').value.trim();
    const category = document.getElementById('threat-category').value;
    const priority = document.getElementById('threat-priority').value;
    const mitigation = document.getElementById('threat-mitigation').value;
    const description = document.getElementById('threat-description').value.trim();
    const mitigation_desc = document.getElementById('threat-mitigation-desc').value.trim();
    
    if (id) {
        // Edit existing
        const threat = studioThreats.find(t => t.id === id);
        if (threat) {
            threat.title = title;
            threat.category = category;
            threat.priority = priority;
            threat.mitigation = mitigation;
            threat.description = description;
            threat.mitigation_desc = mitigation_desc;
        }
    } else {
        // Create new
        const newId = Date.now().toString() + Math.random().toString().substr(2, 5);
        studioThreats.push({
            id: newId,
            title,
            category,
            priority,
            mitigation,
            description,
            mitigation_desc
        });
    }
    
    closeThreatModal();
    renderStudioThreats();
    autoSaveDraftLocally();
}

function deleteThreat(id) {
    if (confirm("Are you sure you want to delete this threat?")) {
        studioThreats = studioThreats.filter(t => t.id !== id);
        renderStudioThreats();
        autoSaveDraftLocally();
    }
}

function updateThreatsSummary(tbodyId, threatsList) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    
    const total = threatsList.length;
    const mitigated = threatsList.filter(t => t.mitigation === 'Mitigated').length;
    const notMitigated = total - mitigated;
    const high = threatsList.filter(t => t.priority === 'High' && t.mitigation !== 'Mitigated').length;
    const medium = threatsList.filter(t => t.priority === 'Medium' && t.mitigation !== 'Mitigated').length;
    const low = threatsList.filter(t => t.priority === 'Low' && t.mitigation !== 'Mitigated').length;
    
    tbody.innerHTML = `
        <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 0.75rem 1rem; color: var(--text-primary);">Total Threats</td>
            <td style="padding: 0.75rem 1rem; font-weight: 600; color: var(--text-primary);">${total}</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 0.75rem 1rem; color: var(--text-primary);">Total Mitigated</td>
            <td style="padding: 0.75rem 1rem; font-weight: 600; color: #10b981;">${mitigated}</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 0.75rem 1rem; color: var(--text-primary);">Not Mitigated</td>
            <td style="padding: 0.75rem 1rem; font-weight: 600; color: #f59e0b;">${notMitigated}</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 0.75rem 1rem; color: var(--text-primary);">Open / High Priority</td>
            <td style="padding: 0.75rem 1rem; font-weight: 600; color: #ef4444;">${high}</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 0.75rem 1rem; color: var(--text-primary);">Open / Medium Priority</td>
            <td style="padding: 0.75rem 1rem; font-weight: 600; color: #f59e0b;">${medium}</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 0.75rem 1rem; color: var(--text-primary);">Open / Low Priority</td>
            <td style="padding: 0.75rem 1rem; font-weight: 600; color: #10b981;">${low}</td>
        </tr>
    `;
}

function renderStudioThreats() {
    const grid = document.getElementById('studio-threats-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    studioThreats.forEach((threat, idx) => {
        const num = idx + 1;
        const priorityColor = threat.priority === 'High' ? '#ef4444' : (threat.priority === 'Medium' ? '#f59e0b' : '#10b981');
        const mitigatedIcon = threat.mitigation === 'Mitigated' ? '✅' : '⚠️';
        const mitigationColor = threat.mitigation === 'Mitigated' ? '#10b981' : '#f59e0b';
        
        const card = document.createElement('div');
        card.style.background = '#ffffff';
        card.style.border = '1px solid var(--border-color)';
        card.style.borderRadius = '8px';
        card.style.padding = '1rem';
        card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.gap = '0.5rem';
        
        card.innerHTML = `
            <div style="font-weight: 600; color: #e11d48; font-size: 0.95rem;">
                #${num} ${threat.title}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">
                Category: <strong>${threat.category}</strong>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem;">
                <span>Mitigation: <span style="color: ${mitigationColor}; font-weight: 600;">${mitigatedIcon} ${threat.mitigation}</span></span>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem;">
                <span>Priority: <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${priorityColor};"></span> <strong>${threat.priority}</strong></span>
            </div>
            <p style="font-size: 0.8rem; margin: 0.25rem 0; color: var(--text-primary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${threat.description || 'No description provided.'}
            </p>
            <div style="display: flex; gap: 0.5rem; margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 0.5rem;">
                <button type="button" class="btn btn-secondary" onclick="openEditThreatModal('${threat.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; border-radius: 4px;">Edit</button>
                <button type="button" class="btn btn-danger" onclick="deleteThreat('${threat.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; border-radius: 4px; border-color: #fecdd3; background: #fff1f2;">Delete</button>
            </div>
        `;
        grid.appendChild(card);
    });
    
    updateThreatsSummary('studio-threats-summary-tbody', studioThreats);
}

// Diagrams List Rendering on VAPT Project Details Page
async function deleteThreatModelDiagram(diagramId) {
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
    
    localStorage.removeItem(`threat_model_json_${currentProjectId}_${diagramId}`);
    localStorage.removeItem(`threat_model_draft_${currentProjectId}_${diagramId}`);
    localStorage.removeItem(`threat_model_threats_${currentProjectId}_${diagramId}`);
    
    viewProject(currentProjectId);
}

function renderProjectThreatModels(diagrams) {
    const container = document.getElementById('project-threat-models-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!diagrams || diagrams.length === 0) {
        container.innerHTML = `
            <div class="sysreptor-report-card" style="margin-top: 2rem;">
                <div class="sysreptor-report-title">
                    <span>Threat Modelling</span>
                </div>
                <div class="sysreptor-content" style="padding: 2rem; background: #ffffff; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 8px 8px; text-align: center; color: var(--text-secondary); font-style: italic;">
                    No Threat Model diagrams have been designed for this project yet. Click "Draw Threat Modelling" above to create one.
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
        const totalThreats = diag.threats ? diag.threats.length : 0;
        
        rowsHTML += `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.75rem 1rem; color: var(--text-primary); font-weight: 500;">${num}</td>
                <td style="padding: 0.75rem 1rem; color: var(--text-primary); font-weight: 600;">${diag.name}</td>
                <td style="padding: 0.75rem 1rem; text-align: center;">
                    <span class="badge" style="font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid ${diag.status === 'Published' ? '#bbf7d0' : '#fed7aa'}; background: ${diag.status === 'Published' ? '#dcfce7' : '#ffedd5'}; color: ${diag.status === 'Published' ? '#15803d' : '#d97706'}; text-transform: uppercase;">
                        ${diag.status || 'Draft'}
                    </span>
                </td>
                <td style="padding: 0.75rem 1rem; color: var(--text-primary); text-align: center;">${totalThreats} threats</td>
                <td style="padding: 0.75rem 1rem; text-align: center;">
                    <div style="display: flex; gap: 0.5rem; justify-content: center; align-items: center;">
                        ${(currentProject && canEditProject(currentProject)) ? `
                        <button class="btn btn-secondary" onclick="openThreatModelStudio('${diag.id}', '${diag.name}')" style="width: auto; height: 32px; display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.75rem; font-size: 0.8rem; white-space: nowrap; cursor: pointer;">✏️ Edit</button>
                        <button class="btn btn-danger" onclick="deleteThreatModelDiagram('${diag.id}')" style="width: auto; height: 32px; display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.75rem; font-size: 0.8rem; white-space: nowrap; border-color: #fecdd3; background: #fff1f2; cursor: pointer;">❌ Delete</button>
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
            <span>Threat Modelling</span>
        </div>
        <div class="sysreptor-content" style="padding: 0; background: #ffffff; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 8px 8px; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                <thead>
                    <tr style="background: #f8fafc; border-bottom: 1px solid var(--border-color);">
                        <th style="padding: 0.75rem 1rem; font-weight: 600; color: var(--text-secondary); width: 60px;">No</th>
                        <th style="padding: 0.75rem 1rem; font-weight: 600; color: var(--text-secondary);">Diagram Title</th>
                        <th style="padding: 0.75rem 1rem; font-weight: 600; color: var(--text-secondary); width: 120px; text-align: center;">Status</th>
                        <th style="padding: 0.75rem 1rem; font-weight: 600; color: var(--text-secondary); width: 140px; text-align: center;">Total Threats</th>
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

// --- Testing Guide Functions ---
let currentGuideCategory = '';
let activeGuideObj = null;

async function loadTestingGuide() {
    document.getElementById('testing-guide-view').style.display = 'block';
    if (cacheStore.testingGuides) {
        testingGuideData = cacheStore.testingGuides;
    } else {
        try {
            const response = await fetch('/api/testing-guides');
            testingGuideData = await response.json();
            cacheStore.testingGuides = testingGuideData;
        } catch (e) {
            console.error("Failed to load testing guides:", e);
        }
    }
    renderCategoryList();
}

function renderCategoryList(selectCat = null) {
    const categoryList = document.getElementById('guide-category-list');
    if (!categoryList) return;
    
    categoryList.innerHTML = '';
    const categories = Object.keys(testingGuideData);
    
    categories.forEach((cat, index) => {
        const li = document.createElement('li');
        li.style.marginBottom = '4px';
        const isCurrent = selectCat ? (selectCat === cat) : (index === 0);
        const isActive = isCurrent ? 'active' : '';
        const bgStyle = isCurrent ? 'background-color: rgba(15, 98, 254, 0.08); color: var(--accent-blue);' : '';
        
        li.innerHTML = `
            <button class="nav-item ${isActive}" 
                    onclick="selectGuideCategory('${cat.replace(/'/g, "\\'")}', this)" 
                    style="width: 100%; text-align: left; background: none; border: none; padding: 0.6rem 0.75rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s; ${bgStyle}">
                <span style="display: flex; align-items: center; gap: 0.5rem;">${cat}</span>
                <span style="font-size: 0.75rem; background: rgba(0,0,0,0.06); padding: 0.15rem 0.45rem; border-radius: 10px; color: var(--text-secondary); font-weight: 700;">${testingGuideData[cat].rows.length}</span>
            </button>
        `;
        categoryList.appendChild(li);
    });
    
    if (categories.length > 0) {
        if (selectCat && categories.includes(selectCat)) {
            selectGuideCategory(selectCat);
        } else {
            selectGuideCategory(categories[0]);
        }
    }
}

function selectGuideCategory(category, buttonEl) {
    currentGuideCategory = category;
    
    const buttons = document.querySelectorAll('#guide-category-list button');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.backgroundColor = 'transparent';
        btn.style.color = 'var(--text-primary)';
    });
    
    if (buttonEl) {
        buttonEl.classList.add('active');
        buttonEl.style.backgroundColor = 'rgba(15, 98, 254, 0.08)';
        buttonEl.style.color = 'var(--accent-blue)';
    } else {
        // Find corresponding button in the sidebar list and style it
        const buttonsList = document.querySelectorAll('#guide-category-list button');
        buttonsList.forEach(btn => {
            const btnText = btn.querySelector('span') ? btn.querySelector('span').innerText : '';
            if (btnText === category) {
                btn.classList.add('active');
                btn.style.backgroundColor = 'rgba(15, 98, 254, 0.08)';
                btn.style.color = 'var(--accent-blue)';
            }
        });
    }
    
    document.getElementById('guide-active-category-title').innerText = category;
    
    let desc = 'Panduan & checklist pengujian keamanan';
    if (category === 'RnD - Testing Guide') desc = 'Panduan Eksploitasi & Bypass hasil R&D Tim Pentester';
    else if (category === 'Web Apps') desc = 'Web Application Security Testing Checklist (OWASP ASVS / WSTG)';
    else if (category === 'API') desc = 'API Security Testing Checklist (OWASP API Security Top 10)';
    else if (category === 'Mobile Apps') desc = 'Mobile Application Security Testing Checklist (OWASP MASTG)';
    else if (category === 'ATM' || category === 'Switching ATM' || category === 'EDC') desc = 'Electronic Delivery Channel & Banking Security Testing Checklist';
    document.getElementById('guide-active-category-desc').innerText = desc;
    
    const downloadBtn = document.getElementById('btn-download-guide-template');
    if (downloadBtn) {
        downloadBtn.href = `/api/testing-guides/template?category=${encodeURIComponent(category)}`;
    }
    
    renderGuideTable();
}

function renderGuideTable() {
    const data = testingGuideData[currentGuideCategory];
    if (!data) return;
    
    const headerRow = document.getElementById('guide-table-headers');
    headerRow.innerHTML = `
        <th style="width: 100px;">Test ID</th>
        <th style="width: 180px;">Area / Platform</th>
        <th>Test Case</th>
        <th style="width: 120px;">Priority</th>
        <th style="width: 180px; text-align: center;">Actions</th>
    `;
    
    filterGuides();
}

function filterGuides() {
    const query = document.getElementById('guide-search-input').value.toLowerCase();
    const priorityFilter = document.getElementById('guide-priority-filter').value;
    
    const data = testingGuideData[currentGuideCategory];
    if (!data) return;
    
    const tableBody = document.getElementById('guide-table-body');
    tableBody.innerHTML = '';
    
    const headers = data.headers;
    const getIndex = (names) => {
        return headers.findIndex(h => names.some(n => h.toLowerCase().includes(n.toLowerCase())));
    };
    
    const idIdx = getIndex(['test id', 'no.', 'no']);
    const areaIdx = getIndex(['area', 'platform', 'sub-category']);
    const caseIdx = getIndex(['test case', 'vulnerability name', 'name']);
    const priorityIdx = getIndex(['priority']);
    const purposeIdx = getIndex(['purpose', 'description']);
    const stepsIdx = getIndex(['steps', 'testing guide']);
    const expectedIdx = getIndex(['expected result', 'remediation', 'result']);
    const toolsIdx = getIndex(['tools']);
    const cweIdx = getIndex(['cwe']);
    
    let filteredCount = 0;
    
    data.rows.forEach((row, rowIndex) => {
        const testId = idIdx !== -1 && row[idIdx] ? row[idIdx] : `TG-${rowIndex+1}`;
        const area = areaIdx !== -1 && row[areaIdx] ? row[areaIdx] : 'General';
        const testCase = caseIdx !== -1 && row[caseIdx] ? row[caseIdx] : (row[0] || 'Unnamed Test');
        const priority = priorityIdx !== -1 && row[priorityIdx] ? row[priorityIdx] : 'Medium';
        const purpose = purposeIdx !== -1 && row[purposeIdx] ? row[purposeIdx] : '';
        const steps = stepsIdx !== -1 && row[stepsIdx] ? row[stepsIdx] : '';
        const expected = expectedIdx !== -1 && row[expectedIdx] ? row[expectedIdx] : '';
        const tools = toolsIdx !== -1 && row[toolsIdx] ? row[toolsIdx] : '';
        const cwe = cweIdx !== -1 && row[cweIdx] ? row[cweIdx] : '';
        
        const matchesQuery = !query || 
            testId.toString().toLowerCase().includes(query) ||
            area.toString().toLowerCase().includes(query) ||
            testCase.toString().toLowerCase().includes(query) ||
            purpose.toString().toLowerCase().includes(query) ||
            steps.toString().toLowerCase().includes(query) ||
            tools.toString().toLowerCase().includes(query) ||
            cwe.toString().toLowerCase().includes(query);
            
        const matchesPriority = !priorityFilter || priority.toString().toLowerCase() === priorityFilter.toLowerCase();
        
        if (matchesQuery && matchesPriority) {
            filteredCount++;
            
            const badgeClass = getSeverityBadgeClass(priority);
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            
            // Clean values for event handler arguments
            const safeTestId = testId.toString().replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const safeArea = area.toString().replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const safeTestCase = testCase.toString().replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const safePriority = priority.toString().replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const safePurpose = purpose.toString().replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const safeSteps = steps.toString().replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const safeExpected = expected.toString().replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const safeTools = tools.toString().replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const safeCwe = cwe.toString().replace(/'/g, "\\'").replace(/"/g, '&quot;');
            
            tr.onclick = (e) => {
                if (e.target.tagName !== 'BUTTON') {
                    showGuideDetail(safeTestId, safeArea, safeTestCase, safePriority, safePurpose, safeSteps, safeExpected, safeTools, safeCwe, row, headers);
                }
            };
            
            const isAdmin = currentUser && currentUser.role === 'Admin';
            tr.innerHTML = `
                <td><strong style="color: var(--accent-blue);">${testId}</strong></td>
                <td><span style="font-weight: 500; color: var(--text-secondary);">${area || '-'}</span></td>
                <td><span style="font-weight: 600; color: var(--text-primary);">${testCase}</span></td>
                <td><span class="badge ${badgeClass}">${priority || 'Medium'}</span></td>
                <td style="text-align: center; display: flex; gap: 0.4rem; justify-content: center; align-items: center;">
                    <button class="btn btn-action-view" onclick="showGuideDetail('${safeTestId}', '${safeArea}', '${safeTestCase}', '${safePriority}', '${safePurpose}', '${safeSteps}', '${safeExpected}', '${safeTools}', '${safeCwe}')" title="Lihat Detail">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    ${isAdmin ? `
                    <button class="btn btn-action-edit" onclick="openEditChecklistItemModal(${rowIndex})" title="Edit Item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn btn-action-delete" onclick="deleteChecklistItem(${rowIndex})" title="Hapus Item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                    ` : ''}
                </td>
            `;
            tableBody.appendChild(tr);
        }
    });
    
    if (filteredCount === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 2rem;">No test cases match the active filters.</td></tr>`;
    }
}

function showGuideDetail(testId, area, title, priority, purpose, steps, expected, tools, cwe, fullRow, headersList) {
    const formattedSteps = steps ? steps.replace(/\\n/g, '\n') : '';
    const formattedPurpose = purpose ? purpose.replace(/\\n/g, '\n') : '';
    const formattedExpected = expected ? expected.replace(/\\n/g, '\n') : '';

    activeGuideObj = { 
        testId, 
        area, 
        title, 
        priority, 
        purpose: formattedPurpose, 
        steps: formattedSteps, 
        expected: formattedExpected, 
        tools, 
        cwe 
    };
    
    document.getElementById('modal-guide-id').innerText = testId;
    document.getElementById('modal-guide-title').innerText = title;
    
    const priBadge = document.getElementById('modal-guide-priority');
    priBadge.innerText = priority || 'Medium';
    priBadge.className = `badge ${getSeverityBadgeClass(priority)}`;
    
    document.getElementById('modal-guide-cwe').innerText = cwe || 'N/A';
    document.getElementById('modal-guide-area').innerText = area || 'General';
    document.getElementById('modal-guide-purpose').innerText = formattedPurpose || 'Tidak ada deskripsi.';
    
    const preconditionSec = document.getElementById('modal-guide-precondition-section');
    if (fullRow && headersList) {
        const preIdx = headersList.findIndex(h => h.toLowerCase().includes('precondition'));
        if (preIdx !== -1 && fullRow[preIdx]) {
            preconditionSec.style.display = 'block';
            document.getElementById('modal-guide-precondition').innerText = fullRow[preIdx].toString().replace(/\\n/g, '\n');
        } else {
            preconditionSec.style.display = 'none';
        }
    } else {
        preconditionSec.style.display = 'none';
    }
    
    document.getElementById('modal-guide-steps').innerText = formattedSteps || 'Tidak ada langkah spesifik.';
    document.getElementById('modal-guide-expected').innerText = formattedExpected || 'Tidak ada hasil yang diharapkan.';
    
    const toolsSec = document.getElementById('modal-guide-tools-section');
    const toolsContainer = document.getElementById('modal-guide-tools');
    toolsContainer.innerHTML = '';
    
    if (tools && tools.trim() !== '') {
        toolsSec.style.display = 'block';
        const rawList = tools.split(',').map(t => t.trim()).filter(Boolean);
        const seen = new Set();
        const toolList = [];
        rawList.forEach(t => {
            const lower = t.toLowerCase();
            if (!seen.has(lower)) {
                seen.add(lower);
                toolList.push(t);
            }
        });
        toolList.forEach(t => {
            toolsContainer.innerHTML += `<span style="background: #e0e7ff; color: #4338ca; font-size: 0.8rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid #c7d2fe; display: inline-block;">🔧 ${t}</span>`;
        });
    } else {
        toolsSec.style.display = 'none';
    }
    
    document.getElementById('guide-detail-modal').classList.add('active');
}

function closeGuideDetailModal() {
    document.getElementById('guide-detail-modal').classList.remove('active');
}

function copyGuideSteps() {
    if (!activeGuideObj || !activeGuideObj.steps) return;
    navigator.clipboard.writeText(activeGuideObj.steps)
        .then(() => alert('Langkah pengujian berhasil disalin ke clipboard!'))
        .catch(err => console.error('Gagal menyalin langkah:', err));
}

function useAsFindingTemplate() {
    if (!activeGuideObj) return;
    
    closeGuideDetailModal();
    openFindingModal('template');
    
    document.getElementById('finding-title').value = activeGuideObj.title;
    document.getElementById('finding-desc').value = activeGuideObj.purpose;
    document.getElementById('finding-severity').value = activeGuideObj.priority || 'Info';
    document.getElementById('finding-step-reproduce').value = activeGuideObj.steps;
    document.getElementById('finding-cwe').value = activeGuideObj.cwe || '';
    
    document.getElementById('finding-reference').value = `${currentGuideCategory} Testing Guide Reference: ${activeGuideObj.testId}`;
}

// --- Category CRUD Functions ---
function openAddCategoryModal() {
    document.getElementById('guide-category-form').reset();
    document.getElementById('guide-category-old-name').value = '';
    document.getElementById('guide-category-modal-title').innerText = 'Add Category';
    document.getElementById('guide-category-modal').classList.add('active');
}

function openEditCategoryModal() {
    if (!currentGuideCategory) return;
    document.getElementById('guide-category-name').value = currentGuideCategory;
    document.getElementById('guide-category-old-name').value = currentGuideCategory;
    document.getElementById('guide-category-modal-title').innerText = 'Edit Category Name';
    document.getElementById('guide-category-modal').classList.add('active');
}

function closeCategoryModal() {
    document.getElementById('guide-category-modal').classList.remove('active');
}

async function saveGuideCategory(e) {
    e.preventDefault();
    const oldName = document.getElementById('guide-category-old-name').value;
    const nameInput = document.getElementById('guide-category-name').value;
    const newName = nameInput.trim ? nameInput.trim() : nameInput;
    
    if (!newName) return;
    
    if (oldName) {
        if (oldName !== newName) {
            testingGuideData[newName] = testingGuideData[oldName];
            delete testingGuideData[oldName];
        }
    } else {
        if (testingGuideData[newName]) {
            alert('Kategori ini sudah ada!');
            return;
        }
        testingGuideData[newName] = {
            metadata: {},
            headers: ['Test ID', 'Area / Platform', 'Test Case', 'Priority', 'Purpose', 'Steps', 'Expected Result', 'Tools', 'CWE'],
            rows: []
        };
    }
    
    await saveTestingGuidesDataBackend();
    closeCategoryModal();
    renderCategoryList(newName);
}

async function deleteActiveCategory() {
    if (!currentGuideCategory) return;
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${currentGuideCategory}" beserta seluruh isinya?`)) {
        delete testingGuideData[currentGuideCategory];
        await saveTestingGuidesDataBackend();
        renderCategoryList();
    }
}

async function saveTestingGuidesDataBackend() {
    try {
        await fetch('/api/testing-guides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testingGuideData)
        });
        cacheStore.testingGuides = null;
    } catch (e) {
        console.error("Failed to save testing guides:", e);
        alert('Gagal menyimpan perubahan ke server.');
    }
}

// --- Checklist Item CRUD Functions ---
function openAddChecklistItemModal() {
    document.getElementById('guide-item-form').reset();
    document.getElementById('guide-item-index').value = '';
    document.getElementById('guide-item-modal-title').innerText = 'Add Checklist Item';
    document.getElementById('guide-item-modal').classList.add('active');
    
    const data = testingGuideData[currentGuideCategory];
    if (data && data.rows.length > 0) {
        const firstRow = data.rows[0];
        const headers = data.headers;
        const idIdx = headers.findIndex(h => ['test id', 'no.', 'no'].some(n => h.toLowerCase().includes(n)));
        if (idIdx !== -1 && firstRow[idIdx]) {
            const firstId = firstRow[idIdx].toString();
            const prefixMatch = firstId.match(/^([A-Za-z]+[-_]*)/);
            if (prefixMatch) {
                document.getElementById('guide-item-id').value = prefixMatch[1] + (data.rows.length + 1).toString().padStart(2, '0');
            }
        }
    }
}

function openEditChecklistItemModal(rowIndex) {
    const data = testingGuideData[currentGuideCategory];
    if (!data || !data.rows[rowIndex]) return;
    
    const row = data.rows[rowIndex];
    const headers = data.headers;
    const getIndex = (names) => {
        return headers.findIndex(h => names.some(n => h.toLowerCase().includes(n.toLowerCase())));
    };
    
    const idIdx = getIndex(['test id', 'no.', 'no']);
    const areaIdx = getIndex(['area', 'platform', 'sub-category']);
    const caseIdx = getIndex(['test case', 'vulnerability name', 'name']);
    const priorityIdx = getIndex(['priority']);
    const purposeIdx = getIndex(['purpose', 'description']);
    const stepsIdx = getIndex(['steps', 'testing guide']);
    const expectedIdx = getIndex(['expected result', 'remediation', 'result']);
    const toolsIdx = getIndex(['tools']);
    const cweIdx = getIndex(['cwe']);
    
    document.getElementById('guide-item-index').value = rowIndex;
    document.getElementById('guide-item-id').value = idIdx !== -1 ? row[idIdx] : '';
    document.getElementById('guide-item-area').value = areaIdx !== -1 ? row[areaIdx] : '';
    document.getElementById('guide-item-case').value = caseIdx !== -1 ? row[caseIdx] : '';
    document.getElementById('guide-item-priority').value = priorityIdx !== -1 ? row[priorityIdx] : 'Medium';
    document.getElementById('guide-item-purpose').value = purposeIdx !== -1 ? row[purposeIdx] : '';
    document.getElementById('guide-item-steps').value = stepsIdx !== -1 ? row[stepsIdx] : '';
    document.getElementById('guide-item-expected').value = expectedIdx !== -1 ? row[expectedIdx] : '';
    document.getElementById('guide-item-tools').value = toolsIdx !== -1 ? row[toolsIdx] : '';
    document.getElementById('guide-item-cwe').value = cweIdx !== -1 ? row[cweIdx] : '';
    
    document.getElementById('guide-item-modal-title').innerText = 'Edit Checklist Item';
    document.getElementById('guide-item-modal').classList.add('active');
}

function closeGuideItemModal() {
    document.getElementById('guide-item-modal').classList.remove('active');
}

async function saveGuideItem(e) {
    e.preventDefault();
    const indexStr = document.getElementById('guide-item-index').value;
    const testId = document.getElementById('guide-item-id').value;
    const area = document.getElementById('guide-item-area').value;
    const testCase = document.getElementById('guide-item-case').value;
    const priority = document.getElementById('guide-item-priority').value;
    const purpose = document.getElementById('guide-item-purpose').value;
    const steps = document.getElementById('guide-item-steps').value;
    const expected = document.getElementById('guide-item-expected').value;
    const tools = document.getElementById('guide-item-tools').value;
    const cwe = document.getElementById('guide-item-cwe').value;
    
    const data = testingGuideData[currentGuideCategory];
    if (!data) return;
    
    const headers = data.headers;
    const getIndex = (names) => {
        return headers.findIndex(h => names.some(n => h.toLowerCase().includes(n.toLowerCase())));
    };
    
    const idIdx = getIndex(['test id', 'no.', 'no']);
    const areaIdx = getIndex(['area', 'platform', 'sub-category']);
    const caseIdx = getIndex(['test case', 'vulnerability name', 'name']);
    const priorityIdx = getIndex(['priority']);
    const purposeIdx = getIndex(['purpose', 'description']);
    const stepsIdx = getIndex(['steps', 'testing guide']);
    const expectedIdx = getIndex(['expected result', 'remediation', 'result']);
    const toolsIdx = getIndex(['tools']);
    const cweIdx = getIndex(['cwe']);
    
    const rowLength = headers.length;
    let newRow = new Array(rowLength).fill('');
    
    const setCol = (idx, val) => {
        if (idx !== -1 && idx < rowLength) newRow[idx] = val;
    };
    
    setCol(idIdx, testId);
    setCol(areaIdx, area);
    setCol(caseIdx, testCase);
    setCol(priorityIdx, priority);
    setCol(purposeIdx, purpose);
    setCol(stepsIdx, steps);
    setCol(expectedIdx, expected);
    setCol(toolsIdx, tools);
    setCol(cweIdx, cwe);
    
    if (indexStr !== '') {
        const rowIndex = parseInt(indexStr);
        data.rows[rowIndex] = newRow;
    } else {
        data.rows.push(newRow);
    }
    
    await saveTestingGuidesDataBackend();
    closeGuideItemModal();
    renderCategoryList(currentGuideCategory);
}

async function deleteChecklistItem(rowIndex) {
    const data = testingGuideData[currentGuideCategory];
    if (!data || !data.rows[rowIndex]) return;
    
    const caseName = data.rows[rowIndex][2] || 'item';
    if (confirm(`Apakah Anda yakin ingin menghapus checklist item "${caseName}"?`)) {
        data.rows.splice(rowIndex, 1);
        await saveTestingGuidesDataBackend();
        renderCategoryList(currentGuideCategory);
    }
}

// --- Admin visibility control ---
function checkAdminUI() {
    const isAdmin = currentUser && currentUser.role === 'Admin';
    document.querySelectorAll('.admin-only-ui').forEach(el => {
        el.style.display = isAdmin ? '' : 'none';
    });
}

// --- Testing Guide Excel Import functions ---
function triggerGuideImport() {
    document.getElementById('guide-excel-file').click();
}

async function handleGuideExcelUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('category', currentGuideCategory);
    formData.append('file', file);
    
    try {
        cacheStore.testingGuides = null;
        const response = await fetch('/api/testing-guides/import', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.success) {
            alert(`Sukses mengimport ${result.count} checklist items!`);
            // Reload guides
            await loadTestingGuide();
        } else {
            alert(`Gagal mengimport: ${result.error}`);
        }
    } catch (e) {
        console.error(e);
        alert(`Error: ${e.message}`);
    }
    event.target.value = '';
}

// --- Framework Reference Functions ---
let frameworksData = {};
let currentFrameworkCategory = '';

async function loadFrameworks() {
    document.getElementById('framework-view').style.display = 'block';
    if (cacheStore.frameworks) {
        frameworksData = cacheStore.frameworks;
    } else {
        try {
            const response = await fetch('/api/frameworks');
            frameworksData = await response.json();
            cacheStore.frameworks = frameworksData;
        } catch (e) {
            console.error("Failed to load frameworks data:", e);
        }
    }
    renderFrameworkCategories();
    checkAdminUI();
}

function renderFrameworkCategories(selectCat = null) {
    const categoryList = document.getElementById('framework-category-list');
    if (!categoryList) return;
    
    categoryList.innerHTML = '';
    const categories = Object.keys(frameworksData);
    
    categories.forEach((cat, index) => {
        const li = document.createElement('li');
        li.style.marginBottom = '4px';
        const isCurrent = selectCat ? (selectCat === cat) : (index === 0);
        const isActive = isCurrent ? 'active' : '';
        const bgStyle = isCurrent ? 'background-color: rgba(15, 98, 254, 0.08); color: var(--accent-blue);' : '';
        
        li.innerHTML = `
            <button class="nav-item ${isActive}" 
                    onclick="selectFrameworkCategory('${cat.replace(/'/g, "\\'")}', this)" 
                    style="width: 100%; text-align: left; background: none; border: none; padding: 0.6rem 0.75rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s; ${bgStyle}">
                <span style="display: flex; align-items: center; gap: 0.5rem;">${cat}</span>
                <span style="font-size: 0.75rem; background: rgba(0,0,0,0.06); padding: 0.15rem 0.45rem; border-radius: 10px; color: var(--text-secondary); font-weight: 700;">${frameworksData[cat].rows.length}</span>
            </button>
        `;
        categoryList.appendChild(li);
    });
    
    if (categories.length > 0) {
        if (selectCat && categories.includes(selectCat)) {
            selectFrameworkCategory(selectCat);
        } else {
            selectFrameworkCategory(categories[0]);
        }
    }
}

function selectFrameworkCategory(category, buttonEl) {
    currentFrameworkCategory = category;
    
    const buttons = document.querySelectorAll('#framework-category-list button');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.backgroundColor = 'transparent';
        btn.style.color = 'var(--text-primary)';
    });
    
    if (buttonEl) {
        buttonEl.classList.add('active');
        buttonEl.style.backgroundColor = 'rgba(15, 98, 254, 0.08)';
        buttonEl.style.color = 'var(--accent-blue)';
    } else {
        const buttonsList = document.querySelectorAll('#framework-category-list button');
        buttonsList.forEach(btn => {
            const btnText = btn.querySelector('span') ? btn.querySelector('span').innerText : '';
            if (btnText === category) {
                btn.classList.add('active');
                btn.style.backgroundColor = 'rgba(15, 98, 254, 0.08)';
                btn.style.color = 'var(--accent-blue)';
            }
        });
    }
    
    document.getElementById('framework-active-title').innerText = category;
    
    const data = frameworksData[category];
    document.getElementById('framework-active-desc').innerText = data ? data.description : '';
    
    const downloadBtn = document.getElementById('btn-download-framework-template');
    if (downloadBtn) {
        downloadBtn.href = `/api/frameworks/template?category=${encodeURIComponent(category)}`;
    }
    
    renderFrameworkTable();
}

function renderFrameworkTable(filteredRows = null) {
    const data = frameworksData[currentFrameworkCategory];
    if (!data) return;
    
    const isAdmin = currentUser && currentUser.role === 'Admin';
    const headerRow = document.getElementById('framework-table-headers');
    headerRow.innerHTML = '';
    
    data.headers.forEach(header => {
        const th = document.createElement('th');
        th.innerText = header;
        if (header.toLowerCase() === 'id' || header.toLowerCase() === 'phase') {
            th.style.width = '100px';
        } else if (header.toLowerCase() === 'name' || header.toLowerCase() === 'phase name' || header.toLowerCase() === 'channel name' || header.toLowerCase() === 'ketentuan / pasal') {
            th.style.width = '240px';
        }
        headerRow.appendChild(th);
    });
    
    if (isAdmin) {
        const th = document.createElement('th');
        th.innerText = "Actions";
        th.style.width = "120px";
        th.style.textAlign = "center";
        headerRow.appendChild(th);
    }
    
    const tbody = document.getElementById('framework-table-body');
    tbody.innerHTML = '';
    
    const rowsToRender = filteredRows || data.rows;
    
    if (rowsToRender.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        const colspanCount = isAdmin ? data.headers.length + 1 : data.headers.length;
        td.colSpan = colspanCount;
        td.className = 'text-center';
        td.style.padding = '2rem';
        td.style.color = 'var(--text-secondary)';
        td.innerText = 'No reference items match your search.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }
    
    rowsToRender.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        row.forEach((cell, cellIdx) => {
            const td = document.createElement('td');
            td.innerText = cell || '-';
            
            const headerName = data.headers[cellIdx].toLowerCase();
            if (headerName === 'id' || headerName === 'phase') {
                td.style.fontWeight = 'bold';
                td.style.color = 'var(--accent-blue)';
            }
            tr.appendChild(td);
        });
        
        if (isAdmin) {
            const td = document.createElement('td');
            td.style.textAlign = 'center';
            td.style.display = 'flex';
            td.style.gap = '0.4rem';
            td.style.justifyContent = 'center';
            td.style.alignItems = 'center';
            td.innerHTML = `
                <button class="btn btn-action-edit" onclick="openEditFrameworkItemModal(${rowIndex})" title="Edit Item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="btn btn-action-delete" onclick="deleteFrameworkItem(${rowIndex})" title="Hapus Item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            `;
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });
}

function filterFrameworks() {
    const query = document.getElementById('framework-search-input').value.toLowerCase().trim();
    const data = frameworksData[currentFrameworkCategory];
    if (!data) return;
    
    if (!query) {
        renderFrameworkTable();
        return;
    }
    
    const filtered = data.rows.filter(row => {
        return row.some(cell => String(cell).toLowerCase().includes(query));
    });
    
    renderFrameworkTable(filtered);
}

// --- Framework Category CRUD Functions ---
function openAddFrameworkCategoryModal() {
    document.getElementById('framework-category-form').reset();
    document.getElementById('framework-category-old-name').value = '';
    document.getElementById('framework-category-modal-title').innerText = 'Add Framework';
    document.getElementById('framework-category-modal').classList.add('active');
}

function openEditFrameworkCategoryModal() {
    if (!currentFrameworkCategory) return;
    const data = frameworksData[currentFrameworkCategory];
    document.getElementById('framework-category-name').value = currentFrameworkCategory;
    document.getElementById('framework-category-desc').value = data ? data.description : '';
    document.getElementById('framework-category-old-name').value = currentFrameworkCategory;
    document.getElementById('framework-category-modal-title').innerText = 'Edit Framework Name';
    document.getElementById('framework-category-modal').classList.add('active');
}

function closeFrameworkCategoryModal() {
    document.getElementById('framework-category-modal').classList.remove('active');
}

async function saveFrameworkCategory(e) {
    e.preventDefault();
    const oldName = document.getElementById('framework-category-old-name').value;
    const nameInput = document.getElementById('framework-category-name').value;
    const description = document.getElementById('framework-category-desc').value;
    const newName = nameInput.trim ? nameInput.trim() : nameInput;
    
    if (!newName) return;
    
    if (oldName) {
        if (oldName !== newName) {
            frameworksData[newName] = frameworksData[oldName];
            delete frameworksData[oldName];
        }
        frameworksData[newName].description = description;
    } else {
        if (frameworksData[newName]) {
            alert('Framework ini sudah ada!');
            return;
        }
        frameworksData[newName] = {
            description: description,
            headers: ['ID', 'Name', 'Description', 'Reference'],
            rows: []
        };
    }
    
    await saveFrameworksDataBackend();
    closeFrameworkCategoryModal();
    renderFrameworkCategories(newName);
}

async function deleteActiveFrameworkCategory() {
    if (!currentFrameworkCategory) return;
    if (confirm(`Apakah Anda yakin ingin menghapus framework "${currentFrameworkCategory}" beserta seluruh isinya?`)) {
        delete frameworksData[currentFrameworkCategory];
        await saveFrameworksDataBackend();
        renderFrameworkCategories();
    }
}

async function saveFrameworksDataBackend() {
    try {
        const response = await fetch('/api/frameworks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(frameworksData)
        });
        const result = await response.json();
        if (!result.success) {
            alert(`Gagal menyimpan: ${result.error}`);
        }
        cacheStore.frameworks = null;
    } catch (e) {
        console.error("Failed to save frameworks:", e);
    }
}

// --- Framework Item CRUD Functions ---
function openAddFrameworkItemModal() {
    const data = frameworksData[currentFrameworkCategory];
    if (!data) return;
    
    document.getElementById('framework-item-index').value = '';
    document.getElementById('framework-item-modal-title').innerText = 'Add Framework Item';
    
    buildDynamicFrameworkFields(data.headers);
    document.getElementById('framework-item-modal').classList.add('active');
}

function openEditFrameworkItemModal(rowIndex) {
    const data = frameworksData[currentFrameworkCategory];
    if (!data || !data.rows[rowIndex]) return;
    
    document.getElementById('framework-item-index').value = rowIndex;
    document.getElementById('framework-item-modal-title').innerText = 'Edit Framework Item';
    
    buildDynamicFrameworkFields(data.headers, data.rows[rowIndex]);
    document.getElementById('framework-item-modal').classList.add('active');
}

function buildDynamicFrameworkFields(headers, values = []) {
    const container = document.getElementById('framework-item-fields-container');
    container.innerHTML = '';
    
    headers.forEach((header, idx) => {
        const value = values[idx] || '';
        const group = document.createElement('div');
        group.className = 'form-group';
        
        const isLongText = header.toLowerCase().includes('desc') || header.toLowerCase().includes('steps') || header.toLowerCase().includes('remediation') || header.toLowerCase().includes('objective') || header.toLowerCase().includes('tasks');
        
        let inputHtml = '';
        if (isLongText) {
            inputHtml = `<textarea id="fw-field-${idx}" class="form-control" rows="3" required placeholder="Enter ${header}...">${value}</textarea>`;
        } else {
            inputHtml = `<input type="text" id="fw-field-${idx}" class="form-control" required placeholder="Enter ${header}..." value="${value}">`;
        }
        
        group.innerHTML = `
            <label for="fw-field-${idx}">${header}</label>
            ${inputHtml}
        `;
        container.appendChild(group);
    });
}

function closeFrameworkItemModal() {
    document.getElementById('framework-item-modal').classList.remove('active');
}

async function saveFrameworkItem(e) {
    e.preventDefault();
    const indexStr = document.getElementById('framework-item-index').value;
    const data = frameworksData[currentFrameworkCategory];
    if (!data) return;
    
    const rowValues = [];
    data.headers.forEach((header, idx) => {
        const val = document.getElementById(`fw-field-${idx}`).value;
        rowValues.push(val);
    });
    
    if (indexStr !== '') {
        const rowIndex = parseInt(indexStr);
        data.rows[rowIndex] = rowValues;
    } else {
        data.rows.push(rowValues);
    }
    
    await saveFrameworksDataBackend();
    closeFrameworkItemModal();
    renderFrameworkTable();
}

async function deleteFrameworkItem(rowIndex) {
    const data = frameworksData[currentFrameworkCategory];
    if (!data || !data.rows[rowIndex]) return;
    
    if (confirm(`Apakah Anda yakin ingin menghapus item ini?`)) {
        data.rows.splice(rowIndex, 1);
        await saveFrameworksDataBackend();
        renderFrameworkTable();
    }
}

// --- Framework Excel Import functions ---
function triggerFrameworkImport() {
    document.getElementById('framework-excel-file').click();
}

async function handleFrameworkExcelUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('category', currentFrameworkCategory);
    formData.append('file', file);
    
    try {
        cacheStore.frameworks = null;
        const response = await fetch('/api/frameworks/import', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.success) {
            alert(`Sukses mengimport ${result.count} framework items!`);
            await loadFrameworks();
        } else {
            alert(`Gagal mengimport: ${result.error}`);
        }
    } catch (e) {
        console.error(e);
        alert(`Error: ${e.message}`);
    }
    event.target.value = '';
}

// --- Reference Library Functions ---
let referencesData = {};
let currentReferenceCategory = '';

async function loadReferences() {
    document.getElementById('reference-view').style.display = 'block';
    if (cacheStore.references) {
        referencesData = cacheStore.references;
    } else {
        try {
            const response = await fetch('/api/references');
            referencesData = await response.json();
            cacheStore.references = referencesData;
        } catch (e) {
            console.error("Failed to load references data:", e);
        }
    }
    renderReferenceCategories();
}

function renderReferenceCategories(selectCat = null) {
    const categoryList = document.getElementById('reference-category-list');
    if (!categoryList) return;
    
    categoryList.innerHTML = '';
    const categories = Object.keys(referencesData.categories || {});
    
    categories.forEach((cat, index) => {
        const li = document.createElement('li');
        li.style.marginBottom = '4px';
        const isCurrent = selectCat ? (selectCat === cat) : (index === 0);
        const isActive = isCurrent ? 'active' : '';
        const bgStyle = isCurrent ? 'background-color: rgba(15, 98, 254, 0.08); color: var(--accent-blue);' : '';
        
        const itemCount = (referencesData.categories[cat].items || []).length;
        
        li.innerHTML = `
            <button class="nav-item ${isActive}" 
                    onclick="selectReferenceCategory('${cat.replace(/'/g, "\\'")}', this)" 
                    style="width: 100%; text-align: left; background: none; border: none; padding: 0.6rem 0.75rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s; ${bgStyle}">
                <span style="display: flex; align-items: center; gap: 0.5rem;">${cat}</span>
                <span style="font-size: 0.75rem; background: rgba(0,0,0,0.06); padding: 0.15rem 0.45rem; border-radius: 10px; color: var(--text-secondary); font-weight: 700;">${itemCount}</span>
            </button>
        `;
        categoryList.appendChild(li);
    });
    
    if (categories.length > 0) {
        if (selectCat && categories.includes(selectCat)) {
            selectReferenceCategory(selectCat);
        } else {
            selectReferenceCategory(categories[0]);
        }
    } else {
        document.getElementById('reference-active-title').innerText = 'No Categories';
        document.getElementById('reference-active-desc').innerText = '';
        document.getElementById('reference-table-body').innerHTML = `
            <tr>
                <td colspan="5" class="text-center" style="padding: 2rem; color: var(--text-secondary);">No categories available. Click "+ Add" to create one.</td>
            </tr>
        `;
    }
}

function selectReferenceCategory(category, buttonEl = null) {
    currentReferenceCategory = category;
    
    const buttons = document.querySelectorAll('#reference-category-list button');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.backgroundColor = 'transparent';
        btn.style.color = 'var(--text-primary)';
    });
    
    if (buttonEl) {
        buttonEl.classList.add('active');
        buttonEl.style.backgroundColor = 'rgba(15, 98, 254, 0.08)';
        buttonEl.style.color = 'var(--accent-blue)';
    } else {
        const buttonsList = document.querySelectorAll('#reference-category-list button');
        buttonsList.forEach(btn => {
            const btnText = btn.querySelector('span') ? btn.querySelector('span').innerText : '';
            if (btnText === category) {
                btn.classList.add('active');
                btn.style.backgroundColor = 'rgba(15, 98, 254, 0.08)';
                btn.style.color = 'var(--accent-blue)';
            }
        });
    }
    
    document.getElementById('reference-active-title').innerText = category;
    
    const catData = referencesData.categories[category];
    document.getElementById('reference-active-desc').innerText = catData ? (catData.description || 'No description') : '';
    
    renderReferenceTable();
}

function renderReferenceTable(filteredItems = null) {
    const catData = referencesData.categories[currentReferenceCategory];
    if (!catData) return;
    
    const tbody = document.getElementById('reference-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const itemsToRender = filteredItems || catData.items || [];
    
    if (itemsToRender.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center" style="padding: 2rem; color: var(--text-secondary);">No references in this category.</td>
            </tr>
        `;
        return;
    }
    
    itemsToRender.forEach((item, index) => {
        const originalIndex = catData.items.indexOf(item);
        
        const tr = document.createElement('tr');
        
        let urlCell = '-';
        if (item.url) {
            urlCell = `<a href="${item.url}" target="_blank" style="color: var(--accent-blue); text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 0.25rem;">
                Link
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>`;
        }
        
        let notesDisplay = item.notes || '-';
        if (item.notes && item.notes.length > 100) {
            const truncated = item.notes.substring(0, 100) + '...';
            const escapedTitle = (item.title || 'Note Details').replace(/'/g, "\\'").replace(/"/g, '\\"');
            const escapedNotes = item.notes.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
            notesDisplay = `${truncated} <button type="button" onclick="showFullNote('${escapedTitle}', \`${escapedNotes}\`)" style="background: none; border: none; color: var(--accent-blue); cursor: pointer; padding: 0 0.25rem; display: inline-flex; align-items: center; justify-content: center; vertical-align: middle;" title="View Full Note"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>`;
        }
        
        tr.innerHTML = `
            <td style="text-align: center; font-weight: 500; color: var(--text-secondary);">${index + 1}</td>
            <td style="font-weight: 600; color: var(--text-primary);">${item.title || '-'}</td>
            <td style="white-space: pre-line; color: var(--text-secondary);">${notesDisplay}</td>
            <td>${item.consultant || '-'}</td>
            <td>${urlCell}</td>
            <td style="text-align: center;">
                <div style="display: flex; gap: 0.4rem; justify-content: center; align-items: center;">
                    <button type="button" class="btn btn-secondary" onclick="openEditReferenceItemModal(${originalIndex})" style="padding: 0.2rem 0.4rem; font-size: 0.75rem; border: none; background: none; color: var(--text-secondary); cursor: pointer;" title="Edit">✏️</button>
                    <button type="button" class="btn btn-secondary" onclick="deleteReferenceItem(${originalIndex})" style="padding: 0.2rem 0.4rem; font-size: 0.75rem; border: none; background: none; color: var(--severity-critical); cursor: pointer;" title="Delete">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterReferences() {
    const query = document.getElementById('reference-search-input').value.toLowerCase();
    const catData = referencesData.categories[currentReferenceCategory];
    if (!catData) return;
    
    if (!query) {
        renderReferenceTable();
        return;
    }
    
    const filtered = (catData.items || []).filter(item => {
        const titleMatch = (item.title || '').toLowerCase().includes(query);
        const notesMatch = (item.notes || '').toLowerCase().includes(query);
        const consultantMatch = (item.consultant || '').toLowerCase().includes(query);
        return titleMatch || notesMatch || consultantMatch;
    });
    
    renderReferenceTable(filtered);
}

async function saveReferencesDataBackend() {
    try {
        const response = await fetch('/api/references', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(referencesData)
        });
        const result = await response.json();
        if (!result.success) {
            alert("Error saving references: " + (result.error || "Unknown error"));
        }
        cacheStore.references = null;
    } catch (e) {
        console.error(e);
        alert("Failed to save references to server: " + e.message);
    }
}

// Category Modals
function openAddReferenceCategoryModal() {
    document.getElementById('reference-category-modal').classList.add('active');
    document.getElementById('reference-category-modal-title').innerText = 'Add Reference Category';
    document.getElementById('ref-category-old-name').value = '';
    document.getElementById('ref-category-name').value = '';
    document.getElementById('ref-category-desc').value = '';
}

function openEditReferenceCategoryModal() {
    if (!currentReferenceCategory) return;
    const catData = referencesData.categories[currentReferenceCategory];
    document.getElementById('reference-category-modal').classList.add('active');
    document.getElementById('reference-category-modal-title').innerText = 'Edit Reference Category';
    document.getElementById('ref-category-old-name').value = currentReferenceCategory;
    document.getElementById('ref-category-name').value = currentReferenceCategory;
    document.getElementById('ref-category-desc').value = catData ? (catData.description || '') : '';
}

function closeReferenceCategoryModal() {
    document.getElementById('reference-category-modal').classList.remove('active');
}

async function saveReferenceCategory(event) {
    event.preventDefault();
    const oldName = document.getElementById('ref-category-old-name').value;
    const newName = document.getElementById('ref-category-name').value.trim();
    const desc = document.getElementById('ref-category-desc').value.trim();
    
    if (!newName) return;
    
    if (!referencesData.categories) {
        referencesData.categories = {};
    }
    
    if (oldName) {
        if (oldName !== newName) {
            referencesData.categories[newName] = referencesData.categories[oldName];
            delete referencesData.categories[oldName];
        }
        referencesData.categories[newName].description = desc;
    } else {
        if (referencesData.categories[newName]) {
            alert('Kategori dengan nama tersebut sudah ada.');
            return;
        }
        referencesData.categories[newName] = {
            description: desc,
            items: []
        };
    }
    
    await saveReferencesDataBackend();
    closeReferenceCategoryModal();
    renderReferenceCategories(newName);
}

async function deleteActiveReferenceCategory() {
    if (!currentReferenceCategory) return;
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${currentReferenceCategory}" beserta semua isinya?`)) {
        delete referencesData.categories[currentReferenceCategory];
        await saveReferencesDataBackend();
        renderReferenceCategories();
    }
}

// Item Modals
function openAddReferenceItemModal() {
    document.getElementById('reference-item-modal').classList.add('active');
    document.getElementById('reference-item-modal-title').innerText = 'Add Reference Item';
    document.getElementById('reference-item-index').value = '-1';
    document.getElementById('ref-item-title').value = '';
    document.getElementById('ref-item-notes').value = '';
    
    const defaultConsultant = currentUser ? (currentUser.username || '') : '';
    document.getElementById('ref-item-consultant').value = defaultConsultant;
    document.getElementById('ref-item-url').value = '';
}

function openEditReferenceItemModal(index) {
    const catData = referencesData.categories[currentReferenceCategory];
    if (!catData || !catData.items[index]) return;
    
    const item = catData.items[index];
    document.getElementById('reference-item-modal').classList.add('active');
    document.getElementById('reference-item-modal-title').innerText = 'Edit Reference Item';
    document.getElementById('reference-item-index').value = index.toString();
    document.getElementById('ref-item-title').value = item.title || '';
    document.getElementById('ref-item-notes').value = item.notes || '';
    document.getElementById('ref-item-consultant').value = item.consultant || '';
    document.getElementById('ref-item-url').value = item.url || '';
}

function closeReferenceItemModal() {
    document.getElementById('reference-item-modal').classList.remove('active');
}

async function saveReferenceItem(event) {
    event.preventDefault();
    const index = parseInt(document.getElementById('reference-item-index').value, 10);
    const title = document.getElementById('ref-item-title').value.trim();
    const notes = document.getElementById('ref-item-notes').value.trim();
    const consultant = document.getElementById('ref-item-consultant').value.trim();
    const url = document.getElementById('ref-item-url').value.trim();
    
    if (!title) return;
    
    const catData = referencesData.categories[currentReferenceCategory];
    if (!catData) return;
    
    const itemData = { title, notes, consultant, url };
    
    if (index === -1) {
        if (!catData.items) catData.items = [];
        catData.items.push(itemData);
    } else {
        catData.items[index] = itemData;
    }
    
    await saveReferencesDataBackend();
    closeReferenceItemModal();
    renderReferenceTable();
}

async function deleteReferenceItem(index) {
    const catData = referencesData.categories[currentReferenceCategory];
    if (!catData || !catData.items[index]) return;
    
    if (confirm(`Apakah Anda yakin ingin menghapus item referensi ini?`)) {
        catData.items.splice(index, 1);
        await saveReferencesDataBackend();
        renderReferenceTable();
    }
}

// Note View Modals
function showFullNote(title, content) {
    document.getElementById('reference-note-modal-title').innerText = title;
    
    let renderedHtml = content;
    if (typeof marked !== 'undefined') {
        renderedHtml = marked.parse(content);
    } else {
        renderedHtml = content.replace(/\n/g, '<br>');
    }
    
    document.getElementById('reference-note-modal-content').innerHTML = renderedHtml;
    document.getElementById('reference-note-modal').classList.add('active');
}

function closeReferenceNoteModal() {
    document.getElementById('reference-note-modal').classList.remove('active');
}

function renderMarkdownToHtml(txt, imgCounterObj = { val: 0 }) {
    if (!txt) return '-';
    let parsedHtml = '';
    if (typeof marked !== 'undefined') {
        const renderer = new marked.Renderer();
        renderer.code = function(code, infostring, escaped) {
            let codeText = typeof code === 'object' && code !== null ? (code.text || '') : (code || '');
            return `<pre style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-left: 4px solid #0f62fe; padding: 10px; font-family: Consolas, 'Courier New', monospace; font-size: 11px; color: #0f172a; margin: 10px 0; white-space: pre-wrap; word-wrap: break-word; border-radius: 4px;"><code style="font-family: Consolas, 'Courier New', monospace;">${codeText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
        };
        renderer.image = function(arg1, arg2, arg3) {
            let href = '', text = '';
            if (typeof arg1 === 'object' && arg1 !== null) {
                href = arg1.href || '';
                text = arg1.text || '';
            } else {
                href = arg1 || '';
                text = arg3 || '';
            }
            let align = 'center';
            let caption = '';
            if (text) {
                const parts = text.split('|');
                caption = parts[0].trim();
                if (parts.length > 1) {
                    const possibleAlign = parts[1].trim().toLowerCase();
                    if (['left', 'center', 'right'].includes(possibleAlign)) {
                        align = possibleAlign;
                    }
                }
            }
            imgCounterObj.val++;
            const captionText = caption && caption !== 'Screenshot' ? caption : 'Bukti Temuan';
            let alignStyle = 'display: block; margin: 0 auto;';
            if (align === 'left') alignStyle = 'display: block; margin: 0 auto 0 0;';
            else if (align === 'right') alignStyle = 'display: block; margin: 0 0 0 auto;';
            return `
                <div style="margin: 1.5rem 0; text-align: ${align}; width: 100%;">
                    <img src="${href}" alt="${captionText}" style="max-width: 100%; max-height: 400px; border: 1px solid var(--border-color); border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); ${alignStyle}">
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem; font-style: italic; font-weight: 500;">
                        Gambar ${imgCounterObj.val}: ${captionText}
                    </div>
                </div>
            `;
        };
        let preparedTxt = txt;
        if (txt.includes('\n') && !txt.includes('```') && (txt.includes('HTTP/') || txt.includes('GET ') || txt.includes('POST ') || txt.includes('curl ') || txt.includes('{') || txt.includes('GET /'))) {
            preparedTxt = '```http\n' + txt + '\n```';
        }
        parsedHtml = marked.parse(preparedTxt, { renderer: renderer });
        if (typeof DOMPurify !== 'undefined') {
            parsedHtml = DOMPurify.sanitize(parsedHtml);
        }
    } else {
        parsedHtml = txt.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    }
    return parsedHtml;
}

function getSevColorHex(severity) {
    const colors = {
        Critical: '#7c3aed',
        High: '#e11d48',
        Medium: '#d97706',
        Low: '#16a34a',
        Info: '#0284c7',
        Default: '#475569'
    };
    return colors[severity] || colors.Default;
}

function buildAffectedHTML(f, isCopy = false) {
    if (!f.affected_system) return '-';
    const systems = f.affected_system.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
    return systems.map(sys => {
        const isUrl = sys.startsWith('http://') || sys.startsWith('https://');
        if (isUrl) {
            return isCopy 
                ? `<div style="margin-bottom: 4px;"><a href="${sys}" target="_blank" style="color: #0f62fe; text-decoration: none;">🔗 ${sys}</a></div>`
                : `<div style="margin-bottom: 0.35rem;"><a href="${sys}" target="_blank" style="color: var(--accent-blue); word-break: break-all; font-weight: 500; text-decoration: none;">🔗 ${sys}</a></div>`;
        } else {
            return isCopy
                ? `<div style="margin-bottom: 4px; font-family: Consolas, monospace; font-size: 11px; background-color: #f1f5f9; display: inline-block; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1; margin-right: 5px;">🖥️ ${sys}</div>`
                : `<div style="margin-bottom: 0.35rem; color: var(--text-primary); font-family: monospace; font-size: 0.85rem; background: #f1f5f9; display: inline-block; padding: 0.2rem 0.6rem; border-radius: 4px; border: 1px solid var(--border-color); margin-right: 5px;">🖥️ ${sys}</div>`;
        }
    }).join('');
}

function getFindingTableRows(f, sevClass, isCopy = false) {
    const affectedHTML = buildAffectedHTML(f, isCopy);
    const renderM = isCopy ? ((val) => renderMarkdownToHtml(val)) : ((val) => renderMarkdownToHtml(val)); // Use renderMarkdownToHtml for both to be safe
    const sevColor = getSevColorHex(f.severity);

    const standardRows = [
        { id: 'title', label: 'Title', content: `<strong>${f.title}</strong>` },
        { id: 'severity', label: 'Severity', content: isCopy ? `<span style="padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background-color: ${sevColor}; color: #ffffff; border: 1px solid ${sevColor};">${f.severity}</span>` : `<span class="badge ${getSeverityBadgeClass(f.severity)}">${f.severity}</span>` },
        { id: 'cvss', label: `CVSS ${f.cvss_version || 'v3.1'}`, content: `<strong>Score: ${(f.cvss_score || 0).toFixed(1)}</strong> — <code>${f.cvss_vector || '-'}</code>` },
        { id: 'finding_status', label: 'Finding Status', content: isCopy ? `<span style="padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background-color: ${f.finding_status === 'Open' ? '#ffe4e6' : '#dcfce7'}; color: ${f.finding_status === 'Open' ? '#e11d48' : '#15803d'}; border: 1px solid ${f.finding_status === 'Open' ? 'rgba(225, 29, 72, 0.2)' : 'rgba(22, 163, 74, 0.2)'};">${f.finding_status || 'Open'}</span>` : `<span class="badge badge-status ${f.finding_status === 'Open' ? 'badge-high' : 'badge-low'}">${f.finding_status || 'Open'}</span>` },
        { id: 'status', label: 'Retest Status', content: isCopy ? `<span style="padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background-color: ${f.status === 'Open' ? '#ffe4e6' : '#dcfce7'}; color: ${f.status === 'Open' ? '#e11d48' : '#15803d'}; border: 1px solid ${f.status === 'Open' ? 'rgba(225, 29, 72, 0.2)' : 'rgba(22, 163, 74, 0.2)'};">${f.status || 'Open'}</span>` : `<span class="badge badge-status ${f.status === 'Open' ? 'badge-high' : 'badge-low'}">${f.status || 'Open'}</span>` },
        { id: 'affected', label: 'Affected System', content: affectedHTML },
        { id: 'description', label: 'Description', content: renderM(f.description) },
        { id: 'poc', label: 'Proof of Vulnerability', content: renderM(f.poc) },
        { id: 'exploitation', label: 'Exploitation', content: renderM(f.exploitation) },
        { id: 'impact', label: 'Impact', content: renderM(f.impact) },
        { id: 'payload', label: 'Script/Payload', content: renderM(f.script_payload) },
        { id: 'solution', label: 'Solution', content: renderM(f.solution) },
        { id: 'reference', label: 'References', content: renderM(f.reference) },
        { id: 'reproduce', label: 'Step of Reproduce', content: renderM(f.step_reproduce) },
        { id: 'cwe', label: 'CWE Mapping', content: f.cwe || '-' },
        { id: 'mitre', label: 'MITRE ATT&CK', content: f.mitre_attack || '-' },
        { id: 'iso', label: 'ISO 27001 Control', content: f.iso_27001 || '-' },
        { id: 'nist', label: 'NIST Control', content: f.nist_control || '-' },
        { id: 'ptes', label: 'PTES Phase', content: f.ptes_phase || '-' },
        { id: 'retest', label: 'Retest Evidence', content: renderM(f.retest_evidence) }
    ];

    let customFields = [];
    if (f.custom_fields) {
        try {
            customFields = JSON.parse(f.custom_fields);
            if (!Array.isArray(customFields)) customFields = [];
        } catch (e) {
            console.error("Error parsing custom fields", e);
        }
    }

    const finalRows = [];
    standardRows.forEach(row => {
        finalRows.push(row);
        const matched = customFields.filter(cf => cf.position === row.id);
        matched.forEach(cf => {
            finalRows.push({
                id: `custom_${cf.label.toLowerCase().replace(/\s+/g, '_')}`,
                label: cf.label,
                content: renderM(cf.value)
            });
        });
    });

    const bottomMatched = customFields.filter(cf => !cf.position || cf.position === 'bottom');
    bottomMatched.forEach(cf => {
        finalRows.push({
            id: `custom_${cf.label.toLowerCase().replace(/\s+/g, '_')}`,
            label: cf.label,
            content: renderM(cf.value)
        });
    });

    return finalRows;
}

async function copyFindingToClipboard(btn, findingId) {
    const finding = currentProjectFindings.find(f => f.id === findingId);
    if (!finding) return;

    const sevColor = getSevColorHex(finding.severity);
    const rows = getFindingTableRows(finding, '', true);

    let tableHtml = `
        <table style="width: 100%; table-layout: fixed; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; margin: 15px 0; border: 1px solid #cbd5e1;">
            <colgroup>
                <col style="width: 20%;">
                <col style="width: 80%;">
            </colgroup>
            <tbody>
    `;

    rows.forEach(row => {
        tableHtml += `
            <tr>
                <td width="20%" style="width: 20%; font-weight: bold; background-color: ${sevColor}; color: #ffffff !important; padding: 10px; border: 1px solid #cbd5e1; vertical-align: top;">
                    ${row.label}
                </td>
                <td width="80%" style="width: 80%; background-color: #ffffff; color: #0f172a; padding: 10px; border: 1px solid #cbd5e1; vertical-align: top; line-height: 1.6;">
                    ${row.content}
                </td>
            </tr>
        `;
    });

    tableHtml += `
            </tbody>
        </table>
    `;

    try {
        const blobHtml = new Blob([tableHtml], { type: 'text/html' });
        const plainText = `${finding.title}\nSeverity: ${finding.severity}\nScore: ${finding.cvss_score}`;
        const blobText = new Blob([plainText], { type: 'text/plain' });
        const data = [new ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText
        })];

        await navigator.clipboard.write(data);
        
        const oldText = btn.innerHTML;
        btn.innerHTML = '✅ Copied!';
        btn.style.color = '#16a34a';
        btn.style.borderColor = 'rgba(22, 163, 74, 0.2)';
        setTimeout(() => {
            btn.innerHTML = oldText;
            btn.style.color = 'var(--accent-blue)';
            btn.style.borderColor = 'rgba(15, 98, 254, 0.2)';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy to clipboard', err);
        alert('Failed to copy finding. Please ensure you have granted Clipboard permissions.');
    }
}

function addCustomFieldRow(label = '', value = '', position = 'bottom') {
    const container = document.getElementById('custom-fields-container');
    if (!container) return;
    
    const row = document.createElement('div');
    row.className = 'custom-field-row';
    row.style.background = '#f8fafc';
    row.style.border = '1px solid var(--border-color)';
    row.style.borderRadius = '8px';
    row.style.padding = '1rem';
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '1.2fr 2fr 1.2fr auto';
    row.style.gap = '0.75rem';
    row.style.alignItems = 'start';
    row.style.marginBottom = '0.75rem';
    
    row.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <label style="font-size: 0.75rem; font-weight: 700; color: var(--accent-blue); display: block; margin-bottom: 0.2rem;">Column Label</label>
            <input type="text" class="form-control custom-field-label" value="${label}" placeholder="e.g. Remediation SLA" style="margin-bottom: 0;">
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <label style="font-size: 0.75rem; font-weight: 700; color: var(--accent-blue); display: block; margin-bottom: 0.2rem;">Column Value</label>
            <textarea class="form-control custom-field-value" rows="2" placeholder="e.g. 14 Days" style="margin-bottom: 0; min-height: 38px; resize: vertical;"></textarea>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <label style="font-size: 0.75rem; font-weight: 700; color: var(--accent-blue); display: block; margin-bottom: 0.2rem;">Insert Position</label>
            <select class="form-control custom-field-position" style="margin-bottom: 0; height: 38px; padding: 0.35rem 0.5rem;">
                <option value="bottom" ${position === 'bottom' ? 'selected' : ''}>At the bottom</option>
                <option value="title" ${position === 'title' ? 'selected' : ''}>After Title</option>
                <option value="severity" ${position === 'severity' ? 'selected' : ''}>After Severity</option>
                <option value="cvss" ${position === 'cvss' ? 'selected' : ''}>After CVSS</option>
                <option value="finding_status" ${position === 'finding_status' ? 'selected' : ''}>After Finding Status</option>
                <option value="status" ${position === 'status' ? 'selected' : ''}>After Retest Status</option>
                <option value="affected" ${position === 'affected' ? 'selected' : ''}>After Affected System</option>
                <option value="description" ${position === 'description' ? 'selected' : ''}>After Description</option>
                <option value="poc" ${position === 'poc' ? 'selected' : ''}>After Proof of Vulnerability</option>
                <option value="exploitation" ${position === 'exploitation' ? 'selected' : ''}>After Exploitation</option>
                <option value="impact" ${position === 'impact' ? 'selected' : ''}>After Impact</option>
                <option value="payload" ${position === 'payload' ? 'selected' : ''}>After Script/Payload</option>
                <option value="solution" ${position === 'solution' ? 'selected' : ''}>After Solution</option>
                <option value="reference" ${position === 'reference' ? 'selected' : ''}>After References</option>
                <option value="reproduce" ${position === 'reproduce' ? 'selected' : ''}>After Step of Reproduce</option>
                <option value="cwe" ${position === 'cwe' ? 'selected' : ''}>After CWE Mapping</option>
                <option value="mitre" ${position === 'mitre' ? 'selected' : ''}>After MITRE ATT&CK</option>
                <option value="iso" ${position === 'iso' ? 'selected' : ''}>After ISO 27001 Control</option>
                <option value="nist" ${position === 'nist' ? 'selected' : ''}>After NIST Control</option>
                <option value="ptes" ${position === 'ptes' ? 'selected' : ''}>After PTES Phase</option>
                <option value="retest" ${position === 'retest' ? 'selected' : ''}>After Retest Evidence</option>
            </select>
        </div>
        <button type="button" class="btn-remove-row" style="align-self: center; height: 38px; width: 38px; display: inline-flex; align-items: center; justify-content: center; margin-top: 1.25rem; font-size: 1.25rem;" title="Remove Row">&times;</button>
    `;
    
    row.querySelector('.custom-field-value').value = value;
    
    row.querySelector('.btn-remove-row').onclick = () => {
        row.remove();
    };
    
    container.appendChild(row);
}

async function copyToolsToClipboard() {
    const toolsContent = document.getElementById('project-tools-preview-content');
    if (!toolsContent) return;
    
    const items = Array.from(toolsContent.querySelectorAll('li')).map(li => li.innerText.trim());
    if (items.length === 0) return;
    
    let htmlContent = `<ul style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.6; margin: 0; padding-left: 20px;">`;
    items.forEach(item => {
        htmlContent += `<li>${item}</li>`;
    });
    htmlContent += `</ul>`;
    
    const plainText = items.map(item => `- ${item}`).join('\n');
    
    const btn = document.getElementById('btn-copy-tools');
    try {
        const blobHtml = new Blob([htmlContent], { type: 'text/html' });
        const blobText = new Blob([plainText], { type: 'text/plain' });
        const data = [new ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText
        })];

        await navigator.clipboard.write(data);
        
        const oldText = btn.innerHTML;
        btn.innerHTML = '✅ Copied!';
        btn.style.color = '#16a34a';
        btn.style.borderColor = 'rgba(22, 163, 74, 0.2)';
        setTimeout(() => {
            btn.innerHTML = oldText;
            btn.style.color = 'var(--accent-blue)';
            btn.style.borderColor = 'rgba(15, 98, 254, 0.2)';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy tools to clipboard', err);
        alert('Failed to copy tools list.');
    }
}

async function copyFindingsTableToClipboard() {
    if (!currentProjectFindings || currentProjectFindings.length === 0) {
        alert("No findings to copy.");
        return;
    }
    
    const btn = document.getElementById('btn-copy-findings-table');
    const oldText = btn.innerHTML;
    
    let tableHtml = `
        <table style="width: 100%; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; border: 1px solid #cbd5e1; margin: 15px 0;">
            <thead>
                <tr style="background-color: #5c67f2; color: #ffffff; font-weight: bold; text-align: left;">
                    <th style="padding: 10px; border: 1px solid #cbd5e1;">Title</th>
                    <th style="padding: 10px; border: 1px solid #cbd5e1;">Affected System</th>
                    <th style="padding: 10px; border: 1px solid #cbd5e1;">CVSS Score</th>
                    <th style="padding: 10px; border: 1px solid #cbd5e1;">Severity</th>
                    <th style="padding: 10px; border: 1px solid #cbd5e1;">Status</th>
                    <th style="padding: 10px; border: 1px solid #cbd5e1;">Retest Status</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    const getBadgeStyle = (sev) => {
        let bg = '#e0f2fe', fg = '#0284c7', border = 'rgba(2, 132, 199, 0.2)';
        if (sev === 'Critical') { bg = '#f5f3ff'; fg = '#7c3aed'; border = 'rgba(124, 58, 237, 0.2)'; }
        else if (sev === 'High') { bg = '#ffe4e6'; fg = '#e11d48'; border = 'rgba(225, 29, 72, 0.2)'; }
        else if (sev === 'Medium') { bg = '#fef3c7'; fg = '#d97706'; border = 'rgba(217, 119, 6, 0.2)'; }
        else if (sev === 'Low') { bg = '#dcfce7'; fg = '#16a34a'; border = 'rgba(22, 163, 74, 0.2)'; }
        return `padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background-color: ${bg}; color: ${fg}; border: 1px solid ${border};`;
    };
    
    const getStatusStyle = (status) => {
        let bg = '#ffe4e6', fg = '#e11d48', border = 'rgba(225, 29, 72, 0.2)';
        if (status === 'Closed') { bg = '#dcfce7'; fg = '#16a34a'; border = 'rgba(22, 163, 74, 0.2)'; }
        return `padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background-color: ${bg}; color: ${fg}; border: 1px solid ${border};`;
    };

    currentProjectFindings.forEach(f => {
        let affectedText = '-';
        if (f.affected_system) {
            const systems = f.affected_system.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
            if (systems.length > 0) {
                affectedText = `<ul style="margin: 0; padding-left: 20px;">` + systems.map(sys => `<li>${sys}</li>`).join('') + `</ul>`;
            }
        }
        
        tableHtml += `
            <tr>
                <td style="padding: 10px; border: 1px solid #cbd5e1; color: #0f172a; font-weight: bold; vertical-align: top;">
                    ${f.title}
                </td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; color: #334155; vertical-align: top;">
                    ${affectedText}
                </td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; color: #0f172a; font-weight: bold; vertical-align: top;">
                    ${f.cvss_score.toFixed(1)} <span style="font-size: 10px; color: #64748b; font-weight: normal;">(${f.cvss_version})</span>
                </td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; vertical-align: top; text-align: center;">
                    <span style="${getBadgeStyle(f.severity)}">${f.severity}</span>
                </td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; vertical-align: top; text-align: center;">
                    <span style="${getStatusStyle(f.finding_status || 'Open')}">${f.finding_status || 'Open'}</span>
                </td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; vertical-align: top; text-align: center;">
                    <span style="${getStatusStyle(f.status || 'Open')}">${f.status || 'Open'}</span>
                </td>
            </tr>
        `;
    });
    
    tableHtml += `
            </tbody>
        </table>
    `;
    
    let plainText = `Title\tAffected System\tCVSS Score\tSeverity\tStatus\tRetest Status\n`;
    currentProjectFindings.forEach(f => {
        let affectedText = '-';
        if (f.affected_system) {
            affectedText = f.affected_system.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0).join(', ');
        }
        plainText += `${f.title}\t${affectedText}\t${f.cvss_score.toFixed(1)} (${f.cvss_version})\t${f.severity}\t${f.finding_status || 'Open'}\t${f.status || 'Open'}\n`;
    });

    try {
        const blobHtml = new Blob([tableHtml], { type: 'text/html' });
        const blobText = new Blob([plainText], { type: 'text/plain' });
        const data = [new ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText
        })];

        await navigator.clipboard.write(data);
        
        btn.innerHTML = '✅ Copied!';
        btn.style.color = '#16a34a';
        btn.style.borderColor = 'rgba(22, 163, 74, 0.2)';
        setTimeout(() => {
            btn.innerHTML = oldText;
            btn.style.color = '';
            btn.style.borderColor = '';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy table to clipboard', err);
        alert('Failed to copy table.');
    }
}

async function openMfaModal() {
    const body = document.getElementById('mfa-setup-body');
    if (!body) return;
    
    body.innerHTML = '<div style="text-align: center; padding: 2rem;"><span class="spinner"></span> Loading MFA settings...</div>';
    document.getElementById('mfa-setup-modal').classList.add('active');
    
    try {
        const res = await fetch('/api/user/mfa/setup');
        const data = await res.json();
        
        if (data.mfa_enabled) {
            body.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🛡️</div>
                    <h4 style="color: #16a34a; font-weight: bold; margin-bottom: 0.5rem;">MFA is Active</h4>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Your account is protected with Multi-Factor Authentication.</p>
                    
                    <div class="form-group" style="max-width: 300px; margin: 0 auto 1.5rem auto;">
                        <label for="mfa-disable-token" style="font-weight: 600; font-size: 0.8rem; display: block; margin-bottom: 0.5rem;">Enter Authenticator Token to Disable</label>
                        <input type="text" id="mfa-disable-token" class="form-control" maxlength="6" style="text-align: center; letter-spacing: 0.3em; font-weight: bold;" placeholder="e.g. 123456">
                    </div>
                    
                    <div id="mfa-error-msg" style="color: var(--severity-critical); font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem; display: none;"></div>
                    
                    <div style="display: flex; justify-content: center; gap: 1rem;">
                        <button class="btn btn-secondary" onclick="closeMfaModal()">Close</button>
                        <button class="btn btn-danger" onclick="disableMfa()">Disable MFA</button>
                    </div>
                </div>
            `;
        } else {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.otpauth_url)}`;
            body.innerHTML = `
                <div style="text-align: center;">
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">Scan QR code ini dengan aplikasi Google Authenticator atau Microsoft Authenticator untuk menambahkan akun Anda.</p>
                    
                    <div style="background: #ffffff; padding: 1rem; display: inline-block; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 1rem;">
                        <img src="${qrUrl}" alt="MFA QR Code" style="display: block; width: 180px; height: 180px;">
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <small style="color: var(--text-secondary); display: block; margin-bottom: 0.25rem;">Atau masukkan kode rahasia secara manual:</small>
                        <code style="font-size: 1rem; font-weight: bold; background: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-color);">${data.secret}</code>
                    </div>
                    
                    <div class="form-group" style="max-width: 300px; margin: 0 auto 1.5rem auto;">
                        <label for="mfa-setup-token" style="font-weight: 600; font-size: 0.8rem; display: block; margin-bottom: 0.5rem;">Masukkan 6 Digit Kode Verifikasi</label>
                        <input type="text" id="mfa-setup-token" class="form-control" maxlength="6" style="text-align: center; letter-spacing: 0.3em; font-weight: bold;" placeholder="e.g. 123456">
                    </div>
                    
                    <div id="mfa-error-msg" style="color: var(--severity-critical); font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem; display: none;"></div>
                    
                    <div style="display: flex; justify-content: center; gap: 1rem;">
                        <button class="btn btn-secondary" onclick="closeMfaModal()">Batal</button>
                        <button class="btn btn-primary" onclick="verifyMfa()">Aktifkan MFA</button>
                    </div>
                </div>
            `;
        }
    } catch (err) {
        console.error("Error loading MFA setup:", err);
        body.innerHTML = '<div style="color: var(--severity-critical); text-align: center; padding: 2rem;">Gagal memuat pengaturan MFA. Silakan coba lagi.</div>';
    }
}

function closeMfaModal() {
    document.getElementById('mfa-setup-modal').classList.remove('active');
}

async function verifyMfa() {
    const tokenInput = document.getElementById('mfa-setup-token');
    const token = tokenInput.value.trim();
    const errorMsg = document.getElementById('mfa-error-msg');
    
    if (!token || token.length !== 6) {
        errorMsg.innerText = 'Masukkan 6 digit kode token.';
        errorMsg.style.display = 'block';
        return;
    }
    
    errorMsg.style.display = 'none';
    
    try {
        const res = await fetch('/api/user/mfa/setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const data = await res.json();
        
        if (res.ok) {
            alert('MFA berhasil diaktifkan!');
            openMfaModal();
            checkAuth();
        } else {
            errorMsg.innerText = data.message || 'Verifikasi gagal';
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        console.error("MFA verification error:", err);
        errorMsg.innerText = 'Koneksi server error';
        errorMsg.style.display = 'block';
    }
}

async function disableMfa() {
    const tokenInput = document.getElementById('mfa-disable-token');
    const token = tokenInput.value.trim();
    const errorMsg = document.getElementById('mfa-error-msg');
    
    if (!token || token.length !== 6) {
        errorMsg.innerText = 'Masukkan 6 digit kode token.';
        errorMsg.style.display = 'block';
        return;
    }
    
    errorMsg.style.display = 'none';
    
    if (!confirm('Apakah Anda yakin ingin menonaktifkan MFA?')) return;
    
    try {
        const res = await fetch('/api/user/mfa/disable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const data = await res.json();
        
        if (res.ok) {
            alert('MFA berhasil dinonaktifkan.');
            openMfaModal();
            checkAuth();
        } else {
            errorMsg.innerText = data.message || 'Verifikasi gagal';
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        console.error("MFA disable error:", err);
        errorMsg.innerText = 'Koneksi server error';
        errorMsg.style.display = 'block';
    }
}


