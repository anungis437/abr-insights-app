import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Trophy,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizPlayer({ questions, onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answerIndex) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    const isCorrect = selectedAnswer === currentQuestion.correct_answer_index;
    setAnswers([...answers, { questionIndex: currentQuestionIndex, selectedAnswer, isCorrect }]);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const calculateScore = () => {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    return Math.round((correctAnswers / questions.length) * 100);
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return { message: "Outstanding!", color: "text-green-400", icon: Trophy };
    if (score >= 80) return { message: "Great job!", color: "text-teal-400", icon: CheckCircle };
    if (score >= 70) return { message: "Good work!", color: "text-blue-400", icon: Target };
    if (score >= 60) return { message: "Passed!", color: "text-yellow-400", icon: CheckCircle };
    return { message: "Keep learning!", color: "text-orange-400", icon: AlertCircle };
  };

  if (quizComplete) {
    const score = calculateScore();
    const scoreInfo = getScoreMessage(score);
    const ScoreIcon = scoreInfo.icon;

    return (
      <div className="max-w-3xl mx-auto p-6 lg:p-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardContent className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-6">
                  <ScoreIcon className="w-16 h-16 text-white" />
                </div>
              </motion.div>

              <h2 className={`text-5xl font-bold ${scoreInfo.color} mb-2`}>{score}%</h2>
              <h3 className="text-2xl font-bold text-white mb-4">{scoreInfo.message}</h3>
              
              <div className="mb-8">
                <p className="text-gray-400 text-lg">
                  You answered {answers.filter(a => a.isCorrect).length} out of {questions.length} questions correctly
                </p>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-3xl font-bold text-green-400">{answers.filter(a => a.isCorrect).length}</div>
                  <div className="text-sm text-gray-400">Correct</div>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-3xl font-bold text-red-400">{answers.filter(a => !a.isCorrect).length}</div>
                  <div className="text-sm text-gray-400">Incorrect</div>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-3xl font-bold text-teal-400">{questions.length}</div>
                  <div className="text-sm text-gray-400">Total</div>
                </div>
              </div>

              {score >= 60 ? (
                <div className="p-4 bg-green-900/20 border border-green-600/30 rounded-lg mb-6">
                  <p className="text-green-400 font-medium">
                    ✅ You've passed this quiz! Your progress has been saved.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-orange-900/20 border border-orange-600/30 rounded-lg mb-6">
                  <p className="text-orange-400 font-medium">
                    You need 60% or higher to pass. Review the lesson and try again.
                  </p>
                </div>
              )}

              <Button
                onClick={() => onComplete(score)}
                size="lg"
                className="teal-gradient text-white px-8"
              >
                Continue to Next Lesson
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Answer Review */}
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">Review Your Answers</h3>
          {questions.map((question, qIndex) => {
            const userAnswer = answers.find(a => a.questionIndex === qIndex);
            return (
              <Card key={qIndex} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    {userAnswer.isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="text-white font-semibold mb-3">{question.question_en}</p>
                      <div className="space-y-2">
                        {question.options_en.map((option, oIndex) => {
                          const isCorrect = oIndex === question.correct_answer_index;
                          const isSelected = oIndex === userAnswer.selectedAnswer;
                          return (
                            <div
                              key={oIndex}
                              className={`p-3 rounded-lg border ${
                                isCorrect
                                  ? 'bg-green-900/20 border-green-600/50 text-green-300'
                                  : isSelected
                                  ? 'bg-red-900/20 border-red-600/50 text-red-300'
                                  : 'bg-gray-700/30 border-gray-600 text-gray-400'
                              }`}
                            >
                              {option}
                              {isCorrect && <span className="ml-2">✓ Correct</span>}
                              {isSelected && !isCorrect && <span className="ml-2">✗ Your answer</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-12">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">Knowledge Check</h2>
          <Badge variant="outline" className="text-teal-400 border-teal-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                {currentQuestion.question_en}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentQuestion.options_en.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correct_answer_index;
                  const showCorrectAnswer = showResult && isCorrect;
                  const showIncorrectAnswer = showResult && isSelected && !isCorrect;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        showCorrectAnswer
                          ? 'bg-green-900/30 border-green-500 text-green-300'
                          : showIncorrectAnswer
                          ? 'bg-red-900/30 border-red-500 text-red-300'
                          : isSelected
                          ? 'bg-teal-900/30 border-teal-500 text-white'
                          : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showCorrectAnswer && <CheckCircle className="w-5 h-5 text-green-400" />}
                        {showIncorrectAnswer && <XCircle className="w-5 h-5 text-red-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Result Feedback */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className={`mb-6 ${
                  selectedAnswer === currentQuestion.correct_answer_index
                    ? 'bg-green-900/20 border-green-600'
                    : 'bg-orange-900/20 border-orange-600'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      {selectedAnswer === currentQuestion.correct_answer_index ? (
                        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0" />
                      )}
                      <div>
                        <h4 className={`font-bold mb-2 ${
                          selectedAnswer === currentQuestion.correct_answer_index
                            ? 'text-green-300'
                            : 'text-orange-300'
                        }`}>
                          {selectedAnswer === currentQuestion.correct_answer_index
                            ? 'Correct!'
                            : 'Not quite right'}
                        </h4>
                        <p className="text-gray-300 text-sm">
                          {selectedAnswer === currentQuestion.correct_answer_index
                            ? 'Great job! You\'ve demonstrated understanding of this concept.'
                            : `The correct answer is: ${currentQuestion.options_en[currentQuestion.correct_answer_index]}`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            {!showResult ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                size="lg"
                className="teal-gradient text-white"
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                size="lg"
                className="teal-gradient text-white"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}