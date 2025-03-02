import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { Branch } from "./Branch";
import { Movement } from "./Movement";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ nullable: false })
  amount: number;

  @Column({ length: 200 })
  description: string;

  @Column({ length: 200, nullable: true })
  url_cover: string;

  @CreateDateColumn({ type: "timestamp"})
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp"})
  updated_at: Date;

  @ManyToOne(() => Branch, (branch) => branch.products)
  branch: Branch;

  @OneToMany(() => Movement, (movement) => movement.product)
  movements: Movement[];
}