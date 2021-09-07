import { Switch, SwitchProps } from '@material-ui/core';
import React from 'react';
import { useStyles } from './ThemeSwitcher.styles';

export interface ThemeSwitcherProps {
  selected: boolean;
  handleThemeChange: () => void;
  switchProps?: Omit<SwitchProps, 'checked' | 'onChange'>;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  selected,
  handleThemeChange,
  switchProps,
}) => {
  const classes = useStyles();
  return (
    <Switch
      checked={selected}
      onChange={handleThemeChange}
      className={classes.switch}
      {...switchProps}
    />
  );
};
