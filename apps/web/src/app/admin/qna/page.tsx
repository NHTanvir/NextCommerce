'use client';

import { useState } from 'react';
import {
  useGetProductQnaAdminQuery,
  useHideQuestionMutation,
  useDeleteQuestionMutation,
  useAnswerQuestionMutation,
} from '@/store/api/qna.api';
import styles from './qna.module.scss';

export default function AdminQnaPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching } = useGetProductQnaAdminQuery({ page, limit });
  const [hideQuestion] = useHideQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [answerQuestion, { isLoading: answering }] = useAnswerQuestionMutation();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const questions = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const handleHide = async (id: string) => {
    if (!confirm('Hide this question from public view?')) return;
    await hideQuestion(id);
  };

  const handleDelete = async (id: string, productId: string) => {
    if (!confirm('Permanently delete this question and all answers?')) return;
    await deleteQuestion({ id, productId });
  };

  const handleAnswer = async (questionId: string) => {
    if (!replyBody.trim()) return;
    await answerQuestion({ questionId, body: replyBody.trim() });
    setReplyBody('');
    setReplyingTo(null);
  };

  const startReply = (id: string) => {
    setReplyingTo(id);
    setExpandedId(id);
    setReplyBody('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.heading}>Q&amp;A Management</h1>
          <p className={styles.sub}>{total} total question{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading questions…</div>
      ) : questions.length === 0 ? (
        <div className={styles.empty}>No questions yet.</div>
      ) : (
        <>
          <div className={styles.list}>
            {questions.map((q) => (
              <div
                key={q.id}
                className={`${styles.card} ${q.isHidden ? styles.hidden : ''} ${isFetching ? styles.fading : ''}`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.qMeta}>
                    <span className={styles.qIcon}>Q</span>
                    <div>
                      <p className={styles.qBody}>{q.body}</p>
                      <div className={styles.qInfo}>
                        <span className={styles.productId}>
                          Product: {q.productId.slice(0, 12)}…
                        </span>
                        <span className={styles.dot}>·</span>
                        <span className={styles.date}>
                          {new Date(q.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </span>
                        {q.isHidden && <span className={styles.hiddenBadge}>Hidden</span>}
                        {q.isAnswered && <span className={styles.answeredBadge}>Answered</span>}
                      </div>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.expandBtn}
                      onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                    >
                      {expandedId === q.id ? 'Collapse' : `Answers (${q.answers.length})`}
                    </button>
                    <button
                      className={styles.replyActionBtn}
                      onClick={() => startReply(q.id)}
                    >
                      Answer
                    </button>
                    {!q.isHidden && (
                      <button
                        className={styles.hideBtn}
                        onClick={() => handleHide(q.id)}
                      >
                        Hide
                      </button>
                    )}
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(q.id, q.productId)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {expandedId === q.id && (
                  <div className={styles.cardBody}>
                    {q.answers.length > 0 && (
                      <div className={styles.answerList}>
                        {q.answers.map((a) => (
                          <div key={a.id} className={`${styles.answerRow} ${a.isAdminAnswer ? styles.adminAnswer : ''}`}>
                            <span className={styles.aIcon}>
                              {a.isAdminAnswer ? '★' : 'A'}
                            </span>
                            <div className={styles.aContent}>
                              {a.isAdminAnswer && <span className={styles.officialBadge}>Official</span>}
                              <p className={styles.aBody}>{a.body}</p>
                              <span className={styles.aDate}>
                                {new Date(a.createdAt).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {replyingTo === q.id && (
                      <div className={styles.replyForm}>
                        <textarea
                          className={styles.textarea}
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          placeholder="Write an official answer…"
                          rows={3}
                          autoFocus
                        />
                        <div className={styles.replyBtns}>
                          <button
                            className="btn btn--primary btn--sm"
                            onClick={() => handleAnswer(q.id)}
                            disabled={answering || !replyBody.trim()}
                          >
                            {answering ? 'Posting…' : 'Post Official Answer'}
                          </button>
                          <button
                            className="btn btn--ghost btn--sm"
                            onClick={() => { setReplyingTo(null); setReplyBody(''); }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </button>
              <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button
                className={styles.pageBtn}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
