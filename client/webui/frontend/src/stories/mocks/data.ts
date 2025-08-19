import type { AgentCard, MessageFE } from "@/lib/types";

export const mockAgents: AgentCard[] = [
    {
        name: "OrchestratorAgent",
        display_name: "Orchestrator",
        description: "Coordinates tasks between multiple agents",
        capabilities: ["task_coordination", "agent_selection"],
    },
    {
        name: "AssistantAgent",
        display_name: "Assistant",
        description: "General purpose assistant agent",
        capabilities: ["conversation", "information_retrieval"],
    },
    {
        name: "DeveloperAgent",
        display_name: "Developer",
        description: "Specialized in software development tasks",
        capabilities: ["code_generation", "code_review", "debugging"],
    },
];

export const mockMessages: MessageFE[] = [
    {
        isUser: false,
        text: "Hi! I'm the Orchestrator Agent. How can I help?",
        isComplete: true,
        metadata: { sessionId: "mock-session-id", lastProcessedEventSequence: 0 },
    },
    {
        isUser: true,
        text: "Hello! I need help with a coding task.",
        isComplete: true,
        metadata: { sessionId: "mock-session-id", lastProcessedEventSequence: 1 },
    },
    {
        isUser: false,
        text: "I'd be happy to help with your coding task. Could you please provide more details about what you're working on?",
        isComplete: true,
        metadata: { sessionId: "mock-session-id", lastProcessedEventSequence: 2 },
    },
];

export const mockLoadingMessage: MessageFE = {
    isUser: false,
    text: "Working on your request...",
    isStatusBubble: true,
    isComplete: false,
    taskId: "mock-task-id",
    metadata: { sessionId: "mock-session-id", lastProcessedEventSequence: 5 },
};
