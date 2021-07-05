import React, { FC, useState } from 'react';
import { SolarSelected } from '@energyweb/origin-ui-assets';
import { Button, IconButton, TextField, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { useStyles } from './SelectedItem.styles';

export const SelectedItem: FC = () => {
  const classes = useStyles();
  const [editMode, setEditMode] = useState(false);

  const openEditMode = () => {
    setEditMode(true);
  };

  const closeEditMode = () => {
    setEditMode(false);
  };

  return (
    <div className={classes.block}>
      <div className={classes.wrapper}>
        <div className={classes.item}>
          <SolarSelected className={classes.icon} />
          <div>
            <Typography>Solar Facility A</Typography>
            <Typography color="textSecondary">
              Nov 1, 2020 - Dec 31,2020
            </Typography>
          </div>
        </div>
        <div className={classes.item}>
          {!editMode ? (
            <>
              <Typography style={{ marginRight: 10 }}>1000 MWh</Typography>
              <IconButton onClick={openEditMode}>
                <Edit color="primary" />
              </IconButton>
            </>
          ) : (
            <Button
              className={classes.item}
              onClick={closeEditMode}
              color="inherit"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
      {editMode ? (
        <div className={classes.editForm}>
          <TextField
            label="Edit amount"
            fullWidth
            className={classes.editField}
            variant="standard"
          />
          <Button className={classes.editButton} variant="contained">
            Save
          </Button>
        </div>
      ) : null}
    </div>
  );
};
