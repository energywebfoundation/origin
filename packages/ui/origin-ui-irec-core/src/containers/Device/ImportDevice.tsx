import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Pagination } from '@material-ui/lab';
import {
    CustomFilterInputType,
    FiltersHeader,
    ICustomFilterDefinition
} from '@energyweb/origin-ui-core';
import { useOriginConfiguration } from '../../utils/configuration';
import { ImportDeviceItem } from '../../components/devices/import';
import { ImportDeviceModal } from '../../components/Modal';

import { useDispatch, useSelector } from 'react-redux';
import {
    fetchDevicesToImport,
    fetchMyDevices,
    getDeviceClient,
    getDevicesToImport,
    getMyDevices
} from '../../features';

const PAGE_SIZE = 20;

export function ImportDevice(): JSX.Element {
    const configuration = useOriginConfiguration();
    const dispatch = useDispatch();
    const myDevices = useSelector(getMyDevices);
    const devicesToImport = useSelector(getDevicesToImport);
    const iRecClient = useSelector(getDeviceClient)?.iRecClient;
    const originClient = useSelector(getDeviceClient)?.originClient;

    console.log('myDevices', myDevices, '\n', 'devicesToImport', devicesToImport);

    useEffect(() => {
        if (iRecClient && !devicesToImport) {
            dispatch(fetchDevicesToImport());
        }
    }, [iRecClient, devicesToImport]);

    useEffect(() => {
        if (originClient && !myDevices) {
            dispatch(fetchMyDevices());
        }
    }, [originClient, myDevices]);

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
    const [activeDevice, setActiveDevice] = useState(null);
    const { t } = useTranslation();

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
            <ImportDeviceModal open={modalOpen} setOpen={setModalOpen} device={activeDevice} />
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <FiltersHeader filters={filters} filtersChanged={(a) => console.log(a)} />
                    <div className={classes.box}>
                        <Typography className={classes.header}>
                            {t('device.info.importDevice')}
                        </Typography>
                        {(devicesToImport ?? [])
                            .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                            .map((a) => {
                                return (
                                    <ImportDeviceItem
                                        key={a.id}
                                        device={a}
                                        onImport={() => {
                                            setActiveDevice(a);
                                            setModalOpen(true);
                                        }}
                                    />
                                );
                            })}
                        <div className={classes.pagination}>
                            <Pagination
                                count={Math.ceil(devicesToImport?.length ?? 0 / PAGE_SIZE)}
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
                        {(myDevices ?? [])
                            .slice((pageImported - 1) * PAGE_SIZE, pageImported * PAGE_SIZE)
                            .map((a) => {
                                return (
                                    <ImportDeviceItem
                                        key={a.code}
                                        device={a}
                                        onImport={() => {
                                            setActiveDevice(a);
                                            setModalOpen(true);
                                        }}
                                    />
                                );
                            })}
                        <div className={classes.pagination}>
                            <Pagination
                                count={Math.ceil(myDevices?.length ?? 0 / PAGE_SIZE)}
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
