

---
sidebar_position: 1
---

# Introduction to Control Systems

Control systems are the **brain–to–muscle link** of Physical AI. They translate high-level goals (like “drive straight” or “follow this path”) into low-level actuator commands that move robots safely, accurately, and efficiently.

In robotics, control systems keep drones stable, mobile bases on course, and robot arms following precise trajectories, even in the presence of noise, delays, and disturbances.

---

## What Is a Control System?

A **control system** continuously measures the state of a robot, compares it to a desired target, and adjusts actuator commands to reduce the difference (the *error*).

Typical closed-loop structure:

```text
   +-----------------+
   | Desired Command |  (reference: position, speed, pose)
   +--------+--------+
    |
    v
  +-----+------+ 
  |  Controller |  (PID, MPC, etc.)
  +-----+------+ 
    |
    Actuator Commands
    v
   +----+----+
   |  Robot  |
   +----+----+
    |
   Sensors / State
    v
  +-----+------+ 
  |  Feedback  |
  +------------+
```

Key ideas:

- **Feedback**: Use sensor measurements to correct errors in real time.  
- **Stability**: Ensure the system does not oscillate or diverge.  
- **Performance**: Meet requirements on speed, accuracy, robustness, and energy use.

---

## PID Controllers and Tuning

A **PID controller** (Proportional–Integral–Derivative) is the most widely used feedback controller in robotics and industry.

### PID basics

PID computes a control signal based on the error between desired and measured output:

- **Proportional (P)**: Reacts to the current error.  
- **Integral (I)**: Reacts to accumulated past error (eliminates steady-state offset).  
- **Derivative (D)**: Reacts to the rate of change of error (predictive, adds damping).

Common uses:

- Motor speed control  
- Balancing robots  
- Position and angle control in arms and drones  

### Tuning PID

Typical tuning approaches:

- **Manual tuning**:  
  - Increase P until the response is fast but not too oscillatory.  
  - Add I to remove residual steady-state error.  
  - Add D to reduce overshoot and oscillations.
- **Heuristic methods**:  
  - Use rules (like Ziegler–Nichols) based on system response to find initial gains.  
- **Software tools**:  
  - Use auto-tuners or simulation to explore parameters safely.

Well-tuned PID provides a strong baseline for many robotic control tasks.

---

## State Estimation (Kalman Filters)

Many control algorithms need a good estimate of the robot’s **state** (position, velocity, orientation, etc.), which is not always directly measurable.

### Why estimation matters

- Sensors are noisy and often measure indirect quantities (e.g., IMU measures acceleration, not position).  
- Controllers need filtered, consistent state estimates to avoid reacting to noise or delays.

### Kalman filter overview

A **Kalman filter** (KF) and its nonlinear variants (EKF, UKF) combine:

- A **motion model** (how the state evolves given inputs).  
- A **measurement model** (how sensors relate to the state).  

to produce an optimal estimate (under certain assumptions).

Typical uses:

- Fusing IMU, wheel encoders, and GPS for vehicle localization.  
- Estimating velocities and accelerations from position sensors.  
- Providing smoothed state for controllers and planners.

State estimation is tightly coupled with control: the controller acts on the estimated state, not the raw sensor data.

---

## Model Predictive Control (MPC)

**Model Predictive Control** uses an explicit model of the robot and an optimization problem to compute control actions over a future time horizon.

### Key ideas

At each control step, MPC:

1. Predicts future system behavior over a finite horizon using a model.  
2. Solves an optimization problem to minimize a cost function (e.g., tracking error + control effort) subject to constraints.  
3. Applies only the first control input and repeats the process at the next step.

### Why MPC for robotics?

MPC is powerful when:

- There are **constraints** (on torque, speed, joint limits, obstacle avoidance).  
- The dynamics are moderately complex but still modellable.  
- You need coordinated control of multiple inputs and outputs (MIMO systems).

Typical applications:

