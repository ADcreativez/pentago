import sys

with open('static/js/app.js', 'r') as f:
    appjs = f.read()

old_img = """                        const img = new Image();
                        img.src = emoji;"""
new_img = """                        const img = new Image();
                        img.crossOrigin = "Anonymous";
                        img.src = emoji;"""
appjs = appjs.replace(old_img, new_img)

# Also let's add an alert if download fails so we know why
old_catch = """        } catch (e) {
            console.error("Error generating image download:", e);
        }
    }
    
    alert("Diagram published & downloaded successfully!");"""
new_catch = """        } catch (e) {
            console.error("Error generating image download:", e);
            alert("Error downloading image: " + e.message);
        }
    }
    
    alert("Diagram published successfully!");"""
appjs = appjs.replace(old_catch, new_catch)

with open('static/js/app.js', 'w') as f:
    f.write(appjs)
print("app.js patched for CORS")
