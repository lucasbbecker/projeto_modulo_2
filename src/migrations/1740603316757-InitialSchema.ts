import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1740603316757 implements MigrationInterface {
    name = 'InitialSchema1740603316757'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "driver" ("id" SERIAL NOT NULL, "full_address" character varying(255), "document" character varying(30) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_abf4fe92b1ed7d4ffa2d4e8045" UNIQUE ("userId"), CONSTRAINT "PK_61de71a8d217d585ecd5ee3d065" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "movement" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "status" "public"."movement_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "destinationBranchId" integer, "productId" integer, CONSTRAINT "PK_079f005d01ebda984e75c2d67ee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product" ("id" SERIAL NOT NULL, "name" character varying(200) NOT NULL, "amount" integer NOT NULL, "description" character varying(200) NOT NULL, "url_cover" character varying(200), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "branchId" integer, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "branch" ("id" SERIAL NOT NULL, "full_address" character varying(255), "document" character varying(30) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_f969fd357b4491268a4520e8a0" UNIQUE ("userId"), CONSTRAINT "PK_2e39f426e2faefdaa93c5961976" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying(200) NOT NULL, "profile" "public"."user_profile_enum" NOT NULL DEFAULT 'DRIVER', "email" character varying(150) NOT NULL, "password_hash" character varying(150) NOT NULL, "status" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "driver" ADD CONSTRAINT "FK_abf4fe92b1ed7d4ffa2d4e8045a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movement" ADD CONSTRAINT "FK_5cf256147530913cbb6ca967abf" FOREIGN KEY ("destinationBranchId") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movement" ADD CONSTRAINT "FK_e2f7dc9076f2b72c075c97154ce" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_79a52c9b7de68257eda80c10215" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "branch" ADD CONSTRAINT "FK_f969fd357b4491268a4520e8a07" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "branch" DROP CONSTRAINT "FK_f969fd357b4491268a4520e8a07"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_79a52c9b7de68257eda80c10215"`);
        await queryRunner.query(`ALTER TABLE "movement" DROP CONSTRAINT "FK_e2f7dc9076f2b72c075c97154ce"`);
        await queryRunner.query(`ALTER TABLE "movement" DROP CONSTRAINT "FK_5cf256147530913cbb6ca967abf"`);
        await queryRunner.query(`ALTER TABLE "driver" DROP CONSTRAINT "FK_abf4fe92b1ed7d4ffa2d4e8045a"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "branch"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "movement"`);
        await queryRunner.query(`DROP TABLE "driver"`);
    }

}
