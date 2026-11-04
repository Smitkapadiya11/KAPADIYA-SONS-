from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]/'pinyoursite/public/rooms'
compact=root/'compact';compact.mkdir(exist_ok=True)
for p in root.glob('*.webp'):
    with Image.open(p) as image:
        if image.size!=(4096,2048):raise ValueError(f'{p.name} is not a 4K panorama')
        image.resize((2048,1024),Image.Resampling.LANCZOS).save(compact/p.name,quality=82,method=6)
