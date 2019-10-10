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
import { connect } from 'react-redux';
import { IStoreState } from '../../types';
import { getConfiguration } from '../../features/selectors';
import { getMarketContractLookupAddress } from '../../features/contracts/selectors';
import { getCurrentUser } from '../../features/users/selectors';
import { bindActionCreators } from 'redux';
import {
    TSetMarketContractLookupAddress,
    setMarketContractLookupAddress
} from '../../features/contracts/actions';

interface IOwnProps {
    showModal: boolean;
    callback: () => void;
}

interface IStateProps {
    configuration: Configuration.Entity;
    currentUser: User.Entity;
    marketLookupAddress: string;
}

interface IDispatchProps {
    setMarketContractLookupAddress: TSetMarketContractLookupAddress;
}

type Props = IOwnProps & IStateProps & IDispatchProps;

interface IState {
    show: boolean;
    notificationsEnabled: boolean;
    marketLookupAddress: string;
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

class AccountDetailsModalClass extends React.Component<Props, IState> {
    constructor(props, context) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
        this.toggleNotifications = this.toggleNotifications.bind(this);

        this.state = {
            show: props.showModal,
            notificationsEnabled: props.currentUser.offChainProperties.notifications,
            marketLookupAddress: ''
        };
    }

    static getDerivedStateFromProps(nextProps: Props): Partial<IState> {
        return {
            show: nextProps.showModal
        };
    }

    componentDidMount() {
        this.setState({
            marketLookupAddress: this.props.marketLookupAddress
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.currentUser && this.props.currentUser !== prevProps.currentUser) {
            this.setState({
                notificationsEnabled: this.props.currentUser.offChainProperties.notifications,
                marketLookupAddress: this.props.marketLookupAddress
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

        const notificationChanged =
            this.state.notificationsEnabled !== currentUser.offChainProperties.notifications;
        const contractChanged = this.state.marketLookupAddress !== this.props.marketLookupAddress;

        if (!notificationChanged && !contractChanged) {
            this.handleClose();
            showNotification(`No changes have been made.`, NotificationType.Error);

            return;
        }

        if (notificationChanged) {
            const newProperties: User.IUserOffChainProperties = currentUser.offChainProperties;
            newProperties.notifications = this.state.notificationsEnabled;

            await currentUser.update(newProperties);
        }

        if (contractChanged) {
            this.props.setMarketContractLookupAddress({
                address: this.state.marketLookupAddress,
                userDefined: true
            });
        }

        showNotification(`User settings have been updated.`, NotificationType.Success);
        this.handleClose();
    }

    get propertiesChanged() {
        const notificationChanged =
            this.state.notificationsEnabled !==
            this.props.currentUser.offChainProperties.notifications;
        const contractChanged = this.state.marketLookupAddress !== this.props.marketLookupAddress;

        return notificationChanged || contractChanged;
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
                        label="E-mail"
                        value={currentUser ? currentUser.offChainProperties.email : 'Unknown'}
                        fullWidth
                        disabled
                        className="my-3"
                    />
                    <TextField
                        label="Market Lookup Address"
                        value={this.state.marketLookupAddress}
                        onChange={e =>
                            this.setState({
                                marketLookupAddress: e.target.value
                            })
                        }
                        fullWidth
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
                        disabled={!this.propertiesChanged}
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export const AccountDetailsModal = connect(
    (state: IStoreState): IStateProps => ({
        currentUser: getCurrentUser(state),
        configuration: getConfiguration(state),
        marketLookupAddress: getMarketContractLookupAddress(state)
    }),
    dispatch =>
        bindActionCreators(
            {
                setMarketContractLookupAddress
            },
            dispatch
        )
)(AccountDetailsModalClass);
