import { BigNumber } from 'ethers';
import convertEnergyCertificateStringToBN, {
  IEnergyCertificateRaw,
} from './convertEnergyCertificateStringToBN';

describe('convertEnergyCertificateStringToBN', function () {
  const certificateRaw: IEnergyCertificateRaw = {
    claimedVolume: '200',
    privateVolume: '100',
    publicVolume: '100',
  };

  it('should create energy certificate BigNumber object values', function () {
    const result = convertEnergyCertificateStringToBN(certificateRaw);
    expect(result.claimedVolume).toBeInstanceOf(BigNumber);
    expect(result.publicVolume).toBeInstanceOf(BigNumber);
    expect(result.privateVolume).toBeInstanceOf(BigNumber);
  });
});
