// src/App.js  (FULL UPDATED CODE - Shows Chapters + Works with questions.json)
import React, { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  BookOpen,
  Play,
  CheckCircle,
  XCircle,
  Home,
  BarChart3,
  ArrowRight,
  Volume2,
  VolumeX,
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
  const [selectedChapter, setSelectedChapter] = useState("");
  const [stats, setStats] = useState({ total: 0, correct: 0 });
  const [timeLeft, setTimeLeft] = useState(30);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  // Load questions from public/questions.json
  useEffect(() => {
    fetch("/questions.json")
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        console.log("Loaded", data.length, "questions");
        setQuestions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Load failed:", err);
        // Fallback (so app never crashes)
        setQuestions([
          {
            chapter: "Test",
            question: "2+2=?",
            answer: "4",
            explanation: "Two plus two is four.",
          },
        ]);
        setLoading(false);
      });
  }, []);

  // Load stats
  useEffect(() => {
    const saved = localStorage.getItem("mathsStats");
    if (saved) setStats(JSON.parse(saved));
  }, []);

  // Timer
  useEffect(() => {
    if (mode === "quiz" && !showResult && quizQuestions.length > 0) {
      setTimeLeft(30);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            submitAnswer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [mode, currentQ, showResult, quizQuestions.length]);

  // Voice
  const speak = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.9;
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utter);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const startQuiz = () => {
    const shuffled = [...questions]
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);
    setQuizQuestions(shuffled);
    setCurrentQ(0);
    setScore(0);
    setUserAnswer("");
    setShowResult(false);
    setTimeLeft(30);
    setMode("quiz");
  };

  const submitAnswer = () => {
    clearInterval(timerRef.current);
    const correct = quizQuestions[currentQ].answer.toLowerCase().trim();
    const user = userAnswer.trim().toLowerCase();
    const match =
      correct.includes(user) || user.includes(correct.split(" ")[0]);
    setIsCorrect(match);
    if (match) setScore(score + 1);
    setShowResult(true);
  };

  const nextQuestion = () => {
    stopSpeaking();
    if (currentQ < quizQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
      setUserAnswer("");
      setShowResult(false);
      setTimeLeft(30);
    } else {
      const finalScore = isCorrect ? score + 1 : score;
      const newStats = {
        total: stats.total + quizQuestions.length,
        correct: stats.correct + finalScore,
      };
      setStats(newStats);
      localStorage.setItem("mathsStats", JSON.stringify(newStats));
      setMode("result");
    }
  };

  const browseChapter = (chapter) => {
    setSelectedChapter(chapter);
    setMode("browse");
  };

  // Unique chapters
  const chapters = [...new Set(questions.map((q) => q.chapter))];

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4'></div>
          <p className='text-xl text-gray-700'>Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10'>
        <div className='max-w-4xl mx-auto px-4 py-3 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl'>
              M8
            </div>
            <h1 className='text-2xl font-bold text-gray-800'>
              CBSE Class 8 Maths
            </h1>
          </div>
          <button
            onClick={() => setMode("home")}
            className='p-2 rounded-full hover:bg-gray-100'
          >
            <Home className='w-6 h-6' />
          </button>
        </div>
      </header>

      {/* HOME */}
      {mode === "home" && (
        <div className='max-w-4xl mx-auto p-6'>
          <div className='text-center mb-10'>
            <h2 className='text-4xl font-bold text-gray-800 mb-3'>
              Welcome, Champion! 🚀
            </h2>
            <p className='text-lg text-gray-600'>
              Master Class 8 Maths with fun quizzes & chapter-wise practice
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-10'>
            <button
              onClick={startQuiz}
              className='bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-3xl shadow-xl transform transition hover:scale-105'
            >
              <Play className='w-16 h-16 mx-auto mb-4' />
              <h3 className='text-2xl font-bold'>Start Quiz</h3>
              <p className='text-lg mt-2'>10 random questions • 30s each</p>
            </button>

            <button
              onClick={() => setMode("chapters")}
              className='bg-gradient-to-r from-green-500 to-teal-600 text-white p-8 rounded-3xl shadow-xl transform transition hover:scale-105'
            >
              <BookOpen className='w-16 h-16 mx-auto mb-4' />
              <h3 className='text-2xl font-bold'>Browse Chapters</h3>
              <p className='text-lg mt-2'>
                {chapters.length} chapters • {questions.length} questions
              </p>
            </button>
          </div>

          <div className='bg-white rounded-3xl p-8 shadow-xl'>
            <h3 className='text-2xl font-bold flex items-center gap-3 mb-4'>
              <BarChart3 className='w-8 h-8 text-indigo-600' />
              Your Progress
            </h3>
            <div className='text-5xl font-bold text-indigo-600'>
              {stats.total > 0
                ? Math.round((stats.correct / stats.total) * 100)
                : 0}
              %
            </div>
            <p className='text-lg text-gray-600 mt-2'>
              {stats.correct} correct out of {stats.total} questions
            </p>
          </div>
        </div>
      )}

      {/* CHAPTERS LIST */}
      {mode === "chapters" && (
        <div className='max-w-4xl mx-auto p-6'>
          <h2 className='text-3xl font-bold text-center mb-8'>
            Select a Chapter
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {chapters.map((ch, i) => (
              <button
                key={i}
                onClick={() => browseChapter(ch)}
                className='bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition flex items-center justify-between group'
              >
                <div className='text-left'>
                  <div className='text-xl font-bold text-gray-800'>{ch}</div>
                  <div className='text-sm text-gray-500 mt-1'>
                    {questions.filter((q) => q.chapter === ch).length} questions
                  </div>
                </div>
                <ChevronRight className='w-8 h-8 text-indigo-600 group-hover:translate-x-2 transition' />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QUIZ MODE */}
      {mode === "quiz" && quizQuestions.length > 0 && (
        <div className='max-w-2xl mx-auto p-6'>
          <div className='bg-white rounded-3xl shadow-2xl p-8'>
            <div className='flex justify-between items-center mb-6'>
              <span className='text-lg font-bold text-indigo-600'>
                Question {currentQ + 1} / {quizQuestions.length}
              </span>
              <div className='flex items-center gap-4'>
                <span className='text-lg font-bold'>Score: {score}</span>
                <div
                  className={`text-2xl font-bold ${
                    timeLeft <= 10
                      ? "text-red-600 animate-pulse"
                      : "text-gray-700"
                  }`}
                >
                  {timeLeft}s
                </div>
              </div>
            </div>

            <div className='mb-6 flex items-start justify-between'>
              <h3 className='text-xl font-semibold text-gray-800 pr-4'>
                {quizQuestions[currentQ].question}
              </h3>
              <button
                onClick={() => speak(quizQuestions[currentQ].question)}
                className='p-3 rounded-full bg-indigo-100 hover:bg-indigo-200 transition'
              >
                {isSpeaking ? (
                  <VolumeX className='w-6 h-6 text-indigo-600' />
                ) : (
                  <Volume2 className='w-6 h-6 text-indigo-600' />
                )}
              </button>
            </div>

            <div className='mb-6'>
              <span className='inline-block bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium'>
                {quizQuestions[currentQ].chapter}
              </span>
            </div>

            <input
              type='text'
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !showResult && userAnswer && submitAnswer()
              }
              placeholder='Type your answer here...'
              className='w-full p-4 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none text-lg'
              autoFocus
              disabled={showResult}
            />

            {!showResult && userAnswer && (
              <button
                onClick={submitAnswer}
                className='mt-6 w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition'
              >
                Submit Answer
              </button>
            )}

            {showResult && (
              <div
                className={`mt-6 p-6 rounded-2xl ${
                  isCorrect ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <div className='flex items-center gap-3 mb-4'>
                  {isCorrect ? (
                    <CheckCircle className='w-10 h-10 text-green-600' />
                  ) : (
                    <XCircle className='w-10 h-10 text-red-600' />
                  )}
                  <span className='text-2xl font-bold'>
                    {isCorrect ? "Correct! 🎉" : "Incorrect 😔"}
                  </span>
                </div>

                <p className='text-lg mb-3'>
                  <strong className='text-gray-700'>Answer:</strong>{" "}
                  {quizQuestions[currentQ].answer}
                </p>

                <div className='flex items-start justify-between mb-6'>
                  <p className='text-lg flex-1'>
                    <strong className='text-gray-700'>Explanation:</strong>{" "}
                    {quizQuestions[currentQ].explanation}
                  </p>
                  <button
                    onClick={() => speak(quizQuestions[currentQ].explanation)}
                    className='ml-4 p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition'
                  >
                    <Volume2 className='w-5 h-5' />
                  </button>
                </div>

                <button
                  onClick={nextQuestion}
                  className='w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 transition'
                >
                  Next Question <ArrowRight className='w-6 h-6' />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BROWSE CHAPTER */}
      {mode === "browse" && (
        <div className='max-w-4xl mx-auto p-6'>
          <div className='mb-8'>
            <button
              onClick={() => setMode("chapters")}
              className='flex items-center gap-2 text-indigo-600 font-semibold hover:underline'
            >
              <ChevronRight className='w-5 h-5 rotate-180' />
              Back to Chapters
            </button>
            <h2 className='text-3xl font-bold mt-2'>{selectedChapter}</h2>
            <p className='text-gray-600 mt-1'>
              {questions.filter((q) => q.chapter === selectedChapter).length}{" "}
              practice questions
            </p>
          </div>

          <div className='space-y-6'>
            {questions
              .filter((q) => q.chapter === selectedChapter)
              .map((q, i) => (
                <details
                  key={i}
                  className='bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition'
                >
                  <summary className='flex items-center justify-between font-bold text-lg text-gray-800'>
                    <span className='flex-1 pr-4'>
                      Q{i + 1}. {q.question}
                    </span>
                    <ChevronRight className='w-6 h-6 text-indigo-600 transition-transform group-open:rotate-90' />
                  </summary>
                  <div className='mt-6 pl-6 border-l-4 border-indigo-500'>
                    <p className='text-lg font-semibold text-green-700 mb-2'>
                      Answer: {q.answer}
                    </p>
                    <p className='text-gray-700'>
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                    <button
                      onClick={() => speak(q.explanation)}
                      className='mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition'
                    >
                      <Volume2 className='w-5 h-5' />
                      Read Explanation
                    </button>
                  </div>
                </details>
              ))}
          </div>
        </div>
      )}

      {/* RESULT */}
      {mode === "result" && (
        <div className='max-w-2xl mx-auto p-6'>
          <div className='bg-white rounded-3xl shadow-2xl p-10 text-center'>
            <div className='text-7xl font-bold text-indigo-600 mb-6'>
              {score}/{quizQuestions.length}
            </div>
            <h2 className='text-4xl font-bold mb-4'>Quiz Complete!</h2>
            <p className='text-xl text-gray-600 mb-8'>
              You got <span className='font-bold text-indigo-600'>{score}</span>{" "}
              out of <span className='font-bold'>{quizQuestions.length}</span>{" "}
              correct
            </p>

            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button
                onClick={startQuiz}
                className='bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition flex items-center justify-center gap-3'
              >
                Try Again
              </button>
              <button
                onClick={() => setMode("home")}
                className='bg-gray-200 text-gray-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transition'
              >
                Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
