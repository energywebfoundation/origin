import { Typography } from '@material-ui/core';
import { TypographyProps } from '@material-ui/core';
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
    <>
      {typeof text === 'string' ? (
        <Typography {...textProps}>{text}</Typography>
      ) : (
        text.map((paragraph, idx) => (
          <Typography key={'dialogText' + idx} gutterBottom {...textProps}>
            {paragraph}
          </Typography>
        ))
      )}
    </>
  );
};
