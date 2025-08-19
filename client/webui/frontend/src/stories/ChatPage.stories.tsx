import type { Meta, StoryObj } from "@storybook/react";
import { within } from '@testing-library/react';

import { ChatPage } from "@/lib/components/pages/ChatPage";

import { mockMessages, mockLoadingMessage } from "./mocks/data";

const meta = {
    title: "Pages/ChatPage",
    component: ChatPage,
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: "The main chat page component that displays the chat interface, side panels, and handles user interactions.",
            },
        },
        msw: {
            handlers: [],
        },
    },
    decorators: [
        Story => (
            <div style={{ height: "100vh", width: "100vw" }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ChatPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    parameters: {
        chatContext: {
            sessionId: "mock-session-id",
            messages: mockMessages,
            userInput: "",
            isResponding: false,
            isCancelling: false,
            selectedAgentName: "OrchestratorAgent",
            isSidePanelCollapsed: true,
            activeSidePanelTab: "files",
        },
    },
    render: () => <ChatPage />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await canvas.findByTestId("Expand Panel");
        await canvas.findByTestId("Send message");
    },
};

export const WithLoadingMessage: Story = {
    parameters: {
        chatContext: {
            sessionId: "mock-session-id",
            messages: [...mockMessages, mockLoadingMessage],
            userInput: "",
            isResponding: true,
            isCancelling: false,
            selectedAgentName: "OrchestratorAgent",
            isSidePanelCollapsed: true,
            activeSidePanelTab: "files",
        },
    },
    render: () => <ChatPage />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await canvas.findByTestId("Expand Panel");
        await canvas.findByTestId("View Agent Workflow");
        await canvas.findByTestId("Cancel");
    },
};

export const WithSidePanelOpen: Story = {
    parameters: {
        chatContext: {
            sessionId: "mock-session-id",
            messages: mockMessages,
            userInput: "",
            isResponding: false,
            isCancelling: false,
            selectedAgentName: "OrchestratorAgent",
            isSidePanelCollapsed: false,
            isSidePanelTransitioning: false,
            activeSidePanelTab: "files",
            artifacts: [],
            artifactsLoading: false,
        },
    },
    render: () => <ChatPage />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await canvas.findByTestId("Collapse Panel");
        await canvas.findByText("No files available");
    },
};
