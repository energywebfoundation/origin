import * as React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { ProducingAsset } from '@energyweb/asset-registry';
import { Certificate } from '@energyweb/origin';
import { MarketUser, PurchasableCertificate } from '@energyweb/market';
import { ProducingAssetDetailView } from './ProducingAssetDetailView';
import './DetailView.scss';
import { Configuration } from '@energyweb/utils-general';
import { connect } from 'react-redux';
import { IStoreState } from '../types';
import { getBaseURL, getConfiguration, getProducingAssets } from '../features/selectors';
import { getProducingAssetDetailLink, getCertificateDetailLink } from '../utils/routing';
import { getCertificates } from '../features/certificates/selectors';

interface IOwnProps {
    id: number;
}

interface IStateProps {
    configuration: Configuration.Entity;
    baseURL: string;
    certificates: PurchasableCertificate.Entity[];
    producingAssets: ProducingAsset.Entity[];
}

type Props = IOwnProps & IStateProps;

interface IDetailViewState {
    newId: number;
    owner: MarketUser.Entity;
    events: IEnrichedEvent[];
}

export interface IEnrichedEvent {
    txHash: string;
    label: string;
    description: string;
    timestamp: number;
}

class CertificateDetailViewClass extends React.Component<Props, IDetailViewState> {
    constructor(props: Props) {
        super(props);
        this.state = {
            newId: null,
            owner: null,
            events: []
        };
        this.onInputChange = this.onInputChange.bind(this);
    }

    onInputChange(e) {
        this.setState({ newId: e.target.value });
    }

    componentDidMount() {
        this.init(this.props);
    }

    UNSAFE_componentWillReceiveProps(newProps: Props) {
        this.init(newProps);
    }

    init(props: Props) {
        if (props.id !== null && props.id !== undefined) {
            const selectedCertificate: PurchasableCertificate.Entity = props.certificates.find(
                (c: PurchasableCertificate.Entity) => c.id === props.id.toString()
            );
            if (selectedCertificate) {
                this.getOwner(props, selectedCertificate, () =>
                    this.enrichEvent(props, selectedCertificate)
                );
            }
        }
    }

    async getOwner(props: Props, selectedCertificate: PurchasableCertificate.Entity, cb) {
        this.setState(
            {
                owner: await new MarketUser.Entity(
                    selectedCertificate.certificate.owner,
                    props.configuration as any
                ).sync()
            },
            cb
        );
    }

    async enrichEvent(props: Props, selectedCertificate: PurchasableCertificate.Entity) {
        const jointEvents = (await selectedCertificate.getAllCertificateEvents()).map(
            async (event: any) => {
                let label;
                let description;

                switch (event.event) {
                    case 'LogNewMeterRead':
                        label = 'Initial logging';
                        description = 'Logging by Asset #' + event.returnValues._assetId;
                        break;
                    case 'LogCreatedCertificate':
                        label = 'Certified';
                        description = 'Local issuer approved the certification request';
                        break;
                    case 'Transfer':
                        if (
                            (event as any).returnValues._from ===
                            '0x0000000000000000000000000000000000000000'
                        ) {
                            label = 'Initial owner';
                            description = (
                                await new MarketUser.Entity(
                                    (event as any).returnValues._to,
                                    props.configuration as any
                                ).sync()
                            ).organization;
                        } else {
                            const newOwner = (
                                await new MarketUser.Entity(
                                    (event as any).returnValues._to,
                                    props.configuration as any
                                ).sync()
                            ).organization;
                            const oldOwner = (
                                await new MarketUser.Entity(
                                    (event as any).returnValues._from,
                                    props.configuration as any
                                ).sync()
                            ).organization;
                            label = 'Changed ownership';
                            description = `Transferred from ${oldOwner} to ${newOwner}`;
                        }
                        break;
                    case 'LogPublishForSale':
                        label = 'Certificate published for sale';
                        break;
                    case 'LogUnpublishForSale':
                        label = 'Certificate unpublished from sale';
                        break;

                    case 'LogCertificateClaimed':
                        label = 'Certificate claimed';
                        description = `Initiated by ${this.state.owner.organization}`;
                        break;

                    default:
                        label = event.event;
                }

                return {
                    txHash: event.transactionHash,
                    label,
                    description,
                    timestamp: (
                        await props.configuration.blockchainProperties.web3.eth.getBlock(
                            event.blockNumber
                        )
                    ).timestamp
                };
            }
        );

        const resolvedEvents = await Promise.all(jointEvents);

        const certificationRequestEvents = await selectedCertificate.getCertificationRequestEvents();

        if (certificationRequestEvents) {
            resolvedEvents.push({
                txHash: certificationRequestEvents.certificationRequestCreatedEvent.transactionHash,
                label: 'Requested certification',
                description: 'Asset owner requested certification based on meter reads',
                timestamp: (
                    await props.configuration.blockchainProperties.web3.eth.getBlock(
                        certificationRequestEvents.certificationRequestCreatedEvent.blockNumber
                    )
                ).timestamp
            });
        }

        this.setState({
            events: resolvedEvents.sort((a, b) => a.timestamp - b.timestamp) as any
        });
    }

