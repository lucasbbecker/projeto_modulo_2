import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, UpdateDateColumn, CreateDateColumn } from "typeorm";
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

  @CreateDateColumn({ type: "timestamp"})
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp"})
  updated_at: Date;

  @OneToOne(() => User, (user) => user.branch)
  @JoinColumn()
  user: User;

  @OneToMany(() => Product, (product) => product.branch)
  products: Product[];

  @OneToMany(() => Movement, (movement) => movement.destination_branch)
  movements: Movement[];
}