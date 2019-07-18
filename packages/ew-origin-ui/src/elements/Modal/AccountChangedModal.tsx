import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './Modal.scss';

import { connect } from 'react-redux';
import { IStoreState } from '../../types';
import { bindActionCreators } from 'redux';
import { disableAccountChangedModal, TDisableAccountChangedModal } from '../../features/general/actions';
import { getAccountChangedModalVisible } from '../../features/general/selectors';

interface AccountChangedModalProps {
    show: boolean;
    disableAccountChangedModal: TDisableAccountChangedModal;
}

export class AccountChangedModalClass extends React.Component<AccountChangedModalProps, any> {
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
            <Modal show={this.props.show} onHide={this.handleClose} animation={false} backdrop="static" backdropClassName="modal-backdrop">
                <Modal.Header>
                    <Modal.Title>{`Account changed`}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="container">
                    <div className="row">
                        <div className="col">Account changed, please refresh the page in order to switch to a new account.</div>
                    </div>

                    <hr />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this.handleClose} className="modal-button modal-button-cancel">Cancel</Button>
                    <Button variant="primary" onClick={this.refreshPage} className="modal-button modal-button-publish">
                        Refresh page
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
  }

export const AccountChangedModal = connect(
    (state: IStoreState) => ({
        show: getAccountChangedModalVisible(state)
    }),
    dispatch => bindActionCreators({
        disableAccountChangedModal
    }, dispatch)
)(AccountChangedModalClass);