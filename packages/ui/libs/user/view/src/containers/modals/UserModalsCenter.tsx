import React, { FC } from 'react';
import { CreateExchangeAddress } from './CreateExchangeAddress';
import { LoginRegisterOrg } from './LoginRegisterOrg';
import { PendingInvitation } from './PendingInvitation';
import { RoleChanged } from './RoleChanged';
import { UserRegistered } from './UserRegistered';

export const UserModalsCenter: FC = () => {
  return (
    <>
      <UserRegistered />
      <LoginRegisterOrg />
      <PendingInvitation />
      <CreateExchangeAddress />
      <RoleChanged />
    </>
  );
};
