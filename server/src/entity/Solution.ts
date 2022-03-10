import { MinLength } from "class-validator";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";
import { Exercise } from "./Exercise";
import { User } from "./User";

export class NewSolution {
  @MinLength(1)
  answer: string;
}

@Entity()
export class Solution {
  static from<T extends NewSolution>(ns: T, ex: Exercise, author: User) {
    const s = new Solution();
    s.exercise = ex;
    s.author = author;
    s.answer = ns.answer;
    s.correct = ns.answer === ex.answer;
    return s;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((_type) => Exercise, (exercise) => exercise.solutions)
  @JoinColumn()
  exercise: Exercise;

  @RelationId((solution: Solution) => solution.exercise)
  exerciseId: number;

  @ManyToOne((_type) => User, (user) => user.solutions)
  @JoinColumn()
  author: User;

  @RelationId((solution: Solution) => solution.author)
  authorId: string;

  @Column()
  answer: string;

  @Column()
  correct: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
