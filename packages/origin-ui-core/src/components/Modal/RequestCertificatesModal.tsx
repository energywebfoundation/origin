import React, { useState, useEffect } from 'react';
import {
    moment,
    Moment,
    setMaxTimeInDay,
    setMinTimeInDay,
    DATE_FORMAT_DMY,
    getDeviceId,
    EnergyFormatter,
    useTranslation
} from '../../utils';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';
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

const DEFAULTS = {
    fromDate: moment(),
    toDate: setMaxTimeInDay(moment())
};

export function RequestCertificatesModal() {
    const [fromDate, setFromDate] = useState(DEFAULTS.fromDate);
    const [toDate, setToDate] = useState(DEFAULTS.toDate);
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

    const dispatch = useDispatch();

    const { t } = useTranslation();

    const parsedEnergyInDisplayUnit = parseFloat(energyInDisplayUnit);

    const energyInBaseUnit =
        typeof parsedEnergyInDisplayUnit === 'number' && !isNaN(parsedEnergyInDisplayUnit)
            ? EnergyFormatter.getBaseValueFromValueInDisplayUnit(parsedEnergyInDisplayUnit)
            : 0;

    const isFormValid =
        fromDate &&
        toDate &&
        fromDate.toDate() <= toDate.toDate() &&
        energyInBaseUnit > 0 &&
        energyInBaseUnit < 1e16 &&
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

    function handleFromDateChange(date: Moment) {
        setFromDate(setMinTimeInDay(date));
    }

    function handleToDateChange(date: Moment) {
        setToDate(setMaxTimeInDay(date));
    }

    return (
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
                    onChange={handleFromDateChange}
                    variant="inline"
                    inputVariant="filled"
                    className="mt-4"
                    fullWidth
                    format={DATE_FORMAT_DMY}
                />

                <DatePicker
                    label={t('certificate.properties.to')}
                    value={toDate}
                    onChange={handleToDateChange}
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
    );
}
