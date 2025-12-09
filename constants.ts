import { Question, QuestionCategory } from './types';

export const QUESTIONS: Question[] = [
  // Leadership-Oriented
  {
    id: 1,
    text: "Do you struggle to set clear goals and expectations for your team?",
    category: QuestionCategory.LEADERSHIP,
  },
  {
    id: 2,
    text: "Do you find it difficult to adapt your leadership style to different personalities or situations?",
    category: QuestionCategory.LEADERSHIP,
  },
  {
    id: 3,
    text: "Do you hesitate when making decisions that affect the whole team?",
    category: QuestionCategory.LEADERSHIP,
  },
  {
    id: 4,
    text: "Do you often avoid giving constructive feedback because you worry about conflict?",
    category: QuestionCategory.LEADERSHIP,
  },
  // Team-Building-Oriented
  {
    id: 5,
    text: "Do team members frequently misunderstand each other or miscommunicate?",
    category: QuestionCategory.TEAM_BUILDING,
  },
  {
    id: 6,
    text: "Do you notice low trust or lack of cohesion among team members?",
    category: QuestionCategory.TEAM_BUILDING,
  },
  {
    id: 7,
    text: "Do conflicts between team members often remain unresolved or escalate?",
    category: QuestionCategory.TEAM_BUILDING,
  },
  {
    id: 8,
    text: "Do projects regularly stall because collaboration breaks down?",
    category: QuestionCategory.TEAM_BUILDING,
  },
];
