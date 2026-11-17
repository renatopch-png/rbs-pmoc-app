# Gerador de Reels animados RBS

    pip install numpy pillow --break-system-packages   # se faltar
    python3 tools/render.py spec.json reels/AAAA-MM-DD.mp4 reels/2026-12-26.mp4   # 3º arg = trilha (qualquer reel existente)
    ffmpeg -ss 3 -i reels/AAAA-MM-DD.mp4 -frames:v 1 -q:v 3 reels/capas/AAAA-MM-DD.jpg

spec.json: {"tag": "Categoria", "scenes": [hook, item x3-4, close]} — ver tools/exemplos/.
- hook: {"type":"hook","dur":3.5,"eyebrow","title","sub"}
- item: {"type":"item","dur":4.5,"title","body"}  (numeração automática)
- close: {"type":"close","dur":6,"title"}  (cartão com WhatsApp e site)
