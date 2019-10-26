import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import { MoreHoriz } from '@material-ui/icons';
import React, { useState } from 'react';
import { useTheme, createStyles, makeStyles } from '@material-ui/core';
import { STYLE_CONFIG } from '../../styles/styleConfig';

export interface ITableAction {
    name: string;
    icon: React.ReactNode;
    onClick: (rowIndex: number) => void;
}

interface IProps {
    actions: ITableAction[];
    id: number;
}

const useStyles = makeStyles(() =>
    createStyles({
        speedDial: {
            position: 'absolute',
            bottom: 'calc(50% - 14px)',
            left: '0'
        },
        speedDialButton: {
            width: '28px',
            height: '28px',
            minHeight: '28px',
            backgroundColor: '#333333'
        },
        speedDialIcon: {
            fontSize: '16px'
        },
        speedDialActionButton: {
            backgroundColor: STYLE_CONFIG.PRIMARY_COLOR,
            color: 'white',
            '&:hover': {
                backgroundColor: STYLE_CONFIG.PRIMARY_COLOR_DARK
            }
        },
        speedDialActionTooltip: {
            color: 'white',
            backgroundColor: STYLE_CONFIG.PRIMARY_COLOR,
            whiteSpace: 'nowrap'
        }
    })
);

export function Actions(props: IProps) {
    const { actions, id } = props;
    const [open, setOpen] = useState(false);

    const classes = useStyles(useTheme());

    return (
        <SpeedDial
            FabProps={{
                className: classes.speedDialButton
            }}
            ariaLabel={`speed-dial-${id}`}
            icon={
                <SpeedDialIcon
                    icon={<MoreHoriz />}
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
            {actions.map(action => (
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
