import { Typography } from '@mui/material';
import { TypographyProps } from '@mui/material';
import React, { FC } from 'react';
import { GenericModalProps } from '../GenericModal';

export interface ModalTextContentProps {
  text: GenericModalProps['text'];
  textProps?: TypographyProps;
}

export const ModalTextContent: FC<ModalTextContentProps> = ({
  text,
  textProps,
}) => {
  return (
    <div>
      {typeof text === 'string' ? (
        <Typography {...textProps}>{text}</Typography>
      ) : text ? (
        text.map((paragraph) => (
          <Typography
            key={'dialogText-' + paragraph}
            gutterBottom
            {...textProps}
          >
            {paragraph}
          </Typography>
        ))
      ) : null}
    </div>
  );
};
