---
title: DeepLearning
---


# Deep Learning for Computer Vision

Deep learning has reshaped computer vision by allowing models to learn directly from raw pixels instead of relying on hand-crafted features. Convolutional Neural Networks (CNNs) now power image classification, object detection, semantic segmentation, pose estimation, and many other tasks in Physical AI systems.

For robots, deep vision enables robust **scene understanding**: detecting people and objects, estimating distances, recognizing places, and interpreting human gestures and actions, often in real time and under challenging conditions.

---

## What Is a CNN?

A **Convolutional Neural Network (CNN)** is a neural network architecture designed for grid-like data, such as images. It exploits *local connectivity* and *weight sharing* to efficiently recognize patterns at different spatial scales.

### Core building blocks

- **Convolutional layers**  
  - Apply small learned filters (kernels) across the image or feature map.  
  - Each filter detects a specific pattern: edges, corners, textures, shapes, etc.  
  - Outputs are feature maps that highlight where patterns occur.

- **Nonlinear activations**  
  - Functions like ReLU, LeakyReLU, or GELU are applied after convolutions.  
  - Introduce non-linearity so the network can approximate complex functions.

- **Pooling layers**  
  - Downsample feature maps (e.g., max or average pooling).  
  - Reduce spatial resolution and computation.  
  - Provide translational invariance (robustness to small shifts).

- **Normalization layers**  
  - Batch normalization or layer normalization stabilize training.  
  - Help gradients flow and allow higher learning rates.

- **Classifier or task head**  
  - After a series of convolutional blocks, the network aggregates features (via global pooling or flattening) and feeds them to fully connected layers.  
  - Output can be class probabilities, bounding boxes, keypoints, or per-pixel labels depending on the task.

### Hierarchical feature learning

Early layers focus on simple patterns (edges, color blobs).  
Middle layers capture parts of objects (corners of objects, textures).  
Deeper layers represent high-level concepts (whole objects or categories).

This hierarchy is one of the main reasons CNNs generalize well across many vision tasks.

---

## Transfer Learning

Training a deep network from scratch often requires millions of labeled images and significant compute. **Transfer learning** mitigates this by reusing a network pre-trained on a large dataset (like ImageNet) and adapting it to a new task or domain.

### Common transfer learning strategies

1. **Feature extractor mode**

   - Freeze most or all of the pre-trained backbone (no gradient updates).  
   - Replace the final classifier layer with a new one matching your number of classes.  
   - Train only the new head.  

   Suitable when:
   - Your dataset is small.  
   - Target domain is not extremely different from the pre-training domain.

2. **Fine-tuning**

   - Initialize with pre-trained weights.  
   - Unfreeze some or all of the deeper layers.  
   - Train with a relatively low learning rate so weights adapt gradually.  

   Suitable when:
   - You have a moderate dataset size.  
   - Domain differs from standard datasets (e.g., industrial parts, medical images, warehouse scenes).

3. **Layer-wise freezing/unfreezing**

   - Start by training only the head.  
   - Then progressively unfreeze earlier layers.  
   - This staged approach often yields stable training and better performance.

### Benefits in robotics

- Faster convergence and better accuracy with limited labeled data.  
- Ability to adapt general visual knowledge to specific environments (factories, farms, warehouses).  
- Reduced need for extensive in-house data collection for basic visual capabilities.

---

## Common Architectures

Several architectures have become “standard building blocks” for vision tasks. They can be used as stand-alone models or as backbones for more complex systems.

### ResNet (Residual Networks)

ResNet introduces **residual connections** (skip connections) that let information and gradients bypass some layers:

- A residual block computes \(y = F(x) + x\), where \(F(x)\) is a few convolutional layers.  
- This makes training very deep networks (50+ layers) more stable, combating vanishing gradients.

Typical variants:

- **ResNet-18/34**: Smaller, suitable as general backbones or starting points.  
- **ResNet-50/101**: Deeper, widely used in detection and segmentation frameworks.

Use cases:

- Image classification.  
- Backbone for object detectors (e.g., Faster R-CNN) and segmentation networks.

---

### MobileNet (and other lightweight models)

MobileNet is designed for **resource-constrained devices** like embedded boards and mobile processors.

