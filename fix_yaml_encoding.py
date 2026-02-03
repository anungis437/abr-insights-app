import re

with open('.github/workflows/ai-cost-controls.yml', 'r', encoding='utf-8-sig', errors='ignore') as f:
    content = f.read()

# Replace smart quotes and emoji with ASCII equivalents
content = content.replace('â€œ', '"').replace('â€\x9d', '"')  # Smart quotes
content = content.replace('â€˜', "'").replace('â€\x99', "'")  # Smart single quotes
content = content.replace('…', '...').replace('â€¦', '...')  # Ellipsis

# Replace checkmarks and X marks with ASCII
content = content.replace('✅', '[OK]').replace('❌', '[ERROR]')

# Ensure Unix line endings
content = content.replace('\r\n', '\n')

with open('.github/workflows/ai-cost-controls.yml', 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print("File cleaned and fixed")
