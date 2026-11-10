import os
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask
from PIL import Image

def generate_qr():
    # Target URL on local network (Wi-Fi IP)
    target_url = "http://10.18.209.94:5173/download-app"
    fallback_url = "http://10.18.209.94:5173/"

    # Setup QR code instance with high error correction so logo can be placed in center
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=16,
        border=3,
    )
    qr.add_data(target_url)
    qr.make(fit=True)

    # Base QR Code
    qr_img = qr.make_image(
        fill_color="#E15712", # Brand primary orange
        back_color="#FFFFFF"
    ).convert("RGBA")

    # Center Logo
    logo_src = r"c:\Users\Personal\Desktop\Mama\frontend\public\logo.png"
    if os.path.exists(logo_src):
        logo = Image.open(logo_src).convert("RGBA")
        
        # Determine center logo size (approx 22% of QR code width)
        qr_w, qr_h = qr_img.size
        logo_size = int(qr_w * 0.24)
        logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)

        # Create white background badge with rounded border for logo
        badge_pad = 8
        badge_size = logo_size + badge_pad * 2
        badge = Image.new("RGBA", (badge_size, badge_size), (255, 255, 255, 255))
        badge.paste(logo, (badge_pad, badge_pad), logo)

        # Paste badge onto QR code center
        pos = ((qr_w - badge_size) // 2, (qr_h - badge_size) // 2)
        qr_img.paste(badge, pos)

    # Save to multiple destinations:
    destinations = [
        r"c:\Users\Personal\Desktop\Mama\frontend\public\mama_mobile_app_qr.png",
        r"c:\Users\Personal\Desktop\Mama\backend\media\mama_mobile_app_qr.png",
        r"C:\Users\Personal\.gemini\antigravity\brain\6f8f973a-532d-43b8-a346-ca55b32855fd\mama_mobile_app_qr.png",
    ]

    for dest in destinations:
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        qr_img.save(dest, format="PNG")
        print(f"Saved QR code to: {dest}")

    # Also generate a second QR that points directly to root http://10.18.209.94:5173/
    qr_root = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=16,
        border=3,
    )
    qr_root.add_data(fallback_url)
    qr_root.make(fit=True)
    qr_root_img = qr_root.make_image(
        fill_color="#E15712",
        back_color="#FFFFFF"
    ).convert("RGBA")

    if os.path.exists(logo_src):
        qr_w, qr_h = qr_root_img.size
        logo_size = int(qr_w * 0.24)
        logo = Image.open(logo_src).convert("RGBA").resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        badge_pad = 8
        badge_size = logo_size + badge_pad * 2
        badge = Image.new("RGBA", (badge_size, badge_size), (255, 255, 255, 255))
        badge.paste(logo, (badge_pad, badge_pad), logo)
        pos = ((qr_w - badge_size) // 2, (qr_h - badge_size) // 2)
        qr_root_img.paste(badge, pos)

    root_dest = r"C:\Users\Personal\.gemini\antigravity\brain\6f8f973a-532d-43b8-a346-ca55b32855fd\mama_store_qr.png"
    qr_root_img.save(root_dest, format="PNG")
    print(f"Saved root QR code to: {root_dest}")

if __name__ == "__main__":
    generate_qr()
