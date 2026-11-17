#!/usr/bin/env python3
"""
Gera o favicon e os ícones do False Alibi a partir de um único desenho:
monograma "FA" na fonte Alfa Slab One (a mesma família de letra pesada com
serifa do título), "F" creme + "A" vermelho, sobre fundo quase preto, com
textura gasta e o traço vermelho sob o título.

Uso:
    python scripts/generate-icons.py --font caminho/AlfaSlabOne-Regular.ttf

Requer Pillow (pip install pillow). Fonte: Google Fonts, licença OFL.

Saídas:
    branding/icon-1024.png            (mestre)
    branding/favicon.ico              (16, 32, 48)
    branding/favicon-16.png, favicon-32.png, apple-touch-icon.png (180),
    branding/icon-192.png, icon-512.png
    android/app/src/main/res/mipmap-*/ic_launcher.png e ic_launcher_round.png
"""

import argparse
import os
import random

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), '..')

# Paleta do jogo
BG = (12, 10, 9)           # quase preto quente
BG_LIGHT = (34, 28, 26)    # centro da vinheta
CREAM = (222, 212, 196)    # "FALSE"
RED = (158, 28, 38)        # "ALIBI"

ANDROID_SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}


def vignette(size):
    """Fundo com vinheta: centro levemente mais claro."""
    mask = Image.new('L', (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((-size * 0.15, -size * 0.25, size * 1.15, size * 1.05), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(size * 0.18))
    return Image.composite(
        Image.new('RGB', (size, size), BG_LIGHT),
        Image.new('RGB', (size, size), BG),
        mask,
    )


def grain(size, amount, seed):
    """Ruído fino (granulado de papel)."""
    rnd = random.Random(seed)
    noise = Image.new('L', (size, size))
    noise.putdata([rnd.randint(128 - amount, 128 + amount) for _ in range(size * size)])
    return noise


def distress_mask(size, seed):
    """Máscara com falhas de tinta para letras/traço (estilo carimbo gasto)."""
    rnd = random.Random(seed)
    small = Image.new('L', (size // 6, size // 6))
    small.putdata([rnd.randint(0, 255) for _ in range((size // 6) ** 2)])
    blotch = small.resize((size, size), Image.BICUBIC).filter(ImageFilter.GaussianBlur(size / 300))
    # falhas: só os pontos mais escuros viram "buracos"
    holes = blotch.point(lambda v: 0 if v < 70 else 255)
    fine = grain(size, 127, seed + 1).point(lambda v: 0 if v < 30 else 255)
    return ImageChops.multiply(holes, fine)


def monogram_layer(size, font_path, textured):
    """Desenha F (creme) + A (vermelho) + traço vermelho, centralizados."""
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    font = ImageFont.truetype(font_path, int(size * (0.60 if textured else 0.68)))
    d = ImageDraw.Draw(layer)

    f_box = d.textbbox((0, 0), 'F', font=font)
    a_box = d.textbbox((0, 0), 'A', font=font)
    f_w, a_w = f_box[2] - f_box[0], a_box[2] - a_box[0]
    overlap = int(size * 0.035)  # letras levemente encaixadas
    total_w = f_w + a_w - overlap
    text_h = max(f_box[3], a_box[3]) - min(f_box[1], a_box[1])

    x0 = (size - total_w) // 2
    y_off = 0.04 if textured else 0.0  # deixa espaço para o traço embaixo
    y0 = (size - text_h) // 2 - min(f_box[1], a_box[1]) - int(size * y_off)

    d.text((x0 - f_box[0], y0), 'F', font=font, fill=CREAM + (255,))
    d.text((x0 + f_w - overlap - a_box[0], y0), 'A', font=font, fill=RED + (255,))

    if textured:
        # traço vermelho levemente inclinado sob as letras (como no título)
        base_y = y0 + max(f_box[3], a_box[3]) + size * 0.06
        th = size * 0.035
        x1, x2 = size * 0.17, size * 0.83
        d.polygon(
            [(x1, base_y + th * 0.9), (x2, base_y - th * 0.6),
             (x2, base_y + th * 0.2), (x1, base_y + th * 1.9)],
            fill=RED + (255,),
        )
        alpha = layer.getchannel('A')
        alpha = ImageChops.multiply(alpha, distress_mask(size, 7))
        layer.putalpha(alpha)
    return layer


def render(size, font_path, shape='square'):
    """Ícone final no tamanho pedido. Abaixo de 64 px usa versão sem textura."""
    textured = size >= 64
    work = 1024 if textured else size * 8  # desenha grande e reduz (antialias)
    base = vignette(work).convert('RGBA')
    if textured:
        # granulado leve no fundo (escurece/clareia ±, sem mudar o tom médio)
        g = grain(work, 24, 3)
        rgb = base.convert('RGB')
        rgb = ImageChops.add(rgb, Image.merge('RGB', [g] * 3), scale=1, offset=-128)
        base = rgb.convert('RGBA')
    mono = monogram_layer(work, font_path, textured)
    if shape == 'round':
        # ícone redondo corta as bordas: reduz o desenho para caber no círculo
        inner = int(work * 0.86)
        mono = mono.resize((inner, inner), Image.LANCZOS)
        pad = (work - inner) // 2
        holder = Image.new('RGBA', (work, work), (0, 0, 0, 0))
        holder.alpha_composite(mono, (pad, pad))
        mono = holder
    base.alpha_composite(mono)

    # Forma do ícone
    mask = Image.new('L', (work, work), 0)
    md = ImageDraw.Draw(mask)
    if shape == 'round':
        md.ellipse((0, 0, work - 1, work - 1), fill=255)
    elif shape == 'rounded':
        md.rounded_rectangle((0, 0, work - 1, work - 1), radius=int(work * 0.18), fill=255)
    else:
        md.rectangle((0, 0, work, work), fill=255)
    base.putalpha(mask)
    return base.resize((size, size), Image.LANCZOS)


def save(img, *parts):
    path = os.path.join(ROOT, *parts)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path)
    print('gerado:', os.path.relpath(path, ROOT))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--font', required=True, help='caminho do AlfaSlabOne-Regular.ttf')
    args = parser.parse_args()
    f = args.font

    save(render(1024, f), 'branding', 'icon-1024.png')
    save(render(512, f), 'branding', 'icon-512.png')
    save(render(192, f), 'branding', 'icon-192.png')
    save(render(180, f), 'branding', 'apple-touch-icon.png')
    save(render(32, f), 'branding', 'favicon-32.png')
    save(render(16, f), 'branding', 'favicon-16.png')

    ico_path = os.path.join(ROOT, 'branding', 'favicon.ico')
    icons = [render(s, f) for s in (16, 32, 48)]
    icons[2].save(ico_path, sizes=[(16, 16), (32, 32), (48, 48)], append_images=icons[:2])
    print('gerado:', os.path.relpath(ico_path, ROOT))

    for folder, px in ANDROID_SIZES.items():
        res = ('android', 'app', 'src', 'main', 'res', folder)
        save(render(px, f, 'rounded'), *res, 'ic_launcher.png')
        save(render(px, f, 'round'), *res, 'ic_launcher_round.png')


if __name__ == '__main__':
    main()
