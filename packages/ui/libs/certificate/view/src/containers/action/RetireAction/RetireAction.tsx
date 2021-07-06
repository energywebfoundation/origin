import React, { FC } from 'react';
import {
  CertificateActionContent,
  CertificateActionContentProps,
} from '../../list';

export const RetireAction: FC = () => {
  return (
    <CertificateActionContent
      title="Selected for Retirement"
      buttonText="Retire"
    />
  );
};
