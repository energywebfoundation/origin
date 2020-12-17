import { OrderSide, OrderStatus } from '@energyweb/exchange-core';
import { MigrationInterface, QueryRunner } from 'typeorm';

const getNewOrderStatus = (oldStatus: number): OrderStatus => {
    switch (oldStatus) {
        case 0:
            return OrderStatus.Active;
        case 1:
            return OrderStatus.Cancelled;
        case 2:
            return OrderStatus.Filled;
        case 3:
            return OrderStatus.NotExecuted;
        case 4:
            return OrderStatus.PartiallyFilled;
        case 5:
            return OrderStatus.PendingCancellation;
        default:
            return OrderStatus.Active;
    }
};

const getNewOrderSide = (oldSide: number): OrderSide => {
    switch (oldSide) {
        case 0:
            return OrderSide.Ask;
        case 1:
            return OrderSide.Bid;
        default:
            return OrderSide.Bid;
    }
};

export class OrderSide1608202021963 implements MigrationInterface {
    name = 'OrderSide1608202021963';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const oldOrders = await queryRunner.query(`SELECT id, status, side FROM "exchange_order"`);

        await queryRunner.query(`ALTER TABLE "exchange_order" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "exchange_order" ADD "status" character varying`);
        await queryRunner.query(`ALTER TABLE "exchange_order" DROP COLUMN "side"`);
        await queryRunner.query(`ALTER TABLE "exchange_order" ADD "side" character varying`);

        oldOrders.forEach(async (oldOrder: any) => {
            await queryRunner.query(
                `UPDATE "exchange_order" SET status = '${getNewOrderStatus(
                    parseInt(oldOrder.status, 10)
                )}', side = '${getNewOrderSide(parseInt(oldOrder.side, 10))}' WHERE id = '${
                    oldOrder.id
                }'`
            );
        });

        await queryRunner.query(`ALTER TABLE "exchange_order" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "exchange_order" ALTER COLUMN "side" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const oldOrders = await queryRunner.query(`SELECT id, status FROM "exchange_order"`);

        await queryRunner.query(`ALTER TABLE "exchange_order" DROP COLUMN "side"`);
        await queryRunner.query(`ALTER TABLE "exchange_order" ADD "side" integer`);
        await queryRunner.query(`ALTER TABLE "exchange_order" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "exchange_order" ADD "status" integer`);

        oldOrders.forEach(async (oldOrder: any) => {
            await queryRunner.query(
                `UPDATE "exchange_order" SET status = ${Object.keys(OrderStatus).indexOf(
                    oldOrder.status
                )}, side = ${Object.keys(OrderSide).indexOf(oldOrder.side)} WHERE id = '${
                    oldOrder.id
                }'`
            );
        });

        await queryRunner.query(`ALTER TABLE "exchange_order" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "exchange_order" ALTER COLUMN "side" SET NOT NULL`);
    }
}
