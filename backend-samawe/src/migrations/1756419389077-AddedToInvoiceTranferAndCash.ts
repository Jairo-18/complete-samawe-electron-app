import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedToInvoiceTranferAndCash1756419389077 implements MigrationInterface {
    name = 'AddedToInvoiceTranferAndCash1756419389077'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Invoice" ADD "transfer" numeric(10,2) DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "Invoice" ADD "cash" numeric(10,2) DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Invoice" DROP COLUMN "cash"`);
        await queryRunner.query(`ALTER TABLE "Invoice" DROP COLUMN "transfer"`);
    }

}
