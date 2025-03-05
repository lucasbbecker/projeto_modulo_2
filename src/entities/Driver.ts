import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: true })
  full_address: string;

  @Column({ length: 30 })
  document: string;

  @CreateDateColumn({ type: "timestamp"})
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp"})
  updated_at: Date;

  @OneToOne(() => User, (user) => user.driver)
  @JoinColumn()
  user: User;
}