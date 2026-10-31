from PIL import Image, ImageDraw, ImageFont
import os

BASE = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.path.join(BASE, 'shots')
BG = (15, 23, 42)
TEXT = (248, 250, 252)
MUTED = (148, 163, 184)
ACCENT = (147, 197, 253)
BORDER = (51, 65, 85)

FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FONT_REG = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

META = {
    'v1': ('A', 'Tabla limpia', 'Densidad alta, header claro y color reservado al estado.'),
    'v2': ('B', 'Stock primero', 'El nivel de stock manda: barras, mínimos y alertas.'),
    'v3': ('C', 'Cards', 'Catálogo visual, más aire y mejor lectura en mobile.'),
    'v4': ('D', 'Master-detail', 'Lista + detalle para gestionar sin cambiar de pantalla.'),
    'v5': ('E', 'Híbrida A + B', 'La tabla limpia de A con la barra de stock de B. Densidad y decisión.'),
}


def font(path, size):
    return ImageFont.truetype(path, size)


def add_border(image, width=2, color=BORDER):
    canvas = Image.new('RGB', (image.width + width * 2, image.height + width * 2), color)
    canvas.paste(image, (width, width))
    return canvas


for variant, (letter, name, tagline) in META.items():
    desktop = Image.open(os.path.join(SHOTS, f'{variant}-desktop.png')).convert('RGB')
    mobile = Image.open(os.path.join(SHOTS, f'{variant}-mobile.png')).convert('RGB')

    desktop_w = 1300
    desktop_h = round(desktop.height * desktop_w / desktop.width)
    desktop = desktop.resize((desktop_w, desktop_h), Image.LANCZOS)

    mobile_w = 280
    mobile_h = round(mobile.height * mobile_w / mobile.width)
    mobile = mobile.resize((mobile_w, mobile_h), Image.LANCZOS)

    header_h = 120
    image_top = 150
    width = 1700
    height = image_top + max(desktop_h, mobile_h) + 40

    board = Image.new('RGB', (width, height), BG)
    draw = ImageDraw.Draw(board)
    draw.rectangle([0, 0, 5, height], fill=(37, 99, 235))

    draw.text((40, 26), f'PROPUESTA {letter}', font=font(FONT_BOLD, 12), fill=ACCENT)
    draw.text((40, 46), name, font=font(FONT_BOLD, 30), fill=TEXT)
    draw.text((40, 90), tagline, font=font(FONT_REG, 15), fill=MUTED)

    draw.text((40, 128), 'ESCRITORIO · 1440 PX', font=font(FONT_BOLD, 10), fill=MUTED)
    draw.text((1370, 128), 'MOBILE · 390 PX', font=font(FONT_BOLD, 10), fill=MUTED)

    board.paste(add_border(desktop), (40, image_top))
    board.paste(add_border(mobile), (1370, image_top))

    draw.text(
        (width - 40, height - 24),
        'Mockup estático · datos de ejemplo · StockFX',
        font=font(FONT_REG, 10),
        fill=(100, 116, 139),
        anchor='rs',
    )

    output = os.path.join(SHOTS, f'board-{variant}.png')
    board.save(output)
    print(output, board.size)
