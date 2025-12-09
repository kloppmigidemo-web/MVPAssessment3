export interface UserDetails {
  name: string;
  email: string;
  phone: string;
}

export enum QuestionCategory {
  LEADERSHIP = 'Leadership-Oriented',
  TEAM_BUILDING = 'Team-Building-Oriented',
}

export interface Question {
  id: number;
  text: string;
  category: QuestionCategory;
}

export interface AssessmentState {
  answers: Record<number, boolean>; // Question ID -> Yes(true)/No(false)
  currentStep: number; // 0: Form, 1..8: Questions, 9: Result
}

export type AssessmentResultType = 
  | "Leadership Training"
  | "Team-Building Training"
  | "Both Leadership and Team-Building Training";

export interface SubmitResponse {
  success: boolean;
  message: string;
}
