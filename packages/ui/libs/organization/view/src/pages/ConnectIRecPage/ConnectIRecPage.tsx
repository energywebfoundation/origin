import { IRecLogo, IRecLogoDark } from '@energyweb/origin-ui-assets';
import { GenericForm } from '@energyweb/origin-ui-core';
import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core';
import React, { FC } from 'react';
import { useConnectIRecPageEffects } from './ConnectIRecPage.effects';
import { useStyles } from './ConnectIRecPage.styles';

export const ConnectIRecPage: FC = () => {
  const {
    isLoading,
    formProps,
    requestingIRecAccess,
    orgInformation,
    platformOrgId,
    organizationId,
    isDarkTheme,
  } = useConnectIRecPageEffects();
  const classes = useStyles();

  if (isLoading) return <CircularProgress />;

  return (
    <Paper className={classes.paper}>
      <Grid container>
        <Grid item md={6} xs={12}>
          <Typography variant="h6" className={classes.uppercase}>
            {requestingIRecAccess}
          </Typography>
          <Divider className={classes.divider} />

          <Typography variant="h6">{orgInformation}</Typography>
          <TextField
            fullWidth
            disabled
            margin="normal"
            variant="filled"
            value={organizationId || ''}
            label={platformOrgId}
          />
          <Divider className={classes.divider} />

          <GenericForm {...formProps} />
        </Grid>
        <Grid item md={6}>
          <Box
            width="100%"
            height="100%"
            sx={{ display: { md: 'flex', xs: 'none' } }}
            justifyContent="center"
          >
            {isDarkTheme ? (
              <IRecLogo className={classes.logo} />
            ) : (
              <IRecLogoDark className={classes.logo} />
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};
