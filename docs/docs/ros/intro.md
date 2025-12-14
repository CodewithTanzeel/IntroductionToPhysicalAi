---
title: ROS (Robot Operating System)
---


# Introduction to ROS (Robot Operating System)

ROS is the software backbone of many modern robots. It provides a common way to connect sensors, actuators, algorithms, and user interfaces so you can build complex robotic systems from modular, reusable components.

ROS is not an operating system in the traditional sense. Instead, it is a **middleware framework** that runs on top of Linux (and other platforms in ROS 2), offering standardized communication patterns, tools, and libraries for robot development.

---

## What Is ROS?

A **ROS-based system** is composed of multiple processes (called *nodes*) that exchange data over a network. This design encourages separation of concerns: one node can handle sensors, another control, another planning, and so on.

### Key Characteristics

Every ROS system is built around a few core ideas:

- **Distributed computing**: Many small processes cooperating over a network.  
- **Standardized messages**: Well-defined data types for sensors, commands, and state.  
- **Language flexibility**: Support for C++, Python, and other languages.  
- **Tooling support**: Command-line tools, visualization, logging, and debugging utilities.  

---

## Core ROS Concepts

ROS provides several communication primitives to model different interaction patterns between components.

### 1. Nodes

A **node** is an executable that performs one specific function:

- A camera driver node publishes images.  
- A localization node subscribes to sensor data and publishes robot pose.  
- A controller node subscribes to commands and talks to motors.  

Nodes can run on one machine or be distributed across multiple computers connected via a network.

### 2. Topics

A **topic** is a named channel for streaming data:

- Nodes **publish** messages to a topic.  
- Other nodes **subscribe** to that topic to receive those messages.  

Typical topics:

- `/scan` – LIDAR data  
- `/camera/image` – camera images  
- `/cmd_vel` – velocity commands  

Topics are ideal for **continuous data streams** such as sensor readings, commands, and state estimates.

### 3. Services

A **service** implements a request–response interaction:

- A client sends a request (with parameters).  
- A server processes it and returns a response.  

Services are used for **discrete operations**, such as:

- Resetting odometry  
- Loading a new map  
- Querying configuration or status  

They are synchronous: the client waits for the response.

### 4. Actions

An **action** is designed for **long-running, cancellable tasks**:

- A client sends a goal (e.g. “navigate to this pose”).  
- The server executes the task, periodically sending feedback.  
- The client can cancel or modify the goal if needed.  

Actions are commonly used for navigation, arm motion, and other tasks that take noticeable time.

---

## ROS Communication at a Glance

```text
  +--------------+          Topic: /scan          +-------------------+
  |  LIDAR Node  | -----------------------------> |  Obstacle Detector |
  +--------------+                                +-------------------+

  +-----------------+   Service: /reset_odom   +------------------+
  |  GUI Interface  | <----------------------> |  Localization Node |
  +-----------------+                          +------------------+

  +----------------+   Action: /navigate_to_pose   +------------------+
  |  Planner Node  | <---------------------------> |  Nav Controller  |
  +----------------+                               +------------------+
```

---

## Building and Running ROS Packages

ROS organizes your code into **packages**, which group nodes, libraries, configuration, and launch files.

### 1. Packages and Workspaces

- A **package** is the basic unit of code organization (e.g. `my_robot_bringup`, `lidar_driver`).  
- A **workspace** is a directory that contains one or more packages and build artifacts.  

Typical workflow:

1. Create a workspace and `src` folder.  
2. Create or clone packages into `src`.  
3. Build the workspace with the ROS build system (e.g. `colcon` in ROS 2).  
4. Source the setup script and run nodes.  

### 2. Launch Files

**Launch files** allow you to start multiple nodes and set parameters with a single command:

- Start drivers, processing nodes, and visualization together.  
- Switch between simulation and real hardware by changing a launch file, not code.  
- Manage remappings, parameters, and namespaces centrally.  

---

## Simulation with Gazebo and RViz

Simulation is a core part of ROS-based development and is tightly integrated into most workflows.

