import { ListActionComponentProps } from '@energyweb/origin-ui-core';
import { TextField, Typography } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { BundleActionContent } from '../../list';
import { useSellActionEffects } from './SellAsBundleAction.effects';
import { useStyles } from './SellAsBundleAction.styles';

type SellAsBundleActionProps<Id> = ListActionComponentProps<Id>;

export type TSellAsBundleAction = <Id>(
  props: PropsWithChildren<SellAsBundleActionProps<Id>>
) => ReactElement;

export const SellAsBundleAction: TSellAsBundleAction = ({
  selectedIds,
  resetIds,
}) => {
  const classes = useStyles();
  const {
    title,
    buttonText,
    totalPriceText,
    priceInputLabel,
    price,
    selectedItems,
    handlePriceChange,
    sellBundleHandler,
    setTotalAmount,
    totalPrice,
    buttonDisabled,
  } = useSellActionEffects(selectedIds, resetIds);

  return (
    <BundleActionContent
      title={title}
      buttonText={buttonText}
      selectedIds={selectedIds}
      selectedItems={selectedItems}
      submitHandler={sellBundleHandler}
      setTotalAmount={setTotalAmount}
      buttonDisabled={buttonDisabled}
    >
      <>
        <TextField
          fullWidth
          variant="standard"
          label={priceInputLabel}
          margin="dense"
          onChange={handlePriceChange}
          value={price}
        />
        <div className={classes.totalPrice}>
          <Typography color="textSecondary">{totalPriceText}</Typography>
          <Typography>$ {totalPrice}</Typography>
        </div>
      </>
    </BundleActionContent>
  );
};
