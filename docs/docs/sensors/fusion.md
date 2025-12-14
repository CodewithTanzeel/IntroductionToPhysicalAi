---
title: Sensor Fusion
---


# Sensor Fusion

Sensor fusion combines data from multiple sensors to estimate a robot’s state (position, velocity, orientation) more accurately and robustly than any single sensor alone.[web:41][web:45] This section moves from simple complementary filters to Kalman filters and EKFs, with IMU–GPS–vision examples you can adapt in your own code.[web:42][web:48]

---

## 1. Why sensor fusion?

Different sensors have complementary strengths and weaknesses:

- **IMU** (accelerometers, gyros, sometimes magnetometers): high‑rate motion information but drifts over time.  
- **GPS / GNSS**: absolute global position but low rate, noisy, and unreliable in urban canyons, tunnels, or indoors.[web:42][web:45]  
- **Vision** (monocular, stereo, RGB‑D): rich environmental features and relative motion, but can fail in poor lighting, textureless or dynamic scenes.[web:43][web:48]

Sensor fusion algorithms use probabilistic models to combine these data streams, reducing noise and drift while handling outages and inconsistencies.[web:41][web:51]

---

## 2. Estimation basics

Most fusion algorithms follow the same conceptual model:

- **State**: vector describing what you want to estimate (e.g. position, velocity, orientation, biases).  
- **Process model**: how the state evolves over time (often derived from robot kinematics and IMU equations).  
- **Measurement model**: how each sensor’s readings relate to the state (e.g. GPS gives position; accelerometer measures linear acceleration plus gravity).[web:48][web:58]

Noise is modeled as random variables, and the estimator tries to find the most likely state given all measurements so far, updating its belief whenever new sensor data arrives.[web:41][web:45]

---

## 3. Complementary filters (basic)

Complementary filters are simple fusion schemes that combine high‑frequency and low‑frequency information from different sensors.[web:46][web:57]

### 3.1 Typical use: IMU attitude

- Gyroscope: good short‑term angular rate, integrates to orientation but drifts at low frequency.  
- Accelerometer (and magnetometer): noisy at high frequency but gives a long‑term reference for tilt and heading.[web:49][web:57]

A basic complementary filter for roll/pitch blends them:

- High‑pass filtered gyro orientation (fast changes, poor DC).  
- Low‑pass filtered accelerometer orientation (slow changes, good DC).[web:46][web:57]

### 3.2 Simple discrete‑time form

For a 1D angle $\theta$:

$$
\theta_{\textrm{gyro}}(k) = \theta(k-1) + \omega(k)\Delta t
$$

$$
\theta(k) = \alpha\,(\theta_{\textrm{gyro}}(k)) + (1-\alpha)\,\theta_{\textrm{acc}}(k)
$$

where \(\omega\) is gyro rate, \(\theta_{\textrm{acc}}\) is angle from accelerometer, and \(\alpha \in [0,1]\) is a tuning parameter.[web:49][web:57]

- Larger \(\alpha\): trust gyro more (faster response, more drift).  
- Smaller \(\alpha\): trust accelerometer more (more stable, more noise and lag).[web:46][web:49]

### 3.3 When to use

- Embedded systems with limited compute (microcontrollers).  
- Attitude estimation for small robots or drones when full Kalman filters are overkill.[web:46][web:57]  
- As a baseline or fallback estimator.

---

## 4. Kalman filter (KF) (intermediate)

The (linear) Kalman filter is an optimal recursive estimator for linear systems with Gaussian noise.[web:41][web:45]

### 4.1 Linear models

State and measurement models:

\[
x_k = A x_{k-1} + B u_k + w_k
\]

\[
z_k = H x_k + v_k
\]

- \(x_k\): state at time \(k\)  
- \(u_k\): control input (e.g. commanded acceleration)  
- \(z_k\): measurement vector  
- \(w_k, v_k\): zero‑mean Gaussian process and measurement noise with covariances \(Q, R\).[web:48][web:58]

