import { Button, Paper, Typography } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { SelectedItem, SelectedItemProps } from '../SelectedItem';
import {
  EnergyAmounts,
  useBundleActionContentEffects,
} from './BundleActionContent.effects';
import { useStyles } from './BundleActionContent.styles';

export interface BundleActionContentProps<Id> {
  title: string;
  buttonText: string;
  selectedIds: Id[];
  submitHandler: (energyAmounts: EnergyAmounts<Id>[]) => void | Promise<void>;
  selectedItems: Omit<SelectedItemProps<Id>, 'amount' | 'onAmountChange'>[];
  buttonDisabled?: boolean;
  setTotalAmount?: (newValue: number) => void;
}

export type TBundleActionContent = <Id>(
  props: PropsWithChildren<BundleActionContentProps<Id>>
) => ReactElement;

export const BundleActionContent: TBundleActionContent = ({
  title,
  buttonText,
  selectedIds,
  selectedItems,
  submitHandler,
  buttonDisabled,
  setTotalAmount,
  children,
}) => {
  const classes = useStyles();
  const {
    selectCertificateText,
    totalVolumeText,
    getEnergyAmountForItem,
    handleItemEnergyAmountChange,
    handleSubmit,
    totalVolume,
  } = useBundleActionContentEffects(
    selectedIds,
    selectedItems,
    submitHandler,
    setTotalAmount
  );

  return (
    <Paper className={classes.paper}>
      <Typography gutterBottom variant="h6">
        {title}
      </Typography>
      {selectedIds.length > 0 ? (
        selectedItems.map((item) => (
          <SelectedItem
            amount={getEnergyAmountForItem(item.id)}
            onAmountChange={handleItemEnergyAmountChange}
            key={`selected-item-${item.id}`}
            {...item}
          />
        ))
      ) : (
        <div className={classes.emptyTextWrapper}>
          <Typography color="textSecondary">{selectCertificateText}</Typography>
        </div>
      )}
      <div className={classes.totalVolume}>
        <Typography color="textSecondary">{totalVolumeText}</Typography>
        <Typography>{totalVolume} MWh</Typography>
      </div>
      {children}
      <Button
        fullWidth
        disabled={selectedIds.length < 2 || buttonDisabled}
        color="primary"
        variant="contained"
        onClick={handleSubmit}
      >
        {`${buttonText} ${selectedIds.length} Certificate(s)`}
      </Button>
    </Paper>
  );
};
