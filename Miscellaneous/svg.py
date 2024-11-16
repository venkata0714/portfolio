from svglib.svglib import svg2rlg
from reportlab.graphics import renderPM
import cairosvg

# Create the SVG content
svg_content = """
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="planetGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="0%" stop-color="#fcbc1d" />
      <stop offset="100%" stop-color="#f89d1d" />
    </radialGradient>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
    </filter>
  </defs>
  <!-- Background Stars -->
  <rect width="500" height="500" fill="#1c1f26" />
  <circle cx="50" cy="50" r="2" fill="white" />
  <circle cx="400" cy="150" r="3" fill="white" />
  <circle cx="250" cy="300" r="2" fill="white" />
  <circle cx="450" cy="400" r="2" fill="white" />
  
  <!-- Planet -->
  <circle cx="250" cy="250" r="150" fill="url(#planetGradient)" filter="url(#blur)" />
  
  <!-- Space Explorer (Facing Back) -->
  <g>
    <!-- Helmet -->
    <ellipse cx="250" cy="200" rx="50" ry="60" fill="#f7f7f7" stroke="#333" stroke-width="2" />
    <!-- Backpack -->
    <rect x="220" y="250" width="60" height="80" rx="10" fill="#444" />
    <rect x="230" y="260" width="40" height="60" rx="5" fill="#fcbc1d" />
    <!-- Body -->
    <ellipse cx="250" cy="270" rx="40" ry="50" fill="#fcbc1d" />
    <!-- Arms -->
    <line x1="210" y1="270" x2="240" y2="270" stroke="#fcbc1d" stroke-width="8" />
    <line x1="260" y1="270" x2="290" y2="270" stroke="#fcbc1d" stroke-width="8" />
    <!-- Legs -->
    <line x1="230" y1="320" x2="230" y2="370" stroke="#fcbc1d" stroke-width="8" />
    <line x1="270" y1="320" x2="270" y2="370" stroke="#fcbc1d" stroke-width="8" />
  </g>
</svg>
"""

# Save the SVG content to a file
svg_file_path = "./space_explorer_brother.svg"
with open(svg_file_path, "w") as svg_file:
    svg_file.write(svg_content)

svg_file_path
