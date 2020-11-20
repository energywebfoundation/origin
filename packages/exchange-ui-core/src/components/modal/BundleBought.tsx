import React from 'react';
import {
    DialogTitle,
    DialogActions,
    Button,
    Dialog,
    DialogContent,
    makeStyles,
    Theme,
    Box,
    Grid
} from '@material-ui/core';
import { RemoveCircle } from '@material-ui/icons';
import { useTranslation } from '@energyweb/origin-ui-core';

interface IOwnProps {
    open: boolean;
    setOpen: (boolean) => void;
}
export const BundleBought = (props: IOwnProps) => {
    const { open, setOpen } = props;
    const { t } = useTranslation();
    const iconStyles = makeStyles((theme: Theme) => ({
        large: {
            fontSize: theme.spacing(10)
        }
    }))();

    return (
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle></DialogTitle>
            <DialogContent>
                <Grid container direction="column" alignItems="center" spacing={2}>
                    <Grid item>
                        <RemoveCircle
                            color="error"
                            fontSize="large"
                            classes={{ fontSizeLarge: iconStyles.large }}
                        />
                    </Grid>
                    <Grid item>
                        <Box>{t('bundle.info.bundleBought')}</Box>
                    </Grid>
                </Grid>{' '}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)} color="primary">
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
    );
};