### 4.2 Predict–update steps

Each iteration:

1. **Prediction**  
   - Predict state: \(\hat{x}_{k|k-1} = A \hat{x}_{k-1|k-1} + B u_k\)  
   - Predict covariance: \(P_{k|k-1} = A P_{k-1|k-1} A^\top + Q\)

2. **Update**  
   - Innovation: \(y_k = z_k - H \hat{x}_{k|k-1}\)  
   - Innovation covariance: \(S_k = H P_{k|k-1} H^\top + R\)  
   - Kalman gain: \(K_k = P_{k|k-1} H^\top S_k^{-1}\)  
   - Update state: \(\hat{x}_{k|k} = \hat{x}_{k|k-1} + K_k y_k\)  
   - Update covariance: \(P_{k|k} = (I - K_k H)P_{k|k-1}\)[web:41][web:48]

### 4.3 Use cases

- 1D or 2D tracking where dynamics and measurements are roughly linear (e.g. constant‑velocity model with noisy position measurements).  
- Sensor fusion for slow‑moving robots or simplified axes.[web:45][web:51]

---

## 5. Extended Kalman Filter (EKF) (intermediate to advanced)

Most robot systems are nonlinear (orientation on SO(3), GPS in geodetic coordinates, etc.), so EKF linearizes the model around the current estimate.[web:42][web:48]

### 5.1 Nonlinear models

\[
x_k = f(x_{k-1}, u_k) + w_k
\]

\[
z_k = h(x_k) + v_k
\]

- \(f(\cdot)\): nonlinear process model derived from motion equations.  
- \(h(\cdot)\): nonlinear measurement model (e.g. GPS converting world pose to lat‑lon, camera projecting 3D points to pixels).[web:48][web:58]

EKF replaces matrices \(A\) and \(H\) with Jacobians of \(f\) and \(h\) evaluated at the current estimate.[web:42][web:48]

### 5.2 EKF steps

1. **Prediction**  
   - \(\hat{x}_{k|k-1} = f(\hat{x}_{k-1|k-1}, u_k)\)  
   - \(F_k = \frac{\partial f}{\partial x}\big|_{\hat{x}_{k-1|k-1},u_k}\)  
   - \(P_{k|k-1} = F_k P_{k-1|k-1} F_k^\top + Q\)

2. **Update**  
   - \(\hat{z}_k = h(\hat{x}_{k|k-1})\)  
   - \(H_k = \frac{\partial h}{\partial x}\big|_{\hat{x}_{k|k-1}}\)  
   - Innovation: \(y_k = z_k - \hat{z}_k\)  
   - \(S_k = H_k P_{k|k-1} H_k^\top + R\)  
   - \(K_k = P_{k|k-1} H_k^\top S_k^{-1}\)  
   - \(\hat{x}_{k|k} = \hat{x}_{k|k-1} + K_k y_k\)  
   - \(P_{k|k} = (I - K_k H_k) P_{k|k-1}\)[web:42][web:58]

### 5.3 Typical state for mobile robots

A common EKF localization state:

\[
x = [p_x, p_y, p_z, v_x, v_y, v_z, q_w, q_x, q_y, q_z, b_{g_x}, b_{g_y}, b_{g_z}, b_{a_x}, b_{a_y}, b_{a_z}]^\top
\]

where \(p\) is position, \(v\) velocity, \(q\) orientation quaternion, and \(b_g, b_a\) gyro and accelerometer biases.[web:58][web:54]

---

## 6. Fusing IMU and GPS

IMU–GPS fusion is classic: IMU gives high‑frequency relative motion; GPS provides low‑frequency absolute position.[web:42][web:45]

### 6.1 Roles of each sensor

- **IMU**: integrate accelerations and angular rates to propagate pose between GPS readings; captures vehicle dynamics at high rates (e.g. 100–200 Hz).[web:42][web:51]  
- **GPS**: correct long‑term drift in position and sometimes velocity at a lower rate (e.g. 1–10 Hz).[web:45][web:58]

