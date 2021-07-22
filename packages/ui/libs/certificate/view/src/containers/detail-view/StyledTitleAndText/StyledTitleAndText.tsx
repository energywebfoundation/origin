import {
  SmallTitleWithText,
  SmallTitleWithTextProps,
} from '@energyweb/origin-ui-core';
import { makeStyles } from '@material-ui/core';
import React, { FC } from 'react';

interface StyledTitleAndTextProps extends SmallTitleWithTextProps {}

const useStyles = makeStyles({
  blockItem: {
    padding: '18px 26px',
  },
});

export const StyledTitleAndText: FC<StyledTitleAndTextProps> = (props) => {
  const classes = useStyles();
  return (
    <SmallTitleWithText
      {...props}
      wrapperProps={{ className: classes.blockItem }}
    />
  );
};
