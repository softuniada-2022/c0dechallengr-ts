import type Exercise from "./Exercise";
import type User from "./User";

export default interface Like {
  authorId: string;
  exerciseId: number;
  author?: User;
  exercise?: Exercise;
  createdAt: string;
}