Key ideas:

- **Depthwise separable convolutions**:  
  - Split a standard convolution into a depthwise spatial convolution followed by a pointwise (1×1) convolution.  
  - Greatly reduce parameter count and FLOPs compared to standard convolutions.

- **Width and resolution multipliers**:  
  - You can shrink the network width (number of channels) or input resolution to trade accuracy for speed.

Typical uses:

- Real-time perception on drones and small ground robots.  
- Onboard inference where power, latency, and memory are limited.

Related families: EfficientNet(-Lite), ShuffleNet, SqueezeNet, etc., which also target efficient inference.

---

### YOLO (You Only Look Once)

YOLO is a family of single-stage **object detectors** optimized for real-time use.

Key characteristics:

- Treats detection as a single regression problem directly from image pixels to bounding boxes and class probabilities.  
- Divides the image into grids, with each cell predicting bounding boxes and class scores.  
- Uses non-max suppression in post-processing to remove redundant detections.

Modern YOLO variants (e.g., YOLOv5, v7, v8, and similar families) offer:

- Scaled versions (small/medium/large) for different speed/accuracy trade-offs.  
- Pre-trained weights for common datasets, making transfer learning easier.

Typical uses in Physical AI:

- Detecting people, vehicles, pallets, tools, and obstacles.  
- Safety monitoring, zone enforcement, and real-time tracking in factories or warehouses.

---

## Typical Training Pipeline

Training a deep vision model generally follows a structured pipeline from data to deployable model.

### Data preparation

1. **Collect data**  
   - Gather images representative of the deployment environment (lighting, backgrounds, sensor type).  
   - Ensure class balance or plan for strategies to handle imbalanced datasets.

2. **Label data**  
   - For classification: image-level labels.  
   - For detection: bounding boxes and class labels per object.  
   - For segmentation: pixel-level masks.  

3. **Split data**  
   - Training set for learning.  
   - Validation set for hyperparameter tuning and early stopping.  
   - Test set for final evaluation.

### Data augmentation

Augmentation improves robustness and reduces overfitting:

- Geometric: random crops, rotations, flips, scaling, perspective transforms.  
- Photometric: brightness, contrast, saturation, hue changes, Gaussian noise.  
- Task-specific: random erasing, cutout, mixup, mosaic (common in detection frameworks).

Crucially, augmentations should reflect the kinds of variability expected in the real world.

---

## Minimal Training Example (Transfer Learning, Classification)

A conceptual PyTorch-style example showing transfer learning with ResNet:

```python
import torch
import torch.nn as nn
from torchvision import models, datasets, transforms

# 1. Transforms: resize, augment, normalize
transform_train = transforms.Compose([
  transforms.Resize((224, 224)),
  transforms.RandomHorizontalFlip(),
  transforms.ColorJitter(brightness=0.2, contrast=0.2),
  transforms.ToTensor(),
  transforms.Normalize(
    mean=[0.485, 0.456, 0.406],
    std=[0.229, 0.224, 0.225]
  ),
])

transform_val = transforms.Compose([
  transforms.Resize((224, 224)),
  transforms.ToTensor(),
  transforms.Normalize(
    mean=[0.485, 0.456, 0.406],
    std=[0.229, 0.224, 0.225]
  ),
])

train_ds = datasets.ImageFolder("data/train", transform=transform_train)
val_ds = datasets.ImageFolder("data/val", transform=transform_val)

train_loader = torch.utils.data.DataLoader(train_ds, batch_size=32, shuffle=True)
val_loader = torch.utils.data.DataLoader(val_ds, batch_size=32, shuffle=False)

# 2. Load pre-trained model and adapt classifier
model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
num_features = model.fc.in_features
model.fc = nn.Linear(num_features, len(train_ds.classes))

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)

# 3. Simple training loop (no checkpointing / scheduling shown)
for epoch in range(20):
  model.train()
  for images, labels in train_loader:
    optimizer.zero_grad()
    outputs = model(images)
    loss = criterion(outputs, labels)
    loss.backward()
    optimizer.step()

  # Validation pass (simplified)
  model.eval()
  correct = 0
  total = 0
  with torch.no_grad():
    for images, labels in val_loader:
      outputs = model(images)
      preds = outputs.argmax(dim=1)
      correct += (preds == labels).sum().item()
      total += labels.size(0)
  val_acc = correct / total
  print(f"Epoch {epoch}: val_acc = {val_acc:.3f}")
```

