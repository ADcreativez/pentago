import sys

with open('static/js/app.js', 'r') as f:
    content = f.read()

# 1. Icons properties in addStudioElement
old1 = """    } else if (type === 'firewall') {
        label = "Firewall";
        width = 80;
        height = 70;
    } else if (type === 'phishing') {
        label = "Phishing";
        width = 80;
        height = 70;
    } else if (type === 'exploit') {
        label = "Exploit";
        width = 80;
        height = 70;
    } else if (type === 'malware') {
        label = "Malware";
        width = 80;
        height = 70;
    } else if (type === 'c2') {
        label = "C2 Server";
        width = 80;
        height = 70;
    }
    
    const cW = currentStudioType === 'killchain' ? 2200 : 1200;"""
    
new1 = """    } else if (type === 'firewall') {
        label = "Firewall";
        width = 80;
        height = 70;
    } else if (type === 'kc_recon') {
        label = "Reconnaissance";
        width = 120;
        height = 50;
    } else if (type === 'kc_initial') {
        label = "Initial Access";
        width = 120;
        height = 50;
    } else if (type === 'kc_exec') {
        label = "Execution";
        width = 120;
        height = 50;
    } else if (type === 'kc_persist') {
        label = "Persistence";
        width = 120;
        height = 50;
    } else if (type === 'kc_privesc') {
        label = "PrivEsc";
        width = 120;
        height = 50;
    } else if (type === 'kc_evasion') {
        label = "Defense Evasion";
        width = 120;
        height = 50;
    } else if (type === 'kc_cred') {
        label = "Credential Access";
        width = 120;
        height = 50;
    } else if (type === 'kc_disc') {
        label = "Discovery";
        width = 120;
        height = 50;
    } else if (type === 'kc_collect') {
        label = "Collection";
        width = 120;
        height = 50;
    } else if (type === 'kc_c2') {
        label = "Command & Control";
        width = 120;
        height = 50;
    }
    
    const cW = currentStudioType === 'killchain' ? 2200 : 1200;"""

# 2. Rendering logic
# The logic for these KC items can be a simple rounded rectangle with text and icon, similar to other nodes.
# Let's add them to the array of generic nodes, but handle them slightly differently if we want them wider.
old2 = """        } else if (['user', 'server', 'device', 'cloud', 'attacker', 'virus', 'switch', 'router', 'database', 'firewall', 'phishing', 'exploit', 'malware', 'c2'].includes(node.type)) {"""

new2 = """        } else if (['user', 'server', 'device', 'cloud', 'attacker', 'virus', 'switch', 'router', 'database', 'firewall', 'kc_recon', 'kc_initial', 'kc_exec', 'kc_persist', 'kc_privesc', 'kc_evasion', 'kc_cred', 'kc_disc', 'kc_collect', 'kc_c2'].includes(node.type)) {"""

old3 = """            else if (node.type === 'phishing') emoji = '🎣';
            else if (node.type === 'exploit') emoji = '⚡';
            else if (node.type === 'malware') emoji = '🕷️';
            else if (node.type === 'c2') emoji = '📡';"""

new3 = """            else if (node.type === 'kc_recon') emoji = '👁️';
            else if (node.type === 'kc_initial') emoji = '🚪';
            else if (node.type === 'kc_exec') emoji = '⚡';
            else if (node.type === 'kc_persist') emoji = '⚓';
            else if (node.type === 'kc_privesc') emoji = '🔼';
            else if (node.type === 'kc_evasion') emoji = '🛡️';
            else if (node.type === 'kc_cred') emoji = '🔑';
            else if (node.type === 'kc_disc') emoji = '🔍';
            else if (node.type === 'kc_collect') emoji = '📦';
            else if (node.type === 'kc_c2') emoji = '📡';"""

old4 = """            studioCtx.font = '24px Inter, Roboto, Arial, sans-serif';
            studioCtx.textAlign = 'center';
            studioCtx.textBaseline = 'middle';
            studioCtx.fillText(emoji, node.x + node.width / 2, node.y + node.height / 2 - 8);
            
            studioCtx.fillStyle = '#0f172a';
            studioCtx.font = '10px Inter, Roboto, Arial, sans-serif';
            studioCtx.fillText(node.label, node.x + node.width / 2, node.y + node.height - 12);"""

new4 = """            if (node.type.startsWith('kc_')) {
                studioCtx.font = '16px Inter, Roboto, Arial, sans-serif';
                studioCtx.textAlign = 'center';
                studioCtx.textBaseline = 'middle';
                studioCtx.fillText(emoji, node.x + 20, node.y + node.height / 2);
                
                studioCtx.fillStyle = '#0f172a';
                studioCtx.font = '11px Inter, Roboto, Arial, sans-serif';
                studioCtx.textAlign = 'left';
                studioCtx.fillText(node.label, node.x + 35, node.y + node.height / 2);
            } else {
                studioCtx.font = '24px Inter, Roboto, Arial, sans-serif';
                studioCtx.textAlign = 'center';
                studioCtx.textBaseline = 'middle';
                studioCtx.fillText(emoji, node.x + node.width / 2, node.y + node.height / 2 - 8);
                
                studioCtx.fillStyle = '#0f172a';
                studioCtx.font = '10px Inter, Roboto, Arial, sans-serif';
                studioCtx.fillText(node.label, node.x + node.width / 2, node.y + node.height - 12);
            }"""

content = content.replace(old1, new1)
content = content.replace(old2, new2)
content = content.replace(old3, new3)
content = content.replace(old4, new4)

with open('static/js/app.js', 'w') as f:
    f.write(content)

print("App.js patched for KC steps successfully.")
