import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { toast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';
import Swal from 'sweetalert2';

// Icons
import { Clock, ShieldAlert, CheckCircle2, ChevronLeft, ChevronRight, Flag, MonitorPlay, Send, Trophy, AlertTriangle, RefreshCw } from 'lucide-react';

interface OnlineExam {
  id: string;
  title: string;
  exam_date: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  shuffle_questions?: boolean;
  shuffle_options?: boolean;
  is_published?: boolean;
}

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  marks: number;
  difficulty_level: string;
}

export default function TakeOnlineExam() {
  const tenantId = localStorage.getItem("tenantId") || "";
  const studentId = localStorage.getItem("userId") || localStorage.getItem("studentId") || "00000000-0000-0000-0000-000000000001";
  const studentName = localStorage.getItem("userName") || "Student Candidate";

  // --- STATES ---
  const [publishedExams, setPublishedExams] = useState<OnlineExam[]>([]);
  const [selectedExam, setSelectedExam] = useState<OnlineExam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Exam Test State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<any | null>(null);

  // --- FETCH PUBLISHED EXAMS ---
  useEffect(() => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (!activeTenant) return;
    const fetchExams = async () => {
      setLoading(true);
      try {
        const res = await api.get<OnlineExam[]>(`/onlineexams/tenant/${activeTenant}`);
        const liveExams = (res.data || []).filter(e => e.is_published);
        setPublishedExams(liveExams);
      } catch (err) {
        toast.error('Failed to load published online exams.');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [tenantId]);

  // --- START EXAM SESSION ---
  const handleStartExam = async (exam: OnlineExam) => {
    setSelectedExam(exam);
    setLoading(true);
    try {
      const res = await api.get<Question[]>(`/onlineexams/${exam.id}/questions`);
      let fetchedQuestions = res.data || [];
      
      // Shuffle questions if enabled
      if (exam.shuffle_questions) {
        fetchedQuestions = [...fetchedQuestions].sort(() => Math.random() - 0.5);
      }
      
      setQuestions(fetchedQuestions);
      setTimeLeft((exam.duration_minutes || 60) * 60);
      setTestStarted(true);
      setCurrentIndex(0);
      setUserAnswers({});
      setFlaggedQuestions({});
      setTabSwitchCount(0);
      setExamResult(null);
      toast.success(`Exam session started. You have ${exam.duration_minutes} minutes.`);
    } catch (err) {
      toast.error('Failed to load exam questions.');
    } finally {
      setLoading(false);
    }
  };

  // --- COUNTDOWN TIMER ---
  useEffect(() => {
    if (!testStarted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testStarted, timeLeft]);

  // --- ANTI-CHEATING TAB SWITCH DETECTOR ---
  useEffect(() => {
    if (!testStarted || examResult) return;

    const handleBlur = () => {
      setTabSwitchCount(prev => {
        const newCount = prev + 1;
        setShowWarningModal(true);
        if (newCount >= 3) {
          toast.error("Security Violation Limit Exceeded (3/3)! Auto-submitting exam.");
          handleAutoSubmit();
        }
        return newCount;
      });
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [testStarted, examResult]);

  // --- FORMAT TIME STRING ---
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- OPTION SELECT ---
  const handleSelectOption = (qId: string, optionKey: string) => {
    setUserAnswers(prev => ({ ...prev, [qId]: optionKey }));
  };

  // --- TOGGLE FLAG ---
  const toggleFlagQuestion = (qId: string) => {
    setFlaggedQuestions(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  // --- SUBMIT EXAM ---
  const handleSubmitExam = async () => {
    const confirm = await Swal.fire({
      title: 'Submit CBT Exam?',
      text: `You have answered ${Object.keys(userAnswers).length} out of ${questions.length} questions. Are you sure you want to finalize?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Yes, Submit Test'
    });

    if (!confirm.isConfirmed) return;
    executeSubmission();
  };

  const handleAutoSubmit = () => {
    executeSubmission();
  };

  const executeSubmission = async () => {
    if (!selectedExam) return;
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    setSubmitting(true);

    const formattedAnswers = Object.entries(userAnswers).map(([qId, opt]) => ({
      question_id: qId,
      selected_option: opt
    }));

    try {
      const payload = {
        tenant_id: activeTenant,
        online_exam_id: selectedExam.id,
        student_id: studentId,
        answers: formattedAnswers
      };

      const res = await api.post('/onlineexams/submit-attempt', payload);
      setExamResult(res.data);
      setTestStarted(false);
      toast.success('Exam submitted and graded successfully!');
    } catch (err) {
      toast.error('Failed to submit exam.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- EXAM LOBBY VIEW ---
  if (!testStarted && !examResult) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-300">
        <Breadcrumb items={[{ label: 'Examinations', href: '#' }, { label: 'Online Test Portal' }]} />

        {/* LOBBY HEADER */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MonitorPlay className="w-6 h-6 text-brand-500" /> Online CBT Test Portal
          </h2>
          <p className="text-sm text-gray-500 mt-1">Select an active published exam to begin your computer-based test session.</p>
        </div>

        {/* PUBLISHED EXAMS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : publishedExams.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center text-gray-500">
            <MonitorPlay className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">No Live Exams Available</h3>
            <p className="text-sm mt-1">There are currently no active published CBT exams for your class stream.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedExams.map(exam => (
              <div key={exam.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:border-brand-500 dark:hover:border-brand-500 transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{exam.title}</h3>
                    <Badge variant="solid" color="success">LIVE</Badge>
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand-500" /> Duration: {exam.duration_minutes} Mins</div>
                    <div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> Total Marks: {exam.total_marks} (Pass: {exam.passing_marks})</div>
                  </div>
                </div>

                <Button variant="primary" onClick={() => handleStartExam(exam)} className="w-full flex items-center justify-center gap-2">
                  <MonitorPlay className="w-4 h-4" /> Attempt CBT Exam
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- RESULT SCORECARD VIEW ---
  if (examResult) {
    const isPassed = (examResult.percentage >= 50);
    return (
      <div className="w-full max-w-2xl mx-auto py-8 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${isPassed ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'}`}>
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{selectedExam?.title}</h2>
            <p className="text-sm text-gray-500 mt-1">CBT Session Completed & Auto-Graded</p>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100 dark:border-gray-800">
            <div>
              <div className="text-xs text-gray-500 uppercase font-bold">Obtained Score</div>
              <div className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">{examResult.obtained_marks} / {examResult.total_marks}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-bold">Percentage</div>
              <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{examResult.percentage}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-bold">Outcome</div>
              <div className="mt-1.5">
                <Badge variant="solid" color={isPassed ? 'success' : 'error'} size="md">
                  {isPassed ? 'PASSED' : 'FAILED'}
                </Badge>
              </div>
            </div>
          </div>

          <Button variant="outline" onClick={() => { setExamResult(null); setSelectedExam(null); }} className="px-8">
            Return to Exam Lobby
          </Button>
        </div>
      </div>
    );
  }

  // --- LIVE CBT EXAM TAKING INTERFACE ---
  const currentQ = questions[currentIndex];

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 flex flex-col space-y-6">
      
      {/* FULLSCREEN EXAM HEADER BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-brand-500" /> {selectedExam?.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Candidate: <strong className="text-slate-800 dark:text-slate-200">{studentName}</strong></p>
        </div>

        {/* TIMER BADGE */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-base border shadow-sm ${timeLeft < 300 ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 border-slate-200 dark:border-slate-700'}`}>
          <Clock className="w-5 h-5" /> {formatTime(timeLeft)}
        </div>
      </div>

      {/* MAIN TEST BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        
        {/* QUESTION AREA (3 Cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          
          {currentQ ? (
            <div className="space-y-6">
              {/* Question Header */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => toggleFlagQuestion(currentQ.id)}
                    className={flaggedQuestions[currentQ.id] ? 'bg-purple-50 text-purple-600 border-purple-200' : ''}
                  >
                    <Flag className="w-3.5 h-3.5 mr-1" /> {flaggedQuestions[currentQ.id] ? 'Flagged' : 'Flag'}
                  </Button>
                  <Badge variant="light" color="primary">{currentQ.marks} Marks</Badge>
                </div>
              </div>

              {/* Question Text */}
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.question_text}
              </h3>

              {/* Options List */}
              <div className="space-y-3 pt-2">
                {['A', 'B', 'C', 'D'].map(optKey => {
                  const optionText = (currentQ as any)[`option_${optKey.toLowerCase()}`];
                  const isSelected = userAnswers[currentQ.id] === optKey;
                  return (
                    <button
                      key={optKey}
                      onClick={() => handleSelectOption(currentQ.id, optKey)}
                      className={`w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all ${
                        isSelected 
                          ? 'bg-brand-50 border-brand-500 text-brand-900 dark:bg-brand-950/40 dark:border-brand-500 dark:text-brand-100 ring-2 ring-brand-500/20' 
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full font-black text-sm flex items-center justify-center shrink-0 border ${
                        isSelected ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {optKey}
                      </div>
                      <span className="font-medium text-sm md:text-base">{optionText}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">No question selected.</div>
          )}

          {/* QUESTION FOOTER CONTROLS */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} 
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button 
                variant="primary" 
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button variant="primary" onClick={handleSubmitExam} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
                <Send className="w-4 h-4 mr-2" /> Submit Test
              </Button>
            )}
          </div>
        </div>

        {/* QUESTION PALETTE SIDEBAR (1 Col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b pb-2 border-slate-100 dark:border-slate-800">
              Question Navigator ({Object.keys(userAnswers).length}/{questions.length})
            </h4>

            {/* Grid Palette */}
            <div className="grid grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isAnswered = !!userAnswers[q.id];
                const isFlagged = !!flaggedQuestions[q.id];
                const isCurrent = idx === currentIndex;

                let badgeClass = "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
                if (isAnswered) badgeClass = "bg-emerald-500 text-white border-emerald-500";
                if (isFlagged) badgeClass = "bg-purple-600 text-white border-purple-600";
                if (isCurrent) badgeClass += " ring-2 ring-brand-500 ring-offset-2";

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-lg font-bold text-xs border transition-all flex items-center justify-center ${badgeClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs space-y-1.5 text-slate-500">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-500"></span> Answered</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-slate-300 dark:bg-slate-700"></span> Unanswered</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-purple-600"></span> Flagged for Review</div>
            </div>

            <Button variant="primary" onClick={handleSubmitExam} disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Send className="w-4 h-4 mr-2" /> Finish & Submit
            </Button>
          </div>
        </div>

      </div>

      {/* ANTI-CHEATING WARNING MODAL */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 text-center space-y-4 border border-rose-200 dark:border-rose-900">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Security Violation Warning ({tabSwitchCount}/3)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Leaving or switching away from the active CBT test window is strictly prohibited. Your test will automatically terminate and submit if 3 violations occur.
            </p>
            <Button variant="primary" onClick={() => setShowWarningModal(false)} className="w-full bg-rose-600 hover:bg-rose-700">
              I Understand & Resume Test
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
