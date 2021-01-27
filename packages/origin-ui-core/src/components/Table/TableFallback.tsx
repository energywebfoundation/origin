import React from 'react';
import { Skeleton } from '@material-ui/lab';

export function TableFallback() {
    return (
        <>
            <Skeleton variant="text" />
            <Skeleton variant="rect" height={200} />
        </>
    );
}
