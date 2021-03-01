import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, IconButton, TextField, makeStyles } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { LightenColor } from '@energyweb/origin-ui-core';
import { useOriginConfiguration } from '../../../utils/configuration';
import { ICertificate } from '../../../containers/Certificate/CertificateImport';

export function CertificateImportSelectedItem(props: { cert: ICertificate }): JSX.Element {
    const { cert } = props;
    const configuration = useOriginConfiguration();
    const { t } = useTranslation();

    const { MAIN_BACKGROUND_COLOR, SIMPLE_TEXT_COLOR, PRIMARY_COLOR } = configuration?.styleConfig;

    const useStyles = makeStyles({
        item: {
            padding: '16px',
            marginBottom: '10px',
            background: LightenColor(MAIN_BACKGROUND_COLOR, 1)
        },

        itemEdit: {
            background: LightenColor(MAIN_BACKGROUND_COLOR, 5)
        },

        top: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
        },

        icon: {
            width: 32,
            height: 32,
            color: LightenColor(PRIMARY_COLOR, 3),
            background: '#766493',
            marginRight: '25px'
        },

        text_1: {
            fontSize: '16px',
            color: SIMPLE_TEXT_COLOR
        },

        text_2: {
            fontSize: '14px',
            color: SIMPLE_TEXT_COLOR
        },

        text_3: {
            fontSize: '12px',
            color: SIMPLE_TEXT_COLOR,
            opacity: '.5'
        },

        editButton: {
            marginLeft: '11px'
        },

        form: {
            marginTop: '18px',
            display: 'flex'
        }
    });

    const classes = useStyles();

    const [editMode, setEditMode] = useState(false);
    const [MVhValue, setMVh] = useState(1000);

    function saveForm() {
        setEditMode(false);
    }

    return (
        <div className={[classes.item, editMode ? classes.itemEdit : ''].join(' ')}>
            <div className={classes.top}>
                <div className={classes.icon} />
                <div style={{ flex: '1' }}>
                    <div className={classes.text_3}>{cert.id}</div>
                    <div className={classes.text_1}>{cert.name}</div>
                </div>
                {!editMode && <div className={classes.text_2}>{MVhValue}MVh</div>}

                {!editMode && (
                    <IconButton
                        className={classes.editButton}
                        size={'small'}
                        onClick={(event) => {
                            event.preventDefault();
                            setEditMode(true);
                        }}
                    >
                        <EditIcon color={'primary'} />
                    </IconButton>
                )}

                {editMode && (
                    <Button
                        className={classes.editButton}
                        size={'small'}
                        onClick={(event) => {
                            event.preventDefault();
                            setEditMode(false);
                        }}
                    >
                        <span>cancel</span>
                    </Button>
                )}
            </div>
            {editMode && (
                <div className={classes.form}>
                    <TextField
                        type={'number'}
                        style={{ flex: '1', marginRight: '10px', background: '#292929' }}
                        value={MVhValue}
                        onChange={(event) => setMVh(parseInt(event.target.value, 10))}
                    />
                    <Button color="primary" variant="contained" size="small" onClick={saveForm}>
                        {t('Save')}
                    </Button>
                </div>
            )}
        </div>
    );
}