In documentation, you can annotate this example with comments explaining each step (data loading, model modification, training loop, validation).

---

## Practical Training Recipes

### 1. Classification (ResNet / MobileNet)

- **Start with transfer learning** using a pre-trained backbone.  
- **Batch size**: start at 32 (adjust for GPU memory).  
- **Learning rate**: ~1e-4 to 1e-3 for fine-tuning.  
- **Scheduler**: cosine decay or step decay often helps.  
- **Stopping**: use early stopping on validation loss/accuracy.

### 2. Object Detection (YOLO-like)

- Use a detection-specific framework (YOLO, SSD, etc.) with configuration files for model, training, and augmentation.  
- Ensure bounding boxes are accurate and consistent (labeling quality is critical).  
- Monitor mAP (mean Average Precision), not just loss.  
- Use stronger augmentations like mosaic or mixup if supported.

### 3. Domain adaptation and robustness

- Include data from different lighting, seasons, or camera types when possible.  
- If models degrade in new environments, collect a small target-domain dataset and fine-tune.  
- For safety-critical robots, combine learned perception with geometric checks (e.g., depth thresholds) as a backup.

---

## Deployment in Physical AI Systems

Once trained, models must run efficiently and reliably on robot hardware.

### 1. Model optimization and export

- **Export**: Convert the model to ONNX or a framework-specific deployable format.  
- **Optimization**: Use tools (e.g., TensorRT, TFLite converters) to:
  - Fuse layers.  
  - Quantize to lower precision (FP16, INT8) for speed and memory savings.  
  - Optimize for specific GPU/CPU accelerators.

- **Benchmark**: Measure latency (ms per frame), throughput (fps), and memory usage on the target device.

### 2. Integration into perception pipeline

Typical runtime pipeline:

Camera / Sensor
↓
Preprocessing (resize, normalize, batching)
↓
Deep Model (CNN / YOLO / MobileNet)
↓
Postprocessing

Thresholding, non-max suppression

Tracking and smoothing across frames
↓
Perception Outputs (detections, labels, masks)
↓
Robot Logic

Navigation, manipulation, UI, logging

text

- Maintain consistent preprocessing between training and deployment (same resizing, normalization, color order).  
- Implement health checks: if the model fails or confidence drops, trigger fallback behavior.

### 3. Safety and interpretability

- For safety-critical applications, combine deep models with simpler rule-based checks (e.g., minimum distance limits from depth sensors).  
- Use logging and visualization tools to inspect intermediate outputs during testing.  
- Consider using saliency maps or feature visualizations for debugging and explaining model behavior.

---

## Example: Deep Vision in a Warehouse Robot

┌──────────────────────────────────────────────┐
│ Warehouse Mobile Robot │
├──────────────────────────────────────────────┤
│ - Front RGB Camera │
│ → CNN-based detector (YOLO) │
│ → Detects pallets, people, forklifts │
│ │
│ - Side Depth Camera │
│ → Depth-based obstacle detection │
│ │
│ - Perception Node │
│ → Fuses detections and depth │
│ → Publishes semantic and geometric info │
│ │
│ - Navigation Stack │
│ → Plans safe paths around detected items │
└──────────────────────────────────────────────┘

text

Deep learning handles semantics (what and where objects are), while geometric sensors and planners ensure collision-free motion.

---

## Next Steps

To expand this section in your documentation:

- **CNN Fundamentals**  
  - Explain convolutions, receptive fields, stride, padding, and feature maps with diagrams.

- **Transfer Learning & Fine-Tuning**  
  - Walk through full examples with dataset structure, training logs, and tips for small datasets.

- **Object Detection with YOLO**  
  - Show how to label data, configure a model, train, evaluate, and deploy on a robot.

- **Edge Deployment & Optimization**  
  - Provide recipes for exporting models, quantizing, and integrating with ROS or other middleware.

These topics will bridge the gap between high-level deep learning concepts and practical, deployable computer vision systems in Physical AI.