import React from 'react';
import {
    Dialog,
    DialogContent,
    Grid,
    Box,
    Theme,
    makeStyles,
    DialogActions,
    Button,
    useTheme
} from '@material-ui/core';
import { Order, Demand } from '../../utils/exchange';
import { ErrorOutline } from '@material-ui/icons';
import { useTranslation } from '../..';
import { useDispatch } from 'react-redux';
import { cancelOrder, archiveDemand } from '../../features/orders/actions';

interface IOwnProps {
    demand?: Demand;
    order?: Order;
    close: () => void;
}

export const RemoveOrderConfirmation = (props: IOwnProps) => {
    const { demand, order, close } = props;
    const { t } = useTranslation();
    const useIconStyles = makeStyles((theme: Theme) => ({
        large: {
            fontSize: theme.spacing(10)
        }
    }));
    const iconStyles = useIconStyles();
    const dispatch = useDispatch();
    const { spacing } = useTheme();

    const onCancelOrder = () => {
        if (order) {
            dispatch(cancelOrder(order));
        } else {
            dispatch(archiveDemand(demand));
        }
        close();
    };

    return (
        <Dialog open={order !== null} onClose={close}>
            <DialogContent>
                <Grid container direction="column" alignItems="center" spacing={2}>
                    <Grid item>
                        <ErrorOutline
                            color="error"
                            fontSize="large"
                            classes={{ fontSizeLarge: iconStyles.large }}
                        />
                    </Grid>
                    <Grid item>
                        <Box>{t('order.feedback.removeOrderConfirmation')}</Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions style={{ padding: spacing(2), justifyContent: 'center' }}>
                <Button onClick={close} variant="outlined" color="primary">
                    {t('general.responses.no')}
                </Button>
                <Button onClick={onCancelOrder} variant="contained" color="primary" autoFocus>
                    {t('general.responses.yes')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
