import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BigNumber } from 'ethers';
import { Formik, Field, Form } from 'formik';
import {
    Box,
    useTheme,
    Grid,
    ListItemAvatar,
    Avatar,
    Button,
    IconButton,
    FormControl,
    InputLabel,
    Input,
    InputAdornment,
    makeStyles
} from '@material-ui/core';
import { Edit, HighlightOff } from '@material-ui/icons';
import { ICertificateEnergy } from '../../../../issuer/src';
import variables from '../../styles/variables.scss';
import {
    energyImageByType,
    moment,
    EnergyFormatter,
    deviceById,
    getEnvironment,
    getProducingDevices,
    EnergyTypes,
    useTranslation,
    useValidation,
    ICertificateViewItem
} from '@energyweb/origin-ui-core';

import bundleItemStyles from '../../styles/BundleItemEdit.scss';
import { IOriginTypography } from '../../types/typography';

export interface IBundledCertificateEnergy extends ICertificateEnergy {
    volumeToBundle: BigNumber;
}

export interface IBundledCertificate extends ICertificateViewItem {
    energy: IBundledCertificateEnergy;
}

interface IOwnProps {
    certificate: IBundledCertificate;
    totalVolume: () => BigNumber;
    onChange: (cert: IBundledCertificate) => void;
}

export const BundleItemEdit = (props: IOwnProps) => {
    const { t } = useTranslation();
    const { onChange } = props;
    let totalVolume = props.totalVolume;
    const { certificate } = props;
    const {
        creationTime,
        deviceId,
        energy: { publicVolume, volumeToBundle }
    } = certificate;
    const [selected, setSelected] = useState<boolean>(false);

    const fontSizeMd = ((useTheme().typography as unknown) as IOriginTypography)?.fontSizeMd;
    const spacing = useTheme().spacing;

    const environment = useSelector(getEnvironment);
    const devices = useSelector(getProducingDevices);
    const classes = makeStyles(() => ({
        formControl: {
            width: '100%',
            backgroundColor: variables.backgroundColorDarker
        },
        formLabel: {
            marginTop: spacing(1),
            marginLeft: spacing(1),
            transform: `scale(0.9)`
        },
        formInput: {
            textAlign: 'right'
        }
    }))();

    useEffect(() => {
        totalVolume = props.totalVolume;
    }, [props.totalVolume]);

    const { province, deviceType, facilityName } = deviceById(deviceId, environment, devices);
    const type = deviceType.split(';')[0].toLowerCase() as EnergyTypes;

    const { Yup } = useValidation();
    const validationSchema = Yup.object().shape({
        volumeToBundle: Yup.number()
            .required()
            .min(1)
            .max(EnergyFormatter.getValueInDisplayUnit(publicVolume))
            .integer()
    });

    return (
        <Grid container direction="column">
            <Grid
                item
                onClick={!selected ? () => setSelected(true) : null}
                style={{ cursor: !selected ? 'pointer' : 'auto' }}
            >
                <Grid container>
                    <Grid item xs={2}>
                        <ListItemAvatar>
                            <Avatar src={energyImageByType(type, true)}></Avatar>
                        </ListItemAvatar>
                    </Grid>

                    <Grid item xs={5}>
                        <Box fontSize={fontSizeMd} fontWeight="fontWeightBold">
                            {province}, {facilityName}
                        </Box>
                        <Box fontSize={fontSizeMd} color="text.secondary">
                            {moment.unix(creationTime).format('MMM, YYYY')}
                        </Box>
                    </Grid>
                    <Grid item xs={!selected ? 4 : 3} style={{ textAlign: 'end' }}>
                        <Box fontSize={fontSizeMd} color="text.secondary">
                            {EnergyFormatter.format(volumeToBundle, true)}
                        </Box>
                        <Box fontSize={fontSizeMd}>
                            {((100 * volumeToBundle.toNumber()) / totalVolume().toNumber()).toFixed(
                                0
                            )}
                            %
                        </Box>
                    </Grid>

                    {!selected ? (
                        <Grid item xs={1} style={{ textAlign: 'center' }}>
                            <IconButton>
                                <Edit color="primary" />
                            </IconButton>
                        </Grid>
                    ) : (
                        <Grid item xs={2} style={{ textAlign: 'center' }}>
                            <Box
                                onClick={() => setSelected(false)}
                                style={{
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    transform: `scale(0.75)`,
                                    fontWeight: 'bold'
                                }}
                            >
                                {t('general.actions.cancel')}
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Grid>
            {selected && (
                <Formik
                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                        setSelected(false);
                        onChange({
                            ...certificate,
                            energy: {
                                ...certificate.energy,
                                volumeToBundle: EnergyFormatter.getBaseValueFromValueInDisplayUnit(
                                    Number(values.volumeToBundle)
                                )
                            }
                        });
                    }}
                    initialValues={{
                        volumeToBundle: EnergyFormatter.getValueInDisplayUnit(volumeToBundle)
                    }}
                >
                    {(formikProps) => {
                        const { isValid, setFieldValue } = formikProps;
                        return (
                            <Form translate="no">
                                <Grid item container style={{ marginTop: spacing(2) }}>
                                    <Grid item style={{ flexGrow: 1 }}>
                                        <Field name="volumeToBundle">
                                            {({ field }) => (
                                                <FormControl
                                                    classes={{ root: classes.formControl }}
                                                >
                                                    <InputLabel
                                                        classes={{ root: classes.formLabel }}
                                                    >
                                                        {t('bundle.info.editBundleVolume')}
                                                    </InputLabel>
                                                    <Input
                                                        name="volumeToBundle"
                                                        {...field}
                                                        classes={{ input: classes.formInput }}
                                                        type="string"
                                                        endAdornment={
                                                            <InputAdornment
                                                                position="end"
                                                                style={{ marginBottom: spacing(1) }}
                                                            >
                                                                <IconButton
                                                                    onClick={() =>
                                                                        setFieldValue(
                                                                            'volumeToBundle',
                                                                            0
                                                                        )
                                                                    }
                                                                >
                                                                    <HighlightOff
                                                                        style={{
                                                                            fill:
                                                                                bundleItemStyles.resetButtonColor
                                                                        }}
                                                                    />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        }
                                                    />
                                                </FormControl>
                                            )}
                                        </Field>
                                    </Grid>
                                    <Grid item xs={2} container direction="column" justify="center">
                                        <Button
                                            type="submit"
                                            disabled={!isValid}
                                            variant="contained"
                                            color="primary"
                                            style={{ marginLeft: spacing(1) }}
                                        >
                                            {t('user.actions.save')}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Form>
                        );
                    }}
                </Formik>
            )}
        </Grid>
    );
};
