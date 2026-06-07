import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { fetchProductQnA, askQuestion, type QnAQuestion, type QnAAnswer } from '@/api/qna';

const COLORS = {
  bg: '#0d1117',
  surface: '#1c2128',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#e94560',
  green: '#3fb950',
  blue: '#58a6ff',
  yellow: '#f0b72f',
  adminBg: '#1a2332',
};

type Answer = QnAAnswer;
type Question = QnAQuestion;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) {
    const hours = Math.floor(diff / 3600000);
    if (hours === 0) return 'just now';
    return `${hours}h ago`;
  }
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function QuestionCard({ question }: { question: Question }) {
  const [showAnswers, setShowAnswers] = useState(question.answers.length > 0);

  return (
    <View style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <View style={styles.qBadge}>
          <Text style={styles.qBadgeText}>Q</Text>
        </View>
        <View style={styles.questionMeta}>
          <Text style={styles.questionAuthor}>Customer</Text>
          <Text style={styles.questionTime}>{timeAgo(question.createdAt)}</Text>
        </View>
        {question.isAnswered && (
          <View style={styles.answeredBadge}>
            <Text style={styles.answeredText}>✓ Answered</Text>
          </View>
        )}
      </View>

      <Text style={styles.questionBody}>{question.body}</Text>

      {question.answers.length > 0 && (
        <TouchableOpacity
          style={styles.toggleAnswers}
          onPress={() => setShowAnswers((v) => !v)}
        >
          <Text style={styles.toggleAnswersText}>
            {showAnswers ? '▲ Hide' : '▼ Show'} {question.answers.length} answer{question.answers.length !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      )}

      {showAnswers && question.answers.map((answer) => (
        <View
          key={answer.id}
          style={[styles.answerCard, answer.isAdminAnswer && styles.adminAnswerCard]}
        >
          <View style={styles.answerHeader}>
            <View style={[styles.aBadge, answer.isAdminAnswer && styles.adminABadge]}>
              <Text style={[styles.aBadgeText, answer.isAdminAnswer && styles.adminABadgeText]}>
                {answer.isAdminAnswer ? 'Store' : 'A'}
              </Text>
            </View>
            <Text style={styles.answerAuthor}>
              {answer.isAdminAnswer ? 'Official Response' : 'Customer'}
            </Text>
            <Text style={styles.answerTime}>{timeAgo(answer.createdAt)}</Text>
          </View>
          <Text style={styles.answerBody}>{answer.body}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ProductQnAScreen() {
  const route = useRoute<any>();
  const { productId, productTitle } = route.params as { productId: string; productTitle?: string };

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchQnA = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProductQnA(productId);
      setQuestions(data.filter((q) => !q.isHidden));
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useFocusEffect(fetchQnA);

  const handleSubmit = async () => {
    const body = newQuestion.trim();
    if (!body || body.length < 10) {
      Alert.alert('Question too short', 'Please write at least 10 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const newQ = await askQuestion(productId, body);
      setQuestions((prev) => [newQ, ...prev]);
      setNewQuestion('');
      Alert.alert('Question submitted!', 'We will notify you when someone answers.');
    } catch {
      Alert.alert('Error', 'Failed to submit question.');
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = questions.filter((q) => q.isAnswered).length;
  const unansweredCount = questions.length - answeredCount;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={questions}
        keyExtractor={(q) => q.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            {/* Hero */}
            <View style={styles.hero}>
              <Text style={styles.heroTitle}>Questions & Answers</Text>
              {productTitle && (
                <Text style={styles.heroProduct} numberOfLines={1}>{productTitle}</Text>
              )}
              {questions.length > 0 && (
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statNum}>{questions.length}</Text>
                    <Text style={styles.statLabel}>Questions</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={[styles.statNum, { color: COLORS.green }]}>{answeredCount}</Text>
                    <Text style={styles.statLabel}>Answered</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={[styles.statNum, { color: COLORS.yellow }]}>{unansweredCount}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Ask a question */}
            <View style={styles.askSection}>
              <Text style={styles.askTitle}>Ask a Question</Text>
              <TextInput
                style={styles.askInput}
                value={newQuestion}
                onChangeText={setNewQuestion}
                placeholder={token ? "What would you like to know about this product?" : "Sign in to ask a question"}
                placeholderTextColor={COLORS.muted}
                multiline
                numberOfLines={3}
                editable={!!token}
              />
              <TouchableOpacity
                style={[styles.submitBtn, (!token || submitting || newQuestion.trim().length < 10) && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!token || submitting || newQuestion.trim().length < 10}
              >
                <Text style={styles.submitBtnText}>{submitting ? 'Submitting…' : 'Submit Question'}</Text>
              </TouchableOpacity>
              {!token && (
                <Text style={styles.signInNote}>Sign in to ask questions and get personalized answers.</Text>
              )}
            </View>

            {questions.length > 0 && (
              <Text style={styles.sectionTitle}>{questions.length} Question{questions.length !== 1 ? 's' : ''}</Text>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No questions yet</Text>
            <Text style={styles.emptyText}>Be the first to ask a question about this product!</Text>
          </View>
        }
        renderItem={({ item }) => <QuestionCard question={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 40 },

  hero: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#161b22',
  },
  heroTitle: { fontSize: 22, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
  heroProduct: { fontSize: 13, color: COLORS.muted, marginBottom: 12 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '900', color: COLORS.text },
  statLabel: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: COLORS.border },

  askSection: {
    margin: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  askTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  askInput: {
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  signInNote: { fontSize: 12, color: COLORS.muted, textAlign: 'center', marginTop: 8 },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  questionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    paddingBottom: 8,
  },
  qBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: COLORS.blue + '20',
    borderWidth: 1,
    borderColor: COLORS.blue + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qBadgeText: { color: COLORS.blue, fontSize: 11, fontWeight: '900' },
  questionMeta: { flex: 1 },
  questionAuthor: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  questionTime: { fontSize: 10, color: COLORS.muted },
  answeredBadge: {
    backgroundColor: COLORS.green + '20',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  answeredText: { color: COLORS.green, fontSize: 10, fontWeight: '700' },
  questionBody: { fontSize: 14, color: COLORS.text, paddingHorizontal: 12, paddingBottom: 12, lineHeight: 20 },

  toggleAnswers: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#0d1117',
  },
  toggleAnswersText: { color: COLORS.blue, fontSize: 12, fontWeight: '600' },

  answerCard: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 12,
    backgroundColor: '#0d1117',
  },
  adminAnswerCard: { backgroundColor: COLORS.adminBg },
  answerHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  aBadge: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: COLORS.green + '20',
    borderWidth: 1,
    borderColor: COLORS.green + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminABadge: { backgroundColor: COLORS.yellow + '20', borderColor: COLORS.yellow + '40' },
  aBadgeText: { color: COLORS.green, fontSize: 10, fontWeight: '900' },
  adminABadgeText: { color: COLORS.yellow },
  answerAuthor: { fontSize: 11, fontWeight: '600', color: COLORS.text, flex: 1 },
  answerTime: { fontSize: 10, color: COLORS.muted },
  answerBody: { fontSize: 13, color: COLORS.text, lineHeight: 19 },

  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32, gap: 10 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 20 },
});
