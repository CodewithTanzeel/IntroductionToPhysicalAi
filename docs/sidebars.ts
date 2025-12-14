import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',

    {
      type: 'category',
      label: 'Foundations',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Sensors',
          items: [
            'sensors/intro',
            'sensors/cameras',
            'sensors/imu',
            'sensors/lidar',
            'sensors/fusion',
          ],
        },
        {
          type: 'category',
          label: 'Actuators',
          items: [
            'actuators/intro',
            'actuators/motors',
            'actuators/power-electronics',
            'actuators/transmissions',
          ],
        },
        {
          type: 'category',
          label: 'Computer Vision',
          items: [
            'computer-vision/intro',
            'computer-vision/calibration',
            'computer-vision/deep-learning',
            'computer-vision/visual-slam',
            'computer-vision/Three-d-reconstruction',
          ],
        },
      ],
    },

    {
      type: 'category',
      label: 'Control & Estimation',
      collapsed: false,
      items: [
        'control-systems/intro',
      ],
    },

    {
      type: 'category',
      label: 'Systems & Integration',
      collapsed: false,
      items: [
        'ros/intro',
      ],
    },
  ],
};

export default sidebars;
