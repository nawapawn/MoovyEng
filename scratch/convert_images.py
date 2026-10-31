import os
import subprocess
from PIL import Image

screenshots_dir = 'public/screenshots'
images = [
    'hero_studio_1440',
    'studio_dark_1440',
    'mobile_editor_touch'
]

for name in images:
    png_path = os.path.join(screenshots_dir, f"{name}.png")
    webp_path = os.path.join(screenshots_dir, f"{name}.webp")
    avif_path = os.path.join(screenshots_dir, f"{name}.avif")

    if not os.path.exists(png_path):
        print(f"Skipping {png_path}, not found")
        continue

    # 1. Convert to high-quality WebP using Pillow (lossless/near-lossless 90%)
    img = Image.open(png_path)
    img.save(webp_path, 'WEBP', quality=88, method=6)
    webp_size = os.path.getsize(webp_path)
    print(f"Created {webp_path}: {webp_size / 1024:.1f} KB")

    # 2. Convert to ultra-compact AVIF using ffmpeg libsvtav1 / libaom-av1
    cmd = [
        'ffmpeg', '-y', '-i', png_path,
        '-c:v', 'libsvtav1',
        '-crf', '26',
        '-preset', '6',
        avif_path
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if res.returncode == 0 and os.path.exists(avif_path):
        avif_size = os.path.getsize(avif_path)
        print(f"Created {avif_path} via libsvtav1: {avif_size / 1024:.1f} KB")
    else:
        # Fallback to libaom-av1 if needed
        cmd_fallback = [
            'ffmpeg', '-y', '-i', png_path,
            '-c:v', 'libaom-av1',
            '-crf', '28',
            avif_path
        ]
        res2 = subprocess.run(cmd_fallback, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if res2.returncode == 0 and os.path.exists(avif_path):
            avif_size = os.path.getsize(avif_path)
            print(f"Created {avif_path} via libaom-av1: {avif_size / 1024:.1f} KB")
        else:
            print(f"Error encoding AVIF for {name}:", res.stderr.decode('utf-8', errors='ignore')[-300:])

print("All WebP and AVIF conversions completed!")
