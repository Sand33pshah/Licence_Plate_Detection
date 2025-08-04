// Get references to the HTML elements
const videoFeed = document.getElementById('videoFeed');
const startCameraButton = document.getElementById('startCameraButton');
const stopCameraButton = document.getElementById('stopCameraButton');
const capturedCanvas = document.getElementById('capturedCanvas');
const captureButton = document.getElementById('captureButton');
const messageBox = document.getElementById('messageBox');
const messageText = document.getElementById('messageText');

const ctx = capturedCanvas.getContext('2d');

// References for vehicle info display
const licensePlateNumber = document.getElementById('licensePlateNumber'); // NEW
const ownerName = document.getElementById('ownerName');
const registrationDate = document.getElementById('registrationDate');
const lastService = document.getElementById('lastService');
const vehicleAge = document.getElementById('vehicleAge');
const fuelType = document.getElementById('fuelType');
const registrationLocation = document.getElementById('registrationLocation');


// Function to display messages to the user
function showMessage(message, type = 'warning') {
  messageText.textContent = message;
  messageBox.style.display = 'block';
  // Remove previous type classes
  messageBox.classList.remove('error');
  if (type === 'error') {
    messageBox.classList.add('error');
  }
}

// Function to hide messages
function hideMessage() {
  messageBox.style.display = 'none';
}

// Function to update vehicle information display
function updateVehicleInfo(data) {
  licensePlateNumber.textContent = data.licensePlateNumber || 'N/A'; // NEW
  ownerName.textContent = data.ownerName || 'N/A';
  registrationDate.textContent = data.registrationDate || 'N/A';
  lastService.textContent = data.lastService || 'N/A';
  vehicleAge.textContent = data.vehicleAge || 'N/A';
  fuelType.textContent = data.fuelType || 'N/A';
  registrationLocation.textContent = data.registrationLocation || 'N/A';
}

// Function to draw placeholder text on canvas
function drawCanvasPlaceholder() {
  // Only draw if canvas has valid dimensions (set by CSS or video metadata)
  // We'll use the clientWidth/clientHeight for drawing context, as the CSS defines visual size
  const width = capturedCanvas.clientWidth;
  const height = capturedCanvas.clientHeight;

  if (width > 0 && height > 0) {
    ctx.clearRect(0, 0, width, height);
    ctx.font = '16px "Share Tech Mono"';
    ctx.fillStyle = 'rgba(0, 255, 204, 0.6)'; // Aqua glow color
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AWAITING FRAME CAPTURE...', width / 2, height / 2);
  }
}

// Event listener for the "Start Camera" button
startCameraButton.addEventListener('click', async () => {
  hideMessage(); // Clear any previous messages

  // Check if media devices are supported by the browser
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showMessage('SYSTEM ERROR: Browser does not support camera access. Upgrade required.', 'error');
    return;
  }

  try {
    // Request access to the user's camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Set the video source to the camera stream
    videoFeed.srcObject = stream;

    // Enable the capture button once the camera starts playing
    videoFeed.onloadedmetadata = () => {
      videoFeed.play();
      captureButton.disabled = false;
      stopCameraButton.disabled = false; // Enable stop button
      startCameraButton.disabled = true; // Disable start button

      // Set canvas internal drawing resolution to match video's native resolution
      // This ensures image quality when drawn, while CSS handles visual scaling
      capturedCanvas.width = videoFeed.videoWidth;
      capturedCanvas.height = videoFeed.videoHeight;
      drawCanvasPlaceholder(); // Redraw placeholder after canvas resize
    };

    console.log('SYSTEM LOG: Camera activated successfully.');

    // Populate with dummy data for now (including license plate)
    updateVehicleInfo({
      licensePlateNumber: 'AB12CD3456', // NEW DUMMY DATA
      ownerName: 'JOHN DOE',
      registrationDate: '2020-05-15',
      lastService: '2024-06-01',
      vehicleAge: '04 YEARS',
      fuelType: 'PETROL',
      registrationLocation: 'CALIFORNIA, USA'
    });

  } catch (err) {
    // Handle different types of errors
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      showMessage('ACCESS DENIED: Camera permission required. Check browser settings.', 'error');
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      showMessage('HARDWARE ERROR: No camera device detected.', 'error');
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      showMessage('RESOURCE CONFLICT: Camera in use by another process.', 'error');
    } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
      showMessage('CONFIGURATION ERROR: Camera resolution constraints not met.', 'error');
    } else {
      showMessage(`UNKNOWN ERROR: ${err.message}`, 'error');
    }
    console.error('SYSTEM ERROR: Failed to access camera:', err);
  }
});

