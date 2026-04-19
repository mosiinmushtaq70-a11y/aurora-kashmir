import os

path = "frontend/src/components/ui/LandingPage_Mobile.tsx"

with open(path, "rb") as f:
    content = f.read()

# Common UTF-8 artifacts in ANSI-decoded-then-UTF8-encoded files
replacements = [
    (b"\xc3\xa2\xe2\x82\xac\xe2\x80\x93", b"\xe2\x80\x94"), # em dash
    (b"\xc3\xa2\xe2\x82\xac\xe2\x80\x94", b"\xe2\x80\x94"), # em dash
    (b"\xc3\x82\xc2\xb0", b"\xc2\xb0"), # degree
    (b"\xc3\x83\xc2\xb8", b"\xc3\xb8"), # o slash
    (b"\xc3\x82\xc2\xa9", b"\xc2\xa9"), # copyright
    (b"\xc3\x82\xc2\xb7", b"\xc2\xb7"), # middle dot
    (b"\xc3\xa2\xe2\x82\xac\xe2\x80\xb9", b"\xe2\x86\x92"), # arrow
]

for target, replacement in replacements:
    content = content.replace(target, replacement)

# Also handle common double-encodings seen in logs
content = content.replace(b"\xc3\xa2\xe2\x82\xac\xe2\x80\x9c", b"\xe2\x80\x94")
content = content.replace(b"\xc3\x82", b"") # Generic stripper for the leading artifact

with open(path, "wb") as f:
    f.write(content)

print("Encoding artifacts fixed.")
