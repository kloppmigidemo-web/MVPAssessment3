import { QUESTIONS } from '../constants';
import { QuestionCategory, AssessmentResultType } from '../types';

export const calculateResult = (answers: Record<number, boolean>): AssessmentResultType => {
  let leadershipScore = 0;
  let teamBuildingScore = 0;

  QUESTIONS.forEach((q) => {
    if (answers[q.id]) {
      if (q.category === QuestionCategory.LEADERSHIP) {
        leadershipScore++;
      } else {
        teamBuildingScore++;
      }
    }
  });

  // Interpret logic
  // 1. Mostly “Yes” to 1–4: Leadership training is the priority
  // 2. Mostly “Yes” to 5–8: Team-building training is the priority
  // 3. Mixed “Yes” answers: Focus on whichever side has more “Yes” responses.

  if (leadershipScore > teamBuildingScore) {
    return "Leadership Training";
  } else if (teamBuildingScore > leadershipScore) {
    return "Team-Building Training";
  } else {
    // If scores are equal or heavily mixed with no clear winner
    return "Both Leadership and Team-Building Training";
  }
};
