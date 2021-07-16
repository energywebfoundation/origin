import { MigrationInterface, QueryRunner } from 'typeorm';

import { TransferStatus } from '../src/pods/transfer/transfer-status';
import { TransferDirection } from '../src/pods/transfer/transfer-direction';

const getNewTransferDirection = (oldDirection: number): TransferDirection => {
    switch (oldDirection) {
        case 0:
            return TransferDirection.Deposit;
        case 1:
            return TransferDirection.Withdrawal;
        case 2:
            return TransferDirection.Claim;
        case 3:
            return TransferDirection.Send;
    }
};

const getNewTransferStatus = (oldStatus: number): TransferStatus => {
    switch (oldStatus) {
        case 0:
            return TransferStatus.Unknown;
        case 1:
            return TransferStatus.Accepted;
        case 2:
            return TransferStatus.Unconfirmed;
        case 3:
            return TransferStatus.Confirmed;
        case 4:
            return TransferStatus.Error;
        default:
            return TransferStatus.Unknown;
    }
};

export class DirectionAndStatusStrings1625819983722 implements MigrationInterface {
    name = 'DirectionAndStatusStrings1625819983722';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const oldTransfers = await queryRunner.query(
            `SELECT id, status, direction FROM "exchange_transfer"`
        );

        await queryRunner.query(`ALTER TABLE "exchange_transfer" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "exchange_transfer" DROP COLUMN "direction"`);
        await queryRunner.query(`ALTER TABLE "exchange_transfer" ADD "status" character varying`);
        await queryRunner.query(
            `ALTER TABLE "exchange_transfer" ADD "direction" character varying`
        );

        await Promise.all(
            oldTransfers.map((oldTransfer: any) =>
                queryRunner.query(
                    `UPDATE "exchange_transfer" SET status = '${getNewTransferStatus(
                        parseInt(oldTransfer.status, 10)
                    )}', direction = '${getNewTransferDirection(
                        parseInt(oldTransfer.direction, 10)
                    )}' WHERE id = '${oldTransfer.id}'`
                )
            )
        );

        await queryRunner.query(
            `ALTER TABLE "exchange_transfer" ALTER COLUMN "status" SET NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_transfer" ALTER COLUMN "direction" SET NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const oldTransfers = await queryRunner.query(
            `SELECT id, status, direction FROM "exchange_transfer"`
        );

        await queryRunner.query(`ALTER TABLE "exchange_transfer" DROP COLUMN "direction"`);
        await queryRunner.query(`ALTER TABLE "exchange_transfer" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "exchange_transfer" ADD "direction" integer`);
        await queryRunner.query(`ALTER TABLE "exchange_transfer" ADD "status" integer`);

        await Promise.all(
            oldTransfers.map((oldTransfer: any) =>
                queryRunner.query(
                    `UPDATE "exchange_transfer" SET status = ${Object.keys(TransferStatus).indexOf(
                        oldTransfers.status
                    )}, direction = ${Object.keys(TransferDirection).indexOf(
                        oldTransfer.direction
                    )} WHERE id = '${oldTransfer.id}'`
                )
            )
        );

        await queryRunner.query(
            `ALTER TABLE "exchange_transfer" ALTER COLUMN "direction" SET NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_transfer" ALTER COLUMN "status" SET NOT NULL`
        );
    }
}
