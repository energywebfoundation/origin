/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import { LinearProgress } from '@material-ui/core';
import { FC } from 'react';

const ProgressWrapper = styled.div({
  position: 'fixed',
  top: '0',
  left: '0',
  width: '100vw',
  zIndex: 100,
});

const StyledProgress = styled(LinearProgress)({
  height: 10,
  backgroundColor: 'rgb(39, 39, 39)',
});

export const ProgressLine: FC = () => {
  return (
    <ProgressWrapper>
      <StyledProgress />
    </ProgressWrapper>
  );
};
