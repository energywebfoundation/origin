import React, { ReactNode } from 'react';

export interface ConditionalWrapperProps {
  condition: boolean;
  wrapper: React.FC<{ children: ReactNode }>;
  children: ReactNode;
}

export const ConditionalWrapper = ({
  condition,
  wrapper: Wrapper,
  children,
}: ConditionalWrapperProps) => {
  if (condition) return <Wrapper>{children}</Wrapper>;
  return <div>{children}</div>;
};
