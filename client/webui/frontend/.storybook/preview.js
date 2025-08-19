import '../src/lib/index.css';
import "solace-agent-mesh-ui/dist/solace-agent-mesh-ui.css"; // Add this line

import { withProviders } from '../src/stories/decorators/withProviders';

/** @type { import('@storybook/react').Preview } */
const preview = {
  decorators: [withProviders],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
      ],
    },
    layout: 'centered',
  },
};

export default preview;
