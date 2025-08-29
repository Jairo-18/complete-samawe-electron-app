import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTaxeDefault01756398631086 implements MigrationInterface {
    name = 'AddedTaxeDefault01756398631086'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "InvoiceDetaill" ALTER COLUMN "taxe" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "InvoiceDetaill" ALTER COLUMN "taxe" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "InvoiceDetaill" ALTER COLUMN "taxe" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "InvoiceDetaill" ALTER COLUMN "taxe" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "InvoiceDetaill" ALTER COLUMN "taxe" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "InvoiceDetaill" ALTER COLUMN "taxe" TYPE numeric(10,2)`);
    }

}
