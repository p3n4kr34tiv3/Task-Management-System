#!/usr/bin/env python3
"""
Script untuk membuat icon sederhana untuk Chrome Extension
Menggunakan PIL (Pillow) untuk generate icon 16x16, 48x48, dan 128x128
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    def create_icon(size, filename):
        # Buat image dengan background gradient
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Background circle dengan gradient effect
        colors = [(103, 126, 234), (118, 75, 162)]  # Purple gradient
        
        # Draw background circle
        margin = size // 8
        draw.ellipse([margin, margin, size-margin, size-margin], 
                    fill=colors[0], outline=colors[1], width=2)
        
        # Draw business icon (simplified building)
        if size >= 48:
            # Building outline
            building_margin = size // 4
            building_width = size - 2 * building_margin
            building_height = building_width * 3 // 4
            
            # Main building rectangle
            draw.rectangle([building_margin, building_margin + building_width//4, 
                          size - building_margin, size - building_margin],
                         fill='white', outline=colors[1], width=1)
            
            # Windows (for larger icons)
            if size >= 48:
                window_size = building_width // 6
                for row in range(2):
                    for col in range(2):
                        x = building_margin + window_size + col * (window_size * 2)
                        y = building_margin + building_width//3 + row * (window_size * 2)
                        draw.rectangle([x, y, x + window_size, y + window_size],
                                     fill=colors[0])
        else:
            # Simple icon for 16x16 - just the letter 'B'
            try:
                # Try to use a font
                font = ImageFont.load_default()
                text = "🏢"
                bbox = draw.textbbox((0, 0), text, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                x = (size - text_width) // 2
                y = (size - text_height) // 2
                draw.text((x, y), text, fill='white', font=font)
            except:
                # Fallback - simple rectangle
                margin = size // 3
                draw.rectangle([margin, margin, size-margin, size-margin], 
                             fill='white')
        
        img.save(filename, 'PNG')
        print(f"Icon created: {filename} ({size}x{size})")
    
    # Create icons directory if it doesn't exist
    os.makedirs('/app/chrome-extension/icons', exist_ok=True)
    
    # Generate all required icon sizes
    create_icon(16, '/app/chrome-extension/icons/icon16.png')
    create_icon(48, '/app/chrome-extension/icons/icon48.png') 
    create_icon(128, '/app/chrome-extension/icons/icon128.png')
    
    print("All icons created successfully!")
    
except ImportError:
    print("PIL (Pillow) not installed. Creating simple text-based icons instead...")
    
    # Create simple SVG icons as fallback
    svg_template = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="{center}" cy="{center}" r="{radius}" fill="url(#grad)" stroke="#764ba2" stroke-width="2"/>
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="{building_x}" y="{building_y}" width="{building_w}" height="{building_h}" fill="white" stroke="#764ba2"/>
  <text x="{center}" y="{text_y}" text-anchor="middle" fill="white" font-family="Arial" font-size="{font_size}" font-weight="bold">🏢</text>
</svg>'''
    
    sizes = [16, 48, 128]
    for size in sizes:
        center = size // 2
        radius = size // 2 - 2
        building_w = size // 3
        building_h = size // 3
        building_x = center - building_w // 2
        building_y = center - building_h // 2
        font_size = size // 4
        text_y = center + font_size // 2
        
        svg_content = svg_template.format(
            size=size, center=center, radius=radius,
            building_x=building_x, building_y=building_y,
            building_w=building_w, building_h=building_h,
            font_size=font_size, text_y=text_y
        )
        
        with open(f'/app/chrome-extension/icons/icon{size}.svg', 'w') as f:
            f.write(svg_content)
        print(f"SVG icon created: icon{size}.svg")
    
    print("SVG icons created as fallback!")