### 1. Gazebo

**Gazebo** is a physics-based simulator that models:

- Robot bodies and joints  
- Sensors (cameras, LIDAR, IMU, etc.)  
- Environments and obstacles  

Sensors and actuators in Gazebo are exposed as ROS topics, services, and actions. This means your real ROS code can be tested in simulation with minimal changes.

Typical steps:

1. Define a robot model (URDF/SDF).  
2. Launch Gazebo with your robot and environment.  
3. Use ROS nodes to command the robot and read simulated sensors.  

### 2. RViz

**RViz** is a 3D visualization tool for ROS:

- Visualize robot geometry and coordinate frames.  
- Display LIDAR scans, point clouds, and camera images.  
- Inspect path plans, trajectories, and markers.  
- Debug TF transforms and topic data.  

RViz is often used alongside Gazebo: Gazebo simulates physics and sensors, while RViz shows how the robot “perceives” the world in ROS.

---

## Integrating Sensors and Actuators with ROS

ROS provides standardized message types and ecosystem support for connecting real hardware.

### 1. Sensors

Common integration patterns:

- Use vendor or open-source **drivers** to publish sensor data as standard ROS messages:
  - `sensor_msgs/Image` for cameras  
  - `sensor_msgs/LaserScan` or `sensor_msgs/PointCloud2` for LIDAR  
  - `sensor_msgs/Imu` for inertial sensors  
- Configure frame IDs and transforms so the rest of your stack (e.g. navigation) can interpret data correctly.

### 2. Actuators

Actuators are often controlled through:

- Low-level drivers that talk to motor controllers or joint drivers.  
- Higher-level interfaces like `ros_control` / `ros2_control`, which expose:
  - Topics for simple commands (e.g. `geometry_msgs/Twist` for mobile bases).  
  - Actions for trajectories (e.g. `FollowJointTrajectory` for arms).  

Typical flow in a robot:

Sensors (camera, LIDAR, IMU)
↓
Perception & Localization Nodes
↓
Planning Node (path / motion)
↓
Control Node (velocity / joint targets)
↓
Actuators (motors, joints)

```text
  (feedback loop continues here)
```

---

## Example: ROS in a Mobile Robot

```
┌────────────────────────────────────────────┐
│ Mobile Robot                                │
├────────────────────────────────────────────┤
│ - LIDAR Node → /scan                        │
│ - IMU Node → /imu                           │
│ - Wheel Encoders → /odom                    │
│ - Localization → /pose                      │
│ - Navigation Stack ↔ /navigate_to_pose      │
│ - Controller ← /cmd_vel                     │
│ - RViz on laptop ← visualizes topics        │
└────────────────────────────────────────────┘
```


Each box inside the robot corresponds to one or more ROS nodes. The navigation stack fuses sensor topics, plans a path, and sends commands to the controller, which drives the motors.

---

## Practical Considerations

When designing a ROS-based system:

### 1. Modularity

- Keep nodes focused on a single responsibility.  
- Use topics for streaming data and actions for long-running tasks.  

### 2. Debugging and Introspection

- Use command-line tools (`ros2 topic list`, `ros2 topic echo`, etc.) to inspect data flow.  
- Use RViz to visualize coordinate frames, sensor data, and robot state.  

### 3. Simulation First

- Bring up your robot in Gazebo before deploying on real hardware.  
- Use the same ROS interfaces so code moves cleanly from simulation to the real robot.  

### 4. Reuse and Ecosystem

- Leverage existing packages (navigation, SLAM, drivers) instead of reinventing them.  
- Follow common conventions (message types, frame naming) to stay compatible with community tools.  

---

## Next Steps

Now that you have an overview of ROS, you can dive into more focused sections:

- **ROS Concepts: Nodes, Topics, Services, Actions**  
- **Building and Running ROS Packages**  
- **Simulation with Gazebo and RViz**  
- **Integrating Sensors and Actuators**  

These pages will walk through practical examples and tutorials to help you build and integrate complete robotic systems with ROS.