import * as React from 'react';
import { Modal, Button, Dropdown, DropdownButton, MenuItem } from 'react-bootstrap';
import './Modal.scss';
import '../PageButton/PageButton.scss';
import moment from 'moment';

import { Currency, Configuration } from 'ew-utils-general-lib';
import { Certificate } from 'ew-origin-lib';
import { ProducingAsset } from 'ew-asset-registry-lib';

import { showNotification, NotificationType } from '../../utils/notifications';

interface IValidation {
    kwh: boolean;
    price: boolean;
    erc20TokenAddress: boolean;
}

interface IPublishForSaleModalProps {
    conf: Configuration.Entity;
    certificate: Certificate.Entity;
    producingAsset: ProducingAsset.Entity;
    showModal: boolean;
    callback: () => void;
}

interface IPublishForSaleModalState {
    show: boolean;
    minKwh: number;
    kwh: number;
    price: number;
    currency: string;
    erc20TokenAddress: string;
    validation: IValidation;
    certCreationDate: string;
}

const ERC20CURRENCY = 'ERC20 Token';

class PublishForSaleModal extends React.Component<IPublishForSaleModalProps, IPublishForSaleModalState> {
    constructor(props, context) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);
        this.publishForSale = this.publishForSale.bind(this);
        this.validateInputs = this.validateInputs.bind(this);

        const minKwh = 0.001;

        this.state = {
            show: props.showModal,
            minKwh,
            kwh: props.certificate ? (props.certificate.powerInW / 1000) : minKwh,
            price: 1,
            currency: this.availableCurrencies[0],
            erc20TokenAddress: '',
            validation: {
                kwh: true,
                price: true,
                erc20TokenAddress: false
            },
            certCreationDate: 'Loading...'
        };
    }

    componentWillReceiveProps(newProps: IPublishForSaleModalProps) {
        this.setState({
            show: newProps.showModal,
        });
    }

    async componentDidUpdate(prevProps) {
        if (this.props.certificate && this.props.certificate !== prevProps.certificate) {
            const logs = await this.props.certificate.getAllCertificateEvents();
            const initialTransfer = logs.find((log: any) => log.event === 'Transfer');

            const timestamp = (await this.props.conf.blockchainProperties.web3.eth.getBlock(
                initialTransfer.blockNumber
            )).timestamp;

            this.setState({
                kwh: this.props.certificate.powerInW / 1000,
                certCreationDate: moment.unix(timestamp).toString()
            });
        }
    }

    async publishForSale() {
        const { price, kwh, erc20TokenAddress, currency } = this.state;
        const { certificate } = this.props;

        if (this.isFormValid) {
            if (certificate.forSale) {
                this.handleClose();
                showNotification(`Certificate ${certificate.id} has already been published for sale.`, NotificationType.Error);

                return;
            }

            await certificate.publishForSale(
                price,
                this.isErc20Sale ? erc20TokenAddress : Currency[currency],
                kwh * 1000
            );

            showNotification(`Certificate has been published for sale.`, NotificationType.Success);
            this.handleClose();
        }
    }

    validateInputs(event) {
        const countDecimals = value => value % 1 ? value.toString().split('.')[1].length : 0;

        switch (event.target.id) {
            case 'kwhInput':
                const kwh = Number(event.target.value);
                const kwhValid = !isNaN(kwh)
                    && kwh >= this.state.minKwh
                    && kwh <= this.props.certificate.powerInW / 1000
                    && countDecimals(kwh) <= 3;

                this.setState({
                    kwh: event.target.value,
                    validation: {
                        kwh: kwhValid,
                        price: this.state.validation.price,
                        erc20TokenAddress: this.state.validation.erc20TokenAddress
                    }
                });
                break;
            case 'priceInput':
                const price = Number(event.target.value);
                const priceValid = !isNaN(price)
                    && price > 0
                    && countDecimals(price) <= (this.isErc20Sale ? 0 : 2);
                console.log({price, priceValid})

                this.setState({
                    price: event.target.value,
                    validation: {
                        kwh: this.state.validation.kwh,
                        price: priceValid,
                        erc20TokenAddress: this.state.validation.erc20TokenAddress
                    }
                });
                break;
            case 'tokenAddressInput':
                this.setState({
                    erc20TokenAddress: event.target.value,
                    validation: {
                        kwh: this.state.validation.kwh,
                        price: this.state.validation.price,
                        erc20TokenAddress: this.props.conf.blockchainProperties.web3.utils.isAddress(event.target.value)
                    }
                });
                break;
        }
    }

    get isFormValid() {
        const { validation } = this.state;

        if (!this.isErc20Sale) {
            return validation.kwh && validation.price;
        }

        return Object.keys(validation).every(property => validation[property] === true);
    }

    get isErc20Sale() {
        return this.state.currency === ERC20CURRENCY;
    }

    get availableCurrencies() {
        let currencies = Object.keys(Currency);
        currencies = currencies.splice(Math.ceil(currencies.length / 2), currencies.length - 1);
        currencies = currencies.filter(curr => Currency[curr] !== Currency.NONE);
        currencies.push(ERC20CURRENCY);

        return currencies;
    }

    handleClose() {
        this.props.callback();
        this.setState({ show: false });
    }

    render() {
        const certificateId = this.props.certificate ? this.props.certificate.id : '';
        const facilityName = this.props.producingAsset ? this.props.producingAsset.offChainProperties.facilityName : '';

        return (
            <Modal show={this.state.show} onHide={this.handleClose} animation={false} backdrop={true} backdropClassName="modal-backdrop">
                <Modal.Header>
                    <Modal.Title>{`Publish certificate #${certificateId} for sale`}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="container">
                    <div className="row">
                        <div className="col">Facility</div>
                        <div className="col">{facilityName}</div>
                    </div>

                    <div className="row">
                        <div className="col">Date</div>
                        <div className="col">{this.state.certCreationDate}</div>
                    </div>

                    <hr />

                    <div className="row">
                        <div className="col vertical-align">kWh</div>
                        <div className="col">
                            <input className="modal-input" id="kwhInput" type="number" placeholder="1" value={this.state.kwh} onChange={(e) => this.validateInputs(e)} />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col vertical-align">Price</div>
                        <div className="col">
                            <input className="modal-input" id="priceInput" type="number" placeholder="1" value={this.state.price} onChange={(e) => this.validateInputs(e)} />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col vertical-align">Currency</div>
                        <div className="col">
                            <DropdownButton
                                id="currencySelectInput"
                                bsStyle="default"
                                title={this.state.currency}
                                onSelect={(eventKey) => this.setState({ currency: eventKey })}
                            >
                                {this.availableCurrencies.map(currency => <MenuItem key={currency} eventKey={currency}>{currency}</MenuItem>)}
                            </DropdownButton>

                            {this.isErc20Sale &&
                                <input id="tokenAddressInput" className="modal-input" type="text" placeholder="<ERC20 Token Address>" value={this.state.erc20TokenAddress} onChange={(e) => this.validateInputs(e)} />
                            }
                        </div>
                    </div>

                    <div className="text-danger">
                        {!this.state.validation.price && <div>Price is invalid</div>}
                        {!this.state.validation.kwh && <div>kwH value is invalid</div>}
                        {this.isErc20Sale && !this.state.validation.erc20TokenAddress && <div>Token address is invalid</div>}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this.handleClose} className="modal-button modal-button-cancel">Cancel</Button>
                    <Button variant="primary" onClick={this.publishForSale} className="modal-button modal-button-publish" disabled={!this.isFormValid}>
                        Publish for sale
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
  }

export { PublishForSaleModal };
