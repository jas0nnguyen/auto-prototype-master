import React from 'react';
import { Text } from '@sureapp/canary-design-system';

/**
 * ScreenProgress Component
 *
 * Displays "Screen X of 19" indicator at the top of each screen
 * Helps users understand their progress through the quote flow
 *
 * Styling: Inter font, 14px, 400 weight, #718096 color
 */

interface ScreenProgressProps {
  currentScreen: number;
  totalScreens: number;
}

export const ScreenProgress: React.FC<ScreenProgressProps> = ({
  currentScreen,
  totalScreens,
}) => {
  return (
    <div
      style={{
        padding: '12px 24px',
        textAlign: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '14px',
        fontWeight: 400,
        color: '#718096',
      }}
    >
      Screen {currentScreen} of {totalScreens}
    </div>
  );
};
