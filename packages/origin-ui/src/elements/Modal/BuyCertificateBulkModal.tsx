import * as React from 'react';
import { Erc20TestToken } from '@energyweb/erc-test-contracts';
import { Configuration } from '@energyweb/utils-general';
import { Certificate } from '@energyweb/origin';
import { showNotification, NotificationType } from '../../utils/notifications';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText
} from '@material-ui/core';

interface IBuyCertificateBulkModalProps {
    conf: Configuration.Entity;
    certificates: Certificate.Entity[];
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
        const from = (await this.props.conf.blockchainProperties.web3.eth.getAccounts())[0];

        for (const cert of this.props.certificates) {
            const acceptedToken = (cert.acceptedToken as any) as string;

            if (acceptedToken !== '0x0000000000000000000000000000000000000000') {
                const erc20TestToken = new Erc20TestToken(
                    this.props.conf.blockchainProperties.web3,
                    acceptedToken
                );

                const currentAllowance = Number(await erc20TestToken.allowance(from, cert.owner));
                const price = Number(cert.onChainDirectPurchasePrice);

                await erc20TestToken.approve(cert.owner, currentAllowance + price, {
                    from,
                    privateKey: ''
                });
            }
        }

        const certificateIds: string[] = this.props.certificates.map(cert => cert.id);
        await this.props.conf.blockchainProperties.certificateLogicInstance.buyCertificateBulk(
            certificateIds,
            { from }
        );

        showNotification(`Certificates have been bought.`, NotificationType.Success);
        this.handleClose();
    }

    handleClose() {
        this.props.callback();
        this.setState({ show: false });
    }

    render() {
        const totalWh = this.props.certificates.reduce((a, b) => a + Number(b.powerInW), 0);

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
