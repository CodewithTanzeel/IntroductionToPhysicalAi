---
title: Transmissions
---

## Gear Transmissions

Gears are toothed wheels that mesh to transmit rotational motion between shafts.

### 1. Spur and Helical Gears

- **Spur gears**: Teeth parallel to the shaft axis.  
  - Simple to manufacture.  
  - Common in many gearboxes and joint drives.  

- **Helical gears**: Teeth angled relative to shaft axis.  
  - Smoother, quieter operation.  
  - Can carry higher loads for the same size.  
  - Introduce axial forces that bearings must handle.

Key concepts:

- **Gear ratio** = (number of teeth on output gear) / (number of teeth on input gear).  
  - Ratio > 1 → speed reduction, torque multiplication.  
- **Backlash**: Small gap between meshing teeth; too much reduces precision, too little can increase wear and noise.

Use cases:

- Compact reductions in robot joints.  
- Gear trains in articulated arms and drive trains.

---

### 2. Planetary (Epicyclic) Gears

Planetary gear sets arrange gears in a compact, coaxial package:

- **Sun gear** in the center.  
- **Planet gears** around the sun, mounted on a carrier.  
- **Ring gear** encircling the planets.

Advantages:

- High reduction ratios in a small volume.  
- Good torque density.  
- Often better load sharing among multiple planet gears.

Typical uses:

- Industrial robot joints.  
- Wheel drives in mobile robots.  
- Any application requiring high torque in limited space.

---

### 3. Worm Gears

A **worm gear** system uses:

- A screw-like **worm**.  
- A **worm wheel** that meshes with the worm at 90°.

Characteristics:

- Large reduction ratios in one stage.  
- Potential **self-locking** (output cannot easily drive input back), useful for holding loads without power.  
- Lower efficiency due to sliding contact; generates more heat.

Use cases:

- Positioning joints that must hold static loads.  
- Lift mechanisms where back-driving is undesirable.

---

## Belts and Pulleys

Belts and pulleys use a flexible belt looped around pulleys to transmit motion between shafts.

### 1. Timing Belts (Toothed Belts)

- Belts with teeth that mesh with matching pulleys.  
- Provide **positive engagement** (no slip under normal loads).  
- Offer configurable gear ratios by changing pulley tooth counts.

Advantages:

- Quieter and lighter than many gear trains.  
- Can span longer distances between shafts.  
- Provide some compliance, reducing shock loads.

Use cases:

- Robot arms where motors are located away from joints.  
- Lightweight drive trains in mobile robots.  
- Camera sliders and pan-tilt mechanisms.

---

### 2. Flat and V-Belts (Less Common in Precision Robotics)

- Used more in industrial machinery than precise robots, but occasionally appear in supporting systems.  
- Can slip under overload, which can act as a crude torque limit.  

In high-precision or odometry-critical mechanisms, **timing belts** are generally preferred over slipping belts.

---

## Harmonic Drives

**Harmonic drives** (strain-wave gears) are a special type of transmission known for:

- Very high reduction ratios (e.g., 30:1 to 160:1) in a compact housing.  
- Extremely low backlash and high positioning accuracy.  
- High torsional stiffness.

Key components:

- **Wave generator**: An elliptical element (often a cam with a flexible bearing) that deforms the flexspline.  
- **Flexspline**: Thin, flexible, toothed cup.  
- **Circular spline**: Rigid ring gear with slightly different tooth count.

Operation concept:

- The wave generator’s ellipse makes the flexspline engage with the circular spline at two opposite regions.  
- Because they have a slight tooth count difference, each revolution of the wave generator produces a tiny relative rotation between flexspline and circular spline.  
- This yields high reduction ratios with very fine motion increments.

Typical uses:

- Precision joints in industrial and collaborative robot arms.  
- Pan/tilt units and gimbals requiring high stiffness and low backlash.  

Trade-offs:

- Costly compared to simple gear trains.  
- Sensitive to overload and shock if not properly sized.

---

## Torque, Speed, and Precision

Transmissions fundamentally trade speed for torque:

- **Torque_out ≈ Torque_in × Ratio × Efficiency**  
- **Speed_out ≈ Speed_in / Ratio**

Higher ratios:

- Increase output torque (up to mechanical and thermal limits).  
- Reduce output speed.  
- Improve apparent resolution and smoothness (small motor steps map to smaller joint motion).  

But:

- Very high ratios can increase reflected inertia and make back-driving harder.  
- Backlash and compliance in the transmission can limit positioning accuracy and control bandwidth.

For precise robotics:

- Low-backlash gearboxes or harmonic drives.  
- Stiff belt systems with proper tensioning.  
- Good alignment and bearing support to minimize flex and play.

---

## Example Transmission Choices

### 1. Industrial Robot Arm Joint

- **Motor**: High-speed servomotor with encoder.  
- **Transmission**:  
  - Planetary or harmonic drive for compact, high-torque, low-backlash reduction.  
- **Result**:  
  - High-precision, repeatable positioning with strong load capacity.

### 2. Lightweight 4-DOF Arm (Hobby / Educational)

- **Motor**: RC servos or DC motors with encoders.  
- **Transmission**:  
  - Small spur gear reductions or timing belt stages.  
- **Result**:  
  - Adequate precision at low cost, simple construction and maintenance.

### 3. Mobile Robot Drive

- **Motor**: Brushed DC or BLDC motor with encoder.  
- **Transmission**:  
  - Gearbox (spur/planetary) for wheel speed and torque.  
  - Possibly chain or timing belt to offset wheel.  
- **Result**:  
  - Sufficient torque to move the robot and climb small obstacles; wheel encoders for odometry.

---

## Practical Considerations

When designing transmissions for Physical AI systems:

1. **Load and duty cycle**  
   - Calculate peak and continuous torque requirements.  
   - Choose gear/belt systems that handle both without excessive heating or wear.

2. **Backlash and stiffness**  
   - For high-precision control, prioritize low-backlash solutions (properly designed gear trains, harmonic drives, tensioned timing belts).  
   - Consider torsional stiffness and flex under load.

3. **Efficiency and heat**  
   - Gears and belts have different efficiencies; worm gears tend to be less efficient.  
   - Losses turn into heat—important in compact, enclosed joints.

4. **Maintenance and wear**  
   - Belts may stretch and need re-tensioning.  
   - Gears require lubrication and proper sealing.  
   - Harmonic drives have finite life depending on load cycles.

5. **Packaging and mass distribution**  
   - Place heavy motors and gearboxes close to the robot base where possible.  
   - Use belts, shafts, or linkages to transmit motion to distal joints to reduce moving inertia.

---

## Next Steps

To connect transmissions with the rest of your system:

- **[Motors](./motors.md)** – How motor characteristics interact with gear ratios and loads.  
- **[Motor Control](./motor-control.md)** – Electrical control of motors that drive these transmissions.  
- **[Mechanism Design](./mechanisms.md)** – Linkages, joints, and how transmissions fit into the overall robot structure.

These topics together will help you design mechanical power trains that match your robot’s performance, precision, and reliability requirements.
