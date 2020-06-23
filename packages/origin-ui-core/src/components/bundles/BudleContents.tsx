import React, { useState } from 'react';
import {
    List,
    ListItem,
    Grid,
    Typography,
    Paper,
    makeStyles,
    Theme,
    createStyles,
    IconButton,
    Button
} from '@material-ui/core';
import { Bundle } from '../../utils/exchange';
import { useSelector } from 'react-redux';
import { getEnvironment, getProducingDevices, deviceById, moment } from '../..';
import { KeyboardArrowUp, KeyboardArrowDown } from '@material-ui/icons';

interface IOwnProps {
    bundle: Bundle;
}

const useOfferClasses = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            paddingLeft: theme.spacing(2)
        }
    })
);

const OFFERS_LIST_SIZE = 5;

export const BundleContents = (props: IOwnProps) => {
    const { bundle } = props;
    const environment = useSelector(getEnvironment);
    const devices = useSelector(getProducingDevices);
    const offerClasses = useOfferClasses();
    const [displayFrom, setDisplayFrom] = useState<number>(0);
    const displayed = bundle.items.slice(displayFrom, displayFrom + OFFERS_LIST_SIZE);

    return (
        <Grid
            container
            direction="column"
            alignItems="stretch"
            justify="flex-start"
            style={{ height: '100%' }}
        >
            <Button
                style={{
                    alignSelf: 'center',
                    backgroundColor: '#5a5a5a',
                    width: '100%'
                }}
                onClick={() => setDisplayFrom(displayFrom - 1)}
                disabled={displayFrom === 0}
            >
                <KeyboardArrowUp />
            </Button>
            {displayed.map(({ id, asset: { deviceId, generationFrom, generationTo } }) => {
                const device = deviceById(deviceId, environment, devices);
                return (
                    <Grid item key={id}>
                        <Paper variant="outlined" classes={{ root: offerClasses.root }}>
                            <Grid container>
                                <Grid item xs>
                                    <Grid container direction="column">
                                        <Typography color="textSecondary" variant="body2">
                                            Facility
                                        </Typography>
                                        <Typography variant="caption">
                                            {device.facilityName}
                                        </Typography>
                                        <Typography color="textSecondary" variant="body2">
                                            Location
                                        </Typography>
                                        <Typography>{device.province}</Typography>
                                    </Grid>
                                </Grid>
                                <Grid item xs>
                                    <Grid container direction="column">
                                        <Typography color="textSecondary" variant="body2">
                                            Generation Date
                                        </Typography>
                                        <Typography>
                                            {`${moment(generationFrom).format(
                                                'MMM, YYYY'
                                            )}->${moment(generationTo).format('MMM, YYYY')}`}
                                            {/* {'->'} {moment(generationTo).format('MMM, YYYY')} */}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                );
            })}
            <Button
                style={{ alignSelf: 'center', backgroundColor: '#5a5a5a', width: '100%' }}
                onClick={() => setDisplayFrom(displayFrom + 1)}
                disabled={displayFrom + OFFERS_LIST_SIZE >= bundle.items.length}
            >
                <KeyboardArrowDown />
            </Button>
        </Grid>
    );
};
