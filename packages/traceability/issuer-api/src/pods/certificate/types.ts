export type CertificateAmount = {
    id: number;
    amount: string; // Stringified BigNumber
};

export const TOTAL_AMOUNT = 'TOTAL';

export enum BlockchainEventType {
    IssuanceSingle = 'IssuanceSingle',
    IssuanceBatch = 'IssuanceBatch',
    TransferSingle = 'TransferSingle',
    TransferBatch = 'TransferBatch',
    ClaimSingle = 'ClaimSingle',
    ClaimBatch = 'ClaimBatch'
}
