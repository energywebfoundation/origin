import { BigNumber, utils } from 'ethers';
import { ICertificateDTO } from '../certificate.dto';
import { Certificate } from '../certificate.entity';

export const certificateToDto = async (
    certificate: Certificate,
    userId: string
): Promise<ICertificateDTO> => {
    const userAddress = utils.getAddress(userId);

    const publicVolume = BigNumber.from(
        certificate.issuedPrivately ? 0 : certificate.owners[userAddress] ?? 0
    );
    const privateVolume = BigNumber.from(
        certificate.issuedPrivately ? certificate.owners[userAddress] ?? 0 : 0
    );
    const claimedVolume = BigNumber.from(
        certificate.claimers ? certificate.claimers[userAddress] ?? 0 : 0
    );

    return {
        id: certificate.id,
        tokenId: certificate.tokenId,
        deviceId: certificate.deviceId,
        generationStartTime: certificate.generationStartTime,
        generationEndTime: certificate.generationEndTime,
        creationTime: certificate.creationTime,
        creationBlockHash: certificate.creationBlockHash,
        energy: {
            publicVolume: publicVolume.toString(),
            privateVolume: privateVolume.toString(),
            claimedVolume: claimedVolume.toString()
        },
        isClaimed: claimedVolume.gt(0),
        isOwned: publicVolume.add(privateVolume).gt(0),
        myClaims:
            certificate.claims?.filter((claim) => utils.getAddress(claim.to) === userAddress) ?? [],
        latestCommitment: certificate.latestCommitment,
        issuedPrivately: certificate.issuedPrivately
    };
};
