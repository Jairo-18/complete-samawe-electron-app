import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedColumnObservationsInInvoice1756225951395 implements MigrationInterface {
    name = 'AddedColumnObservationsInInvoice1756225951395'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Invoice" ADD "observations" character varying(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Invoice" DROP COLUMN "observations"`);
    }

}
