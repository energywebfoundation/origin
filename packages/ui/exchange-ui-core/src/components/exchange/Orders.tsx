import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Paper, makeStyles, createStyles, Grid } from '@material-ui/core';
import { Info } from '@material-ui/icons';
import {
    EnergyFormatter,
    TableMaterial,
    ICustomRow,
    IPaginatedLoaderHooksFetchDataParameters,
    usePaginatedLoaderFiltered,
    LightenColor,
    IconPopover,
    IconSize
} from '@energyweb/origin-ui-core';
import { IOrderBookOrderDTO } from '../../utils/exchange';
import { useOriginConfiguration } from '../../utils/configuration';
import { DeviceTypeIcons } from './DeviceTypeIcons';

export interface IOrdersProps {
    data: IOrderBookOrderDTO[];
    title: string;
    highlightOrdersUserId: string;
    ordersTotalVolume: number;
    currency?: string;
    popoverText?: string[];
    handleRowClick?: (order: IOrderBookOrderDTO) => void;
    customRow?: ICustomRow<any>;
    reverseRows?: boolean;
}

export function Orders(props: IOrdersProps) {
    const {
        data,
        title,
        highlightOrdersUserId,
        handleRowClick,
        customRow,
        reverseRows = false,
        ordersTotalVolume,
        popoverText = []
    } = props;

    const { t } = useTranslation();
    const originBgColor = useOriginConfiguration()?.styleConfig?.MAIN_BACKGROUND_COLOR;
    const paperColor = LightenColor(originBgColor, 0.5);

    const useStyles = makeStyles(() =>
        createStyles({
            paper: {
                backgroundColor: paperColor
            },
            iconPopover: {
                '& button': {
                    outline: 'none'
                }
            }
        })
    );
    const classes = useStyles();

    async function getPaginatedData({
        requestedPageSize,
        offset
    }: IPaginatedLoaderHooksFetchDataParameters) {
        let newPaginatedData = data;
        const newTotal = newPaginatedData.length;
        newPaginatedData = newPaginatedData.slice(offset, offset + requestedPageSize);

        return {
            paginatedData: newPaginatedData,
            total: newTotal
        };
    }

    const {
        paginatedData,
        loadPage,
        total,
        pageSize
    } = usePaginatedLoaderFiltered<IOrderBookOrderDTO>({
        getPaginatedData
    });

    useEffect(() => {
        let isMounted = true;
        const checkIsMounted = () => isMounted;
        loadPage(1, null, checkIsMounted);
        return () => {
            isMounted = false;
        };
    }, [props.data]);

    const columns = [
        { id: 'price', label: t('exchange.info.price') },
        { id: 'volume', label: EnergyFormatter.displayUnit },
        { id: 'type', label: t('exchange.info.type') }
    ];

    const highlightedRowsIndexes = [];
    const rows = paginatedData.map(({ id, price, volume, userId, product: { deviceType } }) => {
        if (typeof userId !== 'undefined' && userId !== null && userId === highlightOrdersUserId) {
            highlightedRowsIndexes.push(id);
        }

        const type = <DeviceTypeIcons deviceType={deviceType} />;

        return {
            id,
            price: (price / 100).toFixed(2),
            volume: EnergyFormatter.format(volume),
            type
        };
    });

    return (
        <Paper className={classes.paper}>
            <Grid container className="orderbookHeader">
                <Grid item xs={3} className="headerItem">
                    <Typography variant="h5" className="title" gutterBottom>
                        {title}
                    </Typography>
                </Grid>

                <Grid item xs={6} className="headerItem matching">
                    {ordersTotalVolume > 0 ? (
                        <Typography>
                            {paginatedData.length}
                            {' / '}
                            {ordersTotalVolume} {'  '}
                            {t('exchange.info.matching')}
                        </Typography>
                    ) : null}
                </Grid>

                <Grid item xs={3} className="headerItem icon">
                    <IconPopover
                        icon={Info}
                        iconSize={IconSize.Medium}
                        className={classes.iconPopover}
                        popoverText={popoverText}
                        clickable={true}
                    />
                </Grid>
            </Grid>

            <TableMaterial
                columns={reverseRows ? columns.reverse() : columns}
                rows={reverseRows ? rows.reverse() : rows}
                loadPage={loadPage}
                total={total}
                pageSize={pageSize}
                highlightedRowsIds={highlightedRowsIndexes}
                handleRowClick={
                    handleRowClick
                        ? (id: string) => {
                              handleRowClick(paginatedData?.find((r) => r.id === id));
                          }
                        : null
                }
                customRow={customRow}
            />
        </Paper>
    );
}
