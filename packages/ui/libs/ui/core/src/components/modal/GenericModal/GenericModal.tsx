import {
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Grid,
  Typography,
  TypographyProps,
} from '@material-ui/core';
import React, { FC, ReactNode } from 'react';
import { ModalTextContent } from '../ModalTextContent';
import { useStyles } from './GenericModal.styles';

type ModalButtonData = ButtonProps & {
  label: string;
  onClick: () => void;
};

export interface GenericModalProps {
  open: boolean;
  title?: string;
  text?: string | string[];
  buttons?: ModalButtonData[];
  customContent?: ReactNode;
  icon?: ReactNode;
  dialogProps?: Omit<DialogProps, 'open'>;
  titleProps?: TypographyProps;
  textProps?: TypographyProps;
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
}) => {
  const classes = useStyles();
  const dialogWidthSmall = dialogProps && dialogProps.maxWidth === 'sm';
  return (
    <Dialog open={open} fullWidth maxWidth="md" {...dialogProps}>
      <Grid container>
        {icon && (
          <Grid className={classes.iconGrid} item md={dialogWidthSmall ? 3 : 2}>
            {icon}
          </Grid>
        )}

        <Grid item md={icon ? (dialogWidthSmall ? 9 : 10) : 12} xs={12}>
          {title && (
            <DialogTitle disableTypography>
              <Typography variant="h5" {...titleProps}>
                {title}
              </Typography>
            </DialogTitle>
          )}
          <DialogContent>
            {customContent ?? (
              <ModalTextContent textProps={textProps} text={text} />
            )}
          </DialogContent>
        </Grid>

        <Grid item xs={12}>
          <DialogActions className={classes.dialogActions}>
            {buttons &&
              buttons?.map((button) => (
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
