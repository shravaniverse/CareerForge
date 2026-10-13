
import { useState, useEffect, useCallback } from 'react'

const questions = [
  {
    category: 'Java',
    question: 'What is the difference between JDK, JRE, and JVM?',
    answer: 'JDK provides tools to develop Java programs. JRE provides the environment to run Java programs. JVM executes Java bytecode.'
  },
  {
    category: 'Java',
    question: 'What is the difference between a class and an object?',
    answer: 'A class is a blueprint that defines properties and methods. An object is an instance of a class.'
  },
  {
    category: 'SQL',
    question: 'What is the difference between WHERE and HAVING?',
    answer: 'WHERE filters rows before grouping. HAVING filters groups after GROUP BY is applied.'
  },
  {
    category: 'React',
    question: 'What is the purpose of useState in React?',
    answer: 'useState stores and updates state in a functional component. When the state changes, React re-renders the component.'
  },
  {
    category: 'Programming',
    question: 'What is the difference between an array and a linked list?',
    answer: 'An array stores elements in indexed positions. A linked list stores elements in nodes connected through references.'
  },
  {
    category: 'HR',
    question: 'Tell me about yourself.',
    answer: 'Introduce yourself and your educational background. Mention your technical skills, a relevant project, and your career goal.'
  }
]

const API_URL = 'http://localhost:8080/api/mock-interview'

