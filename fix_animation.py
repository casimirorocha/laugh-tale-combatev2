import re

with open('src/components/BackgroundCrowdSystem.tsx', 'r') as f:
    content = f.read()

# Replace simple ones like animation: `crowdArmWave ${waveDuration} infinite ease-in-out`,
content = re.sub(
    r"animation:\s*`([a-zA-Z0-9_]+)\s*\$\{(.*?)\}\s*infinite\s*ease-in-out`,",
    r"animationName: '\1', animationDuration: \2, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',",
    content
)

# Replace conditional ones like animation: intensity >= 45 ? `crowdBounce ${cheerDuration} infinite ease-in-out` : `crowdSway ${cheerDuration} infinite ease-in-out`,
# This has exactly one match format in the file.
content = re.sub(
    r"animation:\s*(intensity\s*>=\s*\d+)\s*\?\s*`([a-zA-Z0-9_]+)\s*\$\{(.*?)\}\s*infinite\s*ease-in-out`\s*:\s*`([a-zA-Z0-9_]+)\s*\$\{(.*?)\}\s*infinite\s*ease-in-out`,",
    r"animationName: \1 ? '\2' : '\4', animationDuration: \3, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',",
    content
)

# Replace undefined fallback: animation: intensity >= 40 ? `crowdArmWave ${waveDuration} infinite ease-in-out` : undefined,
content = re.sub(
    r"animation:\s*(intensity\s*>=\s*\d+)\s*\?\s*`([a-zA-Z0-9_]+)\s*\$\{(.*?)\}\s*infinite\s*ease-in-out`\s*:\s*undefined,",
    r"animationName: \1 ? '\2' : 'none', animationDuration: \3, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',",
    content
)

with open('src/components/BackgroundCrowdSystem.tsx', 'w') as f:
    f.write(content)
print("Done")
