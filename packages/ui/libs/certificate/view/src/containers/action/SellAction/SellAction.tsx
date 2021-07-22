import { ListActionComponentProps } from '@energyweb/origin-ui-core';
import { TextField, Typography } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { CertificateActionContent } from '../../list';
import { useSellActionEffects } from './SellAction.effects';
import { useStyles } from './SellAction.styles';

interface SellActionProps<Id> extends ListActionComponentProps<Id> {}

export type TSellAction = <Id>(
  props: PropsWithChildren<SellActionProps<Id>>
) => ReactElement;

export const SellAction: TSellAction = ({ selectedIds, resetIds }) => {
  const classes = useStyles();
  const {
    title,
    buttonText,
    totalPriceText,
    priceInputLabel,
    price,
    selectedItems,
    handlePriceChange,
    sellHandler,
    setTotalAmount,
    totalPrice,
    buttonDisabled,
  } = useSellActionEffects(selectedIds, resetIds);

  return (
    <CertificateActionContent
      title={title}
      buttonText={buttonText}
      selectedIds={selectedIds}
      selectedItems={selectedItems}
      submitHandler={sellHandler}
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
    </CertificateActionContent>
  );
};
