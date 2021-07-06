import React, { FC } from 'react';
import { CertificateActionContent } from '../../list';

export const WithdrawAction: FC = () => {
  return (
    <CertificateActionContent
      title="Selected for Withdrawal"
      buttonText="Withdraw"
    />
  );
};
