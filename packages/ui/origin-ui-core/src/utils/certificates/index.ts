import { BigNumber } from 'ethers';
import { IEnergy } from '../../features/certificates/types';

interface IEnergyString {
    publicVolume: string;
    privateVolume: string;
    claimedVolume: string;
}

export const certificateEnergyStringToBN = (energy: IEnergyString | IEnergy): IEnergy => {
    return {
        publicVolume: BigNumber.from(energy?.publicVolume ?? 0),
        privateVolume: BigNumber.from(energy?.privateVolume ?? 0),
        claimedVolume: BigNumber.from(energy?.claimedVolume ?? 0)
    };
};
