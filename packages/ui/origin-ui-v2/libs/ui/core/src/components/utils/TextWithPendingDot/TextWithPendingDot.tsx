/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import { FC, memo } from 'react';
import { Tooltip, Typography, TypographyVariant } from '@material-ui/core';
import { Dot } from '../Dot';

export interface TextWithPendingDotProps {
  textContent: string;
  pending: boolean;
  tooltipText?: string;
  variant?: TypographyVariant;
}

const BlockWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
});

const DotWrapper = styled.div({
  display: 'inline-block',
});

export const TextWithPendingDot: FC<TextWithPendingDotProps> = memo(
  ({ textContent, pending = false, tooltipText, variant }) => {
    return (
      <BlockWrapper>
        <Typography variant={variant}>{textContent}</Typography>
        {pending && (
          <Tooltip title={tooltipText}>
            <DotWrapper>
              <Dot />
            </DotWrapper>
          </Tooltip>
        )}
      </BlockWrapper>
    );
  }
);
