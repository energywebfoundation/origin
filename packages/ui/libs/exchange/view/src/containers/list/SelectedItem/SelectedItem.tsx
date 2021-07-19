import React, { FC, PropsWithChildren, ReactElement } from 'react';
import { Button, IconButton, TextField, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { useStyles } from './SelectedItem.styles';
import { useSelectedItemEffects } from './SelectedItem.effects';

export interface SelectedItemProps<Id> {
  id: Id;
  icon: FC<React.SVGProps<SVGSVGElement>>;
  deviceName: string;
  energy: string;
  generationTime: string;
  amount: string;
  onAmountChange: (id: Id, amount: string) => void;
}

export type TSelectedItem = <Id>(
  props: PropsWithChildren<SelectedItemProps<Id>>
) => ReactElement;

export const SelectedItem: TSelectedItem = ({
  id,
  icon: Icon,
  deviceName,
  generationTime,
  amount,
  onAmountChange,
}) => {
  const classes = useStyles();

  const {
    editMode,
    openEditMode,
    closeEditMode,
    saveText,
    cancelText,
    inputValue,
    handleSave,
    handleInputChange,
    editInputLabel,
  } = useSelectedItemEffects(id, onAmountChange);

  return (
    <div className={classes.block}>
      <div className={classes.wrapper}>
        <div className={classes.item}>
          <Icon className={classes.icon} />
          <div>
            <Typography>{deviceName}</Typography>
            <Typography color="textSecondary">{generationTime}</Typography>
          </div>
        </div>
        <div className={classes.item}>
          <>
            <Typography style={{ marginRight: 10 }}>{amount} MWh</Typography>
            {!editMode ? (
              <IconButton onClick={openEditMode}>
                <Edit color="primary" />
              </IconButton>
            ) : (
              <Button
                className={classes.item}
                onClick={closeEditMode}
                color="inherit"
              >
                {cancelText}
              </Button>
            )}
          </>
        </div>
      </div>
      {editMode ? (
        <div className={classes.editForm}>
          <TextField
            label={editInputLabel}
            fullWidth
            className={classes.editField}
            variant="standard"
            value={inputValue}
            onChange={handleInputChange}
          />
          <Button
            onClick={handleSave}
            className={classes.editButton}
            variant="contained"
          >
            {saveText}
          </Button>
        </div>
      ) : null}
    </div>
  );
};
