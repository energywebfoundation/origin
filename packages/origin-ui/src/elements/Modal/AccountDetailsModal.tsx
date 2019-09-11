import * as React from 'react';
import { Configuration } from '@energyweb/utils-general';
import { User } from '@energyweb/user-registry';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Switch,
    FormControlLabel,
    FormGroup,
    TextField
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { showNotification, NotificationType } from '../../utils/notifications';
import { STYLE_CONFIG } from '../../styles/styleConfig';

interface IAccountDetailsModalProps {
    conf: Configuration.Entity;
    currentUser: User.Entity;
    showModal: boolean;
    callback: () => void;
}

interface IAccountDetailsModalState {
    show: boolean;
    notificationsEnabled: boolean;
}

const PurpleSwitch = withStyles({
    switchBase: {
        color: STYLE_CONFIG.PRIMARY_COLOR,
        '&$checked': {
            color: STYLE_CONFIG.PRIMARY_COLOR
        },
        '&$checked + $track': {
            backgroundColor: STYLE_CONFIG.PRIMARY_COLOR
        }
    },
    checked: {},
    track: {}
})(Switch);

class AccountDetailsModal extends React.Component<
    IAccountDetailsModalProps,
    IAccountDetailsModalState
> {
    constructor(props, context) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
        this.toggleNotifications = this.toggleNotifications.bind(this);

        this.state = {
            show: props.showModal,
            notificationsEnabled: props.currentUser.offChainProperties.notifications
        };
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            show: nextProps.showModal
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.currentUser && this.props.currentUser !== prevProps.currentUser) {
            this.setState({
                notificationsEnabled: this.props.currentUser.offChainProperties.notifications
            });
        }
    }

    toggleNotifications() {
        this.setState({
            notificationsEnabled: !this.state.notificationsEnabled
        });
    }

    async saveChanges() {
        const { currentUser } = this.props;

        if (this.state.notificationsEnabled === currentUser.offChainProperties.notifications) {
            this.handleClose();
            showNotification(`No changes have been made.`, NotificationType.Error);

            return;
        }

        const newProperties: User.IUserOffChainProperties = currentUser.offChainProperties;
        newProperties.notifications = this.state.notificationsEnabled;

        currentUser.configuration.blockchainProperties.activeUser = {
            address: currentUser.id
        };

        await currentUser.update(newProperties);

        showNotification(`User settings have been updated.`, NotificationType.Success);
        this.handleClose();
    }

    handleClose() {
        this.props.callback();
        this.setState({
            show: false,
            notificationsEnabled: this.props.currentUser.offChainProperties.notifications
        });
    }

    render() {
        const { currentUser } = this.props;

        return (
            <Dialog open={this.state.show} onClose={this.handleClose}>
                <DialogTitle>{currentUser ? currentUser.organization : 'Guest'}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="e-mail"
                        value={currentUser ? currentUser.offChainProperties.email : 'Unknown'}
                        fullWidth
                        disabled
                        className="my-3"
                    />
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <PurpleSwitch
                                    checked={this.state.notificationsEnabled}
                                    onChange={this.toggleNotifications}
                                />
                            }
                            label="Notifications"
                        />
                    </FormGroup>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={this.saveChanges}
                        color="primary"
                        disabled={
                            this.state.notificationsEnabled ===
                            currentUser.offChainProperties.notifications
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
