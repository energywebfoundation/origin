import React, { useState, useEffect } from 'react';
import { CertificationRequest, CertificateUtils } from '@energyweb/issuer';
import { ProducingDeviceDetailView } from '../devices/ProducingDeviceDetailView';
import { useSelector } from 'react-redux';
import { utils } from 'ethers';
import { getConfiguration, getProducingDevices } from '../../features/selectors';
import { getCertificates } from '../../features/certificates/selectors';
import { deduplicate } from '../../utils/helper';
import { formatDate } from '../../utils/time';
import { Skeleton } from '@material-ui/lab';
import { makeStyles, createStyles, useTheme } from '@material-ui/core';
import { getEnvironment, getExchangeClient } from '../../features/general/selectors';
import { EnergyFormatter, useTranslation } from '../../utils';
import { ProducingDevice } from '@energyweb/device-registry';
import { getUserOffchain } from '../../features/users/selectors';

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

    const user = useSelector(getUserOffchain);
    const certificates = useSelector(getCertificates);
    const producingDevices = useSelector(getProducingDevices);
    const configuration = useSelector(getConfiguration);
    const environment = useSelector(getEnvironment);
    const exchangeClient = useSelector(getExchangeClient);

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
            configuration
        );

        const { address: exchangeDepositAddress } = await exchangeClient.getAccount();
        const { issuer, registry } = configuration.blockchainProperties;

        const transformAddress = (address: string) => {
            switch (utils.getAddress(address)) {
                case environment.EXCHANGE_WALLET_PUB:
                    return t('certificate.event.participants.exchange.wallet');
                case exchangeDepositAddress:
                    return t('certificate.event.participants.exchange.depositAddress');
                case issuer.address:
                    return t('certificate.event.participants.issuerContract');
                case registry.address:
                    return t('certificate.event.participants.registryContract');
                default:
                    return address;
            }
        };

        const jointEvents = allCertificateEvents.map(async (event) => {
            let label: string;
            let description: string;

            switch (event.name) {
                case 'IssuanceSingle':
                    label = t('certificate.event.name.certified');
                    description = t('certificate.event.description.certificationRequestApproved');

                    break;
                case 'TransferSingle':
                    if (event.values._from === '0x0000000000000000000000000000000000000000') {
                        label = t('certificate.event.name.initialOwner');
                        description = transformAddress(event.values._to);
                    } else {
                        label = t('certificate.event.name.changedOwnership');
                        description = t('certificate.event.description.transferred', {
                            amount: EnergyFormatter.format(event.values._value, true),
                            newOwner: transformAddress(event.values._to),
                            oldOwner: transformAddress(event.values._from)
                        });
                    }
                    break;
                case 'ClaimSingle':
                    label = t('certificate.event.name.claimed');
                    description = t('certificate.event.description.claimed', {
                        amount: EnergyFormatter.format(event.values._value, true),
                        claimer: transformAddress(event.values._claimIssuer)
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

        const request = await CertificationRequest.fetch(
            selectedCertificate.certificationRequestId,
            configuration
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
        data: string;
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

        const { publicVolume, privateVolume, claimedVolume } = selectedCertificate.energy;

        data = [
            [
                {
                    label: t('certificate.properties.id'),
                    data: selectedCertificate.id.toString()
                },
                {
                    label: t('certificate.properties.claimed'),
                    data: selectedCertificate.isClaimed
                        ? publicVolume.add(privateVolume).gt(0)
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
                    data: EnergyFormatter.format(publicVolume.add(privateVolume))
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
            const claimData = selectedCertificate.claims.find(
                (claim) =>
                    utils.getAddress(claim.to) === utils.getAddress(user.blockchainAccountAddress)
            )?.claimData;

            const claimInfo = [
                {
                    label: `${t('certificate.properties.claimedEnergy')} (${
                        EnergyFormatter.displayUnit
                    })`,
                    data: EnergyFormatter.format(claimedVolume)
                }
            ];

            if (claimData) {
                claimInfo.push({
                    label: t('certificate.properties.claimBeneficiary'),
                    data: Object.values(claimData)
                        .filter((value) => value !== '')
                        .join(', ')
                });
            }

            data.push(claimInfo);
        }
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
