import React, { useState, useEffect } from 'react';
import { Certificate } from '@energyweb/origin';
import { MarketUser } from '@energyweb/market';
import { ProducingDeviceDetailView } from './ProducingDeviceDetailView';
import { useSelector, useDispatch } from 'react-redux';
import { getConfiguration } from '../features/selectors';
import { getCertificates } from '../features/certificates/selectors';
import { deduplicate, formatDate } from '../utils/helper';
import { getUsers, getUserById } from '../features/users/selectors';
import { requestUser } from '../features/users/actions';
import { Skeleton } from '@material-ui/lab';
import { makeStyles, createStyles, useTheme } from '@material-ui/core';
import { getEnvironment, getOffChainDataSource } from '../features/general/selectors';
import { EnergyFormatter } from '../utils/EnergyFormatter';
import { IOrganizationWithRelationsIds } from '@energyweb/origin-backend-core';

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
    const users = useSelector(getUsers);
    const environment = useSelector(getEnvironment);
    const organizationClient = useSelector(getOffChainDataSource).organizationClient;

    const [events, setEvents] = useState<IEnrichedEvent[]>([]);
    const [organizations, setOrganizations] = useState([] as IOrganizationWithRelationsIds[]);

    useEffect(() => {
        (async () => {
            if (organizationClient) {
                setOrganizations(await organizationClient.getAll());
            }
        })();
    }, [organizationClient]);

    function getUserDisplayText(user: MarketUser.Entity) {
        return (
            organizations?.find(o => o.id === user?.information?.organization)?.name ||
            `${user?.information?.firstName} ${user?.information?.lastName}`
        );
    }

    const dispatch = useDispatch();

    const useStyles = makeStyles(() =>
        createStyles({
            eventsLoader: {
                padding: '20px'
            }
        })
    );

    const classes = useStyles(useTheme());

    const selectedCertificate =
        id !== null && typeof id !== 'undefined' && certificates.find(c => c.id === id);

    let owner: MarketUser.Entity = null;

    if (selectedCertificate) {
        owner = getUserById(users, selectedCertificate.certificate.owner);

        if (!owner) {
            dispatch(requestUser(selectedCertificate.certificate.owner));
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
                    description = 'Logging by Device #' + event.returnValues._deviceId;
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
                            (await new MarketUser.Entity(
                                event.returnValues.to,
                                configuration
                            ).sync());

                        description = getUserDisplayText(user);
                    } else {
                        const newOwnerUser =
                            getUserById(users, event.returnValues.to) ||
                            (await new MarketUser.Entity(
                                event.returnValues.to,
                                configuration
                            ).sync());

                        const newOwner = getUserDisplayText(newOwnerUser);

                        const oldOwnerUser =
                            getUserById(users, event.returnValues.from) ||
                            (await new MarketUser.Entity(
                                event.returnValues.from,
                                configuration
                            ).sync());

                        const oldOwner = getUserDisplayText(oldOwnerUser);

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
                    description = `Initiated by ${getUserDisplayText(owner)}`;
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
                description: 'Device owner requested certification based on meter reads',
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
                    {formatDate(event.timestamp * 1000, true)} -{' '}
                    <a
                        href={`${environment.BLOCKCHAIN_EXPLORER_URL}/tx/${event.txHash}`}
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

        data = [
            [
                {
                    label: 'Certificate id',
                    data: selectedCertificate.id
                },
                {
                    label: 'Current owner',
                    data: getUserDisplayText(owner)
                },
                {
                    label: 'Claimed',
                    data:
                        selectedCertificate.certificate.status === Certificate.Status.Claimed
                            ? 'yes'
                            : 'no'
                },
                {
                    label: 'Creation date',
                    data: formatDate(selectedCertificate.certificate.creationTime * 1000)
                }
            ],
            [
                {
                    label: `Certified energy (${EnergyFormatter.displayUnit})`,
                    data: EnergyFormatter.format(selectedCertificate.certificate.energy)
                },
                {
                    label: 'Generation start',
                    data: formatDate(
                        selectedCertificate.certificate.generationStartTime * 1000,
                        true
                    )
                },
                {
                    label: 'Generation end',
                    data: formatDate(selectedCertificate.certificate.generationEndTime * 1000, true)
                }
            ]
        ];
    }

    return (
        <div className="DetailViewWrapper">
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
                    <ProducingDeviceDetailView
                        id={selectedCertificate.certificate.deviceId}
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
