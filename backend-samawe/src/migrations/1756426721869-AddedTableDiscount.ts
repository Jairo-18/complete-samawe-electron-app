import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTableDiscount1756426721869 implements MigrationInterface {
    name = 'AddedTableDiscount1756426721869'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "AdditionalType" RENAME COLUMN "name" TO "value"`);
        await queryRunner.query(`CREATE TABLE "DiscountType" ("discountTypeId" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "code" character varying(255) NOT NULL, "percent" numeric(5,2) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_265960d5d063f383cb5ac0103a9" PRIMARY KEY ("discountTypeId"))`);
        await queryRunner.query(`ALTER TABLE "AdditionalType" DROP COLUMN "value"`);
        await queryRunner.query(`ALTER TABLE "AdditionalType" ADD "value" numeric(10,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "AdditionalType" DROP COLUMN "value"`);
        await queryRunner.query(`ALTER TABLE "AdditionalType" ADD "value" character varying(255)`);
        await queryRunner.query(`DROP TABLE "DiscountType"`);
        await queryRunner.query(`ALTER TABLE "AdditionalType" RENAME COLUMN "value" TO "name"`);
    }

}
