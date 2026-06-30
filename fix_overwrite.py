import re

with open('app.py', 'r') as f:
    content = f.read()

# For POST: it's fine, it's a new project.
# For PUT: only overwrite if `report_template_id` CHANGED!
put_bad = """        project.report_template_id = data.get('report_template_id', project.report_template_id)
        if 'report_template_id' in data and data['report_template_id']:
            tpl = ReportTemplate.query.get(data['report_template_id'])
            if tpl and tpl.structure:
                project.technical_report = tpl.structure"""

put_good = """        new_template_id = data.get('report_template_id')
        if new_template_id and str(new_template_id) != str(project.report_template_id):
            tpl = ReportTemplate.query.get(new_template_id)
            if tpl and tpl.structure:
                project.technical_report = tpl.structure
        project.report_template_id = new_template_id if new_template_id else project.report_template_id"""

content = content.replace(put_bad, put_good)

with open('app.py', 'w') as f:
    f.write(content)
