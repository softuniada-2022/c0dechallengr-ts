import type Like from "./Like";
import type Solution from "./Solution";
import type User from "./User";

export default interface Exercise {
  id: number;
  authorId: string;
  author?: User;
  name: string;
  description: string;
  input: string;
  difficulty: number;
  createdAt: string;
  updatedAt: string;
  likes?: Like[];
  likeCount: number;
  solutions?: Solution[];
}

export interface NewExercise {
  name: string;
  description: string;
  input: string;
  answer: string;
  difficulty: number;
}
