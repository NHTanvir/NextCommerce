'use client';

import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  useGetProductQnaQuery,
  useAskQuestionMutation,
  useAnswerQuestionMutation,
  useDeleteQuestionMutation,
} from '@/store/api/qna.api';
import styles from './ProductQnA.module.scss';

interface Props {
  productId: string;
}

export function ProductQnA({ productId }: Props) {
  const user = useAppSelector((s) => s.auth.user);
  const { data: questions = [], isLoading } = useGetProductQnaQuery(productId);
  const [askQuestion, { isLoading: asking }] = useAskQuestionMutation();
  const [answerQuestion, { isLoading: answering }] = useAnswerQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();

  const [askBody, setAskBody] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askBody.trim()) return;
    await askQuestion({ productId, body: askBody.trim() });
    setAskBody('');
    setSuccessMsg('Your question has been submitted!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAnswer = async (questionId: string) => {
    if (!replyBody.trim()) return;
    await answerQuestion({ questionId, body: replyBody.trim() });
    setReplyBody('');
    setReplyTo(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    await deleteQuestion({ id, productId });
  };

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>
        Questions & Answers
        {questions.length > 0 && (
          <span className={styles.count}>{questions.length}</span>
        )}
      </h3>

      {isLoading && <p className={styles.loading}>Loading questions…</p>}

      {!isLoading && questions.length === 0 && (
        <p className={styles.empty}>No questions yet. Be the first to ask!</p>
      )}

      <div className={styles.list}>
        {questions.map((q) => {
          const canDelete = user && (user.role === 'admin' || user.id === q.userId);
          return (
            <div key={q.id} className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <span className={styles.questionIcon}>Q</span>
                <p className={styles.questionBody}>{q.body}</p>
                <div className={styles.questionActions}>
                  <span className={styles.questionDate}>
                    {new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  {canDelete && (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(q.id)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {q.answers.map((a) => (
                <div key={a.id} className={`${styles.answer} ${a.isAdminAnswer ? styles.answerAdmin : ''}`}>
                  <span className={styles.answerIcon}>
                    {a.isAdminAnswer ? '🏷️' : 'A'}
                  </span>
                  <div className={styles.answerContent}>
                    {a.isAdminAnswer && <span className={styles.adminBadge}>Official Answer</span>}
                    <p className={styles.answerBody}>{a.body}</p>
                    <span className={styles.answerDate}>
                      {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}

              {user && (
                <div className={styles.replySection}>
                  {replyTo === q.id ? (
                    <div className={styles.replyForm}>
                      <textarea
                        className={styles.textarea}
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        placeholder="Write your answer…"
                        rows={2}
                        autoFocus
                      />
                      <div className={styles.replyButtons}>
                        <button
                          className="btn btn--primary btn--sm"
                          onClick={() => handleAnswer(q.id)}
                          disabled={answering || !replyBody.trim()}
                        >
                          {answering ? '…' : 'Submit Answer'}
                        </button>
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => { setReplyTo(null); setReplyBody(''); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className={styles.replyBtn}
                      onClick={() => setReplyTo(q.id)}
                    >
                      + Answer this question
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {user ? (
        <form className={styles.askForm} onSubmit={handleAsk}>
          <h4 className={styles.askTitle}>Ask a Question</h4>
          {successMsg && <p className={styles.successMsg}>{successMsg}</p>}
          <textarea
            className={styles.textarea}
            placeholder="What would you like to know about this product?"
            value={askBody}
            onChange={(e) => setAskBody(e.target.value)}
            rows={3}
            required
            minLength={10}
          />
          <button
            type="submit"
            className="btn btn--primary btn--sm"
            disabled={asking || !askBody.trim()}
          >
            {asking ? 'Submitting…' : 'Submit Question'}
          </button>
        </form>
      ) : (
        <p className={styles.loginPrompt}>
          <a href="/auth/login">Sign in</a> to ask or answer questions.
        </p>
      )}
    </section>
  );
}
