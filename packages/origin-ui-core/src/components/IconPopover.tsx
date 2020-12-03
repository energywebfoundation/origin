import React, { useState } from 'react';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

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

interface IProps {
    icon: React.ReactType;
    popoverText: string[];
    className?: string;
}

export function IconPopover(props: IProps) {
    const { popoverText, className, icon: Icon } = props;
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);

    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const textWithLineBreaks = popoverText.map((text) => (
        <span key={text.length}>
            {text}
            <br />
            <br />
        </span>
    ));

    return (
        <div className={className}>
            <Icon
                aria-owns={open ? 'mouse-over-popover' : undefined}
                aria-haspopup="true"
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
                fontSize="large"
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
                <Typography className={classes.popoverTextBlock}>{textWithLineBreaks}</Typography>
            </Popover>
        </div>
    );
}
