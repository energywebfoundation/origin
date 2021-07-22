import React, { FC } from 'react';
import { TableComponent } from '@energyweb/origin-ui-core';
import { Link } from 'react-router-dom';
import { Fab, Tooltip } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { useAllBundlesPageEffects } from './AllBundlesPage.effects';
import { useStyles } from './AllBundlesPage.styles';

export const AllBundlesPage: FC = () => {
  const { tableData, buttonProps } = useAllBundlesPageEffects();
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <TableComponent {...tableData} />
      {buttonProps.showButton && (
        <Link to={buttonProps.linkUrl}>
          <Tooltip title={buttonProps.tooltipText}>
            <Fab color="primary" aria-label="add" className={classes.fab}>
              <Add />
            </Fab>
          </Tooltip>
        </Link>
      )}
    </div>
  );
};
