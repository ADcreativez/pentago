import os

docs_dir = "docs"

content = {
    "01-project-overview.md": """# Project Overview

Pentago is a Penetration Testing and Vulnerability Management Platform. It is designed to manage security assessments, track vulnerabilities (findings), and generate reports for clients (companies). 

Key features include:
- Project & Company Management
- Vulnerability Tracking with CVSS scoring
- Automated WAF and Intrusion Detection
- Custom Report Generation
""",
    "02-system-architecture.md": """# System Architecture

- **Backend framework**: Flask (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Security**: Built-in Web Application Firewall (WAF) blocking SQLi, XSS, and Path Traversal. 
- **Encryption**: Uses cryptography.fernet for encrypting sensitive fields in the database (e.g., finding details, scope).
""",
    "03-user-role-permission.md": """# User Roles and Permissions

Currently supported roles:
- **Admin**: Has full access to the system, including user management.
- **User**: Standard user access, restricted to assigned companies/projects.
- **Consultant**: Associated with users for roles like Pentester, Project Manager, or Sales.
""",
    "04-authentication.md": """# Authentication

- Session-based authentication via Flask.
- MFA (Multi-Factor Authentication) using pyotp.
- Defense mechanisms: Rate limiting on login failures and IP blocking for suspicious activities.
""",
    "05-database-design.md": """# Database Design

Core Tables:
- **User**: Stores credentials and roles.
- **Company**: Client organizations.
- **Project**: Security assessment engagements (Pentest/Retest).
- **Finding**: Vulnerabilities discovered during projects.
- **FindingTemplate**: Reusable vulnerability templates.
- **AuditLog**: Tracks system activities.
- **BlockedIP**: Manages IP blocklists.
""",
    "06-wallet-system.md": "# Wallet System\n\n*N/A - Not applicable to the current Pentago architecture.*\n",
    "07-advertiser-flow.md": "# Advertiser Flow\n\n*N/A - Not applicable to the current Pentago architecture.*\n",
    "08-worker-flow.md": "# Worker Flow\n\n*N/A - Not applicable to the current Pentago architecture.*\n",
    "09-campaign-system.md": "# Campaign System\n\n*N/A - Not applicable to the current Pentago architecture.*\n",
    "10-task-system.md": "# Task System\n\n*N/A - Not applicable to the current Pentago architecture.*\n",
    "11-submission-system.md": "# Submission System\n\n*N/A - Not applicable to the current Pentago architecture.*\n",
    "12-ai-verification.md": "# AI Verification\n\n*N/A - Not applicable to the current Pentago architecture.*\n",
    "13-anti-fraud-system.md": "# Anti-Fraud System\n\nImplemented via built-in WAF (Web Application Firewall):\n- Rate limiting\n- Malicious payload detection (SQLi, XSS, Path Traversal)\n- IP Blocklisting\n",
    "14-notification-system.md": "# Notification System\n\n*N/A - No dedicated notification system identified in the core app.*",
    "15-payment-system.md": "# Payment System\n\n*N/A - Not applicable to the current Pentago architecture.*\n",
    "16-admin-panel.md": """# Admin Panel

Admin users can:
- Manage Users and Consultants
- Configure System settings and WAF rules
- View Audit Logs
""",
    "17-api-design.md": """# API Design

RESTful endpoints for handling UI requests:
- `/api/upload` - File uploading handler.
- Core CRUD operations for projects, findings, and companies (handled via Flask routes).
""",
    "18-ui-pages.md": """# UI Pages

Built using HTML, CSS, and JS (rendered via Flask templates).
Main views include:
- Dashboard
- Project Management
- Vulnerability/Finding Details
- Settings
""",
    "19-development-roadmap.md": "# Development Roadmap\n\n*To be defined.*\n",
    "20-future-features.md": "# Future Features\n\n*To be defined.*\n"
}

for filename, text in content.items():
    filepath = os.path.join(docs_dir, filename)
    if os.path.exists(filepath):
        with open(filepath, "w") as f:
            f.write(text)
        print(f"Updated {filename}")

