import React, { ElementType } from 'react';
import { Popover, Typography, Button } from '@material-ui/core';
import { useStyles } from './IconPopover.styles';
import { useIconPopoverEffects } from './IconPopover.effects';

export enum IconSize {
  Small = 'small',
  Medium = 'default',
  Large = 'large',
}

export interface IconPopoverProps {
  icon: ElementType;
  iconSize: IconSize;
  popoverText: string[];
  className?: string;
  clickable?: boolean;
}

export const IconPopover = (props: IconPopoverProps) => {
  const {
    icon: Icon,
    iconSize,
    popoverText,
    className,
    clickable = false,
    ...otherProps
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
    <div className={className} {...otherProps}>
      {clickable ? (
        <>
          <Button aria-describedby={getClickableId(open)} onClick={handleClick}>
            <Icon fontSize={iconSize} />
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
              style: { width: '30%' },
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
              style: { width: '30%' },
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
