---
sidebar_position: 2
---

# Camera Calibration

Camera calibration is the process of finding a mathematical model that describes how a camera projects 3D points in the world onto 2D image pixels. This model is essential for accurate 3D reconstruction, pose estimation, and sensor fusion, because it allows conversion between pixel coordinates and rays in 3D space.

In robotics and Physical AI, properly calibrated cameras enable precise measurements, alignment with other sensors (IMU, LIDAR), and robust perception algorithms such as stereo vision and visual SLAM.

---

## Intrinsic and Extrinsic Parameters

A calibrated camera model is typically split into **intrinsic** and **extrinsic** parameters.

### Intrinsic Parameters

Intrinsic parameters describe the camera’s internal geometry and optics:

- **Focal lengths** \(f_x, f_y\): Effective focal length in pixel units along x and y.  
- **Principal point** \((c_x, c_y)\): The projection of the optical center on the image plane.  
- **Skew**: Shear between x and y axes (usually zero for modern cameras).  
- **Distortion coefficients**: Parameters describing lens distortion (radial and tangential).

The intrinsic matrix is often written as:

\[
K =
\begin{bmatrix}
f_x & s   & c_x \\
0   & f_y & c_y \\
0   & 0   & 1
\end{bmatrix}
\]

### Extrinsic Parameters

Extrinsic parameters describe the **pose of the camera** relative to a world or robot coordinate frame:

- **Rotation** \(R\): 3×3 rotation matrix.  
- **Translation** \(t\): 3×1 translation vector.

They define how to transform a 3D point from world coordinates into the camera coordinate system.

---

## Lens Distortion Models

Real lenses introduce distortions that must be corrected for accurate geometry.

### Radial Distortion

Radial distortion bends straight lines, especially near image edges:

- **Barrel distortion**: Lines bulge outward.  
- **Pincushion distortion**: Lines pinch inward.

A common radial model uses coefficients \(k_1, k_2, k_3\), applied to the normalized radius \(r\).

### Tangential Distortion

Tangential distortion occurs if the lens and sensor are not perfectly aligned:

- Modeled with coefficients \(p_1, p_2\).  
- Causes slight shearing and asymmetry in the image.

These coefficients are typically estimated alongside intrinsics during calibration and later used to **undistort** images.

---

## Calibration Patterns

Calibration usually relies on a known physical pattern with precisely measured geometry.

### Checkerboard

The most common pattern is a **checkerboard**:

- Alternating black and white squares of known size.  
- Corner points (square intersections) form a regular grid.  
- Easy to detect and robust for a wide range of viewing angles.

### Other Patterns

- **Circle grids**: Symmetric or asymmetric circles; useful when corner detection is difficult.  
- **ArUco / AprilTag boards**: Fiducial markers with unique IDs; useful for pose estimation and multi-camera setups.

---

## Calibration Procedure (Step by Step)

The typical calibration workflow with a checkerboard and OpenCV is:

1. **Prepare the pattern**  
   - Print or manufacture a checkerboard with known square size (e.g. 25 mm).  
   - Ensure it is flat and rigid.

2. **Capture images**  
   - Take multiple images of the checkerboard from different distances, orientations, and positions.  
   - Ensure the board covers different parts of the image and is tilted in various ways.

3. **Detect corners**  
   - For each calibration image, detect the internal checkerboard corners.  
   - Refine corner locations for subpixel accuracy.

4. **Build correspondence sets**  
   - For each image, create:
     - A set of 3D points in the checkerboard frame (known grid coordinates).  
     - The corresponding 2D pixel coordinates of detected corners.

5. **Run calibration**  
   - Use OpenCV’s calibration function to estimate intrinsics, distortion coefficients, and extrinsics for each image.

6. **Evaluate and refine**  
   - Check the reprojection error to assess calibration quality.  
   - Remove outlier images or retake images if error is too high.

7. **Undistort and save**  
   - Use the resulting parameters to undistort images.  
   - Save the camera matrix and distortion coefficients for use in your pipeline.

---

## OpenCV Calibration Example

