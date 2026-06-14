import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MenteeReviewService, MentorReviewService } from '../../services/dataServices';
import { MenteeReviewForm, MentorReviewForm } from '../../types';
import { getCurrentWeekStart } from '../../utils/reviewDateUtils';
import {
  Star,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Calendar,
  Lock,
  Users,
  UserCheck,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ReviewTarget {
  id: string;
  name: string;
}

interface Props {
  /** 'mentor' = student reviewing their mentor (6 criteria)
   *  'mentee' = mentor reviewing their mentee (5 criteria) */
  reviewType: 'mentor' | 'mentee';
  /** Ordered list of people to review */
  reviewTargets: ReviewTarget[];
  /** Called once every target has been reviewed */
  onAllReviewsComplete: () => void;
}

// ─── Slider criteria config ───────────────────────────────────────────────────

const MENTEE_CRITERIA = [
  { key: 'morningExercise', label: 'Morning Exercise', emoji: '🌅' },
  { key: 'communication',   label: 'Communication',   emoji: '💬' },
  { key: 'academicEffort',  label: 'Academic Effort', emoji: '📚' },
  { key: 'campusContribution', label: 'Campus Contribution', emoji: '🏫' },
  { key: 'behavioural',     label: 'Behavioural',     emoji: '🤝' },
] as const;

const MENTOR_CRITERIA = [
  { key: 'morningExercise',   label: 'Morning Exercise',   emoji: '🌅' },
  { key: 'communication',     label: 'Communication',       emoji: '💬' },
  { key: 'academicEffort',    label: 'Academic Effort',     emoji: '📚' },
  { key: 'campusContribution',label: 'Campus Contribution', emoji: '🏫' },
  { key: 'behavioural',       label: 'Behavioural',         emoji: '🤝' },
  { key: 'mentorshipLevel',   label: 'Mentorship Quality',  emoji: '⭐' },
] as const;

// ─── Score label ─────────────────────────────────────────────────────────────

const scoreLabel = (v: number) => {
  if (v === -2) return { text: 'Needs serious effort', color: 'text-red-600' };
  if (v === -1) return { text: 'Below expectations',   color: 'text-orange-500' };
  if (v ===  0) return { text: 'Has scope for improvement', color: 'text-yellow-500' };
  if (v ===  1) return { text: 'Meeting expectations', color: 'text-blue-500' };
  if (v ===  2) return { text: 'Showing great growth', color: 'text-green-600' };
  return { text: '', color: '' };
};

// ─── Initial form states ─────────────────────────────────────────────────────

const EMPTY_MENTEE_FORM: MenteeReviewForm = {
  morningExercise: 0, communication: 0,
  academicEffort: 0,  campusContribution: 0,
  behavioural: 0, notes: '',
};

const EMPTY_MENTOR_FORM: MentorReviewForm = {
  morningExercise: 0, communication: 0,
  academicEffort: 0,  campusContribution: 0,
  behavioural: 0, mentorshipLevel: 0, notes: '',
};

// ─── Week label helper ────────────────────────────────────────────────────────

const getWeekLabel = () => {
  const weekStart = getCurrentWeekStart();
  const weekEnd   = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  return `${fmt(weekStart)} – ${fmt(weekEnd)}, ${weekStart.getFullYear()}`;
};

// ─── Component ────────────────────────────────────────────────────────────────

const ForcedWeeklyReviewModal: React.FC<Props> = ({
  reviewType,
  reviewTargets,
  onAllReviewsComplete,
}) => {
  const { userData } = useAuth();

  const [currentIdx, setCurrentIdx]   = useState(0);
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState<string[]>([]); // IDs already done
  const [errorMsg, setErrorMsg]       = useState('');
  const [successMsg, setSuccessMsg]   = useState('');

  const [menteeForm, setMenteeForm]   = useState<MenteeReviewForm>(EMPTY_MENTEE_FORM);
  const [mentorForm, setMentorForm]   = useState<MentorReviewForm>(EMPTY_MENTOR_FORM);

  const criteria = reviewType === 'mentor' ? MENTOR_CRITERIA : MENTEE_CRITERIA;
  const currentTarget = reviewTargets[currentIdx];
  const weekLabel = getWeekLabel();
  const weekStart = getCurrentWeekStart();

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Prevent ESC key from closing
  useEffect(() => {
    const block = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.preventDefault();
    };
    document.addEventListener('keydown', block, true);
    return () => document.removeEventListener('keydown', block, true);
  }, []);

  const getValue = (key: string): number => {
    if (reviewType === 'mentor') return (mentorForm as any)[key] ?? 0;
    return (menteeForm as any)[key] ?? 0;
  };

  const setValue = (key: string, val: number) => {
    setErrorMsg('');
    if (reviewType === 'mentor') {
      setMentorForm(prev => ({ ...prev, [key]: val }));
    } else {
      setMenteeForm(prev => ({ ...prev, [key]: val }));
    }
  };

  const getNotes = () =>
    reviewType === 'mentor' ? mentorForm.notes : menteeForm.notes;

  const setNotes = (v: string) => {
    if (reviewType === 'mentor') setMentorForm(prev => ({ ...prev, notes: v }));
    else setMenteeForm(prev => ({ ...prev, notes: v }));
  };

  const resetForm = useCallback(() => {
    setMenteeForm(EMPTY_MENTEE_FORM);
    setMentorForm(EMPTY_MENTOR_FORM);
    setErrorMsg('');
    setSuccessMsg('');
  }, []);

  const handleSubmit = async () => {
    if (!userData || !currentTarget) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      if (reviewType === 'mentor') {
        await MentorReviewService.createReview({
          mentor_id:           currentTarget.id,
          student_id:          userData.id,
          morning_exercise:    mentorForm.morningExercise,
          communication:       mentorForm.communication,
          academic_effort:     mentorForm.academicEffort,
          campus_contribution: mentorForm.campusContribution,
          behavioural:         mentorForm.behavioural,
          mentorship_level:    mentorForm.mentorshipLevel,
          notes:               mentorForm.notes,
          week_start:          weekStart,
        });
      } else {
        await MenteeReviewService.createReview({
          student_id:          currentTarget.id,
          mentor_id:           userData.id,
          morning_exercise:    menteeForm.morningExercise,
          communication:       menteeForm.communication,
          academic_effort:     menteeForm.academicEffort,
          campus_contribution: menteeForm.campusContribution,
          behavioural:         menteeForm.behavioural,
          notes:               menteeForm.notes,
          week_start:          weekStart,
        });
      }

      const newSubmitted = [...submitted, currentTarget.id];
      setSubmitted(newSubmitted);
      setSuccessMsg(`✅ Review for ${currentTarget.name} submitted!`);

      // If all done → notify parent
      if (newSubmitted.length >= reviewTargets.length) {
        setTimeout(() => onAllReviewsComplete(), 900);
        return;
      }

      // Move to next after brief pause
      setTimeout(() => {
        setCurrentIdx(idx => idx + 1);
        resetForm();
      }, 900);
    } catch (err: any) {
      console.error('[ForcedWeeklyReviewModal] Submit error:', err);
      setErrorMsg('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentTarget) return null;

  const totalTargets   = reviewTargets.length;
  const doneCount      = submitted.length;
  const progressPct    = totalTargets > 1 ? (doneCount / totalTargets) * 100 : 0;

  const isReviewingMentor = reviewType === 'mentor';

  return (
    /* ── Full-screen forced overlay ── */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)' }}
      /* Block any click on the backdrop from propagating */
      onClick={e => e.stopPropagation()}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Gradient header ── */}
        <div
          className={`px-6 py-5 text-white ${
            isReviewingMentor
              ? 'bg-gradient-to-r from-purple-600 to-indigo-700'
              : 'bg-gradient-to-r from-blue-600 to-cyan-700'
          }`}
        >
          {/* Lock badge */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
              <Lock className="h-3 w-3" />
              Weekly Review Required
            </div>
            <div className="flex items-center gap-1 text-xs opacity-80">
              <Calendar className="h-3.5 w-3.5" />
              {weekLabel}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-1">
            {isReviewingMentor
              ? <UserCheck className="h-7 w-7 opacity-90" />
              : <Users className="h-7 w-7 opacity-90" />
            }
            <div>
              <h2 className="text-xl font-bold leading-tight">
                {isReviewingMentor ? 'Mentor Performance Review' : 'Mentee Performance Review'}
              </h2>
              <p className="text-sm opacity-80 mt-0.5">
                {isReviewingMentor
                  ? `Rate your mentor's performance across 6 criteria`
                  : `Rate ${currentTarget.name}'s performance across 5 criteria`}
              </p>
            </div>
          </div>

          {/* Reviewing: name chip */}
          <div className="mt-3 inline-flex items-center gap-2 bg-white/25 rounded-xl px-3 py-1.5 text-sm font-semibold">
            <Star className="h-4 w-4" />
            Reviewing: {currentTarget.name}
          </div>

          {/* Multi-target progress bar */}
          {totalTargets > 1 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs opacity-80 mb-1">
                <span>Progress</span>
                <span>{doneCount} / {totalTargets} reviews done</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex gap-1.5 mt-2">
                {reviewTargets.map((t, i) => (
                  <div
                    key={t.id}
                    title={t.name}
                    className={`flex-1 h-1.5 rounded-full transition-all ${
                      submitted.includes(t.id)
                        ? 'bg-white'
                        : i === currentIdx
                        ? 'bg-white/60 animate-pulse'
                        : 'bg-white/25'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Body: sliders ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Warning banner */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
            <span>
              You must complete{' '}
              {totalTargets > 1 ? `all ${totalTargets} reviews` : 'this review'}{' '}
              before accessing the dashboard. Reviews cannot be skipped.
            </span>
          </div>

          {/* Criteria sliders */}
          {criteria.map(c => {
            const val = getValue(c.key);
            const { text, color } = scoreLabel(val);
            return (
              <div key={c.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">
                    {c.emoji} {c.label}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 ${color}`}>
                    {val > 0 ? `+${val}` : val} — {text}
                  </span>
                </div>
                <input
                  type="range"
                  min={-2}
                  max={2}
                  step={1}
                  value={val}
                  onChange={e => setValue(c.key, Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  style={{ background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${((val + 2) / 4) * 100}%, #e5e7eb ${((val + 2) / 4) * 100}%, #e5e7eb 100%)` }}
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>-2: Needs serious effort</span>
                  <span className="text-gray-500 font-medium">0</span>
                  <span>+2: Showing great growth</span>
                </div>
              </div>
            );
          })}

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              📝 Additional Notes <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={getNotes()}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any specific observations or feedback…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>

          {/* Error / Success */}
          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 shrink-0" />
              {successMsg}
            </div>
          )}
        </div>

        {/* ── Footer: submit ── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            {totalTargets > 1
              ? `Step ${currentIdx + 1} of ${totalTargets}`
              : 'Complete your weekly review'}
          </p>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all shadow-md ${
              isReviewingMentor
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Submitting…
              </span>
            ) : doneCount + 1 >= totalTargets ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Submit &amp; Continue
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Submit &amp; Next
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForcedWeeklyReviewModal;
