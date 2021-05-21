import { Role } from '@energyweb/origin-backend-core';
import {
  GenericModalProps,
  SelectRegularProps,
} from '@energyweb/origin-ui-core';
import { useOrganizationMemberRoleUpdate } from '@energyweb/origin-ui-organization-data';
import { useChangeMemberRoleLogic } from '@energyweb/origin-ui-organization-logic';
import { useEffect, useState } from 'react';
import {
  OrganizationModalsActionsEnum,
  useOrgModalsDispatch,
  useOrgModalsStore,
} from '../../../context';

export const useChangeMemberRoleEffects = () => {
  const {
    changeMemberOrgRole: { open, userToUpdate },
  } = useOrgModalsStore();
  const dispatchModals = useOrgModalsDispatch();

  const [role, setRole] = useState<Role>(null);
  useEffect(() => {
    if (userToUpdate?.rights) {
      setRole(userToUpdate?.rights);
    }
  }, [userToUpdate]);

  const handleRoleChange = useOrganizationMemberRoleUpdate();
  const changeRoleHandler = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_CHANGE_MEMBER_ORG_ROLE,
      payload: { open: false, userToUpdate: null },
    });
    handleRoleChange(userToUpdate?.id, role);
  };

  const closeModal = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_CHANGE_MEMBER_ORG_ROLE,
      payload: { open: false, userToUpdate: null },
    });
  };

  const {
    title,
    errorExists,
    errorText,
    field,
    buttons,
  } = useChangeMemberRoleLogic({
    userToUpdate,
    changeRoleHandler,
    closeModal,
    buttonDisabled: role === userToUpdate?.rights,
  });

  const dialogProps: GenericModalProps['dialogProps'] = {
    maxWidth: 'sm',
  };

  const modalProps: GenericModalProps = {
    title,
    buttons,
    open,
    dialogProps,
  };

  const selectProps: SelectRegularProps = {
    value: role,
    onChange: (event) => setRole(event.target.value),
    errorExists,
    errorText,
    field,
  };

  return { selectProps, modalProps };
};
