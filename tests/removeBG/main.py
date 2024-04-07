from app.background import remove_background  
import numpy as np  
from flask import Flask, request, Response 
from PIL import Image 
import io 
import cv2  

app = Flask(__name__)  # Initializing Flask app

def process_image(image_data):
    """
    Process image data by removing background, resizing, and converting to PNG format.

    Args:
        image_data (bytes): Raw image data in bytes.

    Returns:
        bytes: Processed image data in PNG format.
    """
    # Open image from bytes and convert to RGB format
    image = Image.open(io.BytesIO(image_data)).convert('RGB')
    image = np.array(image)  # Convert to numpy array
    image = remove_background(image)  # Remove background
    
    # Ensure the image has uniform dimensions (e.g., square)
    if image.shape[0] > image.shape[1]:
        pad_size = (image.shape[0] - image.shape[1]) // 2
        padded_image = cv2.copyMakeBorder(image, 0, 0, pad_size, pad_size, cv2.BORDER_CONSTANT, value=[0, 0, 0])
    else:
        pad_size = (image.shape[1] - image.shape[0]) // 2
        padded_image = cv2.copyMakeBorder(image, pad_size, pad_size, 0, 0, cv2.BORDER_CONSTANT, value=[0, 0, 0])

    # Resize the image to the desired dimensions
    resized_image = cv2.resize(padded_image, (224, 224))
    
    # Convert back to bytes and return
    img = Image.fromarray(resized_image)
    byte_stream = io.BytesIO()
    img.save(byte_stream, format="PNG")
    return byte_stream.getvalue()

@app.route("/")  # Define route for root endpoint
def hello():
    """
    Simple route to test if the server is running.
    
    Returns:
        str: Message indicating the server is running.
    """
    return "Hello World"

@app.route("/transformers/remove_background", methods=["POST"])  # Define route for background removal endpoint
def background_removal():
    """
    Endpoint for background removal transformation.

    Accepts a POST request with an image file.

    Returns:
        Response: Processed image as a PNG.
    """
    if 'file' not in request.files:
        return {"message": "No file uploaded"}, 400
    
    file = request.files['file']
    if file.filename == '':
        return {"message": "No file selected"}, 400
    
    return Response(content=process_image(file.read()), mimetype="image/png")

if __name__ == "__main__":
    app.run(debug=True)  # Run the Flask app in debug mode
