---
sidebar_position: 2
---
---
sidebar_position: 6
---

# Motors

Motors are the **primary actuators** in most robotic systems. They convert electrical energy into mechanical motion, enabling robots to drive wheels, move arms, rotate joints, and manipulate objects. Choosing the right motor type—and understanding how to control it—is critical for building reliable and efficient Physical AI systems.

This page covers the main motor types used in robotics (DC motors, BLDC, stepper motors, and servos), along with selection guidelines and basic control considerations.

---

## Motor Types Overview

Different motor types trade off **torque**, **speed**, **precision**, **complexity**, and **cost**. In practice, many robots use more than one type in different parts of the system.

### 1. DC Motors (Brushed)

**Brushed DC motors** are simple, widely available, and easy to control.

Key characteristics:

- Two power terminals (often plus optional encoder wires).  
- Speed roughly proportional to applied voltage; torque proportional to current.  
- Internal mechanical commutation (brushes and commutator) switches current in the rotor windings.

Typical uses:

- Mobile robot drive wheels.  
- Conveyors, small mechanisms, intake rollers.  
- Applications where continuous rotation and moderate control accuracy are sufficient.

Pros:

- Simple to drive using H-bridges and PWM.  
- Inexpensive and easy to source in many sizes.  

Cons:

- Brushes wear over time → limited lifetime and potential electrical noise.  
- Requires external feedback (encoders) for precise speed/position control.

---

### 2. Brushless DC Motors (BLDC)

**Brushless DC motors** use electronic commutation instead of brushes.

Key characteristics:

- Typically three-phase windings; commutation handled by an ESC or driver.  
- Higher efficiency, power density, and reliability than brushed DC motors.  
- Often run at high speeds with appropriate gearing or propellers.

Typical uses:

- Drones and multirotors (propulsion).  
- High-speed actuators, gimbals, and some legged robot joints.  
- Applications where efficiency and lifespan matter.

Pros:

- No brushes → less maintenance, less electrical noise.  
- Better efficiency and thermal behavior at high speed.

Cons:

- Require an ESC or specialized driver and control scheme.  
- More complex to integrate at low level (though ESCs hide much of the complexity).

---

### 3. Stepper Motors

**Stepper motors** move in discrete steps, making them naturally suited for open-loop position control.

Key characteristics:

- Rotors with many magnetic poles; stator coils energized in sequence.  
- Fixed step angle (e.g., 1.8° per full step → 200 steps per revolution).  
- Microstepping drivers can subdivide steps (e.g., 16×, 32×) for smoother motion.

Typical uses:

- 3D printers, CNC machines, and laser cutters.  
- Pan-tilt units, small linear stages, and some robot joints.  
- Applications where repeatable positioning is more important than high speed/torque density.

Pros:

- Precise incremental motion without feedback (for limited loads and speeds).  
- Simple command interface (step + direction signals).

Cons:

- Can lose steps under excessive load or acceleration (no inherent feedback).  
- Typically less efficient at high speed and may run hot while holding torque.  
- Closed-loop “servo steppers” add encoders and drivers, increasing cost.

---

### 4. Servos

In robotics, **servo** can refer to:

- Hobby RC servos.  
- Industrial servomotor systems (motor + encoder + dedicated servo drive).

#### Hobby RC Servos

Key characteristics:

- Integrated DC or BLDC motor, geartrain, position sensor, and control electronics.  
- Controlled via RC-style PWM signal (pulse width encodes target angle).  
- Typically limited range (e.g., ~180°) and torque, although high-torque variants exist.

Typical uses:

- Small arms, grippers, pan-tilt cameras, humanoid joints in smaller robots.  
- Hobby robotics and quick prototypes.

Pros:

- Very simple interface (single signal wire + power + ground).  
- Built-in position control—no need for separate encoders or PID loops.

Cons:

- Limited range, speed, and torque compared to industrial solutions.  
- Position accuracy and durability highly dependent on model and quality.

#### Industrial Servomotors

Key characteristics:

- High-performance DC/BLDC motors with encoders and dedicated servo drives.  
- Closed-loop speed and position control with configurable profiles.  
- Communicate over fieldbuses (CAN, EtherCAT, etc.) or analog/digital signals.

Typical uses:

- Industrial arms, collaborative robots, high-precision motion axes.  
- Applications demanding high accuracy, smooth motion, and high dynamic performance.

---

## Comparing Motor Types

A conceptual comparison for quick reference:

| Motor Type     | Control Complexity | Precision       | Typical Use Cases                          |
|----------------|--------------------|-----------------|--------------------------------------------|
| Brushed DC     | Low (H-bridge + PWM) | Medium (with encoder) | Wheels, conveyors, simple mechanisms     |
| BLDC           | Medium/High (ESC/drive) | Medium–High (with encoder) | Drones, high-speed actuators          |
| Stepper        | Medium (driver, step/direction) | High (open-loop, limited) | 3D printers, CNC, small stages        |
| RC Servo       | Low (PWM signal)   | Medium          | Small joints, grippers, pan-tilt           |
| Industrial Servo | High (servo drive config) | High           | Robot arms, precise motion axes           |

---

## Selection Guidelines

Choosing the right motor depends on **application requirements**:

### 1. Motion Type and Range

- Continuous rotation (wheels, belts) → DC or BLDC.  
- Limited-angle, articulated joints → servos or DC/BLDC with encoder and gearbox.  
- Incremental linear or rotary motion with repeatability → steppers (or servo steppers).

