import {
  Entity,
  Column,
  OneToMany,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeUpdate,
  BeforeInsert,
} from "typeorm";
import * as bcrypt from "bcrypt";
import { Exclude } from "class-transformer";
import { Length, Matches, IsEmail } from "class-validator";
import { Exercise } from "./Exercise";
import { Solution } from "./Solution";
import { Like } from "./Like";

export enum UserRole {
  ExerciseAuthor = "exerciseAuthor",
  ExerciseSolver = "exerciseSolver",
  Admin = "admin",
  UserEditor = "userEditor",
  UserRoleEditor = "userRoleEditor",
  UserRemover = "userRemover",
  ExerciseEditor = "exerciseEditor",
  ExerciseRemover = "exerciseRemover",
  ExerciseLiker = "exerciseLiker",
}

export class NewUser {
  @Length(4, 12)
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]{3,12}$/)
  username: string;
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{10,}$/)
  password: string;
  @IsEmail()
  email: string;
}

export class LoginUser {
  username: string;
  password: string;
}

export interface UserClaim {
  sub: string;
  roles: UserRole[];
  jti: string;
  exp?: number;
}

@Entity()
export class User {
  static from<T extends NewUser>(user: T) {
    const u = new User();
    u.username = user.username;
    u.email = user.email;
    u.password = user.password;
    return u;
  }

  @PrimaryColumn()
  username: string;

  @Column()
  email: string;

  @Column()
  @Exclude()
  protected hashedPassword: string;

  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password !== undefined) {
      this.hashedPassword = await bcrypt.hash(this.password, 10);
      this.password = undefined;
    }
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.hashedPassword);
  }

  @Column({
    type: "set",
    enum: UserRole,
    default: [],
  })
  roles: UserRole[];

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @OneToMany((_type) => Exercise, (exercise) => exercise.author, {
    onDelete: "CASCADE",
  })
  exercises: Exercise[];

  @OneToMany((_type) => Like, (like) => like.author, {
    onDelete: "CASCADE",
  })
  likes: Like[];

  @OneToMany((_type) => Solution, (solution) => solution.author, {
    onDelete: "CASCADE",
  })
  solutions: Solution[];

  @Column()
  score: number = 0;
}
