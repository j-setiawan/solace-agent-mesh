import React from 'react';
import { ChatContext, type ChatContextValue } from '@/lib/contexts/ChatContext';
import { mockAgents } from './data';

// Default mock values for ChatContext
const defaultMockChatContext: ChatContextValue = {
  // State
  sessionId: 'mock-session-id',
  messages: [],
  userInput: '',
  isResponding: false,
  currentTaskId: null,
  selectedAgentName: 'MockAgent',
  notifications: [],
  agents: mockAgents,
  agentsLoading: false,
  agentsError: null,
  agentsRefetch: async () => {},
  isCancelling: false,
  artifacts: [],
  artifactsLoading: false,
  artifactsRefetch: async () => {},
  taskIdInSidePanel: null,
  isSidePanelCollapsed: false,
  activeSidePanelTab: 'files',
  isDeleteModalOpen: false,
  artifactToDelete: null,
  isArtifactEditMode: false,
  selectedArtifactFilenames: new Set(),
  isBatchDeleteModalOpen: false,
  previewArtifact: null,
  previewedArtifactAvailableVersions: null,
  currentPreviewedVersionNumber: null,
  previewFileContent: null,

  // Actions
  setMessages: () => {},
  setUserInput: () => {},
  setTaskIdInSidePanel: () => {},
  handleNewSession: () => {},
  handleSubmit: async () => {},
  handleCancel: () => {},
  addNotification: () => {},
  setSelectedAgentName: () => {},
  uploadArtifactFile: async () => {},
  setIsSidePanelCollapsed: () => {},
  setActiveSidePanelTab: () => {},
  openSidePanelTab: () => {},
  openDeleteModal: () => {},
  closeDeleteModal: () => {},
  confirmDelete: async () => {},
  setIsArtifactEditMode: () => {},
  setSelectedArtifactFilenames: () => {},
  handleDeleteSelectedArtifacts: () => {},
  confirmBatchDeleteArtifacts: async () => {},
  setIsBatchDeleteModalOpen: () => {},
  setPreviewArtifact: () => {},
  openArtifactForPreview: async () => null,
  navigateArtifactVersion: async () => null,
  openMessageAttachmentForPreview: () => {},
};

interface MockChatProviderProps {
  children: React.ReactNode;
  mockValues?: Partial<ChatContextValue>;
}

export const MockChatProvider: React.FC<MockChatProviderProps> = ({
  children,
  mockValues = {},
}) => {
  const contextValue = {
    ...defaultMockChatContext,
    ...mockValues,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};
