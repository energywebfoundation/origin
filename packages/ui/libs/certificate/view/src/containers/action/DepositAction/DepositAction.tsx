import React, { FC } from 'react';
import { CertificateActionContent } from '../../list';

export const DepositAction: FC = () => {
  return (
    <CertificateActionContent
      title="Selected for Deposit"
      buttonText="Deposit"
    />
  );
};
