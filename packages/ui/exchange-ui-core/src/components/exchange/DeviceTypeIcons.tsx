import React, { useState } from 'react';
import { Box, makeStyles, createStyles, Popover, Button, Typography } from '@material-ui/core';
import { AvatarDeviceIcon } from './AvatarDeviceIcon';

const useStyles = makeStyles(() =>
    createStyles({
        any: {
            textTransform: 'uppercase',
            padding: '3px 0'
        },
        iconHolder: {
            display: 'flex',
            flexDirection: 'row'
        },
        popoverContent: {
            padding: '10px'
        }
    })
);

interface IProps {
    deviceType: string[];
}

export function DeviceTypeIcons(props: IProps) {
    const { deviceType } = props;
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    if (!deviceType) {
        const anyDevice = (
            <Typography className={classes.any} color="primary">
                Any
            </Typography>
        );
        return anyDevice;
    } else if (deviceType.length === 1) {
        const type = deviceType[0].split(';')[0];
        const singleIcon = <AvatarDeviceIcon type={type} />;
        return singleIcon;
    } else if (deviceType.length > 1) {
        const types = deviceType.filter((type) => !type.includes(';'));

        const multipleIcons =
            types.length <= 3 ? (
                <Box className={classes.iconHolder}>
                    {types.map((type, idx) => (
                        <AvatarDeviceIcon key={type + idx} type={type} />
                    ))}
                </Box>
            ) : (
                <Box className={classes.iconHolder}>
                    {types.slice(0, 3).map((type, idx) => (
                        <AvatarDeviceIcon key={type + idx} type={type} />
                    ))}

                    <div>
                        <Button
                            aria-describedby={id}
                            onClick={handleClick}
                            style={{ outline: 'none' }}
                        >
                            {`+${types.length - 3}`}
                        </Button>
                        <Popover
                            id={id}
                            open={open}
                            anchorEl={anchorEl}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: 'center',
                                horizontal: 'left'
                            }}
                            transformOrigin={{
                                vertical: 'center',
                                horizontal: 'left'
                            }}
                        >
                            <Box className={`${classes.iconHolder} ${classes.popoverContent}`}>
                                {types.slice(3, types.length + 2).map((type, idx) => (
                                    <AvatarDeviceIcon key={type + idx} type={type} />
                                ))}
                            </Box>
                        </Popover>
                    </div>
                </Box>
            );

        return multipleIcons;
    }
}
