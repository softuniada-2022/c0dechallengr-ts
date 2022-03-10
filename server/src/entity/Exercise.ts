import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  RelationId,
} from "typeorm";
import { Solution } from "./Solution";
import { User } from "./User";
import { Like } from "./Like";
import { Exclude } from "class-transformer";
import { Length, MinLength, IsInt, Min, Max } from "class-validator";

export class NewExercise {
  @Length(4, 20)
  name: string;
  @MinLength(10)
  description: string;
  @MinLength(1)
  input: string;
  @MinLength(1)
  answer: string;
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty: number;
}

@Entity()
export class Exercise {
  static from<T extends NewExercise>(exercise: T) {
    const e = new Exercise();
    e.name = exercise.name;
    e.description = exercise.description;
    e.input = exercise.input;
    e.answer = exercise.answer;
    e.difficulty = exercise.difficulty;
    return e;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((_type) => User, (user) => user.exercises)
  @JoinColumn()
  author: User;

  @RelationId((exercise: Exercise) => exercise.author)
  authorId: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  input: string;

  @Exclude()
  @Column()
  answer: string;

  @Column()
  difficulty: number = 0;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @OneToMany((_type) => Like, (like) => like.exercise, {
    onDelete: "CASCADE",
  })
  likes: Like[];

  @Column()
  likeCount: number = 0;

  @OneToMany((_type) => Solution, (solution) => solution.exercise, {
    onDelete: "CASCADE",
  })
  solutions: Solution[];
}