### 6.2 Basic EKF scheme

- **Process model**: Propagate position and velocity using IMU‑derived specific force, compensate gravity, and update orientation with integrated gyro.[web:48][web:58]  
- **Measurement model**: At each GPS update, compare predicted position (in ENU/NED or ECEF coordinates) to GPS‑derived position and correct the state.[web:42][web:58]

### 6.3 Practical considerations

- Convert GPS data to a local Cartesian frame (e.g. ENU) before fusion.  
- Model GPS outages by skipping measurement updates and inflating covariance.  
- Tune \(Q\) (IMU noise/bias) and \(R\) (GPS noise) carefully to avoid over‑ or under‑trusting either source.[web:42][web:58]

---

## 7. Fusing IMU and vision

IMU–vision fusion is the core of visual‑inertial odometry (VIO) and many modern SLAM systems.[web:48][web:54]

### 7.1 Why combine them?

- Vision gives drift‑reduced relative pose by tracking features across frames but struggles with fast motion and textureless scenes.  
- IMU provides accurate short‑term motion cues and helps disambiguate scale and motion blur; fusion stabilizes tracking and enables robust pose estimation.[web:48][web:54]

### 7.2 Filter‑based VIO

- **State**: pose, velocity, IMU biases, and sometimes landmark positions.  
- **Measurements**: 2D feature positions in images; projection of 3D landmarks is modeled in \(h(\cdot)\).  
- EKF updates run when new frames arrive; IMU integration runs between frames as prediction.[web:48][web:54]

Factor‑graph or optimization‑based VIO systems (e.g. sliding‑window bundle adjustment) extend this idea with batch optimization but follow the same probabilistic principles.[web:54]

---

## 8. Implementation patterns (code‑level structure)

Below is a minimal pseudocode structure you can adapt for EKF‑style IMU–GPS fusion:[web:47][web:50][web:53]

```python
state = init_state_from_gps_and_imu()
P = init_covariance()

while running:
   t, imu = read_imu()  # high-rate
   dt = t - state.t
   state, F = propagate_state_with_imu(state, imu, dt)
   P = F @ P @ F.T + Q  # process noise

   if new_gps_available():
      gps = read_gps()
      z, R = gps_measurement_and_cov(gps)
      z_hat, H = predict_gps_measurement(state)
      y = z - z_hat             # innovation
      S = H @ P @ H.T + R
      K = P @ H.T @ np.linalg.inv(S)
      state.vec = state.vec + K @ y
      P = (np.eye(len(P)) - K @ H) @ P
```

For complementary filters on microcontrollers, the loop is much simpler: integrate gyro, compute accelerometer‑based tilt, and blend with a tunable \(\alpha\).[web:49][web:57]

---

## 9. Practical fusion tips

Common issues and how to avoid them:

- **Bad time synchronization**: Always align timestamps between sensors; use hardware time sync if possible.[web:41][web:58]  
- **Mismatched frames**: Carefully define and calibrate transforms between IMU, GPS antenna, and camera frames.[web:48][web:54]  
- **Mis‑tuned noise covariances**:  
  - If the filter lags real motion, process noise may be too small or measurement noise too large.  
  - If the estimate is noisy and jumpy, measurement noise may be too small.[web:41][web:45]  
- **Outlier handling**: Reject obviously bad GPS or visual measurements (e.g. huge jumps, loss of lock) before updating the filter.[web:42][web:51]

---

## 10. What to implement next

To build intuition and content for your docs, consider implementing:

- A **1D complementary filter** for IMU tilt estimation on a microcontroller.[web:49][web:57]  
- A **2D KF** that fuses a simulated position sensor with noisy accelerometer data.  
- A **full EKF** that fuses IMU + GPS logs for a ground robot, following open‑source examples.[web:47][web:50][web:53]