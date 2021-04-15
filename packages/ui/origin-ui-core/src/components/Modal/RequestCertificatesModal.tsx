import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'ethers';
import MomentUtils from '@date-io/moment';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@material-ui/core';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { requestCertificates } from '../../features/certificates';
import { getDeviceId } from '../../utils/device';
import { moment, DATE_FORMAT_DMY } from '../../utils/time';
import { EnergyFormatter } from '../../utils/EnergyFormatter';
import { useOriginConfiguration } from '../../utils/configuration';
import { Upload, IUploadedFile } from '../Documents';
import { IOriginDevice } from '../../types';
import { fromGeneralSelectors } from '../../features';

// Maximum number Solidity can handle is (2^256)-1
export const MAX_ENERGY_PER_CERTIFICATE = BigNumber.from(2).pow(256).sub(1);

interface IProps {
    showModal: boolean;
    setShowModal: (showModal: boolean) => void;
    device: IOriginDevice;
}

export function RequestCertificatesModal(props: IProps) {
    const [energyInDisplayUnit, setEnergyInDisplayUnit] = useState('');
    const [files, setFiles] = useState<IUploadedFile[]>([]);

    const cancelledFiles = files.filter((f) => f.cancelled && !f.removed);
    const filesBeingUploaded = files.filter(
        (f) => !f.removed && !f.cancelled && f.uploadProgress !== 100
    );
    const uploadedFiles = files.filter((f) => !f.removed && f.uploadedName);
    const { showModal, setShowModal, device } = props;
    const environment = useSelector(fromGeneralSelectors.getEnvironment);
    const configuration = useOriginConfiguration();

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
        if (!device) {
            return;
        }

        setEnergyInDisplayUnit('');
        setFromDate(DEFAULTS.fromDate);
        setToDate(DEFAULTS.toDate);
    }, [device]);

    function handleClose() {
        setFiles([]);
        setEnergyInDisplayUnit('');
        setShowModal(false);
    }

    async function requestCerts() {
        dispatch(
            requestCertificates({
                requestData: {
                    deviceId: getDeviceId(device, environment),
                    startTime: fromDate.unix(),
                    endTime: toDate.unix(),
                    energy: energyInBaseUnit,
                    files: uploadedFiles.map((f) => f.uploadedName)
                },
                callback: () => handleClose()
            })
        );
    }

    return (
        <MuiPickersUtilsProvider utils={MomentUtils} locale={configuration?.language}>
            <Dialog open={showModal || false} onClose={handleClose}>
                <DialogTitle>
                    {t('certificate.info.requestCertificatesFor', {
                        facilityName: device?.facilityName ?? ''
                    })}
                </DialogTitle>
                <DialogContent>
                    <DatePicker
                        data-cy="request-certificates-date-from"
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
                        data-cy="request-certificates-date-to"
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
                        data-cy="request-certificates-capacity"
                        label={EnergyFormatter.displayUnit}
                        value={energyInDisplayUnit}
                        onChange={(event) => setEnergyInDisplayUnit(event.target.value)}
                        className="mt-4"
                        fullWidth
                    />

                    <div data-cy="request-certificates-upload">
                        <Upload onChange={(newFiles) => setFiles(newFiles)} />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        {t('general.actions.cancel')}
                    </Button>
                    <Button
                        data-cy="request-certificates-submit"
                        onClick={requestCerts}
                        color="primary"
                        disabled={!isFormValid}
                    >
                        {t('certificate.actions.request')}
                    </Button>
                </DialogActions>
            </Dialog>
        </MuiPickersUtilsProvider>
    );
}
