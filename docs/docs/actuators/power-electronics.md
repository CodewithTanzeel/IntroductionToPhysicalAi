---
title: Power Electronics
---


# Power Electronics

Power electronics is the **energy delivery layer** of a robotic system. It connects batteries and power supplies to motors, servos, sensors, and computers, ensuring each component receives stable, appropriate voltage and current while staying safe and efficient.

This page introduces motor drivers, H-bridges, ESCs, power supplies, and safe power management practices for Physical AI and robotics projects.

---

## What Is Power Electronics in Robotics?

In robotics, power electronics includes all circuits and components that:

- Switch and regulate electrical power (DC–DC converters, regulators).  
- Drive actuators (H-bridges, ESCs, servo drivers).  
- Protect against faults (fuses, current limiting, E-stops).  

Typical power path:

Battery / PSU
↓
Main Power Distribution
↓
DC-DC Regulators (5 V, 3.3 V, etc.)
↓
Logic & Sensors

Battery / PSU
↓
Motor Drivers / ESCs / H-Bridges
↓
Motors & Servos

text

Designing this layer correctly is essential for reliability, safety, and performance.

---

## Motor Drivers and H-Bridges

### Motor Drivers

A **motor driver** is an integrated circuit or module that handles power switching for a motor using low-power control signals (from a microcontroller or SBC).

Typical features:

- Accept **PWM** and direction or step/dir signals.  
- Provide high-current outputs suitable for motors.  
- Include basic protections (overcurrent, thermal shutdown).

Examples:

- Brushed DC drivers (dual H-bridge chips).  
- Stepper drivers (chopper drivers with microstepping).  

---

### H-Bridges for Brushed DC Motors

An **H-bridge** allows bidirectional control of a DC motor.

Key functions:

- Forward and reverse rotation by reversing current.  
- Braking and coasting modes.  
- PWM speed control combined with direction control.

Conceptual control interface:

Inputs:

PWM: speed (duty cycle)

DIR: direction (0 = forward, 1 = reverse)

Outputs:

Motor terminals driven with appropriate polarity and PWM

text

Basic considerations:

- Ensure the H-bridge’s **voltage and current ratings** exceed motor requirements (including stall current).  
- Use adequate **heat sinking** or cooling for high-power applications.  
- Provide **flyback diodes** or use drivers with built-in diodes to handle inductive kickback.

---

## ESCs for Brushless Motors

**Electronic Speed Controllers (ESCs)** are specialized power electronics for **BLDC motors**.

Functions:

- Convert DC supply into 3-phase AC waveforms for the motor.  
- Use Hall sensors or back-EMF sensing for commutation.  
- Regulate motor speed/torque according to input command.  
- Implement protections (overcurrent, undervoltage cutoff, thermal limits).

Control interfaces:

- **RC PWM** (e.g., 1000–2000 μs pulses).  
- Some ESCs support **digital protocols** (CAN, UART, I2C, DShot, etc.) for more precise and robust control.

Integration tips:

- Follow ESC manufacturer’s **arming sequence** and safety requirements.  
- Ensure batteries and wiring can handle surge currents (e.g., at startup or sudden throttle changes).  
- Keep ESCs well-cooled and adequately spaced from sensitive electronics.

---

## Power Supplies and Regulation

Robots often have multiple voltage rails:

- High-voltage **motor bus** (e.g., 12 V, 24 V, 48 V).  
- Logic and sensor rails (e.g., 5 V, 3.3 V).  
- Possibly auxiliary rails (e.g., 9 V, ±12 V for analog circuits).

### Batteries and Main Power

Common battery types:

- **Li-ion / LiPo**: high energy density, common in mobile robots and drones.  
- **Lead-acid**: robust and inexpensive, still used in larger ground robots.  

Key parameters:

- **Nominal voltage** and cell configuration (e.g., 3S LiPo ≈ 11.1 V nominal).  
- **Capacity** (Ah) and expected runtime.  
- **Discharge rating** (C-rating) → determines maximum current.

Include:

- Main **fuse** or circuit breaker near the battery.  
- Proper **connectors** rated for expected currents.  

