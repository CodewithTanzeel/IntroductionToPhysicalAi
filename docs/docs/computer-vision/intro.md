---
title: Computer Vision
---


# Introduction to Computer Vision

Computer Vision enables Physical AI systems to **see and understand** their environment. It's the technology that allows robots, autonomous vehicles, and intelligent systems to extract meaningful information from images and video.

## What is Computer Vision?

**Computer Vision** is a field of AI that trains computers to interpret and understand visual information from the world, mimicking human vision capabilities.

### The Vision Pipeline

```
Camera → Image Capture → Preprocessing → Feature Extraction → 
Analysis/Recognition → Decision/Action
```

## Fundamental Concepts

### 1. Images as Data

Digital images are arrays of numbers:

- **Grayscale Image**: 2D array (height × width)
  - Each pixel: 0 (black) to 255 (white)
  
- **Color (RGB) Image**: 3D array (height × width × 3 channels)
  - Red, Green, Blue channels
  - Each channel: 0-255

```python
import cv2
import numpy as np

# Load image
image = cv2.imread('robot_scene.jpg')

# Image properties
height, width, channels = image.shape
print(f"Image size: {width}x{height}, Channels: {channels}")

# Access pixel at position (100, 200)
pixel = image[100, 200]  # Returns [B, G, R] values
print(f"Pixel BGR: {pixel}")
```

### 2. Color Spaces

Different representations of color:

| Color Space | Description | Use Case |
|-------------|-------------|----------|
| **RGB** | Red, Green, Blue | Display, cameras |
| **HSV** | Hue, Saturation, Value | Color-based segmentation |
| **Grayscale** | Single intensity channel | Feature detection |
| **YUV** | Luminance + Chrominance | Video compression |

```python
# Convert RGB to HSV for color detection
hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

# Detect red objects
lower_red = np.array([0, 120, 70])
upper_red = np.array([10, 255, 255])
red_mask = cv2.inRange(hsv_image, lower_red, upper_red)
```

## Core Computer Vision Tasks

### 1. Image Processing 🖼️

Basic operations to enhance and transform images:

#### **Filtering**
```python
# Gaussian blur - reduce noise
blurred = cv2.GaussianBlur(image, (5, 5), 0)

# Edge detection - find object boundaries
edges = cv2.Canny(image, 100, 200)

# Morphological operations - clean up binary images
kernel = np.ones((5,5), np.uint8)
cleaned = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
```

#### **Thresholding**
```python
# Convert to grayscale
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Binary thresholding
_, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)

# Adaptive thresholding (handles varying lighting)
adaptive = cv2.adaptiveThreshold(gray, 255, 
    cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
```

### 2. Feature Detection 🎯

Identifying distinctive points and patterns:

#### **Corner Detection**
```python
# Harris corner detector
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
corners = cv2.cornerHarris(gray, blockSize=2, ksize=3, k=0.04)

# Mark corners on image
image[corners > 0.01 * corners.max()] = [0, 0, 255]  # Red
```

#### **Keypoint Detection**
```python
# SIFT (Scale-Invariant Feature Transform)
sift = cv2.SIFT_create()
keypoints, descriptors = sift.detectAndCompute(gray, None)

# Draw keypoints
img_with_keypoints = cv2.drawKeypoints(image, keypoints, None)
```

### 3. Object Detection 📦

Finding and localizing objects in images:

#### **Classical Approaches**
```python
# Template matching
template = cv2.imread('object_template.jpg', 0)
result = cv2.matchTemplate(gray, template, cv2.TM_CCOEFF_NORMED)
min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)

# Draw bounding box
h, w = template.shape
top_left = max_loc
bottom_right = (top_left[0] + w, top_left[1] + h)
cv2.rectangle(image, top_left, bottom_right, (0, 255, 0), 2)
```

