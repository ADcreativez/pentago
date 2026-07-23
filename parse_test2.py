import esprima
js = """
const str = `${ [1].map(x => \`hello\`) }`;
"""
try:
    esprima.parseScript(js)
    print("Syntax OK")
except Exception as e:
    print(f"Syntax Error: {e}")
