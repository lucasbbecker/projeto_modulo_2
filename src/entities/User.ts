import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
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

  @Column({ type: "enum", enum: UserProfile, default: UserProfile.DRIVER })
  profile: UserProfile;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 200 })
  password: string;

  @Column({ default: true })
  status: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;

  @OneToOne(() => Driver, (driver) => driver.user)
  driver: Driver;

  @OneToOne(() => Branch, (branch) => branch.user)
  branch: Branch;
}