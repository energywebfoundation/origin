import {
  SmallTitleWithText,
  SmallTitleWithTextProps,
} from '@energyweb/origin-ui-core';
import { makeStyles } from '@material-ui/core';
import React, { FC } from 'react';

type StyledTitleAndTextProps = SmallTitleWithTextProps;

const useStyles = makeStyles({
  text: {
    fontSize: '0.9rem',
  },
});

export const StyledTitleAndText: FC<StyledTitleAndTextProps> = (props) => {
  const classes = useStyles();
  return (
    <SmallTitleWithText
      {...props}
      titleProps={{ variant: 'caption', margin: 'dense' }}
      textProps={{ className: classes.text }}
    />
  );
};
