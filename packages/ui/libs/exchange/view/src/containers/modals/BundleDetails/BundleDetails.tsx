import { GenericModal } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { BundleDetailsModalContent } from '../../bundle-details';
import { useBundleDetailsEffects } from './BundleDetails.effect';

export const BundleDetails: FC = () => {
  const {
    open,
    bundle,
    splits,
    handleClose,
    isLoading,
    isOwner,
  } = useBundleDetailsEffects();

  return (
    <GenericModal
      open={open && !isLoading}
      closeButton
      handleClose={handleClose}
      title={'Bundle details'}
      customContent={
        bundle && splits ? (
          <BundleDetailsModalContent
            isOwner={isOwner}
            bundle={bundle}
            splits={splits}
          />
        ) : (
          <div></div>
        )
      }
    />
  );
};
