import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Branch } from "./Branch";
import { Product } from "./Product";
import { Driver } from "./Driver";

export enum MovementStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

@Entity()
export class Movement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  quantity: number;

  @Column({ 
    type: "enum", 
    enum: MovementStatus, 
    default: MovementStatus.PENDING 
  })
  status: MovementStatus;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @ManyToOne(() => Branch, (branch) => branch.movementsFrom)
  @JoinColumn({ name: "source_branch_id" })
  sourceBranch: Branch;
  
  @ManyToOne(() => Branch, (branch) => branch.movementsTo)
  @JoinColumn({ name: "destination_branch_id" })
  destinationBranch: Branch;

  @ManyToOne(() => Product, (product) => product.movements)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @ManyToOne(() => Driver, { nullable: true })
  @JoinColumn({ name: "driver_id" })
  driver: Driver | null;
}