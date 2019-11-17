import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { Certificate } from '@energyweb/origin';
import { User } from '@energyweb/user-registry';
import { ProducingAssetDetailView } from './ProducingAssetDetailView';
import './DetailView.scss';
import { useSelector, useDispatch } from 'react-redux';
import { getConfiguration, getProducingAssets } from '../features/selectors';
import { getCertificates } from '../features/certificates/selectors';
import { getEnv, deduplicate } from '../utils/helper';
import { useLinks } from '../utils/routing';
import { getUsers, getUserById } from '../features/users/selectors';
import { requestUser } from '../features/users/actions';
import { Skeleton } from '@material-ui/lab';
import { makeStyles, createStyles, useTheme } from '@material-ui/core';

interface IProps {
    id: string;
}

interface IEnrichedEvent {
    txHash: string;
    label: string;
    description: string;
    timestamp: number;
}

export function CertificateDetailView(props: IProps) {
    const { id } = props;

    const certificates = useSelector(getCertificates);
    const configuration = useSelector(getConfiguration);
    const producingAssets = useSelector(getProducingAssets);
    const users = useSelector(getUsers);

    const [newId, setNewId] = useState<string>(null);
    const [events, setEvents] = useState<IEnrichedEvent[]>([]);

    const dispatch = useDispatch();

    const useStyles = makeStyles(() =>
        createStyles({
            eventsLoader: {
                padding: '20px'
            }
        })
    );

    const classes = useStyles(useTheme());

    const { getCertificateDetailLink, getProducingAssetDetailLink } = useLinks();

    const selectedCertificate =
        id !== null && id !== undefined && certificates.find(c => c.id === id);

    let owner: User.Entity = null;

    if (selectedCertificate) {
        owner = getUserById(users, selectedCertificate.owner);

        if (!owner) {
            dispatch(requestUser(selectedCertificate.owner));
        }
    }

    async function enrichEvent() {
        const allCertificateEvents = await selectedCertificate.getAllCertificateEvents();

        const jointEvents = allCertificateEvents.map(async event => {
            let label: string;
            let description: string;

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
                    if (event.returnValues.from === '0x0000000000000000000000000000000000000000') {
                        label = 'Initial owner';
                        const user =
                            getUserById(users, event.returnValues.to) ||
                            (await new User.Entity(event.returnValues.to, configuration).sync());
                        description = user.organization;
                    } else {
                        const newOwner = (
                            getUserById(users, event.returnValues.to) ||
                            (await new User.Entity(event.returnValues.to, configuration).sync())
                        ).organization;

                        const oldOwner = (
                            getUserById(users, event.returnValues.from) ||
                            (await new User.Entity(event.returnValues.from, configuration).sync())
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
                    description = `Initiated by ${owner.organization}`;
                    break;

                default:
                    label = event.event;
            }

            return {
                txHash: event.transactionHash,
                label,
                description,
                timestamp: (
                    await configuration.blockchainProperties.web3.eth.getBlock(event.blockNumber)
                ).timestamp
            };
        });

        const resolvedEvents = await Promise.all(jointEvents);

        const certificationRequestEvents = await selectedCertificate.getCertificationRequestEvents();

        if (certificationRequestEvents) {
            resolvedEvents.push({
                txHash: certificationRequestEvents.certificationRequestCreatedEvent.transactionHash,
                label: 'Requested certification',
                description: 'Asset owner requested certification based on meter reads',
                timestamp: (
                    await configuration.blockchainProperties.web3.eth.getBlock(
                        certificationRequestEvents.certificationRequestCreatedEvent.blockNumber
                    )
                ).timestamp
            });
        }

        setEvents(deduplicate(resolvedEvents).sort((a, b) => a.timestamp - b.timestamp));
    }

    useEffect(() => {
        async function init() {
            if (!selectedCertificate) {
                return;
            }

            await enrichEvent();
        }

        init();
    }, [selectedCertificate?.id]);

    let data: Array<{
        label: string;
        data: string;
        link?: string;
    }>[];

    let eventsDisplay = [];
    if (selectedCertificate) {
        eventsDisplay = events.reverse().map((event, index) => (
            <p key={index}>
                <span className="timestamp text-muted">
                    {new Date(event.timestamp * 1000).toLocaleString()} -{' '}
                    <a
                        href={`${getEnv().BLOCKCHAIN_EXPLORER_URL}/tx/${event.txHash}`}
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

        const asset = producingAssets.find(p => p.id === selectedCertificate.assetId.toString());

        data = [
            [
                {
                    label: 'Certificate Id',
                    data: selectedCertificate.id
                },
                {
                    label: 'Current Owner',
                    data: owner?.organization || ''
                },
                {
                    label: 'Claimed',
                    data: selectedCertificate.status === Certificate.Status.Claimed ? 'yes' : 'no'
                },
                {
                    label: 'Producing Asset Id',
                    data: asset.id,
                    link: getProducingAssetDetailLink(asset.id)
                }
            ],
            [
                {
                    label: 'Certified Energy (kWh)',
                    data: (selectedCertificate.energy / 1000).toLocaleString()
                },
                {
                    label: 'Generation Start',
                    data: moment(selectedCertificate.generationStartTime * 1000).format(
                        'DD MMM YY HH:mm'
                    )
                },
                {
                    label: 'Generation End',
                    data: moment(selectedCertificate.generationEndTime * 1000).format(
                        'DD MMM YY HH:mm'
                    )
                },
                {
                    label: 'Creation Date',
                    data: moment(selectedCertificate.creationTime * 1000).format('DD MMM YY')
                }
            ]
        ];
    }

    return (
        <div className="DetailViewWrapper">
            <div className="FindAsset">
                <input onChange={e => setNewId(e.target.value)} defaultValue={id} />

                <Link
                    className="btn btn-primary find-asset-button"
                    to={getCertificateDetailLink(newId)}
                >
                    Find Certificate
                </Link>
            </div>
            <div className="PageContentWrapper">
                <div className="PageBody">
                    {selectedCertificate ? (
                        <div>
                            <table>
                                <tbody>
                                    {data.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {row.map(col => (
                                                <td key={col.label} rowSpan={1} colSpan={1}>
                                                    <div className="Label">{col.label}</div>
                                                    <div className="Data">{col.data}</div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center">
                            <strong>Certificate not found</strong>
                        </div>
                    )}
                </div>
                {selectedCertificate && (
                    <ProducingAssetDetailView
                        id={selectedCertificate.assetId}
                        addSearchField={false}
                        showSmartMeterReadings={false}
                        showCertificates={false}
                    />
                )}

                {selectedCertificate && (
                    <div className="PageBody">
                        {eventsDisplay.length === 0 ? (
                            <div className={classes.eventsLoader}>
                                <Skeleton variant="rect" height={50} />
                            </div>
                        ) : (
                            <div className="history">
                                <div>{eventsDisplay}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
