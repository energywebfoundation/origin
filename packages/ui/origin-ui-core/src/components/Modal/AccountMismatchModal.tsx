import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
} from '@material-ui/core';
import {
  fromGeneralActions,
  fromGeneralSelectors,
} from '../../features/general';
import { fromUsersSelectors } from '../../features/users';

export const AccountMismatchModal = () => {
  const { visibility } = useSelector(
    fromGeneralSelectors.getAccountMismatchModalProperties
  );
  const user = useSelector(fromUsersSelectors.getUserOffchain);
  const activeBlockchainAddress = useSelector(
    fromUsersSelectors.getActiveBlockchainAccountAddress
  );
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleClose = () =>
    dispatch(
      fromGeneralActions.setAccountMismatchModalProperties({
        visibility: false,
      })
    );

  const submit = () => {
    dispatch(fromGeneralActions.accountMismatchModalResolved(true));
    handleClose();
  };

  const cancel = () => {
    dispatch(fromGeneralActions.accountMismatchModalResolved(false));
    handleClose();
  };

  return (
    <Dialog open={visibility} onClose={handleClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <DialogTitle>
          {t('general.feedback.blockchainAccountMismatch')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('general.info.tryingToSignAndBoundIs')}
            <br />
            <br />
            {user?.organization?.blockchainAccountAddress?.toLowerCase()}
            <br />
            <br />
            {t('general.info.andYouAreTrying')}
            <br />
            <br />
            {activeBlockchainAddress?.toLowerCase()}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={cancel}>
            {t('general.actions.cancel')}
          </Button>
          <Button color="primary" type="submit">
            {t('general.actions.continue')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
