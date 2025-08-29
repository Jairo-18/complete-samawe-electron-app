import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTaxeToInvoiceDetaill1756398058642 implements MigrationInterface {
    name = 'AddedTaxeToInvoiceDetaill1756398058642'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "InvoiceDetaill" ADD "taxe" numeric(10,2) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "InvoiceDetaill" DROP COLUMN "taxe"`);
    }

}
