import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from "typeorm";

@Entity({ name: "transactions" })
export class TransactionEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Index()
    @Column({ type: "varchar", length: 34 })
    fromIban!: string;

    @Column({ type: "varchar", length: 34 })
    toIban!: string;

    @Column({ type: "int" })
    amount!: number;

    @Column({ type: "boolean" })
    isPositive!: boolean;

    @CreateDateColumn({ type: "timestamptz" })
    loadedAt!: Date;
}
