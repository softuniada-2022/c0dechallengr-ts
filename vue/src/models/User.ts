import type Exercise from "./Exercise";
import type Like from "./Like";
import type Solution from "./Solution";

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

export interface NewUser {
  username: string;
  password: string;
  email: string;
}

export interface LoginUser {
  username: string;
  password: string;
}

export interface UserClaim {
  sub: string;
  roles: UserRole[];
  jti: string;
  exp?: number;
}

export default interface User {
  username: string;
  email: string;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
  exercises?: Exercise[];
  likes?: Like[];
  solutions?: Solution[];
  score: number;
}
