import { TimeFrame, Configuration } from '@energyweb/utils-general';

export class Utils {
    public static async getCurrentPeriod(
        startDate: number,
        timeFrame: TimeFrame,
        config: Configuration.Entity
    ): Promise<number> {
        const { timestamp } = await config.blockchainProperties.web3.eth.getBlock('latest');
        const timeDifference = timestamp - startDate;

        switch (timeFrame) {
            case TimeFrame.yearly:
                return Math.floor(timeDifference / (365 * 24 * 60 * 60));
            case TimeFrame.monthly:
                return Math.floor(timeDifference / (30 * 24 * 60 * 60));
            case TimeFrame.daily:
                return Math.floor(timeDifference / (24 * 60 * 60));
            case TimeFrame.hourly:
                return Math.floor(timeDifference / (24 * 60 * 60));
            default:
                throw new Error(`Unknown time frame${timeFrame}`);
        }
    }
}