#### **Modern Deep Learning**
```python
# Using YOLOv8 for real-time object detection
from ultralytics import YOLO

model = YOLO('yolov8n.pt')  # Nano model for speed
results = model(image)

# Process detections
for result in results:
    boxes = result.boxes
    for box in boxes:
        # Get coordinates and class
        x1, y1, x2, y2 = box.xyxy[0]
        confidence = box.conf[0]
        class_id = box.cls[0]
        
        # Draw bounding box
        cv2.rectangle(image, (int(x1), int(y1)), 
                     (int(x2), int(y2)), (0, 255, 0), 2)
```

### 4. Image Segmentation 🎨

Partitioning images into meaningful regions:

```python
# Semantic segmentation - label each pixel
# Instance segmentation - separate object instances

# Simple color-based segmentation
hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
lower_blue = np.array([100, 50, 50])
upper_blue = np.array([130, 255, 255])
blue_mask = cv2.inRange(hsv, lower_blue, upper_blue)

# Apply mask to get only blue objects
blue_objects = cv2.bitwise_and(image, image, mask=blue_mask)
```

### 5. Pose Estimation 🤸

Determining position and orientation:

```python
# ArUco marker detection for pose estimation
import cv2.aruco as aruco

# Detect markers
aruco_dict = aruco.getPredefinedDictionary(aruco.DICT_6X6_250)
parameters = aruco.DetectorParameters()
detector = aruco.ArucoDetector(aruco_dict, parameters)

corners, ids, rejected = detector.detectMarkers(image)

# Estimate pose
if ids is not None:
    rvecs, tvecs, _ = aruco.estimatePoseSingleMarkers(
        corners, marker_size=0.05, 
        cameraMatrix=camera_matrix, 
        distCoeffs=dist_coeffs
    )
    
    # rvecs: rotation vectors
    # tvecs: translation vectors (x, y, z position)
```

## 3D Vision and Depth Perception

### Stereo Vision

Two cameras mimic human binocular vision:

```python
# Stereo matching for depth map
stereo = cv2.StereoBM_create(numDisparities=16, blockSize=15)
disparity = stereo.compute(left_image, right_image)

# Convert disparity to depth
# depth = (baseline * focal_length) / disparity
depth_map = (baseline * focal_length) / (disparity + 1e-6)
```

### Depth Cameras

Direct depth measurement:
- **Structured Light**: Project pattern and analyze distortion (Kinect v1)
- **Time-of-Flight (ToF)**: Measure light travel time (Kinect v2, RealSense)
- **Active Stereo**: IR stereo with projected texture (RealSense D435)

```python
# RealSense depth camera
import pyrealsense2 as rs

pipeline = rs.pipeline()
config = rs.config()
config.enable_stream(rs.stream.depth, 640, 480, rs.format.z16, 30)
config.enable_stream(rs.stream.color, 640, 480, rs.format.bgr8, 30)

pipeline.start(config)

# Get frames
frames = pipeline.wait_for_frames()
depth_frame = frames.get_depth_frame()
color_frame = frames.get_color_frame()

# Convert to numpy arrays
depth_image = np.asanyarray(depth_frame.get_data())
color_image = np.asanyarray(color_frame.get_data())

# Get distance at pixel (320, 240)
distance = depth_frame.get_distance(320, 240)
print(f"Distance: {distance} meters")
```

## Deep Learning for Computer Vision

Modern CV heavily uses neural networks:

### Convolutional Neural Networks (CNNs)

```python
# Example: Transfer learning with pre-trained model
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input, decode_predictions

# Load pre-trained model
model = MobileNetV2(weights='imagenet')

# Prepare image
img = image.load_img('photo.jpg', target_size=(224, 224))
x = image.img_to_array(img)
x = np.expand_dims(x, axis=0)
x = preprocess_input(x)

# Predict
predictions = model.predict(x)
decoded = decode_predictions(predictions, top=3)[0]

for class_name, description, probability in decoded:
    print(f"{description}: {probability*100:.2f}%")
```

### Popular CV Models

