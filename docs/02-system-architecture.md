# System Architecture

- **Backend framework**: Flask (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Security**: Built-in Web Application Firewall (WAF) blocking SQLi, XSS, and Path Traversal. 
- **Encryption**: Uses cryptography.fernet for encrypting sensitive fields in the database (e.g., finding details, scope).
