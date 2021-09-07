import React, { FC } from 'react';
import { Checkbox, Grid, GridProps, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useStyles } from './SignInOptions.styles';

export interface SignInOptionsProps {
  remember: boolean;
  setRemember: (value: boolean) => void;
  forgotPassUrl: string;
  wrapperProps?: GridProps;
}

export const SignInOptions: FC<SignInOptionsProps> = ({
  remember,
  setRemember,
  forgotPassUrl,
  ...rest
}) => {
  const classes = useStyles();
  return (
    <Grid container justifyContent="space-between" {...rest}>
      <Grid item display="flex" alignItems="center">
        <Checkbox
          classes={{ root: classes.checkbox }}
          color="primary"
          checked={remember}
          onChange={() => setRemember(!remember)}
        />
        <Typography>Remember me</Typography>
      </Grid>
      <Grid item display="flex" alignItems="center">
        <Typography
          color="primary"
          component={Link}
          to={forgotPassUrl}
          className={classes.forgotPassword}
        >
          Forgot password?
        </Typography>
      </Grid>
    </Grid>
  );
};
