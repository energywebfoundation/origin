import React, { FC } from 'react';

interface ErrorFallbackProps {
  error: Error;
}

export const ErrorFallback: FC<ErrorFallbackProps> = ({ error }) => {
  const handleReloadClick = () => {
    window.location.reload();
  };

  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <br />
      <button onClick={handleReloadClick}>Reload</button>
    </div>
  );
};
