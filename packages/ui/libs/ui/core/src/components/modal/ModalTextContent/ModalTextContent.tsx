import { Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { GenericModalProps } from '../GenericModal';

export interface ModalTextContentProps {
  text: GenericModalProps['text'];
  typographyProps?: GenericModalProps['textProps'];
}

export const ModalTextContent: FC<ModalTextContentProps> = ({
  text,
  typographyProps,
}) => {
  return (
    <>
      {typeof text === 'string' ? (
        <Typography {...typographyProps}>{text}</Typography>
      ) : (
        text.map((paragraph, idx) => (
          <Typography
            key={'dialogText' + idx}
            gutterBottom
            {...typographyProps}
          >
            {paragraph}
          </Typography>
        ))
      )}
    </>
  );
};