| Model | Task | Characteristics |
|-------|------|-----------------|
| **YOLO** | Object Detection | Real-time, single-stage |
| **Mask R-CNN** | Instance Segmentation | High accuracy, slower |
| **ResNet** | Image Classification | Deep residual learning |
| **U-Net** | Semantic Segmentation | Medical imaging, precise |
| **OpenPose** | Human Pose Estimation | Multi-person skeletal tracking |

## Practical Applications in Physical AI

### 1. **Autonomous Navigation**
```python
# Lane detection for self-driving
def detect_lanes(image):
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Edge detection
    edges = cv2.Canny(gray, 50, 150)
    
    # Region of interest (bottom half of image)
    mask = np.zeros_like(edges)
    height = edges.shape[0]
    polygon = np.array([[
        (0, height),
        (image.shape[1], height),
        (image.shape[1], height//2),
        (0, height//2)
    ]])
    cv2.fillPoly(mask, polygon, 255)
    masked_edges = cv2.bitwise_and(edges, mask)
    
    # Hough transform to detect lines
    lines = cv2.HoughLinesP(masked_edges, 1, np.pi/180, 
                            threshold=50, minLineLength=100, maxLineGap=50)
    
    return lines
```

### 2. **Quality Inspection**
```python
# Defect detection in manufacturing
def detect_defects(product_image, reference_image):
    # Align images
    aligned = align_images(product_image, reference_image)
    
    # Compute difference
    diff = cv2.absdiff(aligned, reference_image)
    gray_diff = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
    
    # Threshold to find defects
    _, defect_mask = cv2.threshold(gray_diff, 30, 255, cv2.THRESH_BINARY)
    
    # Find contours of defects
    contours, _ = cv2.findContours(defect_mask, 
                                    cv2.RETR_EXTERNAL, 
                                    cv2.CHAIN_APPROX_SIMPLE)
    
    # Filter small contours (noise)
    defects = [c for c in contours if cv2.contourArea(c) > 100]
    
    return defects
```

### 3. **Robotic Grasping**
```python
# Detect graspable objects and compute grasp points
def find_grasp_points(depth_image, color_image):
    # Segment objects
    objects = segment_objects(color_image)
    
    # For each object, compute grasp candidates
    grasp_points = []
    for obj_mask in objects:
        # Find object centroid
        moments = cv2.moments(obj_mask)
        cx = int(moments['m10'] / moments['m00'])
        cy = int(moments['m01'] / moments['m00'])
        
        # Get depth at centroid
        depth = depth_image[cy, cx]
        
        # Compute grasp orientation
        angle = compute_principal_axis(obj_mask)
        
        grasp_points.append({
            'position': (cx, cy, depth),
            'angle': angle,
            'confidence': 0.8
        })
    
    return grasp_points
```

## Performance Optimization

Computer vision can be computationally intensive:

### Tips for Real-Time Processing

1. **Reduce Resolution**: Process smaller images when possible
2. **ROI Processing**: Only analyze regions of interest
3. **GPU Acceleration**: Use CUDA for deep learning
4. **Model Optimization**: Use quantization, pruning
5. **Frame Skipping**: Don't process every frame

```python
# Example: Efficient processing
class EfficientDetector:
    def __init__(self):
        self.frame_skip = 3
        self.frame_count = 0
        self.last_result = None
    
    def process(self, frame):
        self.frame_count += 1
        
        # Only process every 3rd frame
        if self.frame_count % self.frame_skip == 0:
            # Resize for faster processing
            small_frame = cv2.resize(frame, (320, 240))
            self.last_result = self.detect(small_frame)
        
        return self.last_result
```

## Next Steps

Explore advanced computer vision topics:

- [Camera Calibration](./calibration) - Correcting lens distortion
- [Deep Learning for CV](./deep-learning) - CNNs and transfer learning
- [3D Reconstruction](./3d-reconstruction) - Creating 3D models from images
- [Visual SLAM](./visual-slam) - Simultaneous localization and mapping

Ready to learn how to control these systems? Continue to **[Control Systems](/docs/control-systems/intro)**.
