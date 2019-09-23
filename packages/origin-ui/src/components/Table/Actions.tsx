import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import { MoreHoriz } from '@material-ui/icons';
import React from 'react';
import { withStyles, createStyles, WithStyles } from '@material-ui/core';
import { STYLE_CONFIG } from '../../styles/styleConfig';

const styles = () =>
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
    });

export interface ITableAction {
    name: string;
    icon: React.ReactNode;
    onClick: (rowIndex: number) => void;
}

interface IProps extends WithStyles<typeof styles> {
    actions: ITableAction[];
    id: number;
}

interface IState {
    open: boolean;
}

class ActionsClass extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            open: false
        };
    }

    render() {
        const { actions, id, classes } = this.props;
        const { open } = this.state;

        const openMenu = () => {
            this.setState({
                open: true
            });
        };

        const closeMenu = () => {
            this.setState({
                open: false
            });
        };

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
                onBlur={closeMenu}
                onClose={closeMenu}
                onFocus={openMenu}
                onMouseEnter={openMenu}
                onMouseLeave={closeMenu}
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
}

export const Actions = withStyles(styles)(ActionsClass);
