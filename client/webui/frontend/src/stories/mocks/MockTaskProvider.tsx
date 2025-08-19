import React from 'react';
import { TaskContext, type TaskContextValue } from '@/lib/contexts/TaskContext';

// Default mock values for TaskContext
const defaultMockTaskContext: TaskContextValue = {
  // State
  isTaskMonitorConnecting: false,
  isTaskMonitorConnected: true,
  taskMonitorSseError: null,
  monitoredTasks: {},
  monitoredTaskOrder: [],
  highlightedStepId: null,
  isReconnecting: false,
  reconnectionAttempts: 0,

  // Actions
  connectTaskMonitorStream: async () => {},
  disconnectTaskMonitorStream: async () => {},
  setHighlightedStepId: () => {},
};

interface MockTaskProviderProps {
  children: React.ReactNode;
  mockValues?: Partial<TaskContextValue>;
}

export const MockTaskProvider: React.FC<MockTaskProviderProps> = ({
  children,
  mockValues = {},
}) => {
  const contextValue = {
    ...defaultMockTaskContext,
    ...mockValues,
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};
