---
sidebar_position: 2
---

# Introduction to Actuators

Actuators are the **muscles** of Physical AI systems. While sensors gather information about the environment, actuators enable robots and intelligent systems to **take action** and manipulate the physical world.

## What Are Actuators?

An **actuator** is a device that converts energy (electrical, hydraulic, pneumatic, or thermal) into mechanical motion. Actuators are controlled by AI systems to produce desired movements and forces.

### Types of Motion

Actuators can produce different types of motion:

- **Linear Motion**: Movement in a straight line (pistons, linear actuators)
- **Rotary Motion**: Circular or spinning movement (motors, servos)
- **Oscillatory Motion**: Back-and-forth movement (vibration motors)
- **Complex Motion**: Combination of multiple motion types (robotic arms)

## Types of Actuators

### 1. Electric Motors ⚡

The most common actuators in robotics:

#### **DC Motors**
- Simple brushed motors for continuous rotation
- Easy to control speed with voltage
- Low cost, suitable for wheeled robots
- Example: Robot wheels, conveyor belts

#### **Servo Motors**
- Precise position control (typically 0-180° or 0-360°)
- Built-in feedback for accurate positioning
- Common in robotic arms and joints
- Example: Robotic gripper, camera pan/tilt

#### **Stepper Motors**
- Move in discrete steps (e.g., 1.8° per step)
- Excellent position control without feedback
- Used where precision is critical
- Example: 3D printers, CNC machines

#### **Brushless DC Motors (BLDC)**
- High efficiency and power density
- Longer lifespan than brushed motors
- Require electronic speed controllers (ESC)
- Example: Drones, electric vehicles

### 2. Hydraulic Actuators 💧

Use pressurized fluid to generate force:

**Advantages**:
- Very high force output
- Smooth, continuous motion
- Excellent for heavy-duty applications

**Disadvantages**:
- Complex system (pump, reservoir, valves)
- Potential for leaks
- Requires maintenance

**Use Cases**: Construction equipment, large industrial robots, aircraft control surfaces

### 3. Pneumatic Actuators 💨

Use compressed air to generate motion:

**Advantages**:
- Clean and safe (air, not oil)
- Fast response time
- Good for pick-and-place operations

**Disadvantages**:
- Lower force than hydraulics
- Difficult to achieve precise position control
- Requires compressor and air supply

**Use Cases**: Manufacturing automation, packaging, door automation

### 4. Piezoelectric Actuators 🔬

Use piezoelectric materials that change shape with voltage:

**Characteristics**:
- Extremely precise (nanometer resolution)
- Very fast response
- Small displacement range
- High force for size

**Use Cases**: Microscopy, precision positioning, ultrasonic motors

### 5. Shape Memory Alloys (SMA) 🔥

Materials that change shape when heated:

**Characteristics**:
- Simple mechanism (just apply current to heat)
- Silent operation
- Slow response time
- Good force-to-weight ratio

**Use Cases**: Soft robotics, compact actuators, bio-inspired systems

## Motor Control Basics

Controlling actuators requires understanding key concepts:

### Speed Control

For DC motors, speed is controlled by voltage:

```python
# Simple DC motor control
def set_motor_speed(motor_pin, speed_percent):
    # PWM (Pulse Width Modulation) controls average voltage
    # speed_percent: 0-100
    pwm_duty_cycle = speed_percent / 100.0
    motor_pin.set_pwm(pwm_duty_cycle)

set_motor_speed(motor1, 75)  # 75% speed
```

### Position Control

Servos use PWM signals for position:

```python
# Servo position control
def set_servo_angle(servo, angle):
    # Typical servo: 0-180 degrees
    # PWM pulse width: 1ms (0°) to 2ms (180°)
    pulse_width = 1.0 + (angle / 180.0)  # milliseconds
    servo.set_pulse_width(pulse_width)

set_servo_angle(gripper_servo, 90)  # 90-degree position
```

### Direction Control

H-Bridge circuits control motor direction:

```python
# Motor direction control using H-Bridge
def set_motor_direction(motor, direction):
    if direction == "forward":
        motor.pin1.high()
        motor.pin2.low()
    elif direction == "backward":
        motor.pin1.low()
        motor.pin2.high()
    else:  # stop
        motor.pin1.low()
        motor.pin2.low()
```

## Motor Drivers and Controllers

Most actuators need driver circuits:

| Actuator Type | Driver/Controller | Purpose |
|---------------|-------------------|---------|
| DC Motor | H-Bridge (L298N, TB6612) | Direction and speed |
| Servo | PWM Controller (PCA9685) | Position control |
| Stepper | Stepper Driver (A4988, TMC2208) | Step sequencing |
| BLDC | ESC (Electronic Speed Controller) | Commutation and speed |

