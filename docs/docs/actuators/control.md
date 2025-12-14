---
sidebar_position: 1
---

# Motor Control

Motor control is how Physical AI systems turn **high-level commands** (like “drive forward at 0.5 m/s” or “rotate this joint to 90°”) into **electrical signals** that drive motors safely and accurately. It covers the power electronics (H-bridges, ESCs), low-level modulation (PWM), feedback devices (encoders), and safety mechanisms needed to control motion in real hardware.

In robotics, good motor control is essential for smooth movement, precise positioning, and reliable operation under varying loads and disturbances.

---

## Motor Types in Robotics

Before looking at control techniques, it helps to know the main motor types:

- **Brushed DC motors**  
  - Simple, inexpensive, good for wheels, conveyor belts, and small mechanisms.  
  - Easy to control with H-bridges and PWM.

- **Brushless DC (BLDC) motors**  
  - Higher efficiency, better lifespan, often used in drones and high-performance robots.  
  - Usually driven with dedicated Electronic Speed Controllers (ESCs).

- **Servomotors**  
  - Integrate motor, position sensor, and controller into a single unit.  
  - Common in hobby robotics and some industrial joints.

This page focuses on **brushed DC** and **BLDC + ESC** control, since they are the building blocks underneath many actuator systems.

---

## PWM (Pulse-Width Modulation)

**Pulse-Width Modulation (PWM)** is a technique to control average power delivered to a motor by switching the supply on and off at high frequency.

### Duty cycle and speed/torque

- **Duty cycle**: percentage of time the signal is “high” within one period (e.g., 0–100%).  
- For a DC motor:
  - Higher duty cycle → higher average voltage → higher speed/torque.  
  - Lower duty cycle → lower average voltage.

PWM is preferred because:

- It is efficient: transistors switch fully on/off, minimizing dissipation.  
- Motor inductance naturally smooths current, resulting in relatively smooth torque.

### Simple PWM example (microcontroller pseudocode)

```cpp
// Pseudocode: set PWM duty cycle for a DC motor
int pwm_pin = 9; // PWM-capable pin
int duty = 128; // 0–255 (50% duty cycle)

void setup() {
  pinMode(pwm_pin, OUTPUT);
}

void loop() {
  analogWrite(pwm_pin, duty); // outputs PWM with 50% duty
  // Adjust 'duty' based on desired speed or control loop
}
```

On many platforms, `analogWrite` is implemented as PWM under the hood.

---

## H-Bridges for DC Motor Direction Control

An **H-bridge** is a circuit that allows a DC motor to be driven **forward**, **reverse**, **brake**, or **coast** by controlling current direction.

### Basic H-bridge concept

An H-bridge uses four switches (often MOSFETs) arranged in an “H” around the motor:

+V
|
[S1]---+---[S2]
| | |
Motor Motor
| | |
[S3]---+---[S4]
|
GND

text

Modes:

- **Forward**: S1 and S4 ON, current flows in one direction.  
- **Reverse**: S2 and S3 ON, current flows in opposite direction.  
- **Brake**: S1 and S2 ON or S3 and S4 ON (both terminals tied to V+ or GND).  
- **Coast**: all switches off, motor free-spins.

In practice, integrated H-bridge driver chips (e.g., L298N, TB6612FNG, many MOSFET-based modules) simplify this.

### PWM + H-bridge

- Use **PWM** to modulate speed by switching one side of the bridge (or both diagonally) at high frequency.  
- Use **direction pins** to select forward vs reverse.

```cpp
// Pseudocode control:
int pwm_pin = 9;
int dir_pin_1 = 7;
int dir_pin_2 = 8;

void set_motor(int speed) {
  // speed in range -255..255
  if (speed > 0) {
    digitalWrite(dir_pin_1, HIGH);
    digitalWrite(dir_pin_2, LOW);
    analogWrite(pwm_pin, speed);
  } else if (speed < 0) {
    digitalWrite(dir_pin_1, LOW);
    digitalWrite(dir_pin_2, HIGH);
    analogWrite(pwm_pin, -speed);
  } else {
    // brake or coast depending on driver
    analogWrite(pwm_pin, 0);
  }
}
```

---

## ESCs for Brushless Motors

**Electronic Speed Controllers (ESCs)** are power electronics modules that handle the complex three-phase commutation for BLDC motors.

### How ESCs work (conceptually)

- Accept a **control signal** (often PWM like RC servo signals, e.g., 1–2 ms pulse at 50 Hz).  
- Drive the motor’s three phases with appropriate timing based on rotor position (often using back-EMF sensing or Hall sensors).  
- Manage current limiting, soft start, and sometimes braking.

From the controller’s perspective:

- You send a **throttle command** (e.g., 1000–2000 μs PWM).  
- The ESC maps that to motor speed/torque.

### Example: controlling an ESC (pseudocode)

```cpp
#include <Servo.h>

Servo esc;
int esc_pin = 9;

void setup() {
  esc.attach(esc_pin);
  // Arm ESC (depends on ESC, often minimum throttle first)
  esc.writeMicroseconds(1000); // minimum
  delay(2000);
}

void loop() {
  // Set throttle (e.g., 1500 is mid)
  esc.writeMicroseconds(1500);
  delay(1000);
}
```


