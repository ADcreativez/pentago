from app import app
with app.app_context():
    print([rule.rule for rule in app.url_map.iter_rules() if 'report_templates' in rule.rule])
