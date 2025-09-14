import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "process_execution_logs" })
export class ProcessExecutionLogEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @CreateDateColumn({ type: "timestamptz" })
    executedAt!: Date;

    @Column({ type: "int" })
    processedCount!: number;

    @Column({ type: "timestamptz", nullable: true })
    startLoadedAt!: Date | null;

    @Column({ type: "timestamptz", nullable: true })
    endLoadedAt!: Date | null;
}
