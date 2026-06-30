import re

with open('/Users/macbookpro/.gemini/antigravity-ide/brain/e5e1c834-829a-421d-abd5-7e12c58643ae/task.md', 'r') as f:
    content = f.read()

content = content.replace("- `[/]` 1. Update `app.py`", "- `[x]` 1. Update `app.py`")
content = content.replace("  - `[ ]` Add `report_version`, `report_date`, `report_author`, `change_reference`, `client_approver_name` to `Project` model", "  - `[x]` Add `report_version`, `report_date`, `report_author`, `change_reference`, `client_approver_name` to `Project` model")
content = content.replace("  - `[ ]` Update `to_dict()` in `Project` to include these fields", "  - `[x]` Update `to_dict()` in `Project` to include these fields")
content = content.replace("  - `[ ]` Update `POST /api/projects` to accept these fields", "  - `[x]` Update `POST /api/projects` to accept these fields")
content = content.replace("  - `[ ]` Update `PUT /api/projects/<id>` to accept these fields", "  - `[x]` Update `PUT /api/projects/<id>` to accept these fields")

content = content.replace("- `[ ]` 2. Update `templates/index.html`", "- `[x]` 2. Update `templates/index.html`")
content = content.replace("  - `[ ]` Add the \"Version Control & Approvals\" UI section in the Project Detail view", "  - `[x]` Add the \"Version Control & Approvals\" UI section in the Project Detail view")
content = content.replace("  - `[ ]` Create dynamic form templates for Revision Rows and Approval Rows", "  - `[x]` Create dynamic form templates for Revision Rows and Approval Rows")

content = content.replace("- `[ ]` 3. Update `static/js/app.js`", "- `[x]` 3. Update `static/js/app.js`")
content = content.replace("  - `[ ]` Implement JS functions to render revision and approval rows (`renderRevisionRows`)", "  - `[x]` Implement JS functions to render revision and approval rows (`renderRevisionRows`)")
content = content.replace("  - `[ ]` Implement JS functions to add new blank rows (`addRevisionRow`, `addApprovalRow`)", "  - `[x]` Implement JS functions to add new blank rows (`addRevisionRow`, `addApprovalRow`)")
content = content.replace("  - `[ ]` Update `saveProject` payload to gather data from these rows into JSON strings", "  - `[x]` Update `saveProject` payload to gather data from these rows into JSON strings")
content = content.replace("  - `[ ]` Update `viewProject` and `editProject` to correctly populate these sections", "  - `[x]` Update `viewProject` and `editProject` to correctly populate these sections")

content = content.replace("- `[ ]` 4. Verify Database Integrity", "- `[x]` 4. Verify Database Integrity")
content = content.replace("  - `[ ]` Initialize missing columns dynamically if sqlite `ALTER TABLE` is needed", "  - `[x]` Initialize missing columns dynamically if sqlite `ALTER TABLE` is needed")

content = content.replace("- `[ ]` 5. Verify Feature", "- `[x]` 5. Verify Feature")
content = content.replace("  - `[ ]` Restart app, add revisions via UI, generate PDF to confirm Document Control appears correctly.", "  - `[x]` Restart app, add revisions via UI, generate PDF to confirm Document Control appears correctly.")

with open('/Users/macbookpro/.gemini/antigravity-ide/brain/e5e1c834-829a-421d-abd5-7e12c58643ae/task.md', 'w') as f:
    f.write(content)
