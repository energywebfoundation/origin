import { ILoggedInUser } from '@energyweb/origin-backend-core';

export class CreateIrecCertificationRequestCommand {
    constructor(
        public readonly user: ILoggedInUser,
        public readonly to: string,
        public readonly energy: string,
        public readonly fromTime: number,
        public readonly toTime: number,
        public readonly deviceId: string,
        public readonly files?: string[],
        public readonly isPrivate?: boolean
    ) {}
}
