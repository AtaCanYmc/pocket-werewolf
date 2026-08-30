import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '@/context/ToastContext';
import ToastContainer from '@/components/common/ToastContainer';

function TestConsumer() {
  const { showSuccess, showError, showWarning } = useToast();
  return (
    <div>
      <button onClick={() => showSuccess('Room created successfully!')}>Trigger Success</button>
      <button onClick={() => showError('Network connection error!')}>Trigger Error</button>
      <button onClick={() => showWarning('Host left the game!')}>Trigger Warning</button>
    </div>
  );
}

describe('ToastContext & ToastContainer', () => {
  it('renders and displays toasts when triggered', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastContainer />
        <TestConsumer />
      </ToastProvider>
    );

    // Initial state: no toasts
    expect(screen.queryByText('Room created successfully!')).not.toBeInTheDocument();

    // Trigger success toast
    await user.click(screen.getByText('Trigger Success'));
    expect(screen.getByText('Room created successfully!')).toBeInTheDocument();

    // Trigger error toast
    await user.click(screen.getByText('Trigger Error'));
    expect(screen.getByText('Network connection error!')).toBeInTheDocument();

    // Dismiss toast manually
    const dismissButtons = screen.getAllByRole('button', { name: /dismiss/i });
    await user.click(dismissButtons[0]);

    expect(screen.queryByText('Room created successfully!')).not.toBeInTheDocument();
    expect(screen.getByText('Network connection error!')).toBeInTheDocument();
  });
});