Actual arming sequences and safety steps vary by ESC and must be checked in its documentation.

---

## Closed-Loop Control with Encoders

Open-loop PWM control is often not enough for precise robotics applications. **Closed-loop control** uses feedback (e.g., from encoders) to measure actual speed or position and adjust motor commands.

### Encoders

Common encoder types:

- **Incremental encoders** (optical, magnetic):  
  - Provide a series of pulses as the shaft rotates.  
  - Two channels (A/B) allow direction sensing via quadrature.  

- **Absolute encoders**:  
  - Report actual angle within a revolution.  
  - More complex but provide direct position without homing.

Encoders provide:

- **Speed**: pulses per unit time.  
- **Position**: cumulative pulse count (with known counts per revolution and gear ratio).

### PID speed control loop (conceptual)

Desired speed (ω_ref)
↓
Error = ω_ref - ω_meas
↓
PID
↓
PWM duty command
↓
Motor + Encoder
↓
Measured speed (ω_meas)

text

High-level pseudocode:

def pid_speed_control(omega_ref, omega_meas, dt, state):
# state holds integral term and previous error
Kp, Ki, Kd = 0.5, 0.1, 0.01

text
error = omega_ref - omega_meas
state["integral"] += error * dt
derivative = (error - state["prev_error"]) / dt

output = Kp * error + Ki * state["integral"] + Kd * derivative
state["prev_error"] = error

# map 'output' to a PWM value
pwm = clamp(int(output), -255, 255)
return pwm
text

In a real system:

- The loop runs at a fixed frequency (e.g., 100–1000 Hz).  
- Encoder counts are read each cycle to compute speed.  
- The PID output updates motor PWM and direction via an H-bridge or motor driver.

### Position control

To get **position control** (e.g., for a joint):

- Use an outer PID loop on position, which outputs a desired speed.  
- An inner loop (like above) controls speed, or you directly map position error to PWM with saturation.

---

## Safety Features and Protections

Motor control can be dangerous without proper safety mechanisms. Common safety features include:

### 1. Current limiting and thermal protection

- Prevents motor and driver from overheating or drawing excessive current.  
- Implemented via:
  - Hardware current sensing and shutdown.  
  - Software limits using current sensors and time thresholds.

### 2. Emergency stop (E-stop)

- Hardware E-stop circuit that can cut power to motors regardless of software state.  
- Often implemented as:
  - Safety relay on the main motor power line.  
  - Physical button accessible to users/operators.

### 3. Fault detection

- Monitor:
  - Overvoltage/undervoltage.  
  - Overcurrent.  
  - Encoder failures or inconsistent feedback.  

- On fault:
  - Disable motor outputs.  
  - Log the event and signal higher-level systems.

### 4. Software limits and watchdogs

- Soft limits on speed, position, and acceleration to avoid mechanical damage.  
- Watchdogs that reset or disable motor commands if control loops stop updating (e.g., communication loss).

---

## Example: Simple DC Motor Control Stack

┌──────────────────────────────────────────────┐
│ Robot Wheel Motor Stack │
├──────────────────────────────────────────────┤
│ - High-Level Controller │
│ - Desired linear & angular velocity │
│ │
│ - Wheel-level Controller │
│ - PID speed control per wheel │
│ - Uses encoder feedback │
│ │
│ - Driver/H-Bridge │
│ - Receives PWM + direction signals │
│ - Drives DC motor with correct polarity │
│ │
│ - Safety Layer │
│ - Current limit, E-stop, watchdog │
└──────────────────────────────────────────────┘

text

Each layer has clear responsibilities, which helps with debugging, testing, and reuse across different robot designs.

---

## Practical Considerations

When designing motor control for Physical AI systems:

### 1. Voltage, current, and power matching

- Ensure motor ratings match your battery/PSU voltage.  
- Choose drivers/H-bridges and ESCs that can safely handle peak currents.  
- Consider stall current (often much higher than running current).

### 2. Electrical noise and grounding

- Motors generate electrical noise; good practices include:
  - Proper grounding and shielding.  
  - Decoupling capacitors near drivers.  
  - Twisted-pair wiring for encoder and low-level signal lines.

### 3. Sampling and control rate

- Faster control loops (e.g., ≥100 Hz) improve responsiveness and stability.  
- Ensure consistent timing (use timers / RTOS where needed).

### 4. Integration with higher-level control

- Map robot-level commands (m/s, rad/s, joint angles) to per-motor speed/position targets.  
- Ensure frame conventions and sign directions are consistent across software and wiring.

---

## Next Steps

To expand this section in your documentation:

- **PWM & H-Bridge Details**  
  - Show concrete wiring diagrams for typical driver boards and microcontrollers.  
  - Explain shoot-through and deadtime for high-power designs.

- **Encoder-Based PID Examples**  
  - Full example with real-time speed measurement, tuning, and plotting responses.

- **ESC and BLDC Control**  
  - Arming sequences, safety checks, and mapping control ranges.

- **Safety & Standards**  
  - Introduce basic practices for safe motor control in collaborative or human-facing robots.

These extensions will turn this overview into a practical guide for implementing robust, safe motor control in Physical AI platforms.