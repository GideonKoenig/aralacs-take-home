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
    accountIban!: string;

    @Column({ type: "varchar", length: 34 })
    counterpartyIban!: string;

    @Column({ type: "int" })
    amount!: number;

    @Column({ type: "enum", enum: ["debit", "credit"] })
    direction!: "debit" | "credit";

    @CreateDateColumn({ type: "timestamptz" })
    loadedAt!: Date;
}
