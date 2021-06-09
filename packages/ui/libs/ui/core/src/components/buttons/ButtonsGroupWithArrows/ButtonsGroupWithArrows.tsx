import { IconButton, ToggleButtonGroup, ToggleButton } from '@material-ui/core';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import React, { FC } from 'react';
import { useStyles } from './ButtonsGroupWithArrows.styles';

export type ButtonGroupItem = {
  label: string;
  value: string;
};

export interface ButtonsGroupWithArrowsProps {
  buttons: ButtonGroupItem[];
  onLeftArrowClick: () => void;
  onRightArrowClick: () => void;
}

export const ButtonsGroupWithArrows: FC<ButtonsGroupWithArrowsProps> = ({
  buttons,
  onLeftArrowClick,
  onRightArrowClick,
}) => {
  const classes = useStyles();
  return (
    <div>
      <IconButton onClick={onLeftArrowClick}>
        <ChevronLeft fontSize="inherit" />
      </IconButton>

      <ToggleButtonGroup exclusive className={classes.buttonGroup}>
        {buttons.map((button) => (
          <ToggleButton
            disableRipple
            key={`button-group-button-${button.label}`}
            className={classes.button}
            value={button.value}
          >
            {button.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <IconButton onClick={onRightArrowClick}>
        <ChevronRight fontSize="inherit" />
      </IconButton>
    </div>
  );
};
