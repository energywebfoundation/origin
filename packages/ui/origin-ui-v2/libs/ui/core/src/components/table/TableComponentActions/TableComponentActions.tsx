import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  TableCell,
} from '@material-ui/core';
import { MoreHoriz } from '@material-ui/icons';
import React from 'react';
import { FC } from 'react';
import { TableActionData } from '../../../containers';
import { useStyles } from './TableComponentActions.styles';
import { useTableActionsEffects } from './TableComponentsActions.effects';

interface TableComponentActionsProps {
  id: string | number;
  actions: TableActionData[];
}

export const TableComponentActions: FC<TableComponentActionsProps> = ({
  id,
  actions,
}) => {
  const classes = useStyles();
  const { open, setOpen } = useTableActionsEffects();

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
        onMouseOver={(event) => setOpen(true)}
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
              staticTooltipLabel: classes.speedDialActionTooltip,
            }}
          />
        ))}
      </SpeedDial>
    </TableCell>
  );
};
