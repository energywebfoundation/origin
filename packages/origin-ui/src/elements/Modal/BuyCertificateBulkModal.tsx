import * as React from 'react';
import { Erc20TestToken } from '@energyweb/erc-test-contracts';
import { PurchasableCertificate } from '@energyweb/market';
import { showNotification, NotificationType } from '../../utils/notifications';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText
} from '@material-ui/core';
import { IStoreState } from '../../types/index';

interface IBuyCertificateBulkModalProps {
    conf: IStoreState['configuration'];
    certificates: PurchasableCertificate.Entity[];
    showModal: boolean;
    callback: () => void;
}

interface IBuyCertificateBulkModalState {
    show: boolean;
}

export class BuyCertificateBulkModal extends React.Component<
    IBuyCertificateBulkModalProps,
    IBuyCertificateBulkModalState
> {
    constructor(props, context) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);
        this.buyCertificateBulk = this.buyCertificateBulk.bind(this);

        this.state = {
            show: props.showModal
        };
    }

    UNSAFE_componentWillReceiveProps(newProps: IBuyCertificateBulkModalProps) {
        this.setState({
            show: newProps.showModal
        });
    }

    async buyCertificateBulk() {
        const account = {
            from: this.props.conf.blockchainProperties.activeUser.address,
            privateKey: this.props.conf.blockchainProperties.activeUser.privateKey
        };

        for (const cert of this.props.certificates) {
            const acceptedToken = (cert.acceptedToken as any) as string;

            if (acceptedToken !== '0x0000000000000000000000000000000000000000') {
                const erc20TestToken = new Erc20TestToken(
                    this.props.conf.blockchainProperties.web3,
                    acceptedToken
                );

                const currentAllowance = Number(
                    await erc20TestToken.allowance(account.from, cert.certificate.owner)
                );
                const price = Number(cert.onChainDirectPurchasePrice);

                await erc20TestToken.approve(
                    cert.certificate.owner,
                    currentAllowance + price,
                    account
                );
            }
        }

        const certificateIds: number[] = this.props.certificates.map(cert => parseInt(cert.id, 10));
        await this.props.conf.blockchainProperties.marketLogicInstance.buyCertificateBulk(
            certificateIds,
            account
        );

        showNotification(`Certificates have been bought.`, NotificationType.Success);
        this.handleClose();
    }

    handleClose() {
        this.props.callback();
        this.setState({ show: false });
    }

    render() {
        const totalWh = this.props.certificates.reduce(
            (a, b) => a + Number(b.certificate.energy),
            0
        );

        return (
            <Dialog open={this.state.show} onClose={this.handleClose}>
                <DialogTitle>Buy certificates</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You selected a total of {totalWh / 1e6} MWh worth of I-REC certificates.
                    </DialogContentText>
                    <DialogContentText>
                        Would you like to proceed with buying them?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={this.buyCertificateBulk} color="primary">
                        Buy
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
