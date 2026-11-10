import os
from PIL import Image, ImageDraw, ImageFilter

def make_icons():
    src_path = r"C:/Users/Personal/.gemini/antigravity/brain/6f8f973a-532d-43b8-a346-ca55b32855fd/.user_uploaded/media_1794305040644_22a2f7ec.jpg"
    img = Image.open(src_path).convert("RGBA")
    
    frontend_dir = r"c:\Users\Personal\Desktop\Mama\frontend"
    public_dir = os.path.join(frontend_dir, "public")
    android_res_dir = os.path.join(frontend_dir, "android", "app", "src", "main", "res")
    backend_media_dir = r"c:\Users\Personal\Desktop\Mama\backend\media"

    os.makedirs(public_dir, exist_ok=True)
    os.makedirs(backend_media_dir, exist_ok=True)

    # 1. Save main high-res logo in public and backend media
    logo_path = os.path.join(public_dir, "logo.png")
    img.save(logo_path, format="PNG", optimize=True)
    img.save(os.path.join(backend_media_dir, "logo.png"), format="PNG", optimize=True)
    print(f"Saved logo.png: {logo_path}")

    # 2. PWA icons
    # Standard 192x192
    pwa_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    pwa_192.save(os.path.join(public_dir, "pwa-192x192.png"), format="PNG")

    # Standard 512x512
    pwa_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    pwa_512.save(os.path.join(public_dir, "pwa-512x512.png"), format="PNG")

    # Maskable 512x512 (contains ~15% safe padding around the logo so circles/squircles don't clip it)
    maskable = Image.new("RGBA", (512, 512), (255, 255, 255, 255))
    padded_logo = img.resize((410, 410), Image.Resampling.LANCZOS)
    maskable.paste(padded_logo, (51, 51), padded_logo)
    maskable.save(os.path.join(public_dir, "pwa-maskable-512x512.png"), format="PNG")
    print("Saved PWA icons")

    # 3. Apple Touch Icon (180x180)
    apple_icon = img.resize((180, 180), Image.Resampling.LANCZOS)
    apple_icon.save(os.path.join(public_dir, "apple-touch-icon.png"), format="PNG")
    print("Saved apple-touch-icon.png")

    # 4. Favicons
    fav_32 = img.resize((32, 32), Image.Resampling.LANCZOS)
    fav_32.save(os.path.join(public_dir, "favicon-32x32.png"), format="PNG")
    fav_16 = img.resize((16, 16), Image.Resampling.LANCZOS)
    fav_16.save(os.path.join(public_dir, "favicon-16x16.png"), format="PNG")
    fav_32.save(os.path.join(public_dir, "favicon.png"), format="PNG")
    
    # Generate multi-layer favicon.ico (16, 32, 48)
    fav_48 = img.resize((48, 48), Image.Resampling.LANCZOS)
    fav_48.save(
        os.path.join(public_dir, "favicon.ico"),
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)]
    )
    print("Saved favicon.ico and favicon.png")

    # 5. Android Launcher Icons & Foreground
    densities = {
        "mipmap-mdpi": {"legacy": 48, "foreground": 108},
        "mipmap-hdpi": {"legacy": 72, "foreground": 162},
        "mipmap-xhdpi": {"legacy": 96, "foreground": 216},
        "mipmap-xxhdpi": {"legacy": 144, "foreground": 324},
        "mipmap-xxxhdpi": {"legacy": 192, "foreground": 432},
    }

    def make_round(im, size):
        # Create circular masked image
        target = im.resize((size, size), Image.Resampling.LANCZOS)
        mask = Image.new("L", (size, size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, size - 1, size - 1), fill=255)
        out = Image.new("RGBA", (size, size), (255, 255, 255, 0))
        out.paste(target, (0, 0), mask)
        return out

    for folder, sizes in densities.items():
        folder_path = os.path.join(android_res_dir, folder)
        if not os.path.exists(folder_path):
            continue
        
        legacy_size = sizes["legacy"]
        fg_size = sizes["foreground"]

        # Standard legacy icon
        legacy_img = img.resize((legacy_size, legacy_size), Image.Resampling.LANCZOS)
        legacy_img.save(os.path.join(folder_path, "ic_launcher.png"), format="PNG")

        # Round legacy icon
        round_img = make_round(img, legacy_size)
        round_img.save(os.path.join(folder_path, "ic_launcher_round.png"), format="PNG")

        # Adaptive icon foreground (centered with ~22% safe margins)
        # Safe inner diameter in Android adaptive is 72/108 = ~66%
        inner_size = int(fg_size * 0.70)
        fg_img = Image.new("RGBA", (fg_size, fg_size), (255, 255, 255, 0))
        inner_content = img.resize((inner_size, inner_size), Image.Resampling.LANCZOS)
        offset = (fg_size - inner_size) // 2
        fg_img.paste(inner_content, (offset, offset), inner_content)
        fg_img.save(os.path.join(folder_path, "ic_launcher_foreground.png"), format="PNG")
        print(f"Updated {folder} icons (legacy: {legacy_size}px, foreground: {fg_size}px)")

    # 6. Splash screens (Android drawable directories)
    splash_targets = [
        ("drawable", 480, 320),
        ("drawable-land-mdpi", 480, 320),
        ("drawable-land-hdpi", 800, 480),
        ("drawable-land-xhdpi", 1280, 720),
        ("drawable-land-xxhdpi", 1600, 960),
        ("drawable-land-xxxhdpi", 1920, 1280),
        ("drawable-port-mdpi", 320, 480),
        ("drawable-port-hdpi", 480, 800),
        ("drawable-port-xhdpi", 720, 1280),
        ("drawable-port-xxhdpi", 960, 1600),
        ("drawable-port-xxxhdpi", 1280, 1920),
    ]

    for folder, w, h in splash_targets:
        dir_path = os.path.join(android_res_dir, folder)
        if not os.path.exists(dir_path):
            continue
        
        splash = Image.new("RGBA", (w, h), (255, 255, 255, 255))
        # Determine scale so logo fits nicely in the center (about 45% of min dimension)
        min_dim = min(w, h)
        logo_size = int(min_dim * 0.60)
        logo_resized = img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        x_pos = (w - logo_size) // 2
        y_pos = (h - logo_size) // 2
        splash.paste(logo_resized, (x_pos, y_pos), logo_resized)
        splash.save(os.path.join(dir_path, "splash.png"), format="PNG")
        print(f"Updated {folder}/splash.png ({w}x{h})")

    print("\nAll website, PWA, and native Android icons generated successfully!")

if __name__ == "__main__":
    make_icons()
