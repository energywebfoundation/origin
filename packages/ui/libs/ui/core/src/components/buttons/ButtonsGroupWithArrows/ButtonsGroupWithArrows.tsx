import { IconButton, ToggleButtonGroup, ToggleButton } from '@material-ui/core';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import React, { PropsWithChildren, ReactElement } from 'react';
import { useStyles } from './ButtonsGroupWithArrows.styles';

export type ButtonGroupItem<T> = {
  label: string;
  value: T;
};

export interface ButtonsGroupWithArrowsProps<T> {
  selected: T;
  setSelected: (value: T) => void;
  buttons: ButtonGroupItem<T>[];
  onLeftArrowClick: () => void;
  onRightArrowClick: () => void;
}

export type TButtonsGroupWithArrows = <T>(
  props: PropsWithChildren<ButtonsGroupWithArrowsProps<T>>
) => ReactElement;

export const ButtonsGroupWithArrows: TButtonsGroupWithArrows = ({
  selected,
  setSelected,
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
            selected={button.value === selected}
            onClick={() => setSelected(button.value)}
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
