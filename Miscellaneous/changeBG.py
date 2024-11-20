from PIL import Image, ImageDraw

def add_gradient_overlay(image_path, output_path):
    """
    Adds a linear gradient overlay to an image and saves the result.

    :param image_path: Path to the input image.
    :param output_path: Path to save the output image with gradient overlay.
    """
    # Open the image
    image = Image.open(image_path).convert("RGBA")
    width, height = image.size

    # Create a gradient overlay
    gradient = Image.new("RGBA", (width, height), color=0)
    draw = ImageDraw.Draw(gradient)

    # Define gradient steps
    gradient_steps = [
        (0, (0, 0, 0, int(0.8 * 255))),
        (height // 8, (0, 0, 0, int(0.7 * 255))),
        (height // 4, (0, 0, 0, int(0.6 * 255))),
        (height // 2, (0, 0, 0, int(0.5 * 255))),
        (3 * height // 4, (0, 0, 0, int(0.4 * 255))),
        (7 * height // 8, (0, 0, 0, int(0.2 * 255))),
        (height, (0, 0, 0, int(0.1 * 255))),
    ]

    # Draw the gradient
    for i in range(len(gradient_steps) - 1):
        start_y, start_color = gradient_steps[i]
        end_y, end_color = gradient_steps[i + 1]
        for y in range(start_y, end_y):
            alpha = (y - start_y) / (end_y - start_y)
            color = tuple(
                int(start_color[c] + alpha * (end_color[c] - start_color[c]))
                for c in range(4)
            )
            draw.line([(0, y), (width, y)], fill=color)

    # Composite the gradient overlay with the original image
    combined = Image.alpha_composite(image, gradient)

    # Save the result
    combined.convert("RGB").save(output_path, "JPEG")

# Example usage
input_image_path = "Miscellaneous\home-bg.jpg"  # Replace with your input image path
output_image_path = "Miscellaneous\home-bg-overlay.jpg"  # Replace with desired output path
add_gradient_overlay(input_image_path, output_image_path)
