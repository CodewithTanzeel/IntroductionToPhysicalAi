---
sidebar_position: 1
---

# Camera Systems

This page introduces camera sensors for robotics and Physical AI, from basic concepts (RGB) to advanced systems (event cameras), and shows how to use them in practice.[web:21][web:25]

---

## 1. Why cameras matter in Physical AI

Cameras give robots rich information about texture, color, shape, and motion at relatively low hardware cost compared to many other sensors.[web:25][web:37] With the right algorithms, the same camera can support localization, mapping, object detection, pose estimation, and human–robot interaction.[web:12][web:25]

---

## 2. Core camera concepts

Before diving into types, it helps to understand basic terms you will see in datasheets and code.[web:21][web:25]

- **Resolution**: Number of pixels, e.g. 1280×720; higher resolution captures finer details but increases compute and bandwidth.  
- **Field of view (FOV)**: Angular extent of the scene; wide FOV covers more but distorts more and reduces angular resolution.  
- **Frame rate**: Images per second (fps); higher fps captures faster motion but increases processing load.  
- **Dynamic range**: Ability to see details in bright and dark areas simultaneously.  
- **Global vs rolling shutter**: Global exposes all pixels at once (better for fast motion), rolling exposes lines sequentially (cheaper but prone to distortion).[web:25]  
- **Intrinsic vs extrinsic parameters**: Intrinsics describe the camera’s internal model; extrinsics describe its pose relative to the robot or world frame.[web:40]

---

## 3. RGB (monocular) cameras

RGB cameras output color images similar to a standard webcam, and are usually the first sensor used in robotics projects.[web:25][web:37]

### 3.1 How they work

- A lens projects the scene onto an image sensor (CMOS/CCD) covered by a color filter array (e.g. Bayer pattern) to capture red, green, and blue components.[web:21]  
- Image signal processing (ISP) converts raw sensor values to an RGB image via demosaicing, white balance, gamma correction, and compression where needed.[web:21]

### 3.2 Typical use cases

- Object detection, tracking, and classification.  
- Lane and road feature detection in autonomous driving.  
- Visual odometry and visual-inertial SLAM when combined with IMUs.[web:12][web:25]

### 3.3 Basic to intermediate pipeline

A minimal RGB processing pipeline in robotics:

1. Capture image from camera driver (e.g. ROS `image_transport`).  
2. Undistort and rectify using camera calibration parameters.  
3. Convert color/format as needed (e.g. BGR→RGB, RGB→grayscale).  
4. Run perception algorithms (feature extraction, neural networks, etc.).[web:12]

**Example (Python + OpenCV, pseudo‑ROS):**
```python
import cv2

# Open camera device
cap = cv2.VideoCapture(0)

while True:
  ok, frame = cap.read()
  if not ok:
    break

  # Resize and convert to grayscale
  gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
  small = cv2.resize(gray, (640, 360))

  # Simple edge detection
  edges = cv2.Canny(small, 50, 150)

  cv2.imshow("edges", edges)
  if cv2.waitKey(1) == 27:
    break

cap.release()
cv2.destroyAllWindows()
```

---

## 4. Stereo cameras

Stereo cameras use two (or more) synchronized lenses to estimate depth from disparity between left and right images, similar to human eyes.[web:21][web:22]

### 4.1 Principle

- Each camera sees the scene from a slightly different viewpoint separated by a baseline.[web:22]  
- After rectification, corresponding points appear on the same image row; disparity (horizontal shift) is inversely proportional to distance.  
- A stereo algorithm matches pixels or features between the two images to build a dense or semi‑dense disparity map.[web:25]

### 4.2 Pros and cons

- Pros:  
  - Passive sensing (no active illumination needed) → good outdoors.  
  - Depth from the visible scene; a single sensor head can provide both RGB and depth.[web:25]  
- Cons:  
  - Struggles with low texture, reflective, or repetitive patterns.  
  - Needs accurate baseline and calibration to avoid bad depth.[web:21][web:25]

### 4.3 Use cases in robotics

- Obstacle avoidance and free‑space estimation for ground robots and drones.  
- 3D reconstruction and mapping (stereo SLAM).  
- Bin‑picking and manipulation when combined with object pose estimation.[web:12][web:37]

---

## 5. Depth cameras (RGB‑D)

Depth cameras directly output per‑pixel distance values, often along with an aligned RGB image (RGB‑D).[web:21][web:25]

### 5.1 Main types

- **Active stereo**: Projects an infrared (IR) pattern and views it with two IR sensors for more reliable matching on low‑texture surfaces.[web:25]  
- **Structured light**: Projects a coded pattern and recovers depth from pattern deformation; accurate at short range but sensitive to sunlight and interference.[web:25]  
- **Time‑of‑flight (ToF)**: Measures phase/flight time of modulated light; can give dense depth at high frame rates but may suffer from multipath and noise.[web:21]

### 5.2 Applications

- Indoor robots and manipulators for obstacle detection and 3D scene understanding.[web:25][web:37]  
- Human skeleton tracking and gesture interfaces.  
- Object pose estimation for pick‑and‑place.

### 5.3 Data representation

- Depth images are usually single‑channel 16‑bit images where each pixel encodes distance in millimeters.[web:25]  
- Many libraries convert depth to point clouds in the robot frame for planning and mapping.[web:25][web:37]

**Example (Python + Open3D, reading a saved depth image):**
```python
import open3d as o3d
import numpy as np

depth = o3d.io.read_image("depth.png")  # 16-bit depth
rgb = o3d.io.read_image("color.png")

rgbd = o3d.geometry.RGBDImage.create_from_color_and_depth(
  rgb, depth, depth_scale=1000.0, depth_trunc=5.0, convert_rgb_to_intensity=False
)

intrinsics = o3d.camera.PinholeCameraIntrinsic(
  640, 480, fx=525, fy=525, cx=319.5, cy=239.5
)

pcd = o3d.geometry.PointCloud.create_from_rgbd_image(rgbd, intrinsics)
o3d.visualization.draw_geometries([pcd])
```

