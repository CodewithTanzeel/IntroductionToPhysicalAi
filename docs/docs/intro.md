sidebar_position: 1

# Tutorial Intro

Let's discover **Docusaurus in less than 5 minutes**.

## Getting Started

Get started by **creating a new site**.

Or **try Docusaurus immediately** with **[docusaurus.new](https://docusaurus.new)**.

### What you'll need

  - When installing Node.js, you are recommended to check all checkboxes related to dependencies.

## Generate a new site

Generate a new Docusaurus site using the **classic template**.

The classic template will automatically be added to your project after you run the command:

```bash
npm init docusaurus@latest my-website classic
```

You can type this command into Command Prompt, Powershell, Terminal, or any other integrated terminal of your code editor.

The command also installs all necessary dependencies you need to run Docusaurus.

## Start your site

Run the development server:

```bash
cd my-website
npm run start
```

The `cd` command changes the directory you're working with. In order to work with your newly created Docusaurus site, you'll need to navigate the terminal there.

The `npm run start` command builds your website locally and serves it through a development server, ready for you to view at http://localhost:3000/.

Open `docs/intro.md` (this page) and edit some lines: the site **reloads automatically** and displays your changes.
---
sidebar_position: 1
---

# Introduction to Physical AI

Welcome to **Introduction to Physical AI** - your comprehensive guide to understanding how artificial intelligence interacts with the physical world through sensors, actuators, and intelligent systems.

## What is Physical AI?

**Physical AI** refers to artificial intelligence systems that perceive and interact with the physical world. Unlike traditional AI that operates purely in digital environments, Physical AI combines:

- 🎯 **Perception**: Sensors to gather data from the environment (cameras, LIDAR, IMUs)
- 🤖 **Action**: Actuators to manipulate the physical world (motors, grippers, displays)
- 🧠 **Intelligence**: AI algorithms to process sensory data and make decisions
- 🔄 **Feedback**: Closed-loop systems that continuously adapt to changes

Physical AI is at the heart of autonomous vehicles, robotic systems, smart manufacturing, and assistive technologies.

## Why Physical AI Matters

The integration of AI with physical systems is transforming industries:

- **Autonomous Vehicles**: Self-driving cars use cameras, LIDAR, and radar to navigate safely
- **Industrial Robotics**: Smart robots adapt to variations in manufacturing processes
- **Healthcare**: Surgical robots provide precision and assistive devices enhance mobility
- **Agriculture**: Autonomous drones and robots optimize crop monitoring and harvesting
- **Smart Cities**: Intelligent systems manage traffic, energy, and infrastructure

## What You'll Learn

This documentation covers the fundamental building blocks of Physical AI:

### 🔧 Hardware Foundations
- Sensors: Cameras, LIDAR, IMUs, tactile sensors
- Actuators: Motors, servos, pneumatics, hydraulics
- Communication protocols: I2C, SPI, UART, CAN bus

### 💻 Software & Algorithms
- Computer vision and image processing
- Sensor fusion and state estimation
- Control systems: PID, MPC, optimal control
- Path planning and navigation
- Machine learning for robotics

### 🤖 Integration & Systems
- Robot Operating System (ROS)
- Real-time systems and embedded programming
- Simulation and testing environments
- Safety and reliability considerations

## Getting Started

Ready to dive in? Here's your learning path:

1. **Fundamentals**: Start with [Sensors](/docs/sensors/intro) to understand how robots perceive the world
2. **Actuation**: Learn about [Actuators](/docs/actuators/intro) and how to control movement
3. **Perception**: Explore [Computer Vision](/docs/computer-vision/intro) for visual understanding
4. **Control**: Master [Control Systems](/docs/control-systems/intro) for precise manipulation
5. **Integration**: Build complete systems with [ROS Basics](/docs/ros/intro)

## Interactive AI Assistant

Notice the **chat widget** in the bottom-right corner? That's your AI-powered documentation assistant! Ask it questions about any Physical AI topic and get instant answers based on this documentation.

Try asking:
- "What types of sensors are used in robotics?"
- "How does a PID controller work?"
- "Explain the difference between LIDAR and cameras"

## Prerequisites

To get the most out of this documentation, you should have:

- Basic programming knowledge (Python or C++)
- Understanding of linear algebra and calculus
- Familiarity with basic physics concepts
- Interest in robotics and intelligent systems

Don't worry if you're missing some prerequisites - we'll explain concepts as we go!

## Let's Begin! 🚀

Physical AI is an exciting field where software meets the physical world. Whether you're building autonomous robots, smart sensors, or intelligent control systems, this documentation will provide the knowledge you need.

Start your journey by exploring the **[Sensors](/docs/sensors/intro)** section, or use the AI assistant to ask specific questions!