---

### DC–DC Converters and Regulators

To generate lower voltages from the main bus:

- **Buck converters** (step-down) for efficient conversion to 5 V, 3.3 V, etc.  
- **Linear regulators** for low-noise rails (but less efficient, especially with large voltage drops).  

Best practices:

- Use **switching regulators** for higher loads (CPUs, radios, multiple sensors).  
- Provide **local decoupling** (ceramic capacitors close to ICs).  
- Separate high-current motor paths from sensitive logic grounds as much as possible (star grounding or careful ground layout).

---

## Safe Power Management

Safety is a critical part of power electronics design.

### 1. Fusing and Overcurrent Protection

- Place main fuses or breakers close to the battery to protect wiring and electronics.  
- Use appropriately rated fuses for subsystem branches (e.g., motor power vs. logic power).  
- Consider resettable fuses (PTC) where convenient, but note their characteristics.

### 2. E-Stop (Emergency Stop)

- Provide a **hard-wired E-stop** that can disconnect motor power quickly.  
- Often implemented with a latching pushbutton controlling a relay or contactor.  
- Design E-stop so it does *not* depend on the main controller’s software to function.

---

### 3. Inrush Current and Brown-Outs

- Large capacitors and motor drivers can draw big currents at power-up.  
- Use **soft-start** circuits or inrush limiters if needed.  
- Ensure that logic supplies (microcontrollers, SBCs) are not brown-out reset by motor surges:
  - Separate motor and logic supplies as much as practical.  
  - Use stable regulators and adequate bulk capacitance.

### 4. Grounding and Noise

Motors and switching devices generate electrical noise:

- Use **twisted pairs** or shielded cables for sensitive signals (encoders, communication buses).  
- Implement a **solid ground reference**; avoid large ground loops.  
- Keep high-current motor and ESC wiring physically separated from low-level analog and digital signals.

---

## Example: Small Mobile Robot Power Architecture

Battery (3S LiPo, 11.1 V)
↓
Main Fuse / Switch / E-Stop
↓
+--------------------------+-----------------------------+
| | |
| Motor Power Rail | Logic & Sensor Rail |
| (11.1 V) | (5 V, 3.3 V) |
| | |
| - Dual H-Bridge Driver | - Buck Converter (5 V) |
| - DC Motors | - 3.3 V LDO from 5 V |
| | - MCU / SBC / Sensors |
+--------------------------+-----------------------------+

text

Key points:

- Motors and logic share the battery but are **electrically isolated** by separate regulators and decoupling.  
- E-stop can cut the **motor rail** while leaving logic powered for diagnostics.  
- Fuses sized appropriately for each rail.

---

## Practical Best Practices

When designing power electronics for a robot:

1. **Overdesign for current and thermal load**  
   - Choose drivers, ESCs, and regulators with comfortable headroom above expected currents.  
   - Include heat sinks or airflow where necessary.

2. **Plan wiring and connectors early**  
   - Use wire gauges suitable for current and length.  
   - Label connectors and harnesses to prevent mis-plugging.

3. **Separate power domains logically and physically**  
   - Motor/actuator power vs. logic/sensor power.  
   - Consider using separate grounds that join at a single point (star grounding) in higher-power systems.

4. **Test incrementally**  
   - Bring up low-power logic first.  
   - Add motor drivers and loads step by step, monitoring voltage drops, temperature, and noise.  
   - Use current-limited bench supplies during early stages.

5. **Document the power system**  
   - Maintain schematics and wiring diagrams.  
   - Record fuse ratings, connector types, and cable specifications for maintenance and debugging.

---

## Next Steps

To build on this introduction:

- **[Motor Control](./control)** – How power electronics interfaces with control logic (PWM, H-bridges, ESC signals, closed-loop control).  
- **[Motors](./motors)** – Detailed overview of motor types, selection criteria, and mechanical considerations.  
- **[Control Systems](../control-systems/intro)** – PID, state-space methods, and trajectory tracking for motor-driven systems.

These sections together will help you design power systems that are not only functional, but also robust, maintainable, and safe for Physical AI applications.