import React, { useState, useEffect } from 'react';
import { CertificationRequest, CertificateUtils } from '@energyweb/issuer';
import { ProducingDeviceDetailView } from './ProducingDeviceDetailView';
import { useSelector } from 'react-redux';
import { getConfiguration } from '../features/selectors';
import { getCertificates } from '../features/certificates/selectors';
import { deduplicate } from '../utils/helper';
import { formatDate } from '../utils/time';
import { Skeleton } from '@material-ui/lab';
import { makeStyles, createStyles, useTheme } from '@material-ui/core';
import { getEnvironment } from '../features/general/selectors';
import { EnergyFormatter } from '../utils/EnergyFormatter';

interface IProps {
    id: number;
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
    const environment = useSelector(getEnvironment);

    const [events, setEvents] = useState<IEnrichedEvent[]>([]);

    const useStyles = makeStyles(() =>
        createStyles({
            eventsLoader: {
                padding: '20px'
            }
        })
    );

    const classes = useStyles(useTheme());

    const selectedCertificate =
        id !== null && typeof id !== 'undefined' && certificates.find((c) => c.id === id);

    async function enrichEvent() {
        const allCertificateEvents = await CertificateUtils.getAllCertificateEvents(
            selectedCertificate.id,
            selectedCertificate.configuration
        );

        const jointEvents = allCertificateEvents.map(async (event) => {
            let label: string;
            let description: string;

            switch (event.name) {
                case 'IssuanceSingle':
                    label = 'Certified';
                    description = `Local issuer approved the certification request`;

                    break;
                case 'TransferSingle':
                    if (event.values._from === '0x0000000000000000000000000000000000000000') {
                        label = 'Initial owner';
                        description = event.values._to;
                    } else {
                        const newOwner = event.values._to;
                        const oldOwner = event.values._from;

                        label = 'Changed ownership';
                        description = `Transferred from ${oldOwner} to ${newOwner}`;
                    }
                    break;
                case 'ClaimSingle':
                    label = 'Certificate claimed';
                    description = `Initiated by ${event.values._claimIssuer}`;
                    break;

                default:
                    label = event.name;
            }

            return {
                txHash: event.transactionHash,
                label,
                description,
                timestamp: event.timestamp
            };
        });

        const resolvedEvents = await Promise.all(jointEvents);

        const request = await new CertificationRequest(
            selectedCertificate.certificationRequestId,
            configuration
        ).sync();

        if (request) {
            resolvedEvents.unshift({
                txHash: '',
                label: 'Requested certification',
                description: 'Device owner requested certification based on meter reads',
                timestamp: request.created
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
                    {formatDate(event.timestamp * 1000, true)}
                    {event.txHash && (
                        <>
                            {' '}
                            -{' '}
                            <a
                                href={`${environment.BLOCKCHAIN_EXPLORER_URL}/tx/${event.txHash}`}
                                className="text-muted"
                                target="_blank"
                                rel="noopener"
                            >
                                {event.txHash}
                            </a>
                        </>
                    )}
                </span>
                <br />
                {event.label}
                {event.description ? ` - ${event.description}` : ''}
                <br />
            </p>
        ));

        const { publicVolume, privateVolume, claimedVolume } = selectedCertificate.energy;

        data = [
            [
                {
                    label: 'Certificate id',
                    data: selectedCertificate.id.toString()
                },
                {
                    label: 'Claimed',
                    data: selectedCertificate.isClaimed ? 'yes' : 'no'
                },
                {
                    label: 'Creation date',
                    data: formatDate(selectedCertificate.creationTime * 1000)
                }
            ],
            [
                {
                    label: `Certified energy (${EnergyFormatter.displayUnit})`,
                    data: EnergyFormatter.format(
                        selectedCertificate.isClaimed
                            ? claimedVolume
                            : publicVolume.add(privateVolume)
                    )
                },
                {
                    label: 'Generation start',
                    data: formatDate(selectedCertificate.generationStartTime * 1000, true)
                },
                {
                    label: 'Generation end',
                    data: formatDate(selectedCertificate.generationEndTime * 1000, true)
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
                                            {row.map((col) => (
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
                        externalId={{
                            id: selectedCertificate.deviceId,
                            type: environment.ISSUER_ID
                        }}
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
