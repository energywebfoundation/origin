import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Box,
  useTheme,
  Grid,
} from '@material-ui/core';
import { showNotification, NotificationTypeEnum } from '../../utils';
import iconAdded from '../../../assets/icon-org-added.svg';
import {
  useOrgModalsStore,
  useOrgModalsDispatch,
  OrganizationModalsActionsEnum,
} from '../../context';

export const IRecAccountRegisteredModal = () => {
  const {
    typography: { fontSizeMd },
  } = useTheme();
  const { t } = useTranslation();

  const { iRecAccountRegistered: open } = useOrgModalsStore();
  const dispatchModals = useOrgModalsDispatch();

  const onCloseHandler = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_IREC_ACCOUNT_REGISTERED,
      payload: false,
    });

    showNotification('Organization registered.', NotificationTypeEnum.Success);

    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_IREC_REGISTERED_THANK_YOU,
      payload: true,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={() => onCloseHandler()}
      maxWidth={'sm'}
      fullWidth={true}
    >
      <DialogTitle>
        <Grid container>
          <Grid item xs={2}>
            <div
              style={{ position: 'relative', height: '100%', width: '100%' }}
            >
              <Box>
                <img
                  src={iconAdded}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                  }}
                />
              </Box>
            </div>
          </Grid>
          <Grid item xs>
            <Box pl={2} mt={4}>
              {t('organization.registration.titleIRecAccountRegistered')}
              <Box fontSize={fontSizeMd} mt={3}>
                {t('organization.registration.contentIRecAccountRegistered')}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogActions>
        <Box pr={2.5} pb={2.5}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onCloseHandler()}
          >
            {t('general.responses.ok')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
