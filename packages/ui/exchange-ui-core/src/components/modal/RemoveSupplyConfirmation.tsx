import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
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
import { ErrorOutline } from '@material-ui/icons';
import { showNotification, NotificationType } from '@energyweb/origin-ui-core';
import { removeSupply } from '../../features/supply';
import { IDeviceWithSupply } from '../../types';

interface IOwnProps {
    device: IDeviceWithSupply;
    close: () => void;
}

export const RemoveSupplyConfirmation = (props: IOwnProps) => {
    const { device, close } = props;
    const { t } = useTranslation();
    const useIconStyles = makeStyles((theme: Theme) => ({
        large: {
            fontSize: theme.spacing(10)
        }
    }));
    const iconStyles = useIconStyles();
    const dispatch = useDispatch();
    const { spacing } = useTheme();

    const handleSupplyRemoval = () => {
        const { supplyId } = device;
        if (supplyId) {
            dispatch(removeSupply({ supplyId }));
            close();
        } else {
            showNotification(t('exchange.supply.supplySettingsMissing'), NotificationType.Error);
            close();
        }
    };

    return (
        <Dialog open={device !== null} onClose={close}>
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
                        <Box>{t('exchange.supply.removeSupplyConfirmation')}</Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions style={{ padding: spacing(2), justifyContent: 'center' }}>
                <Button onClick={close} variant="outlined" color="primary">
                    {t('general.responses.no')}
                </Button>
                <Button onClick={handleSupplyRemoval} variant="contained" color="primary" autoFocus>
                    {t('general.responses.yes')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
