import sys

msg = sys.stdin.read()

replacements = {
    "going collage": "chore: save progress on initial database setup",
    "Train": "feat: implement initial XGBoost training loop",
    "debug": "fix: resolve runtime errors in extraction pipeline",
    "A\n": "feat: initialize Convex schema and API integration\n",
    "1\n": "docs: add initial project problem statement\n",
    "first demo": "feat: launch initial prototype demo",
    "Removed node_modules": "chore: remove node_modules and update gitignore",
    "Mosin merge": "Merge branch 'main' - resolving conflicts"
}

for old, new in replacements.items():
    if msg.strip() == old.strip():
        msg = new + "\n"
    elif old in msg:
        msg = msg.replace(old, new)

sys.stdout.write(msg)
