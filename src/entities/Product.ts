import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { Branch } from "./Branch";
import { Movement } from "./Movement";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column()
  amount: number;

  @Column({ length: 200 })
  description: string;

  @Column({ length: 200, nullable: true })
  url_cover: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;

  @ManyToOne(() => Branch, (branch) => branch.products)
  branch: Branch;

  @OneToMany(() => Movement, (movement) => movement.product)
  movements: Movement[];
}