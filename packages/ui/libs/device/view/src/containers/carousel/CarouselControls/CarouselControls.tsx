import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';
import { ToggleButton, ToggleButtonGroup, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles } from './CarouselControls.styles';

export enum CarouselModeEnum {
  Photo = 'photo',
  Map = 'map',
}

export interface CarouselControlsProps {
  deviceName: ComposedPublicDevice['name'];
  carouselMode: CarouselModeEnum;
  handleModeChange: (
    event: React.MouseEvent<HTMLElement>,
    mode: CarouselModeEnum
  ) => void;
}

export const CarouselControls: FC<CarouselControlsProps> = ({
  deviceName,
  carouselMode,
  handleModeChange,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const photoLabel = t('device.detailView.photo');
  const mapLabel = t('device.detailView.map');

  return (
    <>
      <ToggleButtonGroup
        exclusive
        value={carouselMode}
        onChange={handleModeChange}
        className={classes.toggleGroup}
      >
        <ToggleButton
          disableRipple
          className={classes.toggleButton}
          value={CarouselModeEnum.Photo}
        >
          {photoLabel}
        </ToggleButton>
        <ToggleButton
          disableRipple
          className={classes.toggleButton}
          value={CarouselModeEnum.Map}
        >
          {mapLabel}
        </ToggleButton>
      </ToggleButtonGroup>
      <Typography className={classes.deviceName}>{deviceName}</Typography>
    </>
  );
};
