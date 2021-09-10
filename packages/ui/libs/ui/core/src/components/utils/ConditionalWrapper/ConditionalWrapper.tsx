import React from 'react';

interface ConditionalWrapperProps {
  condition: boolean;
  wrapper: React.FC;
}

export const ConditionalWrapper: React.FC<ConditionalWrapperProps> = ({
  condition,
  wrapper: Wrapper,
  children,
}) => {
  if (condition) return <Wrapper>{children}</Wrapper>;
  return <>{children}</>;
};
