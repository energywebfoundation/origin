import React, { FunctionComponent, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Typography } from '@material-ui/core';
import { InboxItemEditContext } from '../InboxPanel';

export const TabContent: FunctionComponent<{
    header: string;
    buttonLabel: string;
    onSubmit: () => void;
    selectedCerts: number[];
}> = (props): JSX.Element => {
    const { t } = useTranslation();

    const { isEditing } = useContext(InboxItemEditContext);

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
                style={{
                    marginBottom: '18px',
                    textTransform: 'uppercase'
                }}
            >
                {t(props.header)}
            </Typography>

            {props.children}

            <Button
                color="primary"
                variant="contained"
                size="small"
                style={{ marginTop: '14px' }}
                disabled={
                    isEditing || props.selectedCerts.length === 0 || props.selectedCerts.length > 1
                }
                onClick={() => props.onSubmit()}
            >
                {t(props.buttonLabel, {
                    count: props.selectedCerts.length
                })}
                {props.selectedCerts.length > 1 && ' *'}
            </Button>
        </div>
    );
};
