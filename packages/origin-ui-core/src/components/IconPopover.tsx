import React, { useState } from 'react';
import { Popover, Typography, Button, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    popover: {
        pointerEvents: 'none'
    },
    paper: {
        padding: theme.spacing(1)
    },
    popoverTextBlock: {
        padding: '10px'
    }
}));

export enum IconSize {
    Small = 'small',
    Medium = 'default',
    Large = 'large'
}

interface IProps {
    icon: React.ReactType;
    iconSize: IconSize;
    popoverText: string[];
    className?: string;
    clickable?: boolean;
}

export function IconPopover(props: IProps) {
    const { icon: Icon, iconSize, popoverText, className, clickable = false } = props;
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        if (event.currentTarget === anchorEl) {
            setAnchorEl(null);
        } else {
            setAnchorEl(event.currentTarget);
        }
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const clickableId = open ? 'simple-popover' : undefined;

    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const textWithLineBreaks = popoverText.map((text) => (
        <span key={text.length}>
            {text}
            <br />
            <br />
        </span>
    ));

    return (
        <div className={className}>
            {clickable ? (
                <>
                    <Button aria-describedby={clickableId} onClick={handleClick}>
                        <Icon fontSize={iconSize} />
                    </Button>
                    <Popover
                        id={clickableId}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        className={classes.popover}
                        classes={{
                            paper: classes.paper
                        }}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left'
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left'
                        }}
                        PaperProps={{
                            style: { width: '30%' }
                        }}
                    >
                        <Typography className={classes.popoverTextBlock}>
                            {textWithLineBreaks}
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
                            paper: classes.paper
                        }}
                        open={open}
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left'
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left'
                        }}
                        onClose={handlePopoverClose}
                        PaperProps={{
                            style: { width: '30%' }
                        }}
                        disableRestoreFocus
                    >
                        <Typography className={classes.popoverTextBlock}>
                            {textWithLineBreaks}
                        </Typography>
                    </Popover>
                </>
            )}
        </div>
    );
}
