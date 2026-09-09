from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "public/images/codeway-reference"

MODEL_NAME = "phone-frame.png"


def make_screen_mask() -> Image.Image:
    """Extract the connected transparent display area from the old frame model."""
    model = Image.open(ASSET_DIR / MODEL_NAME).convert("RGBA")
    alpha = model.getchannel("A")
    alpha_pixels = alpha.load()
    mask = Image.new("L", model.size, 0)
    mask_pixels = mask.load()
    start = (model.width // 2, model.height // 2)
    queue = deque([start])

    while queue:
        x, y = queue.popleft()
        if x < 0 or y < 0 or x >= model.width or y >= model.height:
            continue
        if mask_pixels[x, y] or alpha_pixels[x, y] > 20:
            continue
        mask_pixels[x, y] = 255
        queue.extend(((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)))

    # The source is displayed much smaller in the browser; a tiny blur prevents
    # a hard, one-pixel seam without softening the product artwork.
    return mask.filter(ImageFilter.GaussianBlur(0.55))


def make_overlay(screen_name: str, output_name: str) -> None:
    model = Image.open(ASSET_DIR / MODEL_NAME).convert("RGBA")
    screenshot = Image.open(ASSET_DIR / screen_name).convert("RGB")
    full_mask = make_screen_mask()
    x, y, right, bottom = full_mask.getbbox()
    width, height = right - x, bottom - y

    fitted = ImageOps.fit(
        screenshot,
        (width, height),
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.5),
    )

    mask = full_mask.crop((x, y, x + width, y + height))

    overlay = Image.new("RGBA", model.size, (0, 0, 0, 0))
    overlay.paste(fitted, (x, y), mask)
    overlay.save(ASSET_DIR / output_name, optimize=True)


for screen, output in (
    ("chat-screen.jpg", "phone-screen-chat.png"),
    ("retake-screen.jpg", "phone-screen-retake.png"),
    ("learna-screen.jpg", "phone-screen-learna.png"),
):
    make_overlay(screen, output)
