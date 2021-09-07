import {
  SpecField,
  SpecFieldProps,
  IconTextProps,
  IconText,
} from '@energyweb/origin-ui-core';
import { Divider } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { useStyles } from './PublicDeviceCardContent.styles';

export interface PublicDeviceCardContentProps<Id> {
  id: Id;
  specsData: SpecFieldProps[];
  iconsData: IconTextProps[];
}

type TPublicDeviceCardContent = <Id>(
  props: PublicDeviceCardContentProps<Id>
) => ReactElement;

export const PublicDeviceCardContent: TPublicDeviceCardContent = ({
  id,
  specsData,
  iconsData,
}) => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.specsWrapper}>
        {specsData.map((spec) => (
          <SpecField key={spec.label + id} {...spec} />
        ))}
      </div>
      <Divider />
      <div>
        {iconsData.map((field) => (
          <IconText
            key={field.title + id}
            iconProps={{ className: classes.icon }}
            {...field}
          />
        ))}
      </div>
    </>
  );
};
