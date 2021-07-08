import React, { FC } from 'react';
import { CertificateActionContent } from '../../list';

export const RetireAction: FC = () => {
  return (
    <CertificateActionContent
      title="Selected for Retirement"
      buttonText="Retire"
    />
  );
};
