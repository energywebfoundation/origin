import {
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogActionsProps,
  DialogContent,
  DialogContentProps,
  DialogProps,
  DialogTitle,
  Grid,
  Typography,
  TypographyProps,
} from '@material-ui/core';
import React, { FC, ReactNode } from 'react';
import { CloseButton } from '../../buttons';
import { ModalTextContent } from '../ModalTextContent';
import { useStyles } from './GenericModal.styles';

type ModalButtonData = ButtonProps & {
  label: string;
  onClick: () => void;
};

export interface GenericModalProps {
  open: boolean;
  title?: string;
  handleClose?: () => void;
  closeButton?: boolean;
  text?: string | string[];
  buttons?: ModalButtonData[];
  customContent?: ReactNode;
  icon?: ReactNode;
  dialogProps?: Omit<DialogProps, 'open'>;
  titleProps?: TypographyProps;
  textProps?: TypographyProps;
  dialogContentProps?: DialogContentProps;
  dialogActionsProps?: DialogActionsProps;
}

export const GenericModal: FC<GenericModalProps> = ({
  open,
  title,
  text,
  buttons,
  customContent,
  icon,
  dialogProps,
  titleProps,
  textProps,
  handleClose,
  closeButton,
  dialogContentProps,
  dialogActionsProps,
}) => {
  const classes = useStyles();
  const dialogWidthSmall = dialogProps && dialogProps.maxWidth === 'sm';
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      {...dialogProps}
    >
      <Grid container>
        {icon && (
          <Grid className={classes.iconGrid} item md={dialogWidthSmall ? 3 : 2}>
            {icon}
          </Grid>
        )}

        <Grid item md={icon ? (dialogWidthSmall ? 9 : 10) : 12} xs={12}>
          <Grid container alignItems="center" justifyContent="space-between">
            {title && (
              <Grid item>
                <DialogTitle>
                  <Typography variant="h5" component="span" {...titleProps}>
                    {title}
                  </Typography>
                </DialogTitle>
              </Grid>
            )}
            {closeButton && (
              <Grid item>
                <CloseButton onClose={handleClose} />
              </Grid>
            )}
          </Grid>
          <DialogContent {...dialogContentProps}>
            {customContent ?? (
              <ModalTextContent textProps={textProps} text={text} />
            )}
          </DialogContent>
        </Grid>

        <Grid item xs={12}>
          <DialogActions
            className={classes.dialogActions}
            {...dialogActionsProps}
          >
            {buttons &&
              buttons.map((button) => (
                <Button
                  key={button.label}
                  variant={button.variant ?? 'contained'}
                  onClick={button.onClick}
                  {...button}
                >
                  {button.label}
                </Button>
              ))}
          </DialogActions>
        </Grid>
      </Grid>
    </Dialog>
  );
};
