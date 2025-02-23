import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  document: string;

  @Column({ length: 255, nullable: true })
  full_address: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;

  @OneToOne(() => User, (user) => user.driver)
  @JoinColumn()
  user: User;
}