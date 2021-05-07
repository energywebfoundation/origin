import React, { FC } from 'react';

interface ErrorFallbackProps {
  error: Error;
}

export const ErrorFallback: FC<ErrorFallbackProps> = ({ error }) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
};
