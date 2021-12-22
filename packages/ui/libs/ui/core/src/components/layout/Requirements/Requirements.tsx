import React, { FC } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  Checkbox,
  ListItemText,
  TypographyProps,
  ListItemProps,
  PaperProps,
  CheckboxProps,
  ListItemIconProps,
  ListItemTextProps,
} from '@mui/material';
import { useStyles } from './Requirements.styles';

export interface IPermissionRule {
  label: string;
  passing: boolean;
}

export interface RequirementsProps {
  rules: IPermissionRule[];
  title: string;
  paperProps?: PaperProps;
  titleProps?: TypographyProps;
  listItemProps?: ListItemProps;
  listItemIconProps?: ListItemIconProps;
  checkboxProps?: CheckboxProps;
  listItemTextProps?: ListItemTextProps;
}

export const Requirements: FC<RequirementsProps> = ({
  rules,
  title,
  paperProps,
  titleProps,
  listItemProps,
  listItemIconProps,
  checkboxProps,
  listItemTextProps,
}) => {
  const classes = useStyles();
  return (
    <Paper className={classes.container} {...paperProps}>
      <Typography variant="body1" {...titleProps}>
        {title}
      </Typography>
      <List>
        {rules.map((rule) => (
          <ListItem key={rule.label} dense {...listItemProps}>
            <ListItemIcon {...listItemIconProps}>
              <Checkbox
                edge="start"
                checked={rule.passing}
                tabIndex={-1}
                disableRipple
                disabled
                {...checkboxProps}
              />
            </ListItemIcon>
            <ListItemText primary={rule.label} {...listItemTextProps} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
