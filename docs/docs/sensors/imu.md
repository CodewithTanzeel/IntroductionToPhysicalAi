---
title: IMU
---


# IMU & Orientation

An inertial measurement unit (IMU) combines accelerometers, gyroscopes, and often magnetometers to measure motion and orientation in 3D space.[web:62][web:63] This section covers how each sensor works, how to calibrate them, and how to fuse their data (complementary filters and Kalman filters) for robust orientation estimation.[web:64][web:65]

---

## 1. IMU building blocks

An IMU typically contains:

- **Accelerometer**: Measures specific force (acceleration plus gravity) along three axes; used to estimate tilt and detect motion.[web:62][web:63]  
- **Gyroscope**: Measures angular velocity; integrating gyro rates over time gives relative orientation but accumulates drift.[web:63][web:64]  
- **Magnetometer**: Measures the Earth’s magnetic field; provides an absolute heading reference when combined with tilt information.[web:62][web:65]

A 6‑axis IMU has accelerometer + gyro, while a 9‑axis module (sometimes called MARG) includes a magnetometer for full attitude and heading reference.[web:62][web:65]

---

## 2. Accelerometers

### 2.1 What they measure

- Low‑cost IMUs use MEMS accelerometers that sense inertial forces by the deflection of tiny proof masses.[web:62]  
- The sensor outputs acceleration along each axis, including gravity; at rest, the magnitude is close to 1 g and direction indicates device tilt.[web:63][web:64]

### 2.2 Orientation from accelerometers

- When the device is static or moving slowly, roll and pitch can be estimated from the gravity vector.  
- Accelerometer‑only orientation is noisy and corrupted by linear accelerations during fast motion, so it is usually fused with gyros and magnetometers.[web:63][web:65]

---

## 3. Gyroscopes

### 3.1 What they measure

- MEMS gyros measure angular velocity about each axis; integrating the rate over time gives relative change in orientation.[web:63][web:64]  
- Gyros respond quickly and are robust to linear accelerations, making them ideal for high‑frequency orientation updates.[web:63]

### 3.2 Drift and bias

- Real gyros have **bias** (constant offset), noise, and scale factor errors; integrating biased signals leads to drift that grows over time.[web:63][web:64]  
- Sensor fusion uses other sensors (accelerometer, magnetometer, external references) to correct this drift.[web:65][web:73]

---

## 4. Magnetometers

### 4.1 Heading reference

- Magnetometers measure the local magnetic field vector, which can be related to Earth’s magnetic north; combined with tilt, this gives yaw (heading).[web:62][web:65]  
- Using accelerometer + magnetometer is often known as an electronic compass (e‑compass).[web:65][web:71]

### 4.2 Disturbances

- Hard‑iron effects (permanent magnets or DC currents) create constant offsets; soft‑iron effects (ferromagnetic materials) distort field direction.[web:64][web:66]  
- Magnetometer calibration and placement away from motors and high currents are critical for good heading estimates.[web:64][web:71]

---

## 5. IMU calibration

Correct calibration significantly improves orientation accuracy.[web:64][web:66]

### 5.1 Intrinsic calibration

- **Bias**: Measure sensor output at known zero input (e.g. level static orientation for accelerometer, no rotation for gyro) and subtract mean offset.[web:63][web:66]  
- **Scale factor and misalignment**: Rotate the IMU through known angles or angular rates (e.g. on a turntable) and fit gains and cross‑axis terms.[web:66][web:71]

### 5.2 Magnetometer calibration

- Collect measurements while rotating the sensor through many orientations; raw data usually forms a distorted ellipsoid.  
- Fit an ellipsoid and map it to a sphere to correct hard‑ and soft‑iron errors.[web:64][web:71]

### 5.3 Extrinsic calibration (on a robot)

- Determine the rotation and translation between the IMU frame and robot frame or camera frame; often done via motion‑based optimization or joint calibration tools.[web:66][web:78]  
- Good extrinsic calibration is essential when fusing IMU with other sensors (e.g. camera‑IMU VIO).[web:72][web:80]

---

## 6. Orientation representations

For fusion algorithms, orientation is represented mathematically:[web:64][web:70]

- **Euler angles** (roll, pitch, yaw): intuitive, but suffer from gimbal lock and discontinuities.  
- **Rotation matrices** (3×3): no singularities but over‑parameterized and more expensive to store.  
- **Unit quaternions**: 4‑D minimal, no singularities, numerically stable; widely used in modern IMU filters.[web:64][web:73]

---

## 7. Complementary filter for orientation (basic)

Complementary filters blend gyroscope integration (good short term) with accelerometer and magnetometer orientation (good long term).[web:67][web:76]

### 7.1 Concept

For roll/pitch:

