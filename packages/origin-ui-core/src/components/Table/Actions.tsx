import { SpeedDial, SpeedDialIcon, SpeedDialAction } from '@material-ui/lab';
import { MoreHoriz } from '@material-ui/icons';
import React, { useState } from 'react';
import { useTheme, createStyles, makeStyles } from '@material-ui/core';

import { useOriginConfiguration } from '../../utils/configuration';

export enum TableActionId {
    Claim = 0,
    PublishForSale = 1,
    Withdraw = 2,
    Deposit = 3
}
export interface ITableAction {
    id?: TableActionId;
    name: string;
    icon: React.ReactNode;
    onClick: (rowId: string | number) => any;
}

interface IProps {
    actions: ITableAction[];
    id: string;
}

export function Actions(props: IProps) {
    const { actions, id } = props;
    const [open, setOpen] = useState(false);

    const { styleConfig } = useOriginConfiguration();

    const useStyles = makeStyles(() =>
        createStyles({
            speedDial: {
                position: 'absolute',
                bottom: 'calc(50% - 14px)',
                left: 0,
                right: 0
            },
            speedDialButton: {
                width: '28px',
                height: '28px',
                minHeight: '28px',
                backgroundColor: 'inherit',
                boxShadow: 'none',
                color: styleConfig.PRIMARY_COLOR
            },
            speedDialIcon: {
                fontSize: '16px',
                backgroundColor: 'inherit'
            },
            speedDialActionButton: {
                backgroundColor: styleConfig.PRIMARY_COLOR,
                color: 'white',
                '&:hover': {
                    backgroundColor: styleConfig.PRIMARY_COLOR_DARK
                }
            },
            speedDialActionTooltip: {
                color: 'white',
                backgroundColor: styleConfig.PRIMARY_COLOR,
                whiteSpace: 'nowrap'
            }
        })
    );

    const classes = useStyles(useTheme());

    return (
        <SpeedDial
            FabProps={{
                className: classes.speedDialButton
            }}
            ariaLabel={`speed-dial-${id}`}
            icon={
                <SpeedDialIcon
                    icon={<MoreHoriz style={{ backgroundColor: 'inherit' }} />}
                    classes={{
                        icon: classes.speedDialIcon
                    }}
                />
            }
            onClose={() => setOpen(false)}
            onOpen={(event, reason) => {
                if (reason === 'focus') {
                    return;
                }

                setOpen(true);
            }}
            open={open}
            className={classes.speedDial}
        >
            {actions.map((action) => (
                <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    tooltipOpen
                    onClick={() => action.onClick(id)}
                    classes={{
                        fab: classes.speedDialActionButton,
                        staticTooltipLabel: classes.speedDialActionTooltip
                    }}
                />
            ))}
        </SpeedDial>
    );
}
