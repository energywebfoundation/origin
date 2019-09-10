import { ConsumingAsset, ProducingAsset } from '@energyweb/asset-registry';
import { Agreement, Demand, Supply } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Configuration, TimeFrame } from '@energyweb/utils-general';
import * as Jsonschema from 'jsonschema';
import * as LogSymbols from 'log-symbols';

import { logger } from '../Logger';
import { StrategyBasedMatcher } from '../matcher/StrategyBasedMatcher';

export abstract class Controller {
    public static validateJson(input: any, schema: any, description: string) {
        const validationResult = Jsonschema.validate(input, schema);
        if (validationResult.valid) {
            logger.verbose(`${description} file is valid ${LogSymbols.success}`);
        } else {
            const error = new Error();
            const errorAt = validationResult.errors
                .map(
                    (validationError: Jsonschema.ValidationError, index: number) =>
                        `\n${index}. error at ${JSON.stringify(validationError.instance)}`
                )
                .reduce((previous: string, current: string) => (previous += current));
            error.message = `${description} file is invalid ${LogSymbols.error} ${errorAt}`;
            throw error;
        }
    }

    public conf: Configuration.Entity;
    public matcherAddress: string;

    protected agreements: Agreement.Entity[];
    protected demands: Demand.Entity[];
    protected supplies: Supply.Entity[];
    protected producingAssets: ProducingAsset.Entity[];
    protected matcher: StrategyBasedMatcher;

    public setMatcher(matcher: StrategyBasedMatcher) {
        this.matcher = matcher;
    }

    public async matchTrigger(certificate: Certificate.Entity) {
        await this.matcher.match(certificate, this.agreements, this.demands);
    }

    public abstract async matchAgreement(
        certificate: Certificate.Entity,
        agreement: Agreement.Entity
    ): Promise<void>;

    public abstract async matchDemand(
        certificate: Certificate.Entity,
        demand: Demand.Entity
    ): Promise<void>;

    public abstract async getCurrentDataSourceTime(): Promise<number>;

    public abstract start(): void;

    public abstract async handleUnmatchedCertificate(
        certificate: Certificate.Entity
    ): Promise<void>;

    public abstract async registerProducingAsset(newAsset: ProducingAsset.Entity): Promise<void>;

    public abstract async registerConsumingAsset(newAsset: ConsumingAsset.Entity): Promise<void>;

    public abstract async registerAgreement(agreement: Agreement.Entity): Promise<void>;

    public abstract async registerDemand(demand: Demand.Entity): Promise<void>;

    public abstract async registerSupply(supply: Supply.Entity): Promise<void>;

    public abstract async removeProducingAsset(assetId: string): Promise<void>;

    public abstract async removeConsumingAsset(assetId: string): Promise<void>;

    public abstract async removeAgreement(agreementId: string): Promise<void>;

    public abstract getProducingAsset(assetId: string): ProducingAsset.Entity;

    public abstract getConsumingAsset(assetId: string): ConsumingAsset.Entity;

    public abstract async createOrRefreshConsumingAsset(assetId: string): Promise<void>;

    public abstract async splitCertificate(
        certificate: Certificate.Entity,
        whForFirstChils: number
    ): Promise<void>;

    public abstract async getCurrentPeriod(
        startDate: number,
        timeFrame: TimeFrame
    ): Promise<number>;

    public abstract getAgreement(agreementId: string): Agreement.Entity;

    public abstract getDemand(demandId: string): Demand.Entity;

    public abstract getSupply(supplyId: string): Supply.Entity;
}
