import React, { FC } from 'react';
import { ChangeRoleModal } from './ChangeRoleModal';
import { IRecAccountRegisteredModal } from './IRecAccountRegisteredModal';
import { IRECConnectOrRegisterModal } from './IRECConnectOrRegisterModal';
import { IRecRegisterThankYouMessageModal } from './IRecRegisterThankYouMessageModal';
import { OrganizationAlreadyExistsModal } from './OrganizationAlreadyExistsModal';
import { RegisterThankYouMessageModal } from './RegisterThankYouMessageModal';
import { RoleChangedModal } from './RoleChangedModal';

export const OrganizationModalsCenter: FC = () => {
  return (
    <>
      <IRecAccountRegisteredModal />
      <IRECConnectOrRegisterModal />
      <IRecRegisterThankYouMessageModal />
      <OrganizationAlreadyExistsModal />
      <RegisterThankYouMessageModal />
      <RoleChangedModal setShowIRec={true} />
      <ChangeRoleModal />
    </>
  );
};
