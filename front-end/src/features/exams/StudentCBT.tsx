import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';

// Components
import Button from '../../components/ui/button/Button';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import Badge from '../../components/ui/badge/Badge';
import { toast } from '../../components/ui/Toast';

// Icons
import { Play, Clock, CheckCircle, AlertTriangle, Monitor, FileText, ChevronRight, ChevronLeft, Target, AlertCircle, PlayCircle } from 'lucide-react';

export default function StudentCBT() {
  const [searchParams] = useSearchParams();
  const tenantId = localStorage.getItem("tenantId") || "";
  // In a real app, you'd get the studentId from auth context
  // Using a mock student ID or pulling from localStorage for now
  const studentId = "00000000-0000-0000-0000-000000000000"; 

  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Test State
  const [activeAttempt, setActiveAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!tenantId) return;
    fetchExams();
  }, [tenantId]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      // Fetching all exams for tenant (ideally filtered by student's class)
      const res = await api.get(`/onlineexams/tenant/${tenantId}`);
      const list = Array.isArray(res.data) ? res.data : [];
      setExams(list);
      
      const examParam = searchParams.get('exam') || searchParams.get('examId');
      if (examParam && list.length > 0) {
        const target = list.find((e: any) => e.id === examParam);
        if (target) {
          startTest(target);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeAttempt && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitTest(true); // auto-submit on timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeAttempt, timeLeft]);

  const startTest = async (exam: any) => {
    const result = await Swal.fire({
      title: 'Start Exam?',
      text: `You have ${exam.duration_minutes} minutes to complete this exam. Once started, the timer will not stop.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Start Now'
    });

    if (result.isConfirmed) {
      try {
        // 1. Start Attempt
        const attemptRes = await api.post(`/studentexamattempts/start`, {
          tenant_id: tenantId,
          online_exam_id: exam.id,
          student_id: studentId
        });
        
        // 2. Fetch Questions
        const qRes = await api.get(`/onlineexams/${exam.id}/questions`);
        
        setQuestions(qRes.data);
        setActiveAttempt({ ...attemptRes.data.attempt, exam_details: exam });
        
        // Calculate remaining time if resuming
        const start = new Date(attemptRes.data.attempt.start_time).getTime();
        const now = new Date().getTime();
        const elapsedSeconds = Math.floor((now - start) / 1000);
        const totalSeconds = exam.duration_minutes * 60;
        const remaining = Math.max(0, totalSeconds - elapsedSeconds);
        
        setTimeLeft(remaining);
        setCurrentQuestionIndex(0);
        
        // Load existing answers if resuming
        if (attemptRes.data.attempt.responses_json) {
           try {
               setAnswers(JSON.parse(attemptRes.data.attempt.responses_json));
           } catch(e) {}
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to start exam.');
      }
    }
  };

  const submitTest = async (isAutoSubmit = false) => {
    if (!isAutoSubmit) {
      const confirm = await Swal.fire({
        title: 'Submit Exam?',
        text: 'Are you sure you want to submit your answers? You cannot change them after submission.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Submit'
      });
      if (!confirm.isConfirmed) return;
    }

    try {
      // Calculate Score (Simple frontend calculation for demo purposes)
      let score = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correct_option) {
          score += q.marks;
        }
      });

      await api.post(`/studentexamattempts/submit`, {
        attempt_id: activeAttempt.id,
        responses_json: JSON.stringify(answers),
        score: score
      });

      Swal.fire({
        title: 'Exam Submitted!',
        text: `Your test has been successfully recorded.`,
        icon: 'success'
      });
      
      setActiveAttempt(null);
      setQuestions([]);
      setAnswers({});
      fetchExams();
    } catch (err) {
      toast.error('Failed to submit exam.');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (qId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  // --- ACTIVE TEST VIEW ---
  if (activeAttempt && questions.length > 0) {
    const currentQ = questions[currentQuestionIndex];
    
    return (
      <div className="w-full h-full min-h-[80vh] flex flex-col bg-gray-50 dark:bg-slate-900 animate-in fade-in">
        {/* Test Header */}
        <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 p-4 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{activeAttempt.exam_details.title}</h2>
              <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg ${timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-brand-50 text-brand-600'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col md:flex-row gap-8">
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Q{currentQuestionIndex + 1}. {currentQ.question_text}</h3>
              <Badge variant="light" color="primary">{currentQ.marks} Marks</Badge>
            </div>

            <div className="space-y-4 mt-8">
              {['A', 'B', 'C', 'D'].map((opt) => (
                <label 
                  key={opt}
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                    answers[currentQ.id] === opt 
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-[0_0_0_1px_rgba(59,130,246,1)]' 
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${answers[currentQ.id] === opt ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}`}>
                    {answers[currentQ.id] === opt && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className="text-lg text-gray-700 dark:text-gray-200 font-medium">
                    {opt === 'A' ? currentQ.option_a : opt === 'B' ? currentQ.option_b : opt === 'C' ? currentQ.option_c : currentQ.option_d}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-between mt-12 pt-6 border-t border-gray-100 dark:border-gray-700">
              <Button 
                variant="outline" 
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              >
                Previous
              </Button>
              
              {currentQuestionIndex === questions.length - 1 ? (
                <Button variant="primary" onClick={() => submitTest(false)} className="bg-success-500 hover:bg-success-600 border-success-500 text-white">
                  Submit Final Test
                </Button>
              ) : (
                <Button variant="primary" onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                  Next Question
                </Button>
              )}
            </div>
          </div>

          {/* Question Navigator Panel */}
          <div className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-fit sticky top-24">
            <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4">Question Navigator</h4>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = currentQuestionIndex === idx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm transition-all
                      ${isCurrent ? 'ring-2 ring-brand-500 ring-offset-1' : ''}
                      ${isAnswered 
                        ? 'bg-brand-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-brand-500"></div> Attempted</div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700"></div> Unattempted</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- EXAMS LIST DASHBOARD ---
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      <Breadcrumb items={[{ label: 'My Portal', href: '#' }, { label: 'Online CBT Tests' }]} />
      
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">My Online Tests</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Available computer-based tests assigned to your class.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center"><div className="animate-spin h-8 w-8 border-b-2 border-brand-500 rounded-full"></div></div>
        ) : exams.length === 0 ? (
          <div className="col-span-full py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-center flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-500 font-medium">No online tests available at the moment.</p>
          </div>
        ) : (
          exams.map((exam) => {
            const isToday = new Date(exam.exam_date).toDateString() === new Date().toDateString();
            const isPast = new Date(exam.exam_date) < new Date(new Date().setHours(0,0,0,0));

            return (
              <div key={exam.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                {isToday && <div className="absolute top-0 left-0 w-1 h-full bg-success-500"></div>}
                
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">{exam.title}</h3>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Duration: <span className="font-semibold text-gray-900 dark:text-gray-200">{exam.duration_minutes} Mins</span></span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Target className="w-4 h-4 mr-2" />
                    <span>Marks: <span className="font-semibold text-gray-900 dark:text-gray-200">{exam.total_marks}</span> (Passing: {exam.passing_marks})</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>Date: <span className="font-semibold text-gray-900 dark:text-gray-200">{new Date(exam.exam_date).toLocaleDateString()}</span></span>
                  </div>
                </div>
                
                {isPast ? (
                  <Button variant="outline" className="w-full text-gray-400 border-gray-200 cursor-not-allowed" disabled>Test Expired</Button>
                ) : (
                  <Button 
                    variant="primary" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => startTest(exam)}
                  >
                    <PlayCircle className="w-4 h-4" /> Start Attempt
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
