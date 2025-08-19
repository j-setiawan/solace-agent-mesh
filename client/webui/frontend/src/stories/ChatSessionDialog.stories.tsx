import type { Meta, StoryObj } from '@storybook/react';
import { ChatSessionDialog } from '@/lib/components/chat/ChatSessionDialog';
import { screen } from '@testing-library/react';

const meta = {
  title: 'Components/Chat/ChatSessionDialog',
  component: ChatSessionDialog,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ChatSessionDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Dialog closed'),
  },
  parameters: {
    chatContext: {
      handleNewSession: () => console.log('New session created'),
    },
  },
  play: async () => {
        await screen.findByRole("dialog");
        await screen.findByRole("button", { name: "Start New Chat" });
    },
};
