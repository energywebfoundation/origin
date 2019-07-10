import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './Modal.scss';
import '../PageButton/PageButton.scss';
import moment from 'moment';

import { Configuration } from 'ew-utils-general-lib';
import { Certificate } from 'ew-origin-lib';
import { ProducingAsset } from 'ew-asset-registry-lib';
import { Erc20TestToken } from 'ew-erc-test-contracts';

import { showNotification, NotificationType } from '../../utils/notifications';

interface IValidation {
    kwh: boolean;
}

interface BuyCertificateModalProps {
    conf: Configuration.Entity;
    producingAsset: ProducingAsset.Entity;
    certificate: Certificate.Entity;
    showModal: boolean;
    callback: () => void;
}

interface BuyCertificateModalState {
    show: boolean;
    kwh: number;
    validation: IValidation;
}

export class BuyCertificateModal extends React.Component<BuyCertificateModalProps, BuyCertificateModalState> {
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

    componentWillReceiveProps(newProps: BuyCertificateModalProps) {
        this.setState({
            show: newProps.showModal
        });
    }

    async componentDidUpdate(prevProps : BuyCertificateModalProps) {
        if (this.props.certificate && (this.props.certificate !== prevProps.certificate)) {
            this.setState({
                kwh: this.props.certificate.powerInW / 1000,
                validation: {
                    kwh: true
                }
            });
        }
    }

    async buyCertificate() {
        const { certificate } = this.props;

        if (certificate) {
            if ((certificate.acceptedToken as any) as string !== '0x0000000000000000000000000000000000000000') {
                const erc20TestToken = new Erc20TestToken(
                    this.props.conf.blockchainProperties.web3,
                    (certificate.acceptedToken as any) as string
                );

                await erc20TestToken.approve(
                    certificate.owner,
                    certificate.onChainDirectPurchasePrice
                );    
            }

            await certificate.buyCertificate(this.state.kwh * 1000);

            showNotification(`Certificates for ${this.state.kwh} kWh have been bought.`, NotificationType.Success);
        } else {
            showNotification(`Unable to buy certificates.`, NotificationType.Error);
        }

        this.handleClose();
    }

    validateInputs(event) {
        const countDecimals = value => value % 1 ? value.toString().split('.')[1].length : 0;

        switch (event.target.id) {
            case 'kwhInput':
                const kwh = Number(event.target.value);
                const kwhValid = !isNaN(kwh)
                    && kwh >= 0.001
                    && kwh <= this.props.certificate.powerInW / 1000
                    && countDecimals(kwh) <= 3;

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
        const date = this.props.certificate ? moment.unix(this.props.certificate.creationTime).format('YYYY-MM-DD') : '';
        const facilityName = this.props.producingAsset ? this.props.producingAsset.offChainProperties.facilityName : '';

        return (
            <Modal show={this.state.show} onHide={this.handleClose} animation={false} backdrop={true} backdropClassName="modal-backdrop">
                <Modal.Header>
                    <Modal.Title>{`Buy certificate #${certificateId}`}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="container">
                    <div className="row">
                        <div className="col">Facility</div>
                        <div className="col">
                            {facilityName}
                        </div>
                    </div>

                    <br/>

                    <div className="row">
                        <div className="col">Date</div>
                        <div className="col">
                            {date}
                        </div>
                    </div>

                    <br/>

                    <div className="row">
                        <div className="col">kWh</div>
                        <div className="col">
                            <input className="modal-input" id="kwhInput" placeholder="1" value={this.state.kwh} onChange={(e) => this.validateInputs(e)} />
                        </div>
                    </div>

                    <hr />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this.handleClose} className="modal-button modal-button-cancel">Cancel</Button>
                    <Button variant="primary" onClick={this.buyCertificate} className="modal-button modal-button-publish" disabled={!this.isFormValid()}>
                        Buy
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
  }
