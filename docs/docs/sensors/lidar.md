---
title: LiDAR
---

# LIDAR

LIDAR (Light Detection and Ranging) measures distance by emitting laser pulses and timing their return from surfaces, producing dense 3D information about the environment.[web:90][web:97] This section covers LIDAR fundamentals, major sensor types, point clouds, core processing techniques, and practical use cases in robotics and autonomous systems.[web:87][web:99]

---

## 1. LIDAR fundamentals

A LIDAR system typically includes a laser source, scanning optics, a photodetector, and timing electronics.[web:97][web:99]

- The sensor emits short laser pulses and measures the round‑trip time to compute distance: \(d \approx c \cdot t / 2\) where \(c\) is the speed of light and \(t\) is time of flight.  
- Repeating this over many directions creates a 2D or 3D sampling of the surroundings, often combined with intensity (return strength) data.[web:90][web:97]

Key characteristics:
- Range and accuracy (e.g. up to hundreds of meters, centimeter‑level accuracy).  
- Field of view (horizontal/vertical), scan pattern, and angular resolution.  
- Scan rate (e.g. 5–20 Hz) and number of channels (1D, multi‑beam).[web:87][web:95]

---

## 2. Types of LIDAR

Modern robotics mainly uses two families of LIDAR for perception.[web:88][web:91]

### 2.1 Spinning / mechanical LIDAR

- Uses rotating mirrors or the entire sensor head to sweep one or more laser beams around, often providing 360° horizontal coverage.[web:88][web:90]  
- Multi‑layer (multi‑channel) devices stack vertical beams to form 3D scans over time.

Pros:
- Wide field of view and relatively uniform scan pattern; widely used and well‑supported in software stacks.[web:90][web:99]  
Cons:
- Moving parts can wear out; bulkier, often more expensive and power‑hungry than small solid‑state units.[web:91][web:97]

### 2.2 Solid‑state LIDAR

- Uses electronic beam steering (MEMS mirrors, optical phased arrays) or flash illumination (illuminate an area and read out a sensor array) without macroscopic moving parts.[web:88][web:91]  
- Typically has limited field of view but can be compact, robust, and easier to integrate in vehicle bodies or small robots.

Pros:
- Fewer moving parts, potentially higher reliability and smaller form factor.[web:88][web:90]  
Cons:
- Often non‑uniform or application‑specific scan patterns and narrower coverage, requiring more careful placement or multiple units.[web:85][web:91]

---

## 3. Point clouds

A LIDAR scan is usually represented as a **point cloud**: a set of 3D points, each with optional attributes.[web:83][web:96]

Common point attributes:
- 3D coordinates (x, y, z) in the sensor, vehicle, or world frame.  
- Intensity/reflectivity and sometimes return time or ring index (channel).  
- Semantic labels or instance IDs after perception processing.[web:86][web:98]

Typical representations:
- **Range image**: 2D matrix indexed by azimuth/elevation containing range values (common in spinning LIDAR).  
- **Unordered point list**: set of points with no implicit structure; many processing libraries work directly on this form.[web:96][web:100]

---

## 4. Core point cloud processing techniques

LIDAR perception pipelines apply several standard steps before planning or learning algorithms.[web:82][web:94][web:96]

### 4.1 Preprocessing

- **Filtering / downsampling**: voxel grids or random sampling to reduce point count while preserving structure.[web:96]  
- **Noise and outlier removal**: statistical outlier removal, radius filtering, or temporal consistency checks.[web:89][web:94]  
- **Ground segmentation**: separate ground from obstacles using plane fitting, RANSAC, or scan‑line methods; important for vehicles and legged robots.[web:82][web:90]

### 4.2 Registration and localization

Registration aligns point clouds to each other or to a map.[web:85][web:92]

- **ICP (Iterative Closest Point)**: classic method minimizing point‑to‑point or point‑to‑plane distances between two clouds.[web:85][web:96]  
- **NDT (Normal Distributions Transform)**: models space as Gaussian distributions in cells and aligns by maximizing likelihood.  
- Used in LIDAR odometry and SLAM to estimate ego‑motion and build maps.[web:81][web:85]

### 4.3 Segmentation and object detection

Segmentation partitions clouds into meaningful regions.[web:86][web:98]

- Geometric clustering (e.g. Euclidean clustering) to extract individual obstacles.  
- Semantic segmentation (deep learning) to label each point as road, building, car, pedestrian, vegetation, etc.[web:86][web:91]  
- Instance and panoptic segmentation for distinguishing individual objects in the same class.[web:86][web:98]

---

## 5. Visualization and basic processing examples

### 5.1 Visualizing a LIDAR point cloud

Example in Python using `open3d` to load a `.pcd` file and display it:[web:96]