- Integrate gyro rates to get fast, smooth orientation estimate.  
- Compute orientation from accelerometer (gravity direction) and low‑pass filter it.  
- Combine both using a weight $\alpha$ (0–1).[web:63][web:67]

Simple 1D update (e.g. roll angle):

$$
\theta_{\text{gyro}}(k) = \theta(k-1) + \omega(k)\Delta t
$$

$$
\theta(k) = \alpha\,\theta_{\text{gyro}}(k) + (1-\alpha)\,\theta_{\text{acc}}(k)
$$

where \(\theta_{\text{acc}}\) is computed from accelerometer readings.[web:63][web:67]

### 7.2 Example (Python‑style pseudocode)

```python
import math

alpha = 0.98  # gyro weight
dt = 0.01  # 100 Hz

theta = 0.0  # initial roll

while True:
  ax, ay, az = read_accel()
  gx, gy, gz = read_gyro()

  # integrate gyro roll (gx in rad/s)
  theta_gyro = theta + gx * dt

  # roll from accelerometer (assuming small pitch)
  theta_acc = math.atan2(ay, math.sqrt(ax * ax + az * az))

  # complementary fuse
  theta = alpha * theta_gyro + (1 - alpha) * theta_acc
```

This pattern generalizes to pitch and, with magnetometer, to yaw; for full 3D, filters such as Mahony and Madgwick implement quaternion‑based complementary schemes.[web:67][web:74]

---

## 8. Kalman‑based orientation filters (intermediate–advanced)

Kalman and Extended Kalman Filters (EKF) provide a probabilistic framework for fusing IMU (and magnetometer) data for 3D orientation.[web:64][web:73]

### 8.1 State and models

A common quaternion‑based EKF state includes:

\[
x = [q_w, q_x, q_y, q_z, b_{g_x}, b_{g_y}, b_{g_z}]^\top
\]

where \(q\) is orientation and \(b_g\) are gyro biases.[web:64][web:73]

- **Process model**:  
  - Integrate gyro minus bias to propagate quaternion (discrete quaternion integration).  
  - Bias is often modeled as a random walk.[web:64][web:70]
- **Measurement model**:  
  - Predict expected gravity and magnetic field vectors in the sensor frame from the current orientation, and compare with accelerometer/magnetometer readings.[web:65][web:73]

### 8.2 Filter structure

Each time step:

1. **Predict** orientation using gyro and propagate covariance using the process Jacobian.  
2. **Update** with accelerometer (tilt) and magnetometer (heading) when readings are reliable (e.g. accelerometer close to 1 g, magnetometer not disturbed).[web:64][web:73]  

Orientation filters like `ahrsfilter` (Matlab) implement this logic efficiently, combining accelerometer, gyro, and magnetometer into an AHRS (Attitude and Heading Reference System).[web:61][web:65]

---

## 9. Example EKF pseudocode (orientation only)

High‑level pseudocode for a quaternion + gyro bias EKF:[web:70][web:73]

```python
state = init_quaternion_and_bias()
P = init_covariance()

while True:
  ax, ay, az = read_accel()
  mx, my, mz = read_mag()
  gx, gy, gz = read_gyro()
  dt = get_dt()

  # --------- Prediction (gyro) ----------
  omega = np.array([gx, gy, gz]) - state.bias
  q_pred = integrate_quaternion(state.q, omega, dt)  # normalize inside
  F = compute_F_jacobian(state, omega, dt)           # process Jacobian
  P = F @ P @ F.T + Q

  # --------- Measurement update ----------
  z = np.hstack([normalize([ax, ay, az]),
           normalize([mx, my, mz])])

  z_hat, H = predict_accel_mag_measurement(q_pred)   # expected gravity & mag
  y = z - z_hat                                      # innovation
  S = H @ P @ H.T + R
  K = P @ H.T @ np.linalg.inv(S)

  x_update = K @ y
  state.q   = apply_quaternion_correction(q_pred, x_update)
  state.bias += extract_bias_correction(x_update)
  P = (np.eye(len(P)) - K @ H) @ P
```

This sketch omits many details (normalization, gating, frame conventions) but shows how gyro, accelerometer, and magnetometer interact in a Kalman‑style orientation estimator.[web:64][web:73]

---

## 10. Practical tips for IMU orientation

- **Sampling and timing**: Use consistent high‑rate sampling (100–200 Hz or more) and ensure accurate timestamps.[web:64][web:79]  
- **Sensor placement**: Mount IMUs on rigid parts of the robot, away from strong magnetic and vibration sources when possible.[web:66][web:69]  
- **Dynamic conditions**: During strong linear accelerations, treat accelerometer readings cautiously (e.g. down‑weight in filters) because they no longer represent only gravity.[web:63][web:68]  
- **Testing**: Start with simple complementary filters to debug axes, signs, and calibration, then move to EKF or AHRS filters once basics are verified.[web:67][web:71]