import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from './components/Input';
import { QUESTIONS } from './constants';
import { calculateResult } from './utils/helpers';
import { UserDetails, AssessmentResultType, QuestionCategory } from './types';

const App: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const [user, setUser] = useState<UserDetails>({ name: '', email: '', phone: '' });
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [finalResult, setFinalResult] = useState<AssessmentResultType | null>(null);

  const totalSteps = QUESTIONS.length + 1; // 0 is form, 1-8 are questions

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.name && user.email && user.phone) {
      setStep(1);
    }
  };

  const handleAnswer = async (answer: boolean) => {
    const currentQuestionId = QUESTIONS[step - 1].id;
    const newAnswers = { ...answers, [currentQuestionId]: answer };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      // Finished
      await submitAssessment(newAnswers);
    }
  };

  const submitAssessment = async (finalAnswers: Record<number, boolean>) => {
    setIsSubmitting(true);
    setSubmissionError(null);
    
    try {
      const result = calculateResult(finalAnswers);
      setFinalResult(result);

      // Calculate separate scores for backend storage
      let lScore = 0;
      let tScore = 0;
      QUESTIONS.forEach(q => {
        if (finalAnswers[q.id]) {
          q.category === QuestionCategory.LEADERSHIP ? lScore++ : tScore++;
        }
      });

      // Call Vercel Serverless Function
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          phone: user.phone,
          result: result,
          leadershipScore: lScore,
          teamBuildingScore: tScore
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit assessment.');
      }

      setStep(totalSteps); // Move to success screen
    } catch (err) {
      console.error(err);
      setSubmissionError("There was an error saving your results. However, your assessment is complete.");
      setStep(totalSteps); // Still show result, but maybe with error warning
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = step > 0 && step <= QUESTIONS.length ? QUESTIONS[step - 1] : null;
  const progress = Math.min((step / totalSteps) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Progress Bar */}
        {step > 0 && step <= QUESTIONS.length && (
          <div className="mb-6 bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <AnimatePresence mode='wait'>
            
            {/* Step 0: User Form */}
            {step === 0 && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-8"
              >
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Leadership Assessment</h1>
                  <p className="text-gray-500">Enter your details to begin the evaluation.</p>
                </div>

                <form onSubmit={handleStart}>
                  <Input
                    label="Full Name"
                    name="name"
                    id="name"
                    value={user.name}
                    onChange={handleUserChange}
                    placeholder="John Doe"
                    required
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={handleUserChange}
                    placeholder="john@example.com"
                    required
                  />
                  <Input
                    label="Phone Number"
                    name="phone"
                    id="phone"
                    type="tel"
                    value={user.phone}
                    onChange={handleUserChange}
                    placeholder="+1 555 000 0000"
                    required
                  />

                  <div className="mt-8">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-secondary text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                    >
                      <span>Start Assessment</span>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </form>

                {/* Info for Database Setup (Dev only hint) */}
                <div className="mt-8 p-4 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100">
                  <p className="font-bold mb-1">Database Setup Required:</p>
                  <p>Ensure your Supabase table <code>assessments</code> exists with columns: <code>name (text)</code>, <code>email (text)</code>, <code>phone (text)</code>, <code>result_type (text)</code>, <code>leadership_score (int)</code>, <code>team_building_score (int)</code>.</p>
                </div>
              </motion.div>
            )}

            {/* Steps 1-8: Questions */}
            {step > 0 && step <= QUESTIONS.length && currentQuestion && (
              <motion.div
                key={`q-${currentQuestion.id}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2 }}
                className="p-8"
              >
                <div className="mb-2 text-sm font-semibold text-primary uppercase tracking-wide">
                  {currentQuestion.category.replace(/-/g, ' ')}
                </div>
                <h2 className="text-2xl font-medium text-gray-900 mb-8 leading-snug">
                  {currentQuestion.text}
                </h2>

                <div className="space-y-4">
                  <button
                    onClick={() => handleAnswer(true)}
                    className="w-full text-left px-6 py-4 rounded-xl border-2 border-gray-100 hover:border-primary hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <span className="text-lg font-medium text-gray-700 group-hover:text-primary">Yes</span>
                  </button>
                  <button
                    onClick={() => handleAnswer(false)}
                    className="w-full text-left px-6 py-4 rounded-xl border-2 border-gray-100 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 group"
                  >
                    <span className="text-lg font-medium text-gray-700 group-hover:text-gray-900">No</span>
                  </button>
                </div>
                
                <div className="mt-8 text-center text-sm text-gray-400">
                  Question {step} of {QUESTIONS.length}
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {isSubmitting && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 flex flex-col items-center justify-center text-center"
              >
                <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">Analyzing Results...</h2>
                <p className="text-gray-500 mt-2">Sending your assessment report.</p>
              </motion.div>
            )}

            {/* Step 9: Result */}
            {!isSubmitting && step > QUESTIONS.length && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center"
              >
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Assessment Complete</h2>
                <p className="text-gray-500 mb-8">Thank you, {user.name}. We have analyzed your answers.</p>

                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-8">
                  <h3 className="text-sm uppercase text-slate-500 font-semibold mb-2">Recommended Focus</h3>
                  <p className="text-2xl font-bold text-primary">
                    {finalResult}
                  </p>
                </div>

                <div className="text-left bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-6">
                  <p className="font-semibold mb-1">Next Steps:</p>
                  <p>An email has been sent to <strong>{user.email}</strong> with these details.</p>
                  <p className="mt-2">Please contact <strong>755-25-25</strong> for more information regarding the training program.</p>
                </div>

                {submissionError && (
                   <div className="flex items-start space-x-2 text-left bg-red-50 p-4 rounded-lg text-sm text-red-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-bold">System Notice:</p>
                      <p>{submissionError}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 text-gray-500 hover:text-gray-900 text-sm underline"
                >
                  Start New Assessment
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default App;
