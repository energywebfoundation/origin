import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  TableCell,
} from '@material-ui/core';
import { MoreHoriz } from '@material-ui/icons';
import React, { PropsWithChildren, ReactElement, SyntheticEvent } from 'react';
import { TableActionData } from '../../../containers';
import { useStyles } from './TableComponentActions.styles';
import { useTableActionsEffects } from './TableComponentsActions.effects';

interface TableComponentActionsProps<Id> {
  id: Id;
  actions: TableActionData<Id>[];
}

export type TTableComponentActions = <Id>(
  props: PropsWithChildren<TableComponentActionsProps<Id>>
) => ReactElement;

export const TableComponentActions: TTableComponentActions = ({
  id,
  actions,
}) => {
  const classes = useStyles();
  const { open, setOpen, handleMobileOpen } = useTableActionsEffects();

  if (!actions) {
    return <TableCell></TableCell>;
  }

  return (
    <TableCell className={classes.wrapper}>
      <SpeedDial
        FabProps={{ className: classes.speedDialButton }}
        ariaLabel={`speed-dial-${id}`}
        icon={<SpeedDialIcon icon={<MoreHoriz />} />}
        onClose={() => setOpen(false)}
        onMouseOver={() => setOpen(true)}
        onClick={(event) => handleMobileOpen(event)}
        open={open}
        className={classes.speedDial}
      >
        {actions.map((action) => (
          <SpeedDialAction
            tooltipOpen
            key={action.name + id}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={(event: SyntheticEvent) => {
              event.stopPropagation();
              action.onClick(id);
            }}
            classes={{
              fab: classes.speedDialActionButton,
              staticTooltipLabel: classes.speedDialActionTooltip,
            }}
          />
        ))}
      </SpeedDial>
    </TableCell>
  );
};
