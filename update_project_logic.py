import re

with open('app.py', 'r') as f:
    content = f.read()

# For POST:
post_logic = """        report_template_id=data.get('report_template_id'),
            used_tools=data.get('used_tools', ''),"""
post_replacement = """        report_template_id=data.get('report_template_id'),
            used_tools=data.get('used_tools', ''),"""

# Actually, the best place is after `db.session.add(project)`
post_add = "db.session.add(project)"
post_add_replacement = """db.session.add(project)
        if project.report_template_id:
            tpl = ReportTemplate.query.get(project.report_template_id)
            if tpl and tpl.structure:
                project.technical_report = tpl.structure"""
content = content.replace(post_add, post_add_replacement)

# For PUT:
put_update = "project.report_template_id = data.get('report_template_id', project.report_template_id)"
put_update_replacement = """project.report_template_id = data.get('report_template_id', project.report_template_id)
        if 'report_template_id' in data and data['report_template_id']:
            tpl = ReportTemplate.query.get(data['report_template_id'])
            if tpl and tpl.structure:
                project.technical_report = tpl.structure"""
content = content.replace(put_update, put_update_replacement)

with open('app.py', 'w') as f:
    f.write(content)
