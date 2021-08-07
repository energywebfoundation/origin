import { DetailedCertificate } from '@energyweb/origin-ui-certificate-data';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import dayjs from 'dayjs';
import { BigNumber, utils } from 'ethers';
import { useTranslation } from 'react-i18next';
import { uniqBy } from 'lodash';

export const useCertificateBlockchainEventsLogic = (
  certificate: DetailedCertificate,
  exchangeAddress: string
) => {
  const { t } = useTranslation();

  const transformAddress = (address: string) => {
    if (address) {
      switch (utils.getAddress(address)) {
        case process.env.NX_EXCHANGE_WALLET_PUB:
          return t('certificate.detailView.events.exchangeWallet');
        case exchangeAddress:
          return t('certificate.detailView.events.exchangeDepositAddress');
        case '0x0000000000000000000000000000000000000000':
          return t('certificate.detailView.events.initialOwner');
        default:
          return address;
      }
    }
    return '';
  };

  // this any type is used here because CertificatEvent type does not contain all values
  // it actually returns. Same property names has different typing for different events (e.g. value / _value)
  const jointEvents =
    certificate.events?.length > 0
      ? certificate.events?.map((event: any) => {
          let label: string;
          let description: string;

          switch (event.name) {
            case 'IssuanceSingle':
              label = t('certificate.detailView.events.certified');
              description = t(
                'certificate.detailView.events.certificationRequestApproved'
              );

              break;
            case 'TransferSingle':
              if (event.from === '0x0000000000000000000000000000000000000000') {
                label = t('certificate.detailView.events.initialOwner');
                description = t(
                  'certificate.detailView.events.transferedToInitialOwner',
                  {
                    amount: PowerFormatter.format(
                      BigNumber.from(event.value).toNumber(),
                      true
                    ),
                    address: transformAddress(event.to),
                  }
                );
              } else if (
                event.to === '0x0000000000000000000000000000000000000000'
              ) {
                label = '';
                description = '';
              } else {
                label = t('certificate.detailView.events.changedOwnership');
                description = t('certificate.detailView.events.transferred', {
                  amount: PowerFormatter.format(
                    BigNumber.from(event.value).toNumber(),
                    true
                  ),
                  newOwner: transformAddress(event.to),
                  oldOwner: transformAddress(event.from),
                });
              }
              break;
            case 'ClaimSingle':
              label = t('certificate.detailView.events.claimedTitle');
              description = t('certificate.detailView.events.claimedContent', {
                amount: PowerFormatter.format(
                  BigNumber.from(event._value).toNumber(),
                  true
                ),
                claimer: transformAddress(event._claimIssuer),
              });
              break;

            default:
              label = event.name;
          }

          return {
            txHash: event.transactionHash,
            label,
            description,
            timestamp: event.timestamp * 1000,
          };
        })
      : [];

  jointEvents?.unshift({
    txHash: '',
    label: t('certificate.detailView.events.requestedTitle'),
    description: t('certificate.detailView.events.requestedContent', {
      requestor: transformAddress(certificate.requestPart.owner),
      amount: PowerFormatter.format(
        parseInt(certificate.requestPart.energy),
        true
      ),
    }),
    timestamp: dayjs((certificate.requestPart as any).createdAt).unix() * 1000,
  });

  const filteredEvents = jointEvents?.filter(
    (event) => !!event.label || !!event.description
  );

  const sortedEvents = uniqBy(filteredEvents, 'txHash')
    .sort((a, b) => a.timestamp - b.timestamp)
    .reverse();

  return sortedEvents;
};
