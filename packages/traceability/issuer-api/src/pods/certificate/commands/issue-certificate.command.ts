export class IssueCertificateCommand {
    constructor(
        public readonly to: string,
        public readonly energy: string,
        public readonly fromTime: number,
        public readonly toTime: number,
        public readonly deviceId: string,
        public readonly userId: string,
        public readonly isPrivate = false,
        public readonly metadata = ''
    ) {}
}
