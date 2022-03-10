import type Exercise from "./Exercise";
import type User from "./User";

export interface NewSolution {
  answer: string;
}

export default interface Solution {
  id: number;
  exerciseId: number;
  exercise?: Exercise;
  authorId: string;
  author?: User;
  answer: string;
  correct: boolean;
  createdAt: string;
}