### 2. Torque, Speed, and Load

- Compute required torque using load, friction, and acceleration requirements.  
- Check speed needs (RPM range) and whether gearing is required.  
- Consider stall torque and peak currents for worst-case load scenarios.

### 3. Precision and Backlash

- For high-precision positioning (CNC, arms, cameras):  
  - Stepper + quality driver, or servomotor with encoder.  
- For less critical motion (e.g., mobile base speed):  
  - Brushed DC with simple encoder feedback may be sufficient.  
- Gearboxes introduce backlash; precision applications often require low-backlash or harmonic drives.

### 4. Environment and Duty Cycle

- Harsh environments (dust, high temp, vibration) may favor sealed BLDC/servo solutions.  
- High duty cycles require good thermal management and efficiency.  
- Battery-powered systems must balance motor performance with power consumption.

### 5. Integration and Ecosystem

- Check availability of:  
  - Drivers (H-bridges, ESCs, stepper drivers, servo drives).  
  - Feedback devices (encoders, resolvers).  
  - Library and middleware support (e.g., ROS drivers, existing control stacks).

---

## Basic Control Considerations

Different motor types require different **electrical interfaces** and **control loops**.

### Brushed DC

- **Interface**: Voltage or PWM duty cycle via H-bridge / driver.  
- **Direction**: Controlled by H-bridge polarity.  
- **Feedback**: Encoders for speed/position (closed-loop control).  

Typical control stack:

High-Level Command (linear speed)
↓
Wheel Speed Controller (PID)
↓
PWM + Direction Signals
↓
H-Bridge / Driver
↓
DC Motor + Encoder Feedback

text

---

### BLDC + ESC

- **Interface**: Typically RC PWM signal (throttle) or digital bus (CAN/UART) depending on ESC.  
- **Commutation**: Handled internally by the ESC.  
- **Feedback**: May be internal to ESC; external encoders or FOC drives enable more advanced control.

Typical control stack:

High-Level Command (thrust / speed)
↓
Throttle Command (0–100% or μs pulse)
↓
ESC (current limiting, commutation)
↓
BLDC Motor

text

Advanced drives use **Field-Oriented Control (FOC)** for smooth, efficient torque control at all speeds.

---

### Stepper Motors

- **Interface**: Step and direction signals from a microcontroller or motion controller.  
- **Control**: Number of steps = displacement; step frequency = speed.  
- **Feedback**: None in open-loop (risk of missed steps); encoder added in closed-loop variants.

Typical control stack:

Desired Position / Trajectory
↓
Step Generator (planner)
↓
Step + Direction Signals
↓
Stepper Driver (microstepping)
↓
Stepper Motor

text

Key considerations:

- Acceleration profiles (ramps) to avoid missed steps.  
- Holding torque vs current draw and heating.

---

### Servos

#### RC Servos

- **Interface**: Pulse-width encoded angle (e.g., 1–2 ms at ~50 Hz).  
- **Internal Control**: Built-in position control using a potentiometer or encoder.

Typical use:

Target Angle (degrees)
↓
PWM Command (e.g., 0–180° → 1000–2000 μs)
↓
RC Servo (internal controller)
↓
Output Shaft Position

text

#### Industrial Servos

- **Interface**: Command protocols over fieldbus or analog inputs (e.g., target position, speed, or torque).  
- **Internal Control**: Hierarchical loops (current, speed, position) tightly integrated in servo drive.

---

## Example: Selecting Motors for a Small Mobile Robot

Suppose you are designing a differential-drive mobile robot:

- Requirements:  
  - Moderate speed (0.5–1.0 m/s).  
  - Good control of straight-line and rotational motion.  
  - Runs off a battery (e.g., 12 V).  

Reasonable choice:

- **Brushed DC gearmotors** with encoders:  
  - Provide necessary torque at wheel speed.  
  - Encoders enable closed-loop speed and odometry.  
- **Drivers**: Dual H-bridge capable of handling stall current.  
- **Control**:  
  - Inner wheel speed PID loops.  
  - Outer velocity/pose controller mapping robot-level commands to wheel speeds.

---

## Practical Tips

When working with motors in Physical AI systems:

1. **Always overspec drivers and power**  
   - Design for stall or peak current, not just nominal current.  
   - Include fuses or electronic protection where appropriate.

2. **Mind wiring and connectors**  
   - Use connectors rated for current and environmental conditions.  
   - Keep high-current motor wiring separate from sensitive signal lines where possible.

3. **Test and characterize**  
   - Measure speed–torque behavior, current draw, and temperature rise under load.  
   - Use test jigs or benches to validate motor and driver combos before integrating into the full robot.

4. **Plan for maintenance**  
   - Brushed DC motors and cheap gearboxes may wear out under heavy use.  
   - Design for easy replacement where possible.

---

## Next Steps

For deeper, implementation-focused topics:

- **[Motor Control](./motor-control.md)** – PWM, H-bridges, ESCs, closed-loop control, and safety.  
- **[Actuators & Mechanisms](./actuators.md)** – How motors pair with gears, linkages, and transmissions.  
- **[Control Systems](./control-systems.md)** – PID, state-space methods, and trajectory tracking for motor-driven systems.

These sections, together with this overview, will help you select and control motors effectively in your Physical AI projects.