import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDriverToMovement1741115993421 implements MigrationInterface {
    name = 'AddDriverToMovement1741115993421'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movement" ADD "driver_id" integer`);
        await queryRunner.query(`ALTER TABLE "movement" ADD CONSTRAINT "FK_1d276a1c63b68ae3a7e5f289481" FOREIGN KEY ("driver_id") REFERENCES "driver"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movement" DROP CONSTRAINT "FK_1d276a1c63b68ae3a7e5f289481"`);
        await queryRunner.query(`ALTER TABLE "movement" DROP COLUMN "driver_id"`);
    }

}
