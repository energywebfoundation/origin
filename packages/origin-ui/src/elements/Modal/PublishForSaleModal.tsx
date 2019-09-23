import * as React from 'react';
import moment from 'moment';
import { Erc20TestToken } from '@energyweb/erc-test-contracts';
import { Currency, Configuration } from '@energyweb/utils-general';
import { Certificate } from '@energyweb/origin';
import { ProducingAsset } from '@energyweb/asset-registry';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    FormControl,
    InputLabel,
    FilledInput,
    MenuItem,
    Select
} from '@material-ui/core';
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

class PublishForSaleModal extends React.Component<
    IPublishForSaleModalProps,
    IPublishForSaleModalState
> {
    constructor(props, context) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);
        this.publishForSale = this.publishForSale.bind(this);
        this.validateInputs = this.validateInputs.bind(this);

        const minKwh = 0.001;

        this.state = {
            show: props.showModal,
            minKwh,
            kwh: props.certificate ? props.certificate.energy / 1000 : minKwh,
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

    UNSAFE_componentWillReceiveProps(newProps: IPublishForSaleModalProps) {
        this.setState({
            show: newProps.showModal
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
                kwh: this.props.certificate.energy / 1000,
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
                showNotification(
                    `Certificate ${certificate.id} has already been published for sale.`,
                    NotificationType.Error
                );

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

    async validateInputs(event) {
        const countDecimals = value => (value % 1 ? value.toString().split('.')[1].length : 0);

        switch (event.target.id) {
            case 'kwhInput':
                const kwh = Number(event.target.value);
                const kwhValid =
                    !isNaN(kwh) &&
                    kwh >= this.state.minKwh &&
                    kwh <= this.props.certificate.energy / 1000 &&
                    countDecimals(kwh) <= 3;

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
                const priceValid =
                    !isNaN(price) &&
                    price > 0 &&
                    countDecimals(price) <= (this.isErc20Sale ? 0 : 2);

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
                const givenAddress = event.target.value;
                const isAddress = this.props.conf.blockchainProperties.web3.utils.isAddress(
                    givenAddress
                );
                let isInitializedToken = true;

                if (isAddress) {
                    const token = new Erc20TestToken(
                        this.props.conf.blockchainProperties.web3,
                        givenAddress
                    );

                    try {
                        await token.web3Contract.methods.symbol().call();
                    } catch (e) {
                        isInitializedToken = false;
                    }
                }

                this.setState({
                    erc20TokenAddress: givenAddress,
                    validation: {
                        kwh: this.state.validation.kwh,
                        price: this.state.validation.price,
                        erc20TokenAddress: isAddress && isInitializedToken
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
        const facilityName = this.props.producingAsset
            ? this.props.producingAsset.offChainProperties.facilityName
            : '';

        return (
            <Dialog open={this.state.show} onClose={this.handleClose}>
                <DialogTitle>{`Publish certificate #${certificateId} for sale`}</DialogTitle>
                <DialogContent>
                    <TextField label="Facility" value={facilityName} fullWidth disabled />

                    <TextField
                        label="Date"
                        value={this.state.certCreationDate}
                        fullWidth
                        disabled
                        className="mt-4"
                    />

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

                    <TextField
                        label="Price"
                        value={this.state.price}
                        type="number"
                        placeholder="1"
                        onChange={e => this.validateInputs(e)}
                        className="mt-4"
                        id="priceInput"
                        fullWidth
                    />

                    <FormControl fullWidth={true} variant="filled" className="mt-4">
                        <InputLabel>Currency</InputLabel>
                        <Select
                            value={this.state.currency}
                            onChange={e => this.setState({ currency: e.target.value as any })}
                            fullWidth
                            variant="filled"
                            input={<FilledInput />}
                        >
                            {this.availableCurrencies.map(currency => (
                                <MenuItem key={currency} value={currency}>
                                    {currency}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {this.isErc20Sale && (
                        <TextField
                            label="ERC20 Token Address"
                            value={this.state.erc20TokenAddress}
                            placeholder="<ERC20 Token Address>"
                            onChange={e => this.validateInputs(e)}
                            className="mt-4"
                            id="tokenAddressInput"
                            fullWidth
                        />
                    )}

                    <div className="text-danger">
                        {!this.state.validation.price && <div>Price is invalid</div>}
                        {!this.state.validation.kwh && <div>kWh value is invalid</div>}
                        {this.isErc20Sale && !this.state.validation.erc20TokenAddress && (
                            <div>Token address is invalid</div>
                        )}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={this.publishForSale}
                        color="primary"
                        disabled={!this.isFormValid}
                    >
                        Publish for sale
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export { PublishForSaleModal };
