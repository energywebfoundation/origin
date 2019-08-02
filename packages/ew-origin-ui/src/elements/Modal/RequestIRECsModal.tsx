import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './Modal.scss';
import '../PageButton/PageButton.scss';
import moment from 'moment';

import { Configuration } from 'ew-utils-general-lib';
import { CertificateLogic } from 'ew-origin-lib';
import { ProducingAsset } from 'ew-asset-registry-lib';

import { showNotification, NotificationType } from '../../utils/notifications';
import DatePicker from 'react-date-picker';

interface IRequestIRECsModalProps {
    conf: Configuration.Entity;
    producingAsset: ProducingAsset.Entity;
    showModal: boolean;
    callback: () => void;
}

interface IRequestIRECsModalState {
    show: boolean;
    fromDate: Date;
    toDate: Date;
    reads: any[];
}

export class RequestIRECsModal extends React.Component<IRequestIRECsModalProps, IRequestIRECsModalState> {
    constructor(props, context) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);
        this.requestIRECs = this.requestIRECs.bind(this);
        this.isFormValid = this.isFormValid.bind(this);
        this.handleToDateChange = this.handleToDateChange.bind(this);

        this.state = {
            show: props.showModal,
            fromDate: moment().toDate(),
            toDate: this.setMaxTimeInDay(moment().toDate()),
            reads: []
        };
    }

    componentWillReceiveProps(newProps: IRequestIRECsModalProps) {
        this.setState({
            show: newProps.showModal
        });
    }

    async componentDidUpdate(prevProps : IRequestIRECsModalProps) {
        if (this.props.producingAsset && (this.props.producingAsset !== prevProps.producingAsset)) {
            const reads = await this.props.producingAsset.getSmartMeterReads();

            const certificateLogic : CertificateLogic = this.props.conf.blockchainProperties.certificateLogicInstance;

            const requestedSMReadsLength = Number(await certificateLogic.getAssetRequestedCertsForSMReadsLength(Number(this.props.producingAsset.id)));

            const fromDate = moment.unix(reads[requestedSMReadsLength].timestamp).toDate();

            this.setState({
                reads,
                fromDate
            });
        }
    }

    async requestIRECs() {
        const certificateLogic : CertificateLogic = this.props.conf.blockchainProperties.certificateLogicInstance;

        const readsInRange = this.getReadsInTimeRange(this.state.fromDate, this.state.toDate);
        const lastReadIndex = this.state.reads.indexOf(readsInRange[readsInRange.length - 1]);

        await certificateLogic.requestCertificates(Number(this.props.producingAsset.id), lastReadIndex);

        const energy = this.getEnergy(this.state.fromDate, this.state.toDate) / 1000;

        showNotification(`Certificates for ${energy} kWh requested.`, NotificationType.Success);

        this.handleClose();
    }

    isFormValid() {
        return this.state.fromDate <= this.state.toDate;
    }

    handleClose() {
        this.props.callback();
        this.setState({ show: false });
    }

    setMaxTimeInDay(date) {
        return moment(date).hours(23).minutes(59).seconds(59).milliseconds(999).toDate();
    }

    async handleToDateChange(date) {
        this.setState({
            'toDate': this.setMaxTimeInDay(date),
            energy: this.getEnergy(this.state.fromDate, date)
        } as any);
    }

    getReadsInTimeRange(fromDate, toDate) {
        const fromTimestamp = moment(fromDate).unix();
        const toTimestamp = moment(toDate).unix();

        return this.state.reads.filter(read => Number(read.timestamp) <= toTimestamp && Number(read.timestamp) >= fromTimestamp);
    }

    getEnergy(fromDate, toDate) {
        if (!this.props.producingAsset) {
            return 0;
        }

        return this.getReadsInTimeRange(fromDate, toDate).reduce((a, b) => a + Number(b.energy), 0);
    }

    render() {
        const assetId = this.props.producingAsset ? this.props.producingAsset.id : '';

        return (
            <Modal show={this.state.show} onHide={this.handleClose} animation={false} backdrop={true} backdropClassName="modal-backdrop">
                <Modal.Header>
                    <Modal.Title>{`Request I-RECs for Asset #${assetId}`}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="container">
                    <div className="row">
                        <div className="col">From</div>
                        <div className="col">
                            {moment(this.state.fromDate).format('YYYY-MM-DD')}
                        </div>
                    </div>

                    <br/>

                    <div className="row">
                        <div className="col">To</div>
                        <div className="col">
                            <input
                                className="Date modal-input"
                                value={
                                    moment(this.state.toDate).format('YYYY-MM-DD') ||
                                    'Pick a date'
                                }
                                readOnly={true}
                            />
                            <DatePicker
                                onChange={this.handleToDateChange}
                                value={this.state.toDate}
                            />
                        </div>
                    </div>

                    <br/>

                    <div className="row">
                        <div className="col">kWh</div>
                        <div className="col">{this.getEnergy(this.state.fromDate, this.state.toDate) / 1000}</div>
                    </div>

                    <hr />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this.handleClose} className="modal-button modal-button-cancel">Cancel</Button>
                    <Button variant="primary" onClick={this.requestIRECs} className="modal-button modal-button-publish" disabled={!this.isFormValid()}>
                        Request
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
  }
