import { createStyles, makeStyles, Paper } from '@material-ui/core';
import { PermissionsFeedback } from './PermissionsFeedback';
import React from 'react';
import { usePermissions } from '../../utils';

export function Requirements() {
    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '10px'
            }
        })
    );
    const { canAccessPage } = usePermissions();
    const classes = useStyles();

    return (
        <Paper className={classes?.container}>
            <PermissionsFeedback canAccessPage={canAccessPage} />
        </Paper>
    );
}
