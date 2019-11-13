import * as React from 'react';
import moment from 'moment';
import { Configuration } from '@energyweb/utils-general';
import { PurchasableCertificate } from '@energyweb/market';
import { ProducingAsset } from '@energyweb/asset-registry';
import { Erc20TestToken } from '@energyweb/erc-test-contracts';
import { showNotification, NotificationType } from '../../utils/notifications';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@material-ui/core';

interface IValidation {
    kwh: boolean;
}

interface IBuyCertificateModalProps {
    conf: Configuration.Entity;
    producingAsset: ProducingAsset.Entity;
    certificate: PurchasableCertificate.Entity;
    showModal: boolean;
    callback: () => void;
}

interface IBuyCertificateModalState {
    show: boolean;
    kwh: number;
    validation: IValidation;
}

export class BuyCertificateModal extends React.Component<
    IBuyCertificateModalProps,
    IBuyCertificateModalState
> {
    constructor(props, context) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);
        this.buyCertificate = this.buyCertificate.bind(this);
        this.validateInputs = this.validateInputs.bind(this);
        this.isFormValid = this.isFormValid.bind(this);

        this.state = {
            show: props.showModal,
            kwh: 0.001,
            validation: {
                kwh: false
            }
        };
    }

    UNSAFE_componentWillReceiveProps(newProps: IBuyCertificateModalProps) {
        this.setState({
            show: newProps.showModal
        });
    }

    async componentDidUpdate(prevProps: IBuyCertificateModalProps) {
        if (this.props.certificate && this.props.certificate !== prevProps.certificate) {
            this.setState({
                kwh: this.props.certificate.certificate.energy / 1000,
                validation: {
                    kwh: true
                }
            });
        }
    }

    async buyCertificate() {
        const { certificate } = this.props;

        if (certificate) {
            if (
                ((certificate.acceptedToken as any) as string) !==
                '0x0000000000000000000000000000000000000000'
            ) {
                const erc20TestToken = new Erc20TestToken(
                    this.props.conf.blockchainProperties.web3,
                    (certificate.acceptedToken as any) as string
                );

                await erc20TestToken.approve(
                    certificate.certificate.owner,
                    certificate.onChainDirectPurchasePrice
                );
            }

            await certificate.buyCertificate(this.state.kwh * 1000);

            showNotification(
                `Certificates for ${this.state.kwh} kWh have been bought.`,
                NotificationType.Success
            );
        } else {
            showNotification(`Unable to buy certificates.`, NotificationType.Error);
        }

        this.handleClose();
    }

    validateInputs(event) {
        const countDecimals = value => (value % 1 ? value.toString().split('.')[1].length : 0);

        switch (event.target.id) {
            case 'kwhInput':
                const kwh = Number(event.target.value);
                const kwhValid =
                    !isNaN(kwh) &&
                    kwh >= 0.001 &&
                    kwh <= this.props.certificate.certificate.energy / 1000 &&
                    countDecimals(kwh) <= 3;

                this.setState({
                    kwh: event.target.value,
                    validation: {
                        kwh: kwhValid
                    }
                });
                break;
        }
    }

    isFormValid() {
        const { validation } = this.state;

        return Object.keys(validation).every(property => validation[property] === true);
    }

    handleClose() {
        this.props.callback();
        this.setState({ show: false });
    }

    render() {
        const certificateId = this.props.certificate ? this.props.certificate.id : '';
        const date = this.props.certificate
            ? moment.unix(this.props.certificate.certificate.creationTime).format('YYYY-MM-DD')
            : '';
        const facilityName = this.props.producingAsset
            ? this.props.producingAsset.offChainProperties.facilityName
            : '';

        return (
            <Dialog open={this.state.show} onClose={this.handleClose}>
                <DialogTitle>Buy certificate #{certificateId}</DialogTitle>
                <DialogContent>
                    <TextField label="Facility" value={facilityName} fullWidth disabled />

                    <TextField label="Date" value={date} fullWidth disabled className="mt-4" />

                    <TextField
                        label="kWh"
                        value={this.state.kwh}
                        type="number"
                        placeholder="1"
                        onChange={e => this.validateInputs(e)}
                        className="mt-4"
                        id="kwhInput"
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={this.buyCertificate}
                        color="primary"
                        disabled={!this.isFormValid()}
                    >
                        Buy
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
