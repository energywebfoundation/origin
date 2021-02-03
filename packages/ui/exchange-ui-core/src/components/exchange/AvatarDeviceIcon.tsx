import React from 'react';
import { Tooltip, makeStyles, createStyles, Avatar } from '@material-ui/core';
import { energyImageByType, EnergyTypes } from '@energyweb/origin-ui-core';

interface IProps {
    type: string;
}

const useStyles = makeStyles(() =>
    createStyles({
        icon: {
            margin: '0 5px',
            width: 30,
            height: 30
        }
    })
);

export function AvatarDeviceIcon(props: IProps) {
    const { type } = props;

    const classes = useStyles();

    return (
        <Tooltip title={type}>
            <Avatar
                className={classes.icon}
                src={energyImageByType(type.toLowerCase() as EnergyTypes, true)}
                variant="square"
            />
        </Tooltip>
    );
}
