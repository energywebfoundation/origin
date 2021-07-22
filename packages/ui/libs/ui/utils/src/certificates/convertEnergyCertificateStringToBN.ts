import { BigNumber } from 'ethers';
import { toBN } from '../convert';
interface IEnergyCertificateBN {
  publicVolume: BigNumber;
  privateVolume: BigNumber;
  claimedVolume: BigNumber;
}

export interface IEnergyCertificateRaw {
  publicVolume: string;
  privateVolume: string;
  claimedVolume: string;
}

const convertEnergyCertificateStringToBN = (
  energyCertRaw: IEnergyCertificateRaw
): IEnergyCertificateBN => {
  return {
    publicVolume: toBN(energyCertRaw.publicVolume),
    privateVolume: toBN(energyCertRaw.privateVolume),
    claimedVolume: toBN(energyCertRaw.claimedVolume),
  };
};
export default convertEnergyCertificateStringToBN;
