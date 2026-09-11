import re

with open('src/index.css', 'r') as f:
    content = f.read()

# For .voice-wave-bar
content = content.replace(
    "animation: voiceWave 0.45s ease-in-out infinite;",
    "animation: voiceWave 0.45s ease-in-out infinite;\n  animation-delay: var(--anim-delay, 0s);"
)

# For .animate-haki-spark
content = content.replace(
    "animation: hakiSparkFly var(--duration, 0.6s) cubic-bezier(0.1, 0.8, 0.25, 1) forwards;",
    "animation: hakiSparkFly var(--duration, 0.6s) cubic-bezier(0.1, 0.8, 0.25, 1) forwards;\n  animation-delay: var(--anim-delay, 0s);"
)

# For .animate-haki-dust
content = content.replace(
    "animation: hakiDustExpand var(--duration, 0.8s) cubic-bezier(0.1, 0.8, 0.25, 1) forwards;",
    "animation: hakiDustExpand var(--duration, 0.8s) cubic-bezier(0.1, 0.8, 0.25, 1) forwards;\n  animation-delay: var(--anim-delay, 0s);"
)

# For Tailwind utility classes like animate-spin, we can't easily modify them in index.css without creating a new rule.
# Let's add a global rule for the custom variables.
global_rules = """
/* Apply custom animation variables mapped from inline styles */
[style*="--anim-delay"] {
  animation-delay: var(--anim-delay) !important;
}
[style*="--anim-duration"] {
  animation-duration: var(--anim-duration) !important;
}
"""
content += global_rules

with open('src/index.css', 'w') as f:
    f.write(content)

print("Done updating CSS")
