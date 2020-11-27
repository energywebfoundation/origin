import React, { useState, useEffect } from 'react';
import { ProducingDeviceDetailView } from '../devices/ProducingDeviceDetailView';
import { useSelector } from 'react-redux';
import { utils } from 'ethers';
import { getProducingDevices } from '../../features/selectors';
import {
    getCertificates,
    getCertificatesClient,
    getCertificationRequestsClient
} from '../../features/certificates/selectors';
import { deduplicate } from '../../utils/helper';
import { formatDate } from '../../utils/time';
import { Skeleton } from '@material-ui/lab';
import { makeStyles, createStyles, useTheme } from '@material-ui/core';
import { getEnvironment, getExchangeClient } from '../../features/general/selectors';
import { EnergyFormatter, useTranslation, LightenColor } from '../../utils';
import { ProducingDevice } from '@energyweb/device-registry';
import { useOriginConfiguration } from '../../utils/configuration';

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
    const { t } = useTranslation();

    const { id } = props;

    const certificates = useSelector(getCertificates);
    const producingDevices = useSelector(getProducingDevices);
    const environment = useSelector(getEnvironment);
    const exchangeClient = useSelector(getExchangeClient);
    const certificatesClient = useSelector(getCertificatesClient);
    const certificationRequestsClient = useSelector(getCertificationRequestsClient);

    const [events, setEvents] = useState<IEnrichedEvent[]>([]);

    const useStyles = makeStyles(() =>
        createStyles({
            eventsLoader: {
                padding: '20px'
            }
        })
    );

    const originContext = useOriginConfiguration();
    const originBgColor = originContext?.styleConfig?.MAIN_BACKGROUND_COLOR;
    const originTextColor = originContext?.styleConfig?.TEXT_COLOR_DEFAULT;
    const originSimpleTextColor = originContext?.styleConfig?.SIMPLE_TEXT_COLOR;

    const bgColorDarken = LightenColor(originBgColor, -2);
    const textColorDarken = LightenColor(originTextColor, -4);

    const classes = useStyles(useTheme());

    const selectedCertificate =
        id !== null && typeof id !== 'undefined'
            ? certificates.filter((c) => c.id === id).pop()
            : null;

    async function enrichEvent() {
        const { data: allCertificateEvents } = await certificatesClient.getAllEvents(
            selectedCertificate.id
        );
        const {
            data: { address: exchangeDepositAddress }
        } = await exchangeClient.accountClient.getAccount();

        const transformAddress = (address: string) => {
            switch (utils.getAddress(address)) {
                case environment.EXCHANGE_WALLET_PUB:
                    return t('certificate.event.participants.exchange.wallet');
                case exchangeDepositAddress:
                    return t('certificate.event.participants.exchange.depositAddress');
                default:
                    return address;
            }
        };

        const jointEvents = allCertificateEvents.map(async (event: any) => {
            let label: string;
            let description: string;

            switch (event.name) {
                case 'IssuanceSingle':
                    label = t('certificate.event.name.certified');
                    description = t('certificate.event.description.certificationRequestApproved');

                    break;
                case 'TransferSingle':
                    if (event._from === '0x0000000000000000000000000000000000000000') {
                        label = t('certificate.event.name.initialOwner');
                        description = transformAddress(event._to);
                    } else {
                        label = t('certificate.event.name.changedOwnership');
                        description = t('certificate.event.description.transferred', {
                            amount: EnergyFormatter.format(event._value, true),
                            newOwner: transformAddress(event._to),
                            oldOwner: transformAddress(event._from)
                        });
                    }
                    break;
                case 'ClaimSingle':
                    label = t('certificate.event.name.claimed');
                    description = t('certificate.event.description.claimed', {
                        amount: EnergyFormatter.format(event._value, true),
                        claimer: transformAddress(event._claimIssuer)
                    });
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

        const { data: request } = await certificationRequestsClient.getByCertificate(
            selectedCertificate.id
        );

        if (request) {
            resolvedEvents.unshift({
                txHash: '',
                label: t('certificate.event.name.requested'),
                description: t('certificate.event.description.requested', {
                    requestor: transformAddress(request.owner),
                    amount: EnergyFormatter.format(request.energy, true)
                }),
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
        data: string | string[];
        link?: string;
    }>[];

    let eventsDisplay = [];
    if (selectedCertificate) {
        let producingDevice: ProducingDevice.Entity = null;

        if (selectedCertificate.deviceId) {
            producingDevice = producingDevices.find((p) =>
                p.externalDeviceIds?.find(
                    (deviceExternalId) =>
                        deviceExternalId.id === selectedCertificate.deviceId &&
                        deviceExternalId.type === environment.ISSUER_ID
                )
            );
        }

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

        data = [
            [
                {
                    label: t('certificate.properties.id'),
                    data: selectedCertificate.id.toString()
                },
                {
                    label: t('certificate.properties.claimed'),
                    data: selectedCertificate.isClaimed
                        ? selectedCertificate.isOwned
                            ? t('general.responses.partially')
                            : t('general.responses.yes')
                        : t('general.responses.no')
                },
                {
                    label: t('certificate.properties.creationDate'),
                    data: formatDate(
                        selectedCertificate.creationTime * 1000,
                        false,
                        producingDevice.timezone
                    )
                }
            ],
            [
                {
                    label: `${
                        selectedCertificate.isClaimed
                            ? t('certificate.properties.remainingEnergy')
                            : t('certificate.properties.certifiedEnergy')
                    } (${EnergyFormatter.displayUnit})`,
                    data: EnergyFormatter.format(selectedCertificate.energy.publicVolume)
                },
                {
                    label: t('certificate.properties.generationDateStart'),
                    data: formatDate(
                        selectedCertificate.generationStartTime * 1000,
                        true,
                        producingDevice.timezone
                    )
                },
                {
                    label: t('certificate.properties.generationDateEnd'),
                    data: formatDate(
                        selectedCertificate.generationEndTime * 1000,
                        true,
                        producingDevice.timezone
                    )
                }
            ]
        ];

        if (selectedCertificate.isClaimed) {
            const claims = selectedCertificate.myClaims.map((c) => c.claimData);
            const uniqueClaims = [...new Set(claims)];

            const claimInfo = [
                {
                    label: `${t('certificate.properties.claimedEnergy')} (${
                        EnergyFormatter.displayUnit
                    })`,
                    data: EnergyFormatter.format(selectedCertificate.energy.claimedVolume) || ['']
                }
            ];

            if (uniqueClaims.length > 0) {
                const fieldData = uniqueClaims.map((oneBeneficiary) =>
                    Object.values(oneBeneficiary)
                        .filter((value) => value !== '')
                        .join(', ')
                );

                claimInfo.push({
                    label: t('certificate.properties.claimBeneficiary'),
                    data: fieldData
                });
            }

            data.push(claimInfo);
        }
    }

    return (
        <div className="DetailViewWrapper">
            <div className="PageContentWrapper">
                <div className="PageBody" style={{ backgroundColor: bgColorDarken }}>
                    {selectedCertificate ? (
                        <div>
                            <table>
                                <tbody>
                                    {data.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {row.map((col) => (
                                                <td key={col.label} rowSpan={1} colSpan={1}>
                                                    <div
                                                        className="Label"
                                                        style={{ color: textColorDarken }}
                                                    >
                                                        {col.label}
                                                    </div>
                                                    <div
                                                        className="Data"
                                                        style={{ color: originSimpleTextColor }}
                                                    >
                                                        {typeof col.data === 'string' ? (
                                                            col.data
                                                        ) : (
                                                            <>
                                                                {col.data.length > 1 ? (
                                                                    <ol
                                                                        style={{
                                                                            paddingLeft: '10px'
                                                                        }}
                                                                    >
                                                                        {col.data.map(
                                                                            (text, idx) => (
                                                                                <li key={idx}>
                                                                                    {text}
                                                                                </li>
                                                                            )
                                                                        )}
                                                                    </ol>
                                                                ) : (
                                                                    col.data[0]
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center">
                            <strong>{t('certificate.feedback.certificateNotFound')}</strong>
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
                    <div className="PageBody" style={{ backgroundColor: bgColorDarken }}>
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
