import { Entity, Column, PrimaryGeneratedColumn, OneToOne, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { Driver } from "./Driver";
import { Branch } from "./Branch";

export enum UserProfile {
  DRIVER = "DRIVER",
  BRANCH = "BRANCH",
  ADMIN = "ADMIN",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: "enum", enum: UserProfile, default: UserProfile.DRIVER, nullable: false })
  profile: UserProfile;

  @Column({ length: 150, unique: true })
  email: string;

  @Column({ length: 150 })
  password_hash: string;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn({ type: "timestamp"})
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp"})
  updated_at: Date;

  @OneToOne(() => Driver, (driver) => driver.user)
  driver: Driver;

  @OneToOne(() => Branch, (branch) => branch.user)
  branch: Branch;
}