import {
  useUserLogInFormConfig,
  TUserLoginFormValues,
  INITIAL_FORM_VALUES,
} from '@energyweb/origin-ui-user-logic';
import { useUserLogin } from '@energyweb/origin-ui-user-data';
import { useNavigate } from 'react-router';
import { UserModalsActionsEnum, useUserModalsDispatch } from '../../context';
import { InvitationDTO } from '@energyweb/origin-backend-react-query-client';
import { useState } from 'react';

export const useLogInPageEffects = () => {
  const navigate = useNavigate();
  const dispatchModals = useUserModalsDispatch();

  const [formValues, setFormValues] =
    useState<TUserLoginFormValues>(INITIAL_FORM_VALUES);

  const onWatchHandler = (values: string[]) => {
    const [username, password] = values;

    setFormValues({ username, password });
  };

  const openRegisterOrgModal = () => {
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_LOGIN_REGISTER_ORG,
      payload: true,
    });
  };

  const openInvitationModal = (invitation: InvitationDTO) => {
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_PENDING_INVITATION,
      payload: {
        open: true,
        invitation,
      },
    });
  };

  const openExchangeAddressModal = () => {
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_CREATE_EXCHANGE_ADDRESS,
      payload: true,
    });
  };

  const submitHandler = useUserLogin(
    openRegisterOrgModal,
    openInvitationModal,
    openExchangeAddressModal
  );
  const formConfig = useUserLogInFormConfig(submitHandler, onWatchHandler);

  const buttonDisabled = !formConfig.validationSchema.isValidSync(formValues);

  const formProps = {
    ...formConfig,
    buttonDisabled,
    controlSubmitButton: true,
  };

  const navigateToResetPassword = () => {
    navigate('/auth/reset-password');
  };

  const navigateToRegister = () => {
    navigate('/auth/register');
  };

  return { formProps, navigateToResetPassword, navigateToRegister };
};