### Example: Controlling a DC Motor

```python
import RPi.GPIO as GPIO

# Setup
motor_pin1 = 17
motor_pin2 = 18
enable_pin = 25

GPIO.setmode(GPIO.BCM)
GPIO.setup(motor_pin1, GPIO.OUT)
GPIO.setup(motor_pin2, GPIO.OUT)
GPIO.setup(enable_pin, GPIO.OUT)

# Create PWM object for speed control
pwm = GPIO.PWM(enable_pin, 1000)  # 1000 Hz frequency
pwm.start(0)

def drive_motor(speed, direction):
    """
    speed: 0-100 (percentage)
    direction: 'forward' or 'backward'
    """
    if direction == 'forward':
        GPIO.output(motor_pin1, GPIO.HIGH)
        GPIO.output(motor_pin2, GPIO.LOW)
    else:
        GPIO.output(motor_pin1, GPIO.LOW)
        GPIO.output(motor_pin2, GPIO.HIGH)
    
    pwm.ChangeDutyCycle(speed)

# Drive motor forward at 75% speed
drive_motor(75, 'forward')
```

## Actuator Selection Criteria

Choosing the right actuator depends on:

### 1. **Force/Torque Requirements**
- How much force is needed?
- Continuous vs peak torque
- Safety margins

### 2. **Speed and Acceleration**
- Maximum speed required
- How quickly must it accelerate?
- Dynamic response

### 3. **Precision and Accuracy**
- Position accuracy needed
- Repeatability requirements
- Feedback necessary?

### 4. **Environmental Factors**
- Operating temperature range
- Dust, moisture, chemicals
- Outdoor vs indoor use

### 5. **Power and Efficiency**
- Available power source
- Battery life considerations
- Heat dissipation

### 6. **Size and Weight**
- Space constraints
- Weight limitations
- Integration complexity

## Safety Considerations

Actuators can be dangerous if not properly controlled:

⚠️ **Important Safety Measures**:

1. **Emergency Stop**: Always implement e-stop functionality
2. **Soft Limits**: Set software limits on range of motion
3. **Current Limiting**: Prevent motor damage and overheating
4. **Mechanical Stops**: Physical barriers to prevent over-travel
5. **Watchdog Timers**: Automatic shutdown if control is lost
6. **Force Limiting**: Prevent excessive force in collaborative robots

```python
# Example: Safety-conscious motor control
class SafeMotor:
    def __init__(self, min_position=0, max_position=180):
        self.min_pos = min_position
        self.max_pos = max_position
        self.current_pos = 90
        self.max_current = 2.0  # Amps
    
    def move_to(self, target_position):
        # Check soft limits
        if target_position < self.min_pos or target_position > self.max_pos:
            print(f"Error: Position {target_position} out of range")
            return False
        
        # Check current draw
        if self.get_current() > self.max_current:
            print("Error: Overcurrent detected, stopping motor")
            self.emergency_stop()
            return False
        
        # Safe to move
        self.current_pos = target_position
        self.actuate(target_position)
        return True
    
    def emergency_stop(self):
        # Immediately cut power
        self.set_speed(0)
        print("EMERGENCY STOP ACTIVATED")
```

## Real-World Example: Robotic Arm

A typical 6-DOF (Degrees of Freedom) robotic arm uses multiple actuators:

```
┌─────────────────────────────────────┐
│      6-DOF Robotic Arm              │
├─────────────────────────────────────┤
│ Joint 1 (Base):      Stepper Motor  │
│ Joint 2 (Shoulder):  Servo Motor    │
│ Joint 3 (Elbow):     Servo Motor    │
│ Joint 4 (Wrist 1):   Servo Motor    │
│ Joint 5 (Wrist 2):   Servo Motor    │
│ Joint 6 (Wrist 3):   Servo Motor    │
│ Gripper:             Linear Servo   │
└─────────────────────────────────────┘
```

Each joint requires:
- Motor/actuator
- Position feedback (encoder or potentiometer)
- Driver circuit
- Mechanical transmission (gears, belts)

## Next Steps

Dive deeper into specific actuator technologies:

- [Motor Types & Selection](./motors) - Detailed motor comparison
- [Motor Control Techniques](./control) - PID, feedforward, and advanced control
- [Power Electronics](./power-electronics) - Drivers, H-bridges, and ESCs
- [Mechanical Transmissions](./transmissions) - Gears, belts, and linkages

Ready to learn how robots see? Continue to **[Computer Vision](/docs/computer-vision/intro)**.
