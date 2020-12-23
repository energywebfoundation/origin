import { createStyles, makeStyles, Paper } from '@material-ui/core';
import { DevicePermissionsFeedback } from './devices/DevicePermissionsFeedback';
import React from 'react';
import { useDevicePermissions } from '../utils';

export function Requirements() {
    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '10px'
            }
        })
    );
    const { canCreateDevice } = useDevicePermissions();
    const classes = useStyles();

    return (
        <Paper className={classes?.container}>
            <DevicePermissionsFeedback canCreateDevice={canCreateDevice} />
        </Paper>
    );
}
