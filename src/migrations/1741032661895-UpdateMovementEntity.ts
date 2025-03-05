import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMovementEntity1741032661895 implements MigrationInterface {
    name = 'UpdateMovementEntity1741032661895'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movement" DROP CONSTRAINT "FK_5cf256147530913cbb6ca967abf"`);
        await queryRunner.query(`ALTER TABLE "movement" DROP CONSTRAINT "FK_e2f7dc9076f2b72c075c97154ce"`);
        await queryRunner.query(`ALTER TABLE "movement" DROP COLUMN "destinationBranchId"`);
        await queryRunner.query(`ALTER TABLE "movement" DROP COLUMN "productId"`);
        await queryRunner.query(`ALTER TABLE "movement" ADD "source_branch_id" integer`);
        await queryRunner.query(`ALTER TABLE "movement" ADD "destination_branch_id" integer`);
        await queryRunner.query(`ALTER TABLE "movement" ADD "product_id" integer`);
        await queryRunner.query(`ALTER TABLE "movement" ADD CONSTRAINT "FK_ec925c00da20dc45e6dde9f9fea" FOREIGN KEY ("source_branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movement" ADD CONSTRAINT "FK_1a5b0255292737c0679c83f45c8" FOREIGN KEY ("destination_branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movement" ADD CONSTRAINT "FK_04fb7658224d6ceadd8e400283e" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movement" DROP CONSTRAINT "FK_04fb7658224d6ceadd8e400283e"`);
        await queryRunner.query(`ALTER TABLE "movement" DROP CONSTRAINT "FK_1a5b0255292737c0679c83f45c8"`);
        await queryRunner.query(`ALTER TABLE "movement" DROP CONSTRAINT "FK_ec925c00da20dc45e6dde9f9fea"`);
        await queryRunner.query(`ALTER TABLE "movement" DROP COLUMN "product_id"`);
        await queryRunner.query(`ALTER TABLE "movement" DROP COLUMN "destination_branch_id"`);
        await queryRunner.query(`ALTER TABLE "movement" DROP COLUMN "source_branch_id"`);
        await queryRunner.query(`ALTER TABLE "movement" ADD "productId" integer`);
        await queryRunner.query(`ALTER TABLE "movement" ADD "destinationBranchId" integer`);
        await queryRunner.query(`ALTER TABLE "movement" ADD CONSTRAINT "FK_e2f7dc9076f2b72c075c97154ce" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movement" ADD CONSTRAINT "FK_5cf256147530913cbb6ca967abf" FOREIGN KEY ("destinationBranchId") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