Below is a minimal example in Python-style code using OpenCV to calibrate a single camera with a checkerboard:
```python
import cv2
import numpy as np
import glob

# Chessboard parameters
CHECKERBOARD = (9, 6)  # number of internal corners (columns, rows)
SQUARE_SIZE = 0.025  # square size in meters

# Prepare 3D object points for the checkerboard
objp = np.zeros((CHECKERBOARD[0] * CHECKERBOARD[1], 3), np.float32)
objp[:, :2] = np.mgrid[0:CHECKERBOARD[0], 0:CHECKERBOARD[1]].T.reshape(-1, 2)
objp *= SQUARE_SIZE

objpoints = []  # 3D points in checkerboard frame
imgpoints = []  # 2D points in image frame

images = glob.glob("calib_images/*.png")

for fname in images:
   img = cv2.imread(fname)
   gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

   # Find checkerboard corners
   ret, corners = cv2.findChessboardCorners(gray, CHECKERBOARD, None)

   if ret:
      # Refine corner locations
      criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER,
               30, 0.001)
      corners_sub = cv2.cornerSubPix(
         gray, corners, (11, 11), (-1, -1), criteria
      )

      objpoints.append(objp)
      imgpoints.append(corners_sub)

# Run calibration
ret, camera_matrix, dist_coeffs, rvecs, tvecs = cv2.calibrateCamera(
   objpoints, imgpoints, gray.shape[::-1], None, None
)

print("Camera matrix:\n", camera_matrix)
print("Distortion coefficients:\n", dist_coeffs)

# Example: undistort an image
img = cv2.imread(images[0])
h, w = img.shape[:2]
new_cam_mtx, roi = cv2.getOptimalNewCameraMatrix(
   camera_matrix, dist_coeffs, (w, h), 1, (w, h)
)

undistorted = cv2.undistort(img, camera_matrix, dist_coeffs, None, new_cam_mtx)
cv2.imwrite("undistorted.png", undistorted)
```

This skeleton can be adapted for your documentation with comments and diagrams showing how patterns, rays, and projections relate.

---

## Stereo Camera Calibration

For stereo setups, calibration also needs the **relative pose** between the two cameras.

### Additional Steps

1. Calibrate each camera individually (intrinsics + distortion).  
2. Capture synchronized pairs of images of the checkerboard.  
3. Detect corners in both left and right images.  
4. Run **stereo calibration** to estimate:
   - Rotation and translation between cameras.  
   - Essential and fundamental matrices.  
5. Use **stereo rectification** to align epipolar lines, which simplifies stereo matching.

OpenCV provides `stereoCalibrate` and `stereoRectify` for this extended process.

---

## Visualization and Intuition

Conceptual diagram of calibration:

World Checkerboard Points (3D)
→ Projected through Camera Model (K, R, t)
→ Image Plane (2D Pixels)

Optimization:
Minimize difference between
observed 2D corners and
projected 3D corners
by adjusting K, distortion, R, t

text

Intuitively, calibration “bends” an approximate camera model until it best explains the observed corner locations across all images.

---

## Practical Tips

When calibrating cameras for robotics:

1. **Good coverage**  
   - Move the checkerboard to different parts of the image and at various distances and tilts.  
   - Avoid using only front-facing, centered views.

2. **Focus and exposure**  
   - Ensure sharp, well-exposed images; blurred corners reduce accuracy.

3. **Board quality**  
   - Use a rigid, flat board; warped printouts introduce systematic errors.

4. **Check reprojection error**  
   - Aim for a low average reprojection error (e.g., sub-pixel if possible).  
   - Remove clearly bad images and recalibrate if needed.

5. **Save parameters**  
   - Store intrinsics, distortion, and extrinsics in configuration files (YAML/JSON) for later use in your camera, stereo, or SLAM pipelines.

---

## Next Steps

Once your cameras are calibrated:

- Use **[Camera Systems](./cameras.md)** to learn how to build full perception pipelines.  
- Combine calibration with **[3D Reconstruction](./3d-reconstruction.md)** for mapping and scene modeling.  
- Integrate camera parameters into **[Sensor Fusion](./fusion.md)** and **[ROS-based](./ros-intro.md)** systems for accurate, multi-sensor robotics.