import * as React from 'react';
import { Configuration } from '@energyweb/utils-general';
import { User } from '@energyweb/user-registry';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { showNotification, NotificationType } from '../../utils/notifications';

interface IAccountDetailsModalProps {
    conf: Configuration.Entity;
    user: User.Entity;
    showModal: boolean;
    callback: () => void;
}

interface IAccountDetailsModalState {
    show: boolean;
    notificationsEnabled: boolean;
}

class AccountDetailsModal extends React.Component<
    IAccountDetailsModalProps,
    IAccountDetailsModalState
> {
    constructor(props, context) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);
        this.saveChanges = this.saveChanges.bind(this);

        this.state = {
            show: props.showModal,
            notificationsEnabled: props.user.offChainProperties.notifications
        };
    }

    UNSAFE_componentWillReceiveProps(newProps: IAccountDetailsModalProps) {
        this.setState({
            show: newProps.showModal
        });
    }

    async componentDidUpdate(prevProps) {
        if (this.props.user && this.props.user !== prevProps.user) {
            this.setState({
                notificationsEnabled: this.props.user.offChainProperties.notifications
            });
        }
    }

    async saveChanges() {
        if (this.state.notificationsEnabled === this.props.user.offChainProperties.notifications) {
            this.handleClose();
            showNotification(`No changes have been made.`, NotificationType.Error);

            return;
        }

        showNotification(`User settings have been updated.`, NotificationType.Success);
        this.handleClose();
    }

    handleClose() {
        this.props.callback();
        this.setState({ show: false });
    }

    render() {
        return (
            <Dialog open={this.state.show} onClose={this.handleClose}>
                <DialogTitle>{`User #${this.props.user.id}`}</DialogTitle>
                <DialogContent></DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={this.saveChanges}
                        color="primary"
                        disabled={
                            this.state.notificationsEnabled ===
                            this.props.user.offChainProperties.notifications
                        }
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export { AccountDetailsModal };
