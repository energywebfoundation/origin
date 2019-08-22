import * as React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText
} from '@material-ui/core';
import { connect } from 'react-redux';
import { IStoreState } from '../../types';
import { bindActionCreators } from 'redux';
import {
    disableAccountChangedModal,
    TDisableAccountChangedModal
} from '../../features/general/actions';
import { getAccountChangedModalVisible } from '../../features/general/selectors';

interface AccountChangedModalProps {
    show: boolean;
    disableAccountChangedModal: TDisableAccountChangedModal;
}

class AccountChangedModalClass extends React.Component<AccountChangedModalProps> {
    constructor(props: AccountChangedModalProps) {
        super(props);

        this.handleClose = this.handleClose.bind(this);
    }

    handleClose() {
        this.props.disableAccountChangedModal();
    }

    refreshPage() {
        window.location.reload();
    }

    render() {
        return (
            <Dialog open={this.props.show} onClose={this.handleClose}>
                <DialogTitle>Account changed</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Account changed, please refresh the page in order to switch to a new
                        account.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={this.refreshPage} color="primary">
                        Refresh page
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export const AccountChangedModal = connect(
    (state: IStoreState) => ({
        show: getAccountChangedModalVisible(state)
    }),
    dispatch =>
        bindActionCreators(
            {
                disableAccountChangedModal
            },
            dispatch
        )
)(AccountChangedModalClass);
