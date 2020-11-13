import React, { useState, useEffect, useContext } from 'react';
import { moment, DATE_FORMAT_DMY, getDeviceId, EnergyFormatter, useTranslation } from '../../utils';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@material-ui/core';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { useSelector, useDispatch } from 'react-redux';
import {
    requestCertificates,
    hideRequestCertificatesModal
} from '../../features/certificates/actions';
import {
    getRequestCertificatesModalProducingDevice,
    getRequestCertificatesModalVisible
} from '../../features/certificates/selectors';
import { Upload, IUploadedFile } from '../Upload';
import { getEnvironment } from '../../features';
import { BigNumber } from 'ethers';
import MomentUtils from '@date-io/moment';
import { OriginConfigurationContext } from '../OriginConfigurationContext';

// Maximum number Solidity can handle is (2^256)-1
export const MAX_ENERGY_PER_CERTIFICATE = BigNumber.from(2).pow(256).sub(1);

export function RequestCertificatesModal() {
    const [energyInDisplayUnit, setEnergyInDisplayUnit] = useState('');
    const [files, setFiles] = useState<IUploadedFile[]>([]);

    const cancelledFiles = files.filter((f) => f.cancelled && !f.removed);
    const filesBeingUploaded = files.filter(
        (f) => !f.removed && !f.cancelled && f.uploadProgress !== 100
    );
    const uploadedFiles = files.filter((f) => !f.removed && f.uploadedName);

    const producingDevice = useSelector(getRequestCertificatesModalProducingDevice);
    const showModal = useSelector(getRequestCertificatesModalVisible);
    const environment = useSelector(getEnvironment);
    const configuration = useContext(OriginConfigurationContext);

    const DEFAULTS = {
        fromDate: moment()
            .utcOffset(Number(environment?.MARKET_UTC_OFFSET ?? 0), true)
            .startOf('day'),
        toDate: moment()
            .utcOffset(Number(environment?.MARKET_UTC_OFFSET ?? 0), true)
            .endOf('day')
    };

    const [fromDate, setFromDate] = useState(DEFAULTS.fromDate);
    const [toDate, setToDate] = useState(DEFAULTS.toDate);

    const dispatch = useDispatch();

    const { t } = useTranslation();

    const parsedEnergyInDisplayUnit = isNaN(Number(energyInDisplayUnit))
        ? 0
        : Number(energyInDisplayUnit);

    const energyInBaseUnit = EnergyFormatter.getBaseValueFromValueInDisplayUnit(
        parsedEnergyInDisplayUnit
    );

    const isFormValid =
        fromDate &&
        toDate &&
        fromDate.toDate() <= toDate.toDate() &&
        energyInBaseUnit.gt(0) &&
        energyInDisplayUnit.split('.').length === 1 &&
        energyInBaseUnit.lt(MAX_ENERGY_PER_CERTIFICATE) &&
        cancelledFiles.length === 0 &&
        filesBeingUploaded.length === 0;

    useEffect(() => {
        if (!producingDevice) {
            return;
        }

        setFromDate(DEFAULTS.fromDate);
        setToDate(DEFAULTS.toDate);
    }, [producingDevice]);

    function handleClose() {
        dispatch(hideRequestCertificatesModal());
    }

    async function requestCerts() {
        dispatch(
            requestCertificates({
                deviceId: getDeviceId(producingDevice, environment),
                startTime: fromDate.unix(),
                endTime: toDate.unix(),
                energy: energyInBaseUnit,
                files: uploadedFiles.map((f) => f.uploadedName)
            })
        );
    }

    return (
        <MuiPickersUtilsProvider utils={MomentUtils} locale={configuration?.language}>
            <Dialog open={showModal} onClose={handleClose}>
                <DialogTitle>
                    {t('certificate.info.requestCertificatesFor', {
                        facilityName: producingDevice?.facilityName ?? ''
                    })}
                </DialogTitle>
                <DialogContent>
                    <DatePicker
                        label={t('certificate.properties.from')}
                        value={fromDate}
                        onChange={(date) =>
                            setFromDate(
                                moment(date)
                                    .utcOffset(Number(environment.MARKET_UTC_OFFSET), true)
                                    .startOf('day')
                            )
                        }
                        variant="inline"
                        inputVariant="filled"
                        className="mt-4"
                        fullWidth
                        format={DATE_FORMAT_DMY}
                    />

                    <DatePicker
                        label={t('certificate.properties.to')}
                        value={toDate}
                        onChange={(date) =>
                            setToDate(
                                moment(date)
                                    .utcOffset(Number(environment.MARKET_UTC_OFFSET), true)
                                    .endOf('day')
                            )
                        }
                        variant="inline"
                        inputVariant="filled"
                        className="mt-4"
                        fullWidth
                        format={DATE_FORMAT_DMY}
                    />
                    <TextField
                        label={EnergyFormatter.displayUnit}
                        value={energyInDisplayUnit}
                        onChange={(event) => setEnergyInDisplayUnit(event.target.value)}
                        className="mt-4"
                        fullWidth
                    />

                    <Upload onChange={(newFiles) => setFiles(newFiles)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        {t('general.actions.cancel')}
                    </Button>
                    <Button onClick={requestCerts} color="primary" disabled={!isFormValid}>
                        {t('certificate.actions.request')}
                    </Button>
                </DialogActions>
            </Dialog>
        </MuiPickersUtilsProvider>
    );
}