    render() {
        const selectedCertificate =
            this.props.id !== null && this.props.id !== undefined
                ? this.props.certificates.find(
                      (c: PurchasableCertificate.Entity) => c.id === this.props.id.toString()
                  )
                : null;

        let data;
        let events = [];
        if (selectedCertificate) {
            events = this.state.events.reverse().map((event: IEnrichedEvent) => (
                <p key={event.txHash}>
                    <span className="timestamp text-muted">
                        {new Date(event.timestamp * 1000).toLocaleString()} -{' '}
                        <a
                            href={`${process.env.BLOCKCHAIN_EXPLORER_URL}/tx/${event.txHash}`}
                            className="text-muted"
                            target="_blank"
                            rel="noopener"
                        >
                            {event.txHash}
                        </a>
                    </span>
                    <br />
                    {event.label}
                    {event.description ? ` - ${event.description}` : ''}
                    <br />
                </p>
            ));

            const asset = this.props.producingAssets.find(
                p => p.id === selectedCertificate.certificate.assetId.toString()
            );

            data = [
                [
                    {
                        label: 'Certificate Id',
                        data: selectedCertificate.id
                    },
                    {
                        label: 'Current Owner',
                        data: this.state.owner ? this.state.owner.organization : ''
                    },
                    {
                        label: 'Claimed',
                        data:
                            selectedCertificate.certificate.status === Certificate.Status.Claimed
                                ? 'yes'
                                : 'no'
                    },
                    {
                        label: 'Producing Asset Id',
                        data: asset.id,
                        link: getProducingAssetDetailLink(this.props.baseURL, asset.id)
                    },

                    {
                        label: 'Certified Energy (kWh)',
                        data: (selectedCertificate.certificate.energy / 1000).toLocaleString()
                    },
                    {
                        label: 'Creation Date',
                        data: moment(selectedCertificate.certificate.creationTime * 1000).format(
                            'DD MMM YY'
                        )
                    }
                ]
            ];
        }

        return (
            <div className="DetailViewWrapper">
                <div className="FindAsset">
                    <input
                        onChange={this.onInputChange}
                        defaultValue={
                            this.props.id || this.props.id === 0 ? this.props.id.toString() : ''
                        }
                    />

                    <Link
                        className="btn btn-primary find-asset-button"
                        to={getCertificateDetailLink(this.props.baseURL, this.state.newId)}
                    >
                        Find Certificate
                    </Link>
                </div>
                <div className="PageContentWrapper">
                    <div className="PageBody">
                        {!selectedCertificate ? (
                            <div className="text-center">
                                <strong>Certificate not found</strong>
                            </div>
                        ) : (
                            <div>
                                <table>
                                    <tbody>
                                        {data.map((row: any) => (
                                            <tr key={row.label}>
                                                {row.map(col => (
                                                    <td
                                                        key={col.label}
                                                        rowSpan={col.rowspan || 1}
                                                        colSpan={col.colspan || 1}
                                                    >
                                                        <div className="Label">{col.label}</div>
                                                        <div className="Data">
                                                            {col.data}{' '}
                                                            {col.tip && <span>{col.tip}</span>}
                                                        </div>

                                                        {col.description && (
                                                            <div className="Description">
                                                                {col.description}
                                                            </div>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    {selectedCertificate ? (
                        <ProducingAssetDetailView
                            id={selectedCertificate.certificate.assetId}
                            addSearchField={false}
                            showSmartMeterReadings={false}
                            showCertificates={false}
                        />
                    ) : null}
                    {selectedCertificate ? (
                        <div className="PageBody">
                            <div className="history">
                                <div>{events}</div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }
}

export const CertificateDetailView = connect(
    (state: IStoreState): IStateProps => ({
        baseURL: getBaseURL(),
        certificates: getCertificates(state),
        configuration: getConfiguration(state),
        producingAssets: getProducingAssets(state)
    })
)(CertificateDetailViewClass);
