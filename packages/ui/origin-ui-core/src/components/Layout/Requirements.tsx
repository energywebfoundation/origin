import { createStyles, makeStyles, Paper } from '@material-ui/core';
import { PermissionsFeedback } from './PermissionsFeedback';
import React from 'react';
import { Requirement, usePermissions } from '../../utils';

export function Requirements(props: { rules?: Requirement[] }): JSX.Element {
    const { rules } = props;
    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '10px'
            }
        })
    );
    const { canAccessPage } = usePermissions(rules);
    const classes = useStyles();

    return (
        <Paper className={classes?.container}>
            <PermissionsFeedback canAccessPage={canAccessPage} />
        </Paper>
    );
}
