import React, { ElementType } from 'react';
import { Popover, Typography, Button } from '@mui/material';
import { useStyles } from './IconPopover.styles';
import { useIconPopoverEffects } from './IconPopover.effects';

export enum IconSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

export interface IconPopoverProps {
  icon: ElementType;
  popoverText: string[];
  iconSize?: IconSize;
  iconProps?: Record<string, any>;
  className?: string;
  clickable?: boolean;
}

export const IconPopover = (props: IconPopoverProps) => {
  const {
    icon: Icon,
    iconSize = IconSize.Medium,
    iconProps,
    popoverText,
    className,
    clickable = false,
  } = props;
  const classes = useStyles();

  const {
    open,
    mapTextWithLineBreaks,
    handleClick,
    handlePopoverClose,
    handlePopoverOpen,
    handleClose,
    getClickableId,
    anchorElRef,
  } = useIconPopoverEffects();

  const textContent = mapTextWithLineBreaks(popoverText);

  return (
    <div className={className}>
      {clickable ? (
        <>
          <Button aria-describedby={getClickableId(open)} onClick={handleClick}>
            <Icon fontSize={iconSize} {...iconProps} />
          </Button>
          <Popover
            id={getClickableId(open)}
            open={open}
            anchorEl={anchorElRef}
            onClose={handleClose}
            className={classes.popover}
            classes={{
              paper: classes.paper,
            }}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            PaperProps={{
              className: classes.popoverPaper,
            }}
          >
            <Typography className={classes.popoverTextBlock}>
              {textContent}
            </Typography>
          </Popover>
        </>
      ) : (
        <>
          <Icon
            aria-owns={open ? 'mouse-over-popover' : undefined}
            aria-haspopup="true"
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
            fontSize={iconSize}
            {...iconProps}
          />
          <Popover
            id="mouse-over-popover"
            className={classes.popover}
            classes={{
              paper: classes.paper,
            }}
            open={open}
            anchorEl={anchorElRef}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            onClose={handlePopoverClose}
            PaperProps={{
              className: classes.popoverPaper,
            }}
            disableRestoreFocus
          >
            <Typography className={classes.popoverTextBlock}>
              {textContent}
            </Typography>
          </Popover>
        </>
      )}
    </div>
  );
};
