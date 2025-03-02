import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { Branch } from "./Branch";
import { Product } from "./Product";

export enum MovementStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

@Entity()
export class Movement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column({ type: "enum", enum: MovementStatus, default: MovementStatus.PENDING })
  status: MovementStatus;

  @CreateDateColumn({ type: "timestamp"})
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp"})
  updated_at: Date;

  @ManyToOne(() => Branch, (branch) => branch.movements)
  destination_branch: Branch;

  @ManyToOne(() => Product, (product) => product.movements)
  product: Product;
}