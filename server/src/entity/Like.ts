import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Exercise } from "./Exercise";
import { User } from "./User";

@Entity()
export class Like {
  @PrimaryColumn()
  authorId: string;

  @PrimaryColumn()
  exerciseId: number;

  @ManyToOne((_type) => User, (user) => user.likes)
  @JoinColumn({ name: "authorId" })
  author: User;

  @ManyToOne((_type) => Exercise, (exercise) => exercise.likes)
  @JoinColumn({ name: "exerciseId" })
  exercise: Exercise;

  @CreateDateColumn()
  readonly createdAt: Date;
}
