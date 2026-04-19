import os

path = r"d:\python_projects\aurora\frontend\src\components\ui\LandingPage_Mobile.tsx"

with open(path, "rb") as f:
    content = f.read()

# Replacements for common double-encoded UTF-8 artifacts
replacements = [
    (b"\xc3\xa2\xe2\x82\xac\xe2\x80\x93", b"\xe2\x80\x94"), # â€“ -> —
    (b"\xc3\xa2\xe2\x80\xa0\xe2\x84\xa2", b"\xe2\x86\x92"), # â†’ -> →
    (b"\xc3\xa2\xe2\x94\xac\xc2\xac", b"\xe2\x94\x80"),     # â”€ variants
    (b"\xc3\x82\xc2\xb0", b"\xc2\xb0"), # Â° -> °
    (b"\xc3\x83\xc2\xb8", b"\xc3\xb8"), # Ã¸ -> ø
    (b"\xc3\x82\xc2\xa9", b"\xc2\xa9"), # Â© -> ©
    (b"\xc3\x82\xc2\xb7", b"\xc2\xb7"), # Â· -> ·
]

for target, replacement in replacements:
    content = content.replace(target, replacement)

# Catch-all for lingering 'Â' artifacts
content = content.replace(b"\xc3\x82 ", b" ")
content = content.replace(b"\xc3\x82", b"")

with open(path, "wb") as f:
    f.write(content)

print("Encoding artifacts cleaned successfully.")
