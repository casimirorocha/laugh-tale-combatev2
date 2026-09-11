import os
import re

for root, dirs, files in os.walk('src'):
    for file in files:
        if not file.endswith('.tsx'): continue
        path = os.path.join(root, file)
        with open(path, 'r') as f:
            content = f.read()
        
        # Replace animationDelay: '...' with '--anim-delay': '...'
        content = re.sub(
            r"animationDelay:\s*('[^']+'|`[^`]+`)",
            r"'--anim-delay': \1",
            content
        )
        
        # Replace animationDuration: '...' with '--anim-duration': '...'
        content = re.sub(
            r"animationDuration:\s*('[^']+'|`[^`]+`)",
            r"'--anim-duration': \1",
            content
        )
        
        with open(path, 'w') as f:
            f.write(content)

print("Done replacing inline delays in TSX")
