
import { useState, useEffect, useCallback } from 'react'

const resources = [
  {
    category: 'Java',
    icon: '☕',
    title: 'Core Java Fundamentals',
    level: 'Beginner',
    topics: ['OOP concepts', 'Classes and Objects', 'Inheritance', 'Exception Handling', 'Collections'],
    questions: [
      'What are the four pillars of OOP?',
      'What is method overloading?',
      'What is the difference between an interface and an abstract class?'
    ]
  },
  {
    category: 'SQL',
    icon: '🗄️',
    title: 'SQL and Database Concepts',
    level: 'Beginner',
    topics: ['SELECT queries', 'Joins', 'GROUP BY', 'Subqueries', 'Keys and Constraints'],
    questions: [
      'What is the difference between DELETE and TRUNCATE?',
      'Explain INNER JOIN and LEFT JOIN.',
      'What is database normalization?'
    ]
  },
  {
    category: 'React',
    icon: '⚛️',
    title: 'React Development',
    level: 'Intermediate',
    topics: ['Components', 'Props and State', 'useState', 'useEffect', 'API Fetching'],
    questions: [
      'What is the difference between props and state?',
      'What is a React Hook?',
      'How do you fetch data from an API in React?'
    ]
  },
  {
    category: 'Aptitude',
    icon: '🧠',
    title: 'Placement Aptitude',
    level: 'Practice',
    topics: ['Percentages', 'Ratios', 'Time and Work', 'Number Series', 'Logical Reasoning'],
    questions: [
      'A product costs ₹800 and has a 10% discount. What is its selling price?',
      'A person completes a task in 6 days. What fraction of the task is completed in one day at a constant rate?',
      'Find the next number: 2, 4, 8, 16, __.'
    ]
  },
  {
    category: 'HR',
    icon: '💼',
    title: 'HR Interview Preparation',
    level: 'All Levels',
    topics: ['Self Introduction', 'Strengths and Weaknesses', 'Career Goals', 'Project Explanation'],
    questions: [
      'Tell me about yourself.',
      'Why should we hire you?',
      'Explain a challenge you faced in your project and how you solved it.'
    ]
  }
]

const allTopics = resources.flatMap((resource) =>
  resource.topics.map((topic) => `${resource.category}::${topic}`)
)

