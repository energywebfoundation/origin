import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  TableCell,
} from '@material-ui/core';
import { MoreHoriz } from '@material-ui/icons';
import React, { PropsWithChildren, ReactElement } from 'react';
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
  const { open, setOpen } = useTableActionsEffects();

  if (!actions) {
    return <TableCell></TableCell>;
  }
  console.log(id, actions);
  return (
    <TableCell className={classes.wrapper}>
      <SpeedDial
        FabProps={{ className: classes.speedDialButton }}
        ariaLabel={`speed-dial-${id}`}
        icon={<SpeedDialIcon icon={<MoreHoriz />} />}
        onClose={() => setOpen(false)}
        onMouseOver={(event) => setOpen(true)}
        open={open}
        className={classes.speedDial}
      >
        {actions.map((action) => (
          <SpeedDialAction
            tooltipOpen
            key={action.name + id}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => action.onClick(id)}
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
