import { IClaim, IOwnershipCommitmentProof } from '@energyweb/issuer';
import { ApiProperty } from '@nestjs/swagger';

export interface IEnergy {
    publicVolume: string;
    privateVolume: string;
    claimedVolume: string;
}

export class ICertificateDTO {
    @ApiProperty()
    id: number;

    @ApiProperty()
    tokenId: number;

    @ApiProperty()
    deviceId: string;

    @ApiProperty()
    generationStartTime: number;

    @ApiProperty()
    generationEndTime: number;

    @ApiProperty()
    creationTime: number;

    @ApiProperty()
    creationBlockHash: string;

    @ApiProperty()
    energy: IEnergy;

    @ApiProperty()
    isOwned: boolean;

    @ApiProperty()
    isClaimed: boolean;

    @ApiProperty()
    myClaims?: IClaim[];

    @ApiProperty()
    blockchain?: any;

    @ApiProperty()
    latestCommitment?: IOwnershipCommitmentProof;

    @ApiProperty()
    issuedPrivately?: boolean;
}
