import React from 'react';

import type { ChatContextValue, ConfigContextValue, TaskContextValue } from '@/lib/contexts';
import { ThemeProvider } from '@/lib';

import { MockChatProvider } from './MockChatProvider';
import { MockTaskProvider } from './MockTaskProvider';
import { MockConfigProvider } from './MockConfigProvider';

interface StoryProviderProps {
  children: React.ReactNode;
  chatContextValues?: Partial<ChatContextValue>;
  taskContextValues?: Partial<TaskContextValue>;
  configContextValues?: Partial<ConfigContextValue>;
}

/**
 * A shared provider component that combines all necessary context providers for stories.
 * This makes it easy to provide consistent mock context across all Storybook tests.
 */
export const StoryProvider: React.FC<StoryProviderProps> = ({
  children,
  chatContextValues = {},
  taskContextValues = {},
  configContextValues = {},
}) => {
  return (
    <ThemeProvider>
        <MockConfigProvider mockValues={configContextValues}>
          <MockTaskProvider mockValues={taskContextValues}>
            <MockChatProvider mockValues={chatContextValues}>
              {children}
            </MockChatProvider>
          </MockTaskProvider>
        </MockConfigProvider>
    </ThemeProvider>
  );
};
