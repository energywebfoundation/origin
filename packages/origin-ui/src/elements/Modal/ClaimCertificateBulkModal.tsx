import * as React from 'react';
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
import { IStoreState } from '../../types/index';
import { connect } from 'react-redux';
import { getConfiguration } from '../../features/selectors';
import { getCurrentUser } from '../../features/users/selectors';
import { User } from '@energyweb/user-registry';

interface IStateProps {
    configuration: IStoreState['configuration'];
    currentUser: User.Entity;
}

interface IOwnProps {
    certificates: Certificate.Entity[];
    showModal: boolean;
    callback: () => void;
}

type Props = IOwnProps & IStateProps;

class ClaimCertificateBulkModalClass extends React.Component<Props> {
    constructor(props, context) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);
        this.claimCertificates = this.claimCertificates.bind(this);
    }

    async claimCertificates() {
        const certificateIds: string[] = this.props.certificates.map(cert => cert.id);

        await Certificate.claimCertificates(certificateIds, this.props.configuration);

        showNotification(`Certificates have been claimed.`, NotificationType.Success);
        this.handleClose();
    }

    handleClose() {
        this.props.callback();
    }

    render() {
        const totalWh = this.props.certificates.reduce((a, b) => a + Number(b.energy), 0);

        return (
            <Dialog open={this.props.showModal} onClose={this.handleClose}>
                <DialogTitle>Claim certificates</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You selected a total of {totalWh / 1e6} MWh worth of I-REC certificates.
                    </DialogContentText>
                    <DialogContentText>
                        Would you like to proceed with claiming them?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={this.claimCertificates} color="primary">
                        Claim
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export const ClaimCertificateBulkModal = connect(
    (state: IStoreState): IStateProps => ({
        currentUser: getCurrentUser(state),
        configuration: getConfiguration(state)
    })
)(ClaimCertificateBulkModalClass);
