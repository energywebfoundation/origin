import { Switch, SwitchProps } from '@mui/material';
import React from 'react';
import clsx from 'clsx';
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
      {...switchProps}
      className={clsx(classes.switch, switchProps?.className)}
    />
  );
};
