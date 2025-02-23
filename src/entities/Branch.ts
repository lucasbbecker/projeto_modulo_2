import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./User";
import { Product } from "./Product";
import { Movement } from "./Movement";

@Entity()
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: true })
  full_address: string;

  @Column({ length: 30 })
  document: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;

  @OneToOne(() => User, (user) => user.branch)
  @JoinColumn()
  user: User;

  @OneToMany(() => Product, (product) => product.branch)
  products: Product[];

  @OneToMany(() => Movement, (movement) => movement.destination_branch)
  movements: Movement[];
}