// Event listener for the "Stop Webcam Feed" button
stopCameraButton.addEventListener('click', () => {
  if (videoFeed.srcObject) {
    const tracks = videoFeed.srcObject.getTracks();
    tracks.forEach(track => track.stop()); // Stop all tracks in the stream
    videoFeed.srcObject = null; // Disconnect the video element from the stream
    videoFeed.load(); // Reload video element to show black screen
    console.log('SYSTEM LOG: Camera feed terminated.');

    // Reset button states
    startCameraButton.disabled = false;
    stopCameraButton.disabled = true;
    captureButton.disabled = true;
    // Reset canvas internal drawing dimensions, CSS will handle visual size
    capturedCanvas.width = 1; // Set to a minimal value to clear it
    capturedCanvas.height = 1;
    drawCanvasPlaceholder(); // Redraw placeholder
    showMessage('FEED TERMINATED: Camera is now offline.', 'warning');

    // Clear displayed vehicle info
    updateVehicleInfo({
      licensePlateNumber: 'N/A',
      ownerName: 'N/A',
      registrationDate: 'N/A',
      lastService: 'N/A',
      vehicleAge: 'N/A',
      fuelType: 'N/A',
      registrationLocation: 'N/A'
    });

  } else {
    showMessage('SYSTEM WARNING: No active camera feed to stop.', 'warning');
  }
});


// Event listener for the "Capture Frame" button
captureButton.addEventListener('click', () => {
  if (videoFeed.readyState === videoFeed.HAVE_ENOUGH_DATA) {
    // Draw the current frame from the video onto the canvas
    // Note: The video feed is mirrored, so we need to draw it mirrored to get a normal image
    ctx.clearRect(0, 0, capturedCanvas.width, capturedCanvas.height);
    ctx.drawImage(videoFeed, 0, 0, capturedCanvas.width, capturedCanvas.height);

    // Get image as base64 JPEG
    const imageDataUrl = capturedCanvas.toDataURL('image/jpeg', 0.9);
    console.log('TRANSMITTING DATA: Captured image data (first 100 chars):', imageDataUrl.substring(0, 100) + '...');

    // --- START: Fetch API call to send image to Flask backend ---
    showMessage('TRANSMITTING DATA: Sending frame to server for processing...', 'warning');
    fetch('/process_image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: imageDataUrl }) // Send Base64 image data
    })
      .then(response => {
        if (!response.ok) {
          // Check if response is not OK (e.g., 404, 500)
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Parse JSON response from backend
      })
      .then(data => {
        console.log('SERVER RESPONSE: Received from backend:', data);
        if (data.status === 'success') {
          updateVehicleInfo(data.vehicle_info); // Update UI with actual data
          showMessage('PROCESSING COMPLETE: Vehicle data updated.', 'success');
        } else {
          showMessage(`PROCESSING FAILED: ${data.message || 'Unknown error from server.'}`, 'error');
        }
      })
      .catch(error => {
        console.error('TRANSMISSION ERROR: Failed to send image to backend or process response:', error);
        showMessage('SERVER OFFLINE: Image processing failed. Check server connection.', 'error');
      });
    // --- END: Fetch API call ---

  } else {
    showMessage('SYSTEM WARNING: Live feed not stable. Awaiting data stream.', 'warning');
  }
});

// Initial state: set up placeholder and disable buttons
window.onload = () => {
  // Set initial canvas drawing dimensions to a small value, CSS will control visual size
  capturedCanvas.width = 1;
  capturedCanvas.height = 1;
  drawCanvasPlaceholder(); // Draw placeholder based on visual size
  captureButton.disabled = true;
  stopCameraButton.disabled = true;
  // Clear all info on load
  updateVehicleInfo({
    licensePlateNumber: 'N/A',
    ownerName: 'N/A',
    registrationDate: 'N/A',
    lastService: 'N/A',
    vehicleAge: 'N/A',
    fuelType: 'N/A',
    registrationLocation: 'N/A'
  });
};