function MockInterview() {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [completed, setCompleted] = useState([])
  const [showSample, setShowSample] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const token = localStorage.getItem('token')

  const loadProgress = useCallback(async () => {
    if (!token) {
      setAnswers({})
      setCompleted([])
      setLoading(false)
      setSaveMessage('Please log in again to load your interview progress.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.status === 401 || response.status === 403) {
        throw new Error('Your login session may have expired. Please log in again.')
      }

      if (!response.ok) {
        throw new Error(`Could not load progress. HTTP ${response.status}`)
      }

      const data = await response.json()
      const savedAnswers = {}
      const savedCompleted = []

      if (Array.isArray(data)) {
        data.forEach((item) => {
          const index = item.questionIndex

          if (Number.isInteger(index) && index >= 0 && index < questions.length) {
            savedAnswers[index] = item.answer || ''

            if (item.completed) {
              savedCompleted.push(index)
            }
          }
        })
      }

      setAnswers(savedAnswers)
      setCompleted(savedCompleted)
      setSaveMessage('')
    } catch (error) {
      console.error('Load interview progress error:', error)
      setSaveMessage(error.message || 'Could not load your saved progress.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  const currentQuestion = questions[questionIndex]
  const answer = answers[questionIndex] || ''
  const isCompleted = completed.includes(questionIndex)
  const progress = Math.round((completed.length / questions.length) * 100)

  const saveQuestion = async (index, answerText, isAttempted) => {
    if (!token) {
      setSaveMessage('Please log in again to save your progress.')
      return false
    }

    setSaving(true)
    setSaveMessage('')

    try {
      const response = await fetch(`${API_URL}/${index}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          answer: answerText,
          completed: isAttempted
        })
      })

      if (response.status === 401 || response.status === 403) {
        throw new Error('Your login session may have expired. Please log in again.')
      }

      if (!response.ok) {
        throw new Error(`Could not save answer. HTTP ${response.status}`)
      }

      setSaveMessage('Your progress has been saved to your account.')
      return true
    } catch (error) {
      console.error('Save interview progress error:', error)
      setSaveMessage(error.message || 'Could not save progress. Please try again.')
      return false
    } finally {
      setSaving(false)
    }
  }

  const updateAnswer = (value) => {
    setAnswers((previous) => ({
      ...previous,
      [questionIndex]: value
    }))
    setSaveMessage('')
  }

  const saveCurrentAnswer = async () => {
    const success = await saveQuestion(questionIndex, answer, isCompleted)

    if (success) {
      setSaveMessage('Your answer has been saved.')
    }
  }

  const markCompleted = async () => {
    if (!answer.trim()) {
      setSaveMessage('Please enter your answer before marking it attempted.')
      return
    }

    const success = await saveQuestion(questionIndex, answer, true)

    if (success) {
      setCompleted((previous) =>
        previous.includes(questionIndex)
          ? previous
          : [...previous, questionIndex]
      )
      setSaveMessage('Question marked as attempted and saved.')
    }
  }

  const changeQuestion = async (index) => {
    if (index < 0 || index >= questions.length || saving) return

    if (answer.trim() || isCompleted) {
      const success = await saveQuestion(questionIndex, answer, isCompleted)
      if (!success) return
    }

    setQuestionIndex(index)
    setShowSample(false)
    setSaveMessage('')
  }

  const restartInterview = async () => {
    const confirmed = window.confirm(
      'Start again? This will delete your saved interview answers and progress for this account.'
    )

    if (!confirmed) return

    if (!token) {
      setSaveMessage('Please log in again to reset your progress.')
      return
    }

    setSaving(true)
    setSaveMessage('')

    try {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.status === 401 || response.status === 403) {
        throw new Error('Your login session may have expired. Please log in again.')
      }

      if (!response.ok) {
        throw new Error(`Could not reset progress. HTTP ${response.status}`)
      }

      setQuestionIndex(0)
      setAnswers({})
      setCompleted([])
      setShowSample(false)
      setSaveMessage('Your interview progress has been reset.')
    } catch (error) {
      console.error('Reset interview progress error:', error)
      setSaveMessage(error.message || 'Could not reset progress.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section style={styles.card}>
        <h2>Mock Interview</h2>
        <p>Loading your saved interview progress...</p>
      </section>
    )
  }

  return (
    <section style={styles.card}>
      <div style={styles.topRow}>
        <div>
          <span style={styles.eyebrow}>PRACTICE SESSION</span>
          <h2>Mock Interview</h2>
          <p>Practice common placement interview questions at your own pace.</p>
        </div>
        <span style={styles.category}>{currentQuestion.category}</span>
      </div>

      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressBar, width: `${progress}%` }} />
      </div>

      <p style={styles.progressText}>
        {completed.length} of {questions.length} questions completed ({progress}%)
      </p>

      {completed.length === questions.length ? (
        <div>
          <div style={styles.icon}>🎉</div>
          <h3>Interview Practice Completed!</h3>
          <p>Great work! You attempted all six questions. Your progress is saved to your account.</p>
          <button style={styles.primaryButton} onClick={restartInterview} disabled={saving}>
            {saving ? 'Resetting...' : 'Practice Again'}
          </button>
        </div>
      ) : (
        <>
          <div style={styles.questionBox}>
            <span style={styles.questionNumber}>
              QUESTION {questionIndex + 1} OF {questions.length}
            </span>
            <h3>{currentQuestion.question}</h3>
          </div>

          <label style={styles.label} htmlFor="interview-answer">
            Your Answer
          </label>

          <textarea
            id="interview-answer"
            style={styles.textarea}
            value={answer}
            onChange={(event) => updateAnswer(event.target.value)}
            onBlur={saveCurrentAnswer}
            placeholder="Type your answer here..."
            rows={6}
            disabled={saving}
          />

          <p style={styles.savedHint}>
            Click Save Answer or leave the answer field to save your work.
          </p>

          <div style={styles.buttonRow}>
            <button
              style={styles.secondaryButton}
              onClick={() => setShowSample((previous) => !previous)}
            >
              {showSample ? 'Hide Sample Answer' : 'View Sample Answer'}
            </button>

            <button
              style={styles.secondaryButton}
              onClick={saveCurrentAnswer}
              disabled={saving}
            >
              Save Answer
            </button>

            <button
              style={{
                ...styles.primaryButton,
                opacity: !answer.trim() || isCompleted || saving ? 0.6 : 1
              }}
              onClick={markCompleted}
              disabled={!answer.trim() || isCompleted || saving}
            >
              {saving ? 'Saving...' : isCompleted ? 'Answer Saved ✓' : 'Mark as Attempted'}
            </button>
          </div>

          {showSample && (
            <div style={styles.sampleBox}>
              <h3>Sample Answer</h3>
              <p>{currentQuestion.answer}</p>
              <p style={styles.tip}>
                Tip: Explain the concept in your own words instead of memorising the sample answer.
              </p>
            </div>
          )}

          <div style={styles.navigation}>
            <button
              style={styles.navButton}
              onClick={() => changeQuestion(questionIndex - 1)}
              disabled={questionIndex === 0 || saving}
            >
              ← Previous
            </button>

            <span style={styles.counter}>
              {questionIndex + 1} / {questions.length}
            </span>

            <button
              style={styles.navButton}
              onClick={() => changeQuestion(questionIndex + 1)}
              disabled={questionIndex === questions.length - 1 || saving}
            >
              Next →
            </button>
          </div>

          <button
            style={styles.resetButton}
            onClick={restartInterview}
            disabled={saving}
          >
            {saving ? 'Please wait...' : 'Reset Interview Progress'}
          </button>
        </>
      )}

      {saveMessage && (
        <p
          role="status"
          style={{
            ...styles.statusMessage,
            color: /could not|expired|log in/i.test(saveMessage) ? '#b91c1c' : '#166534'
          }}
        >
          {saveMessage}
        </p>
      )}
    </section>
  )
}

const styles = {
  card: {
    marginTop: '28px',
    padding: '28px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    maxWidth: '900px',
    boxSizing: 'border-box'
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px'
  },
  eyebrow: {
    color: '#2563eb',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '1px'
  },
  category: {
    background: '#dbeafe',
    color: '#1d4ed8',
    padding: '8px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700'
  },
  icon: {
    fontSize: '44px',
    marginBottom: '16px'
  },
  progressTrack: {
    height: '8px',
    background: '#e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden',
    marginTop: '24px'
  },
  progressBar: {
    height: '100%',
    background: '#2563eb',
    borderRadius: '10px',
    transition: 'width 0.2s ease'
  },
  progressText: {
    fontSize: '13px',
    marginTop: '8px'
  },
  questionBox: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '22px',
    borderRadius: '12px',
    margin: '24px 0'
  },
  questionNumber: {
    color: '#64748b',
    fontSize: '12px',
    fontWeight: '700'
  },
  label: {
    display: 'block',
    fontWeight: '700',
    marginBottom: '8px'
  },
  textarea: {
    width: '100%',
    padding: '14px',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    resize: 'vertical',
    fontSize: '15px',
    lineHeight: '1.6',
    boxSizing: 'border-box'
  },
  savedHint: {
    fontSize: '12px',
    marginTop: '8px',
    color: '#64748b'
  },
  buttonRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '16px'
  },
  primaryButton: {
    padding: '11px 16px',
    background: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  secondaryButton: {
    padding: '11px 16px',
    background: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  sampleBox: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '20px'
  },
  tip: {
    marginTop: '12px',
    fontSize: '13px',
    color: '#166534'
  },
  statusMessage: {
    marginTop: '14px',
    fontSize: '13px',
    fontWeight: '600'
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginTop: '28px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0'
  },
  navButton: {
    padding: '9px 13px',
    background: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  counter: {
    color: '#64748b',
    fontSize: '13px'
  },
  resetButton: {
    marginTop: '20px',
    padding: '10px 14px',
    background: '#fff1f2',
    color: '#be123c',
    border: '1px solid #fecdd3',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer'
  }
}

export default MockInterview