- Quadrotor trajectory tracking with actuator limits.  
- Autonomous vehicle lane-keeping and path following.  
- Industrial manipulation with collision and joint constraints.

The main trade-off is computational cost versus performance and flexibility.

---

## State-Space Methods

**State-space control** describes systems using vectors and matrices, capturing multiple coupled states at once.

### State-space model

A linear time-invariant (LTI) system is often written as:

- State equation: describes how the state evolves.  
- Output equation: describes how measurements relate to the state.

State-space representation enables:

- Rigorous analysis of stability and controllability.  
- Design of **state feedback controllers** (e.g., LQR).  
- Design of **observers** (estimators) that reconstruct the state from outputs.

### State feedback and LQR

A linear quadratic regulator (LQR) chooses a feedback gain to minimize a quadratic cost of state error and control effort.

Benefits:

- Systematic design for multi-variable systems.  
- Natural way to balance tracking accuracy vs actuator effort.  

State-space tools are also the foundation for many MPC formulations.

---

## Trajectory Generation and Tracking

Robots often need to follow **time-varying trajectories**, not just reach static setpoints.

### Trajectory generation

Trajectory generation creates smooth reference signals that respect robot limits:

- Interpolation between waypoints with polynomials or splines.  
- Time-parameterized paths with velocity and acceleration limits.  
- Online re-planning when the environment changes.

Outputs: sequences of positions, velocities, and sometimes accelerations or jerks.

### Trajectory tracking

Tracking controllers ensure the robot follows the generated trajectory:

- Feedforward term from the model (anticipating needed effort).  
- Feedback term (PID, state feedback, or MPC) to correct deviations.  

Typical pipeline:

Planner → Trajectory Generator → Tracking Controller → Robot

text


For example, a mobile base might:

- Plan a path around obstacles.  
- Convert it into a time-stamped trajectory.  
- Use a controller that tracks linear and angular velocity profiles.

---

## Example: Control Stack in a Differential-Drive Robot

```text
┌────────────────────────────────────────────┐
│ Differential-Drive Robot                    │
├────────────────────────────────────────────┤
│ High-Level: Path Planner                    │
│ - Generates waypoints / trajectories        │
│                                            │
│ Mid-Level: Trajectory Tracking Controller   │
│ - PID or MPC on linear & angular speed     │
│ - Uses estimated pose from state est.      │
│                                            │
│ Low-Level: Motor Controllers                │
│ - Wheel speed PID loops                     │
│ - Encoder feedback                          │
└────────────────────────────────────────────┘
```

Each layer uses control concepts at a different abstraction level, from individual wheel speed to global path following.

---

## Practical Considerations

When designing control systems for Physical AI:

### 1. Modeling and identification

- Start with simple models (e.g., first-order, double integrator).  
- Use experiments to estimate parameters (mass, friction, time constants).

### 2. Robustness

- Expect noise, delays, and modeling errors.  
- Add safety margins and test across operating conditions.

### 3. Simulation before hardware

- Simulate controllers with realistic models (including noise and saturation).  
- Validate stability and performance before applying to real robots.

### 4. Integration with estimation and planning

- Ensure estimators and controllers agree on frames and units.  
- Match controller update rates with sensor and actuator capabilities.  

Good control is not just about one algorithm; it’s about how modeling, estimation, control, and planning fit together.

---

## Next Steps

To dive deeper into control systems for robotics, continue with:

- **[PID Controllers and Tuning](./pid.md)** – Basics and hands-on examples.  
- **[State Estimation with Kalman Filters](./kalman.md)** – Building reliable state estimates.  
- **[Model Predictive Control](./mpc.md)** – Constraint-aware control for advanced robots.  
- **[Trajectory Generation and Tracking](./trajectory-tracking.md)** – From waypoints to smooth motion.

These tutorials will guide you from simple single-loop controllers to full control stacks for mobile robots and manipulators.