---

## 6. Event cameras (advanced)

Event cameras are neuromorphic sensors that output asynchronous “events” at each pixel when brightness changes, rather than full frames at fixed intervals.[web:24][web:36]

### 6.1 Key properties

- Each pixel independently reports changes with microsecond latency and very high dynamic range.[web:27][web:36]  
- Output is a stream of events \((x, y, t, p)\) where \(p\) is the polarity (brightness increase or decrease).  
- There is almost no data when the scene is static, and dense data at moving edges.[web:30][web:36]

### 6.2 Advantages and challenges

- Advantages:  
  - Handles fast motion without motion blur; ideal for agile drones and high‑speed inspection.[web:27][web:30]  
  - Works well in high dynamic range scenes (e.g. tunnels, night driving with headlights).[web:30]  
- Challenges:  
  - Algorithms are very different from frame‑based vision (event‑based SLAM, optical flow, reconstruction).[web:24][web:36]  
  - Tooling and ecosystems are less mature than standard RGB‑D.

### 6.3 Example applications

- Ultra‑fast obstacle avoidance and object tracking in drones.  
- Low‑latency SLAM and visual‑inertial odometry in difficult lighting.[web:30][web:33]  
- High‑speed industrial inspection where conventional cameras saturate or blur.[web:27][web:39]

---

## 7. Mounting and mechanical design

How and where you mount a camera affects both image quality and calibration stability.[web:26][web:29]

### 7.1 General guidelines

- Use **rigid mounting** to minimize vibration and shifting; avoid long flexible brackets.  
- Position cameras where the robot’s body does not frequently occlude the field of view.  
- Protect lenses with covers or enclosures, but avoid reflections and condensation inside.[web:29][web:35]

### 7.2 Coordinate frames

- Define consistent frames: camera frame, robot base, end‑effector, and world frame.  
- When mounting on an arm (eye‑in‑hand), perform hand–eye calibration to find the transform between camera and tool center point.[web:29][web:38]  
- When mounting fixed in the cell (eye‑to‑hand), calibrate between camera frame and robot base.[web:29][web:35]

---

## 8. Camera calibration

Calibration recovers the relationship between image pixels and 3D rays so your measurements and projections are accurate.[web:21][web:40]

### 8.1 Intrinsic calibration

- Determines focal lengths, principal point, and lens distortion coefficients from images of a known pattern (checkerboard, AprilTag grid, etc.).[web:40]  
- Used to undistort images and to project pixels to 3D rays, crucial for stereo, depth fusion, and accurate measurements.[web:21][web:25]

### 8.2 Extrinsic (pose) calibration

- Finds the transform between camera and robot/world frame.[web:29][web:38]  
- For robot arms, hand–eye calibration typically moves the camera through several poses relative to a calibration target and solves for the transform.  
- For fixed cameras, multiple images of a calibration board at known robot poses are used.[web:29][web:35]

### 8.3 Practical tips

- Keep the calibration target in focus and cover as much of the image as possible with varied orientations.  
- Repeat calibration if you change lens, mounting, or take a strong mechanical hit.[web:29][web:40]

**Example (OpenCV chessboard calibration skeleton):**

import cv2
import numpy as np
import glob

Prepare object points for a 9x6 chessboard with 0.025 m square size
objp = np.zeros((9*6, 3), np.float32)
objp[:, :2] = np.mgrid[0:9, 0:6].T.reshape(-1, 2) * 0.025

objpoints = []
imgpoints = []

images = glob.glob("calib_*.png")

for fname in images:
img = cv2.imread(fname)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
ret, corners = cv2.findChessboardCorners(gray, (9, 6), None)
if ret:
objpoints.append(objp)
imgpoints.append(corners)

ret, mtx, dist, rvecs, tvecs = cv2.calibrateCamera(
objpoints, imgpoints, gray.shape[::-1], None, None
)

print("Camera matrix:\n", mtx)
print("Distortion:\n", dist)

## 9. Choosing the right camera

Choosing a camera depends heavily on environment, task, and compute budget.[web:21][web:25][web:37]

| Scenario                          | Recommended sensor type                 | Notes |
|----------------------------------|-----------------------------------------|-------|
| Indoor mobile robot, moderate speed | RGB‑D (active stereo or ToF)[web:21][web:25] | Easy obstacle avoidance and mapping. |
| Outdoor UGV / drone, daylight    | Stereo or RGB + LIDAR[web:21][web:25]   | Passive stereo handles sun; LIDAR helps range. |
| Manipulation at short range      | RGB‑D or structured light[web:25][web:37] | Accurate near‑field depth for grasping. |
| High‑speed drone / inspection    | Event + RGB or event‑only[web:27][web:30] | Handles fast motion and HDR scenes. |

Key factors to consider:
- Lighting (indoor vs outdoor, HDR vs controlled).  
- Range and field of view requirements.  
- Motion speed and available compute.  
- Power and interface (USB, MIPI, Ethernet, CSI) and compatibility with your platform.[web:21][web:25]

---

## 10. Next steps

To go deeper:

- Implement a full **RGB to depth to point‑cloud** pipeline using a RealSense‑class camera or similar.[web:25][web:37]  
- Practice **intrinsic and extrinsic calibration** with OpenCV or ROS tools, and verify reprojection error.  
- Experiment with an **event camera simulator or dataset** to understand asynchronous vision concepts if you plan to explore advanced Physical AI.[web:30][web:36]

