// src/App.js
import React, { useState, useEffect } from "react";
import {
  Play,
  Home,
  Volume2,
  VolumeX,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";

function App() {
  const [mode, setMode] = useState("home");
  const [questions, setQuestions] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Load questions
  useEffect(() => {
    fetch("/questions.json")
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        console.log("Questions loaded:", data);
        setQuestions(data);
      })
      .catch((err) => {
        console.error("Failed:", err);
        // Fallback
        setQuestions([
          {
            chapter: "Test",
            question: "1+1=?",
            answer: "2",
            explanation: "One plus one is two.",
          },
        ]);
      });
  }, []);

  // Timer
  useEffect(() => {
    if (mode === "quiz" && !showResult && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(t);
    } else if (timeLeft === 0 && !showResult) {
      submitAnswer();
    }
  }, [timeLeft, mode, showResult]);

  const startQuiz = () => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random()).slice(0, 5);
    setQuizQuestions(shuffled);
    setCurrentQ(0);
    setScore(0);
    setUserAnswer("");
    setShowResult(false);
    setTimeLeft(30);
    setMode("quiz");
  };

  const submitAnswer = () => {
    const correct = quizQuestions[currentQ].answer.toLowerCase();
    const user = userAnswer.trim().toLowerCase();
    const match = correct.includes(user) || user.includes(correct[0]);
    setIsCorrect(match);
    if (match) setScore(score + 1);
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQ < quizQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
      setUserAnswer("");
      setShowResult(false);
      setTimeLeft(30);
    } else {
      setMode("result");
    }
  };

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utter);
    }
  };

  if (questions.length === 0) {
    return <div className='p-8 text-center'>Loading...</div>;
  }

  return (
    <div className='min-h-screen bg-blue-50 p-4'>
      <header className='bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-indigo-600'>CBSE Maths 8</h1>
        <button onClick={() => setMode("home")} className='p-2'>
          <Home className='w-6 h-6' />
        </button>
      </header>

      {mode === "home" && (
        <div className='text-center'>
          <h2 className='text-3xl font-bold mb-6'>Welcome!</h2>
          <button
            onClick={startQuiz}
            className='bg-indigo-600 text-white px-8 py-4 rounded-xl text-xl flex items-center gap-3 mx-auto hover:bg-indigo-700'
          >
            <Play /> Start Quiz
          </button>
        </div>
      )}

      {mode === "quiz" && quizQuestions.length > 0 && (
        <div className='max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg'>
          <div className='flex justify-between mb-4'>
            <span>
              Q{currentQ + 1}/{quizQuestions.length}
            </span>
            <span className={timeLeft <= 10 ? "text-red-600" : ""}>
              {timeLeft}s
            </span>
          </div>

          <div className='flex justify-between items-start mb-4'>
            <h3 className='text-lg font-semibold'>
              {quizQuestions[currentQ].question}
            </h3>
            <button
              onClick={() => speak(quizQuestions[currentQ].question)}
              className='p-1'
            >
              {isSpeaking ? (
                <VolumeX className='w-5 h-5' />
              ) : (
                <Volume2 className='w-5 h-5' />
              )}
            </button>
          </div>

          <input
            type='text'
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && !showResult && userAnswer && submitAnswer()
            }
            placeholder='Your answer...'
            className='w-full p-3 border rounded-lg mb-4 text-lg'
            autoFocus
            disabled={showResult}
          />

          {!showResult && userAnswer && (
            <button
              onClick={submitAnswer}
              className='w-full bg-indigo-600 text-white py-3 rounded-lg font-bold'
            >
              Submit
            </button>
          )}

          {showResult && (
            <div
              className={`p-4 rounded-lg ${
                isCorrect ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <div className='flex items-center gap-2 mb-2'>
                {isCorrect ? (
                  <CheckCircle className='text-green-600' />
                ) : (
                  <XCircle className='text-red-600' />
                )}
                <span className='font-bold'>
                  {isCorrect ? "Correct!" : "Wrong"}
                </span>
              </div>
              <p>
                <strong>Answer:</strong> {quizQuestions[currentQ].answer}
              </p>
              <div className='flex justify-between items-start mt-2'>
                <p className='flex-1'>
                  <strong>Explanation:</strong>{" "}
                  {quizQuestions[currentQ].explanation}
                </p>
                <button
                  onClick={() => speak(quizQuestions[currentQ].explanation)}
                  className='p-1'
                >
                  <Volume2 className='w-4 h-4' />
                </button>
              </div>
              <button
                onClick={nextQuestion}
                className='mt-4 w-full bg-indigo-600 text-white py-3 rounded-lg flex items-center justify-center gap-2'
              >
                Next Question <ArrowRight />
              </button>
            </div>
          )}
        </div>
      )}

      {mode === "result" && (
        <div className='text-center max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg'>
          <h2 className='text-3xl font-bold mb-4'>Quiz Complete!</h2>
          <p className='text-5xl font-bold text-indigo-600 mb-6'>
            {score}/{quizQuestions.length}
          </p>
          <button
            onClick={startQuiz}
            className='bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg'
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
