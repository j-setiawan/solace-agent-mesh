# Storybook Tests for Solace Agent Mesh Frontend

This directory contains Storybook tests for the Solace Agent Mesh frontend components. These tests allow you to view and interact with components in isolation, making it easier to develop and test UI components.

## Running Storybook

To run Storybook, use the following command:

```bash
cd solace-agent-mesh/client/webui/frontend
npm run storybook
```

This will start the Storybook development server, and you can view your stories in the browser.

## Directory Structure

- `.storybook/`: Configuration files for Storybook
- `src/stories/`: Story files for components
  - `mocks/`: Mock providers and data for testing
  - `decorators/`: Storybook decorators for wrapping stories

## Mock Providers

We've created several mock providers to simulate the context providers used in the application:

- `MockChatProvider`: Provides mock chat context
- `MockTaskProvider`: Provides mock task context
- `MockConfigProvider`: Provides mock config context

These providers are combined in the `StoryProvider` component, which is used by the `withProviders` decorator to wrap stories.

## Adding New Stories

To add a new story:

1. Create a new file in the `src/stories/` directory
2. Import the component you want to test
3. Create a default export with the component's metadata
4. Create named exports for each story
5. Use the `withProviders` decorator to wrap your stories

Example:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from '@/lib/components';

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Component props
  },
  parameters: {
    chatContext: {
      // Chat context values
    },
    taskContext: {
      // Task context values
    },
    configContext: {
      // Config context values
    }
  },
};
```

## Best Practices

- Use the `withProviders` decorator for all stories
- Provide sensible default values for context and hooks
- Use the `parameters` object to provide context values and hook mocks
- Use the `args` object to provide component props
- Use the `docs` parameter to provide documentation for your stories
