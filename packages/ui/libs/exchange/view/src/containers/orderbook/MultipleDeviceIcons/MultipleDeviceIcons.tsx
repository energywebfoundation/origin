import { Box, Button, Popover, Tooltip, Typography } from '@material-ui/core';
import React, { FC, SyntheticEvent, useState } from 'react';
import { useStyles } from './MultipleDeviceIcons.styles';

interface MultipleDeviceIconsProps {
  iconsData: {
    label: string;
    icon: React.FC<React.SVGProps<SVGSVGElement> & { title?: string }>;
  }[];
  id: string | number;
}

export const MultipleDeviceIcons: FC<MultipleDeviceIconsProps> = ({
  iconsData,
  id,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  if (iconsData === null) {
    return <Typography color="primary">ANY</Typography>;
  }

  if (iconsData.length <= 3) {
    return (
      <Box className={classes.iconHolder}>
        {iconsData.map((fuelTypeIcon) => {
          const { icon: FuelIcon, label } = fuelTypeIcon;
          return (
            <Tooltip key={`${label}-${id}`} title={label}>
              <FuelIcon className={classes.icon} />
            </Tooltip>
          );
        })}
      </Box>
    );
  }

  return (
    <Box className={classes.iconHolder}>
      {iconsData.slice(0, 3).map((fuelTypeIcon) => {
        const { icon: FuelIcon, label } = fuelTypeIcon;
        return (
          <Tooltip key={`${label}-${id}`} title={label}>
            <FuelIcon className={classes.icon} />
          </Tooltip>
        );
      })}
      <Button onClick={handleClick} style={{ outline: 'none' }} color="inherit">
        {`+${iconsData.length - 3}`}
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
      >
        <Box className={`${classes.iconHolder} ${classes.popoverContent}`}>
          {iconsData.slice(3, iconsData.length + 2).map((fuelTypeIcon) => {
            const { icon: FuelIcon, label } = fuelTypeIcon;
            return (
              <Tooltip key={`${label}-${id}`} title={label}>
                <FuelIcon className={classes.icon} />
              </Tooltip>
            );
          })}
        </Box>
      </Popover>
    </Box>
  );
};
