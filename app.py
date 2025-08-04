# app.py
from flask import Flask, request, jsonify, send_from_directory
# Required for cross-origin requests if frontend and backend are on different ports/domains
from flask_cors import CORS
import base64
import numpy as np
import cv2
import os

# Serve static files from the current directory
app = Flask(__name__, static_folder='.')
CORS(app)  # Enable CORS for all routes (important for development)

# --- Placeholder for your Object Detection Model/Function ---
# Replace this with your actual license plate detection logic.
# This dummy function simulates processing and returning data.


def process_image_for_license_plate(image_np):
    """
    Simulates processing an image for license plate detection and vehicle info.
    Replace this with your actual object detection and data retrieval logic.

    Args:
        image_np (numpy.ndarray): The image as an OpenCV numpy array.

    Returns:
        dict: A dictionary containing status and vehicle information.
    """
    print(
        f"Received image with shape: {image_np.shape}, dtype: {image_np.dtype}")

    # Example: Convert to grayscale and save for debugging (optional)
    # gray_image = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
    # cv2.imwrite("received_image_for_processing.jpg", image_np)
    # print("Saved received image as received_image_for_processing.jpg")

    # --- YOUR OBJECT DETECTION CODE GOES HERE ---
    # Example:
    # detected_plates = your_object_detection_model.predict(image_np)
    # license_plate_text = your_ocr_model.recognize(detected_plates[0])
    # vehicle_data = lookup_vehicle_info(license_plate_text)
    # ---------------------------------------------

    # Dummy data for demonstration
    # In a real application, you would get this data based on the detected license plate
    dummy_vehicle_info = {
        "licensePlateNumber": "XYZ7890",  # NEW DUMMY DATA
        "ownerName": "ALEXANDER SMITH",
        "registrationDate": "2022-03-20",
        "lastService": "2024-01-15",
        "vehicleAge": "02 YEARS",
        "fuelType": "ELECTRIC",
        "registrationLocation": "TEXAS, USA"
    }

    # Simulate a successful detection
    return {
        "status": "success",
        "message": "License plate detected and vehicle info retrieved.",
        "vehicle_info": dummy_vehicle_info
    }

# --- Flask Routes ---


@app.route('/')
def serve_index():
    """Serves the main HTML file."""
    return send_from_directory('.', 'index.html')


@app.route('/<path:path>')
def serve_static_files(path):
    """Serves other static files (CSS, JS)."""
    return send_from_directory('.', path)


@app.route('/process_image', methods=['POST'])
def process_image():
    """
    Receives a Base64 encoded image, processes it, and returns vehicle information.
    """
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"status": "error", "message": "No image data provided."}), 400

        # Extract Base64 string and remove the "data:image/jpeg;base64," prefix
        image_data_b64 = data['image'].split(',')[1]

        # Decode Base64 string to bytes
        image_bytes = base64.b64decode(image_data_b64)

        # Convert bytes to a NumPy array
        np_arr = np.frombuffer(image_bytes, np.uint8)

        # Decode NumPy array into an OpenCV image (BGR format)
        image_np = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if image_np is None:
            return jsonify({"status": "error", "message": "Could not decode image."}), 400

        # Call your object detection function
        result = process_image_for_license_plate(image_np)

        return jsonify(result), 200

    except Exception as e:
        print(f"Error processing image: {e}")
        return jsonify({"status": "error", "message": f"Server error: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
