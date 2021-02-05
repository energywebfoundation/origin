import React, { useState } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CustomFilterInputType, FiltersHeader, ICustomFilterDefinition } from '../../Table';
import { IDevice, ImportDeviceItem } from './ImportDeviceItem';
import { useTranslation } from '../../../utils';
import { ImportDeviceModal } from './ImportDeviceModal';
import { Pagination } from '@material-ui/lab';
import { useOriginConfiguration } from '../../../utils/configuration';

export function ImportDevice(): JSX.Element {
    const configuration = useOriginConfiguration();

    const useStyles = makeStyles({
        box: {
            background: configuration?.styleConfig?.MAIN_BACKGROUND_COLOR,
            borderRadius: '2px',
            padding: '21px 24px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 2px 4px rgba(0,0,0,.2)'
        },
        header: {
            marginBottom: '29px',
            textTransform: 'uppercase'
        },
        pagination: {
            display: 'flex',
            justifyContent: 'flex-end'
        }
    });

    const classes = useStyles();

    const [page, setPage] = useState(1);
    const [pageImported, setImportedPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const { t } = useTranslation();

    const devices: IDevice[] = [
        {
            id: 1,
            name: 'test1',
            country: 'poland',
            capacity: 300
        },
        {
            id: 2,
            name: 'test2',
            country: 'germany',
            capacity: 250
        },
        {
            id: 3,
            name: 'test3',
            country: 'italy',
            capacity: 100
        },
        {
            id: 4,
            name: 'test4',
            country: 'moon',
            capacity: 1000
        }
    ];

    const importedDevice: IDevice[] = devices.map((d) => {
        return {
            ...d,
            imported: true
        };
    });

    const filters: ICustomFilterDefinition[] = [
        {
            label: 'test',
            property: () => 1,
            input: {
                type: CustomFilterInputType.string
            }
        }
    ];

    return (
        <>
            <ImportDeviceModal open={modalOpen} setOpen={setModalOpen} />
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <FiltersHeader filters={filters} filtersChanged={(a) => console.log(a)} />
                    <div className={classes.box}>
                        <Typography className={classes.header}>
                            {t('device.info.importDevice')}
                        </Typography>
                        {devices.slice((page - 1) * 3, page * 3).map((a) => {
                            return (
                                <ImportDeviceItem
                                    key={a.id}
                                    device={a}
                                    onImport={() => setModalOpen(true)}
                                />
                            );
                        })}
                        <div className={classes.pagination}>
                            <Pagination
                                count={Math.ceil(devices.length / 3)}
                                defaultPage={1}
                                onChange={(e, index) => setPage(index)}
                            />
                        </div>
                    </div>
                </Grid>

                <Grid item xs={12} md={6}>
                    <FiltersHeader filters={filters} filtersChanged={(a) => console.log(a)} />
                    <div className={classes.box}>
                        <Typography className={classes.header}>
                            {t('device.info.importedDevices')}
                        </Typography>
                        {importedDevice.slice((pageImported - 1) * 3, pageImported * 3).map((a) => {
                            return (
                                <ImportDeviceItem
                                    key={a.id}
                                    device={a}
                                    onImport={() => setModalOpen(true)}
                                />
                            );
                        })}
                        <div className={classes.pagination}>
                            <Pagination
                                count={Math.ceil(importedDevice.length / 3)}
                                defaultPage={1}
                                onChange={(e, index) => setImportedPage(index)}
                            />
                        </div>
                    </div>
                </Grid>
            </Grid>
        </>
    );
}