function PlacementResources() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedResource, setSelectedResource] = useState(null)
  const [completedTopics, setCompletedTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingTopic, setSavingTopic] = useState('')
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')

  const loadProgress = useCallback(async () => {
    if (!token) {
      setError('Please log in again to load your learning progress.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        'http://localhost:8080/api/learning-progress',
        {
          headers: {
            Authorization: 'Bearer ' + token
          }
        }
      )

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? 'Your session may have expired. Please log in again.'
            : 'Could not load learning progress.'
        )
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('Unexpected learning progress response.')
      }

      const savedTopics = data
        .filter((item) => item.completed === true)
        .map((item) => item.topicId)
        .filter((topicId) => allTopics.includes(topicId))

      setCompletedTopics([...new Set(savedTopics)])
    } catch (err) {
      setError(err.message || 'Could not connect to backend.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  const filteredResources =
    selectedCategory === 'All'
      ? resources
      : resources.filter((item) => item.category === selectedCategory)

  const totalTopics = allTopics.length
  const completedCount = completedTopics.length
  const progress = Math.round((completedCount / totalTopics) * 100)

  const toggleTopic = async (category, topic) => {
    const topicId = `${category}::${topic}`
    const completed = !completedTopics.includes(topicId)

    setSavingTopic(topicId)
    setError('')

    try {
      const response = await fetch(
        `http://localhost:8080/api/learning-progress/${encodeURIComponent(topicId)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          },
          body: JSON.stringify({ completed })
        }
      )

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? 'Your session may have expired. Please log in again.'
            : 'Could not save this topic. Please try again.'
        )
      }

      setCompletedTopics((previous) =>
        completed
          ? [...new Set([...previous, topicId])]
          : previous.filter((item) => item !== topicId)
      )
    } catch (err) {
      setError(err.message || 'Could not connect to backend.')
    } finally {
      setSavingTopic('')
    }
  }

  const resetProgress = async () => {
    if (completedCount === 0 || savingTopic) return

    const confirmed = window.confirm(
      'Are you sure you want to reset all completed learning topics for your account?'
    )

    if (!confirmed) return

    setError('')
    setSavingTopic('__reset__')

    try {
      for (const topicId of completedTopics) {
        const response = await fetch(
          `http://localhost:8080/api/learning-progress/${encodeURIComponent(topicId)}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({ completed: false })
          }
        )

        if (!response.ok) {
          throw new Error('Some topics could not be reset. Please try again.')
        }
      }

      setCompletedTopics([])
    } catch (err) {
      setError(err.message || 'Could not reset learning progress.')
      await loadProgress()
    } finally {
      setSavingTopic('')
    }
  }

  return (
    <section style={styles.page}>
      <div style={styles.intro}>
        <span style={styles.eyebrow}>LEARN • PRACTICE • SUCCEED</span>
        <h2>Placement Resources</h2>
        <p>
          Explore important technical concepts and practise common
          placement interview questions.
        </p>
      </div>

      <div style={styles.stats}>
        <div style={styles.statCard}>
          <strong>{resources.length}</strong>
          <span>Learning Categories</span>
        </div>

        <div style={styles.statCard}>
          <strong>{completedCount} / {totalTopics}</strong>
          <span>Topics Completed</span>
        </div>

        <div style={styles.statCard}>
          <strong>{progress}%</strong>
          <span>Overall Learning Progress</span>
        </div>
      </div>

      <div style={styles.progressCard}>
        <div style={styles.progressHeader}>
          <h3>Your Learning Progress</h3>
          <span>{progress}%</span>
        </div>

        <div
          style={styles.progressTrack}
          role="progressbar"
          aria-label="Overall learning progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            style={{
              ...styles.progressBar,
              width: `${progress}%`
            }}
          />
        </div>

        <p style={styles.progressHint}>
          {loading
            ? 'Loading your saved progress...'
            : 'Your completed topics are saved to your account in the database.'}
        </p>

        <button
          style={styles.resetButton}
          onClick={resetProgress}
          disabled={completedCount === 0 || loading || Boolean(savingTopic)}
        >
          {savingTopic === '__reset__' ? 'Resetting...' : 'Reset Learning Progress'}
        </button>

        {error && (
          <div>
            <p role="alert" style={styles.errorMessage}>{error}</p>
            <button style={styles.retryButton} onClick={loadProgress}>
              Retry Loading
            </button>
          </div>
        )}
      </div>

      <div style={styles.filters}>
        {['All', 'Java', 'SQL', 'React', 'Aptitude', 'HR'].map((category) => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category)
              setSelectedResource(null)
            }}
            style={{
              ...styles.filterButton,
              ...(selectedCategory === category ? styles.activeFilter : {})
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div style={styles.grid}>
        {filteredResources.map((resource) => {
          const completedInCategory = resource.topics.filter((topic) =>
            completedTopics.includes(`${resource.category}::${topic}`)
          ).length

          return (
            <article key={resource.category} style={styles.card}>
              <div style={styles.cardTop}>
                <span style={styles.icon}>{resource.icon}</span>
                <span style={styles.level}>{resource.level}</span>
              </div>

              <h3>{resource.title}</h3>

              <p style={styles.description}>
                {resource.topics.length} important topics to study and revise.
              </p>

              <p style={styles.categoryProgress}>
                {completedInCategory} of {resource.topics.length} topics completed
              </p>

              <div style={styles.smallProgressTrack}>
                <div
                  style={{
                    ...styles.progressBar,
                    width: `${(completedInCategory / resource.topics.length) * 100}%`
                  }}
                />
              </div>

              <button
                style={styles.primaryButton}
                onClick={() => setSelectedResource(resource)}
              >
                Open Resources →
              </button>
            </article>
          )
        })}
      </div>

      {selectedResource && (
        <div style={styles.detailCard}>
          <div style={styles.detailHeader}>
            <div>
              <span style={styles.eyebrow}>
                {selectedResource.category.toUpperCase()} LEARNING PLAN
              </span>
              <h2>{selectedResource.title}</h2>
            </div>

            <button
              style={styles.closeButton}
              onClick={() => setSelectedResource(null)}
            >
              Close ✕
            </button>
          </div>

          <h3>Topics to Study</h3>

          {selectedResource.topics.map((topic) => {
            const topicId = `${selectedResource.category}::${topic}`
            const isDone = completedTopics.includes(topicId)

            return (
              <label key={topic} style={styles.topicRow}>
                <input
                  type="checkbox"
                  checked={isDone}
                  disabled={loading || Boolean(savingTopic)}
                  onChange={() =>
                    toggleTopic(selectedResource.category, topic)
                  }
                />

                <span
                  style={{
                    textDecoration: isDone ? 'line-through' : 'none',
                    color: isDone ? '#64748b' : '#334155'
                  }}
                >
                  {topic}
                </span>

                {savingTopic === topicId && (
                  <span style={styles.savingLabel}>Saving...</span>
                )}

                {isDone && <span style={styles.doneLabel}>Completed ✓</span>}
              </label>
            )
          })}

          <h3 style={{ marginTop: '26px' }}>Practice Questions</h3>

          <ol style={styles.questionList}>
            {selectedResource.questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>

          {selectedResource.category === 'Aptitude' && (
            <p style={styles.tip}>
              Answers: ₹720; one-sixth of the task; 32.
            </p>
          )}
        </div>
      )}
    </section>
  )
}

const styles = {
  page: { marginTop: '28px', maxWidth: '1100px' },
  intro: {
    background: '#ffffff',
    padding: '28px',
    border: '1px solid #e2e8f0',
    borderRadius: '16px'
  },
  eyebrow: {
    fontSize: '12px',
    color: '#2563eb',
    fontWeight: '700',
    letterSpacing: '1px'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '16px',
    marginTop: '20px'
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '18px'
  },
  progressCard: {
    marginTop: '20px',
    padding: '22px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px'
  },
  progressTrack: {
    height: '10px',
    marginTop: '14px',
    background: '#e2e8f0',
    borderRadius: '20px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    background: '#2563eb',
    borderRadius: '20px',
    transition: 'width 0.25s ease'
  },
  progressHint: { fontSize: '13px', marginTop: '10px' },
  resetButton: {
    marginTop: '16px',
    padding: '9px 13px',
    background: '#fff1f2',
    color: '#be123c',
    border: '1px solid #fecdd3',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  errorMessage: { marginTop: '12px', color: '#b91c1c', fontSize: '13px' },
  retryButton: {
    padding: '8px 12px',
    background: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    margin: '24px 0'
  },
  filterButton: {
    padding: '9px 16px',
    border: '1px solid #cbd5e1',
    borderRadius: '20px',
    background: '#ffffff',
    color: '#334155',
    cursor: 'pointer'
  },
  activeFilter: {
    background: '#2563eb',
    color: '#ffffff',
    borderColor: '#2563eb'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px'
  },
  card: {
    background: '#ffffff',
    padding: '22px',
    border: '1px solid #e2e8f0',
    borderRadius: '14px'
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '18px'
  },
  icon: { fontSize: '32px' },
  level: {
    background: '#eff6ff',
    color: '#1d4ed8',
    borderRadius: '20px',
    padding: '5px 9px',
    fontSize: '11px'
  },
  description: { margin: '12px 0', lineHeight: '1.6' },
  categoryProgress: { fontSize: '12px', marginBottom: '8px' },
  smallProgressTrack: {
    height: '6px',
    background: '#e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '18px'
  },
  primaryButton: {
    width: '100%',
    padding: '11px',
    border: 'none',
    borderRadius: '8px',
    background: '#2563eb',
    color: '#ffffff',
    cursor: 'pointer'
  },
  detailCard: {
    background: '#ffffff',
    padding: '26px',
    marginTop: '24px',
    border: '1px solid #e2e8f0',
    borderRadius: '14px'
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '24px'
  },
  closeButton: {
    background: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '9px 12px',
    cursor: 'pointer'
  },
  topicRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    padding: '11px 0',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer'
  },
  doneLabel: {
    marginLeft: 'auto',
    fontSize: '12px',
    color: '#15803d',
    fontWeight: '600'
  },
  savingLabel: { fontSize: '12px', color: '#2563eb' },
  questionList: {
    paddingLeft: '22px',
    lineHeight: '1.9',
    color: '#334155'
  },
  tip: {
    marginTop: '16px',
    padding: '14px',
    background: '#f0fdf4',
    borderRadius: '8px',
    color: '#166534'
  }
}

export default PlacementResources
