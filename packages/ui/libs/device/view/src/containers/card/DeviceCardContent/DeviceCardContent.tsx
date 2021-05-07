import {
  SpecField,
  SpecFieldProps,
  IconTextProps,
  IconText,
} from '@energyweb/origin-ui-core';
import { Divider } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { useStyles } from './DeviceCardContent.styles';

export interface DeviceCardContentProps<Id> {
  id: Id;
  specsData: SpecFieldProps[];
  iconsData: IconTextProps[];
}

type TDeviceCardContent = <Id>(
  props: DeviceCardContentProps<Id>
) => ReactElement;

export const DeviceCardContent: TDeviceCardContent = ({
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
