import React, { FC } from 'react';
import { ChangeMemberRole } from './ChangeMemberRole';
import { IRecAccountRegistered } from './IRecAccountRegistered';
import { IRecConnectOrRegisterModal } from './IRecConnectOrRegister';
import { IRecRegisteredThankYou } from './IRecRegisteredThankYou';
import { OrganizationAlreadyExists } from './OrganizationAlreadyExists';
import { RegisterThankYou } from './RegisterThankYou';
import { RoleChanged } from './RoleChanged/RoleChanged';

export const ModalsCenter: FC = () => {
  return (
    <>
      <IRecAccountRegistered />
      <IRecConnectOrRegisterModal />
      <IRecRegisteredThankYou />
      <OrganizationAlreadyExists />
      <RegisterThankYou />
      <RoleChanged />
      <ChangeMemberRole />
    </>
  );
};
