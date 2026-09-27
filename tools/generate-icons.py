#!/usr/bin/env python3
"""產生擴充功能圖示（側欄 + 摘要線）。用法：python3 tools/generate-icons.py"""
from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "icons"


def draw_icon(canvas: int) -> Image.Image:
    img = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    pad = canvas * 6 // 100
    radius = canvas * 22 // 100
    bg = (22, 42, 50, 255)
    d.rounded_rectangle(
        [pad, pad, canvas - pad - 1, canvas - pad - 1],
        radius=radius,
        fill=bg,
    )

    accent = (110, 196, 176, 255)
    line = (240, 246, 244, 255)

    # 左側側欄
    bar = [
        canvas * 22 // 100,
        canvas * 24 // 100,
        canvas * 34 // 100,
        canvas * 76 // 100,
    ]
    d.rounded_rectangle(bar, radius=max(2, canvas // 18), fill=accent)

    # 右側摘要線（兩或三條，小尺寸減少）
    lx0 = canvas * 44 // 100
    thickness = max(3, canvas * 7 // 100)
    specs = [
        (0.30, 0.44),
        (0.46, 0.36),
        (0.62, 0.28),
    ]
    if canvas <= 64:
        specs = specs[:2]
        specs = [(0.34, 0.40), (0.54, 0.30)]

    for yf, length in specs:
        y = int(canvas * yf)
        x1 = int(lx0 + canvas * length)
        d.rounded_rectangle(
            [lx0, y, x1, y + thickness],
            radius=max(2, thickness // 2),
            fill=line,
        )

    return img


def export(size: int) -> Path:
    # 4x 超採樣後縮放，邊緣較平滑
    hi = draw_icon(size * 4)
    out = hi.resize((size, size), Image.Resampling.LANCZOS)
    path = OUT / f"icon{size}.png"
    out.save(path, "PNG", optimize=True)
    return path


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for size in (16, 32, 48, 128):
        path = export(size)
        print(f"wrote {path.relative_to(ROOT)} ({path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
