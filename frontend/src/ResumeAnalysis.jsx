import { useEffect, useState } from 'react'

const API = 'http://localhost:8080/api/resumes'

const JOB_ROLES = [
  'Java Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'AI/ML Engineer',
  'Software Engineer',
]

function ResumeAnalysis() {
  const [resumes, setResumes] = useState([])
  const [file, setFile] = useState(null)
  const [jobRole, setJobRole] = useState('Java Developer')
  const [jobDescription, setJobDescription] = useState('')
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem('token')

  const readResponse = async (response) => {
    const text = await response.text()

    try {
      return text ? JSON.parse(text) : {}
    } catch {
      return { message: text || 'Unexpected server response.' }
    }
  }

  const loadResumes = async (preferredId = '') => {
    try {
      const response = await fetch(API, {
        headers: { Authorization: 'Bearer ' + token },
      })

      const data = await readResponse(response)

      if (!response.ok) {
        setMessage(data.message || 'Could not load resumes.')
        return
      }

      if (!Array.isArray(data)) {
        setMessage('Unexpected response while loading resumes.')
        return
      }

      setResumes(data)

      const preferredExists = data.some(
        (resume) => String(resume.id) === String(preferredId)
      )

      const currentExists = data.some(
        (resume) => String(resume.id) === String(selectedResumeId)
      )

      if (preferredExists) {
        setSelectedResumeId(String(preferredId))
      } else if (!currentExists) {
        setSelectedResumeId(data.length ? String(data[0].id) : '')
      }
    } catch {
      setMessage('Could not connect to the backend.')
    }
  }

  useEffect(() => {
    loadResumes()
  }, [])

  const uploadResume = async (e) => {
    e.preventDefault()

    if (!file) {
      setMessage('Please select a PDF resume.')
      return
    }

    if (
      file.type !== 'application/pdf' ||
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      setMessage('Please select a valid PDF file.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage('The PDF must be 10 MB or smaller.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    setMessage('')
    setAnalysis(null)

    try {
      const response = await fetch(API + '/upload', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: formData,
      })

      const data = await readResponse(response)

      if (!response.ok) {
        setMessage(data.message || 'Resume upload failed.')
        return
      }

      setFile(null)
      setMessage('Resume uploaded successfully!')
      await loadResumes(data.id || '')
    } catch {
      setMessage('Could not connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  const analyzeResume = async (e) => {
    e.preventDefault()

    if (!selectedResumeId) {
      setMessage('Please upload or select a resume first.')
      return
    }

    if (!JOB_ROLES.includes(jobRole)) {
      setMessage('Please select a valid job role.')
      return
    }

    setLoading(true)
    setMessage('')
    setAnalysis(null)

    try {
      const response = await fetch(
        `${API}/${selectedResumeId}/analyze`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({
            jobRole,
            jobDescription: jobDescription.trim(),
          }),
        }
      )

      const data = await readResponse(response)

      if (!response.ok) {
        setMessage(data.message || 'Resume analysis failed.')
        return
      }

      setAnalysis(data)
      setMessage('Resume analysis completed!')
    } catch {
      setMessage('Could not connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  const matchedSkills = Array.isArray(analysis?.matchedSkills)
    ? analysis.matchedSkills
    : []

  const missingSkills = Array.isArray(analysis?.missingSkills)
    ? analysis.missingSkills
    : []

  const recommendations = Array.isArray(analysis?.recommendations)
    ? analysis.recommendations
    : []

  const percentage = Math.max(
    0,
    Math.min(100, Number(analysis?.matchPercentage) || 0)
  )

  // Display the backend's calculated percentage consistently.
  const atsScore = percentage

  const scoreLabel =
    atsScore >= 80
      ? 'Strong skill match'
      : atsScore >= 60
        ? 'Moderate skill match'
        : 'Needs improvement'

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <span style={styles.eyebrow}>CAREER DEVELOPMENT</span>

        <h2 style={styles.pageTitle}>Resume Analysis</h2>

        <p style={styles.subtitle}>
          Compare your resume with your target job role, discover matching
          skills, and identify skills you may need to develop.
        </p>
      </header>

      <section style={styles.card}>
        <div style={styles.sectionHeading}>
          <span style={styles.step}>01</span>

          <div>
            <h3 style={styles.cardTitle}>Upload your resume</h3>
            <p style={styles.helper}>
              Choose a PDF file up to 10 MB.
            </p>
          </div>
        </div>

        <form onSubmit={uploadResume} style={styles.form}>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={styles.fileInput}
          />

          {file && (
            <p style={styles.helper}>
              Selected: {file.name} (
              {(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Please wait...' : 'Upload Resume'}
          </button>
        </form>
      </section>

      <section style={styles.card}>
        <div style={styles.sectionHeading}>
          <span style={styles.step}>02</span>

          <div>
            <h3 style={styles.cardTitle}>Choose your target job</h3>
            <p style={styles.helper}>
              You don't need to know the required skills in advance.
              Select a role and we'll compare your resume against its
              predefined skill list.
            </p>
          </div>
        </div>

        <form onSubmit={analyzeResume} style={styles.form}>
          <label style={styles.label}>
            Select uploaded resume

            <select
              value={selectedResumeId}
              onChange={(e) => {
                setSelectedResumeId(e.target.value)
                setAnalysis(null)
              }}
              style={styles.input}
              required
            >
              <option value="">Select a resume</option>

              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.fileName}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Target job role

            <select
              value={jobRole}
              onChange={(e) => {
                setJobRole(e.target.value)
                setAnalysis(null)
              }}
              style={styles.input}
              required
            >
              {JOB_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Job description (optional)

            <textarea
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value)
                setAnalysis(null)
              }}
              placeholder="Paste the job description here to include additional recognized skills in the comparison. You can leave this empty."
              rows={6}
              style={styles.textarea}
            />

            <span style={styles.fieldHint}>
              Don't have a job description? No problem. Your selected
              job role is enough to run the analysis.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || !resumes.length}
            style={{
              ...styles.button,
              opacity: loading || !resumes.length ? 0.65 : 1,
            }}
          >
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </button>
        </form>
      </section>

      {message && (
        <div
          role="status"
          style={{
            ...styles.message,
            ...(/failed|could not|please|unexpected|no readable/i.test(message)
              ? styles.errorMessage
              : styles.successMessage),
          }}
        >
          {message}
        </div>
      )}

      {analysis && (
        <section style={styles.results}>
          <span style={styles.eyebrow}>YOUR RESULTS</span>

          <h3 style={styles.resultsTitle}>Resume Analysis Report</h3>

          <p style={styles.helper}>
            Resume: {analysis.fileName || 'Selected resume'}
          </p>

          <div style={styles.roleTag}>
            Target role: {analysis.jobRole || jobRole}
          </div>

          <div style={styles.scoreGrid}>
            <div style={styles.scoreCard}>
              <span style={styles.scoreLabel}>
                Estimated ATS Match Score
              </span>

              <div style={styles.atsScore}>{atsScore}/100</div>

              <div style={styles.track}>
                <div
                  style={{
                    ...styles.atsFill,
                    width: atsScore + '%',
                  }}
                />
              </div>

              <strong style={styles.scoreStatus}>{scoreLabel}</strong>

              <p style={styles.helper}>
                Estimated match based on the skills detected in your resume
                compared with your selected job role and recognized
                job-description keywords.
              </p>
            </div>

            <div style={styles.scoreCard}>
              <span style={styles.scoreLabel}>Overall Skill Match</span>

              <div style={styles.matchScore}>{percentage}%</div>

              <div style={styles.track}>
                <div
                  style={{
                    ...styles.matchFill,
                    width: percentage + '%',
                  }}
                />
              </div>

              <p style={styles.helper}>
                Match against the role skill list and any additional
                recognized skills from the job description.
              </p>
            </div>
          </div>

          <div style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
              <span style={styles.summaryLabel}>Matched Skills</span>
              <strong style={styles.matchedCount}>
                {matchedSkills.length}
              </strong>
            </div>

            <div style={styles.summaryCard}>
              <span style={styles.summaryLabel}>Skills to Review</span>
              <strong style={styles.missingCount}>
                {missingSkills.length}
              </strong>
            </div>
          </div>

          <SkillSection
            title="Matched Skills"
            description="These keywords were found in your resume."
            skills={matchedSkills}
            matched
          />

          <SkillSection
            title="Skills to Improve"
            description="Review these skills against the job requirements. Add them to your resume only if you genuinely have the relevant knowledge or experience."
            skills={missingSkills}
          />

          {recommendations.length > 0 && (
            <div style={styles.recommendations}>
              <h4 style={styles.skillTitle}>Recommendations</h4>

              <ul style={styles.recommendationList}>
                {recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={styles.notice}>
            <strong>Important Scoring Note</strong>

            <p>
              This is a keyword-based estimate, not an official ATS score
              or an AI evaluation. The analyzer checks a predefined set
              of skills and recognized keywords in your resume. It does
              not evaluate writing quality, document formatting, actual
              proficiency, or recruiter decisions.
            </p>
          </div>
        </section>
      )}
    </div>
  )
}

function SkillSection({
  title,
  description,
  skills,
  matched = false,
}) {
  return (
    <div style={styles.skillSection}>
      <h4 style={styles.skillTitle}>{title}</h4>

      <p style={styles.helper}>{description}</p>

      {skills.length ? (
        <div style={styles.skillList}>
          {skills.map((skill) => (
            <span
              key={skill}
              style={matched ? styles.matchedBadge : styles.missingBadge}
            >
              {matched ? '✓ ' : ''}
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p style={styles.emptyState}>
          {matched
            ? 'No matching skills found.'
            : 'No missing skills from the checked list.'}
        </p>
      )}
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '1000px',
    margin: '0 auto',
    color: '#172033',
    boxSizing: 'border-box',
  },
  header: { marginBottom: '28px' },
  eyebrow: {
    color: '#3563d9',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '1.5px',
  },
  pageTitle: { fontSize: '30px', margin: '8px 0' },
  subtitle: {
    color: '#64748b',
    lineHeight: 1.7,
    maxWidth: '680px',
    margin: 0,
  },
  card: {
    background: '#fff',
    padding: '26px',
    borderRadius: '14px',
    marginBottom: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 16px rgba(15,23,42,.035)',
    boxSizing: 'border-box',
  },
  sectionHeading: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '20px',
  },
  step: {
    background: '#edf2ff',
    color: '#315bd5',
    borderRadius: '9px',
    padding: '9px 10px',
    fontWeight: '800',
    fontSize: '13px',
  },
  cardTitle: { margin: '0 0 5px', fontSize: '18px' },
  helper: {
    color: '#64748b',
    fontSize: '13px',
    lineHeight: 1.7,
    margin: '6px 0 12px',
    overflowWrap: 'anywhere',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  fileInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px',
    border: '1px dashed #b8c7e0',
    borderRadius: '10px',
    background: '#f8faff',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    padding: '13px',
    marginTop: '9px',
    border: '1px solid #cbd5e1',
    borderRadius: '9px',
    fontSize: '14px',
    background: '#fff',
    color: '#172033',
  },
  textarea: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    padding: '13px',
    marginTop: '9px',
    border: '1px solid #cbd5e1',
    borderRadius: '9px',
    fontSize: '14px',
    lineHeight: 1.7,
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  fieldHint: {
    display: 'block',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: '400',
    lineHeight: 1.6,
    marginTop: '8px',
  },
  button: {
    alignSelf: 'flex-start',
    padding: '12px 19px',
    background: '#285bd4',
    color: '#fff',
    border: 'none',
    borderRadius: '9px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
  },
  message: {
    margin: '16px 0',
    padding: '13px 15px',
    borderRadius: '9px',
    fontSize: '14px',
  },
  successMessage: {
    color: '#166534',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
  },
  errorMessage: {
    color: '#b91c1c',
    background: '#fef2f2',
    border: '1px solid #fecaca',
  },
  results: {
    background: '#fff',
    border: '1px solid #dbe5f3',
    borderRadius: '16px',
    padding: '28px',
    marginTop: '28px',
    boxShadow: '0 8px 28px rgba(15,23,42,.05)',
    boxSizing: 'border-box',
  },
  resultsTitle: { margin: '8px 0', fontSize: '23px' },
  roleTag: {
    display: 'inline-block',
    padding: '9px 13px',
    margin: '5px 0 12px',
    borderRadius: '8px',
    background: '#edf2ff',
    color: '#315bd5',
    fontSize: '13px',
    fontWeight: '700',
  },
  scoreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginTop: '22px',
  },
  scoreCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '13px',
    padding: '20px',
    background: '#f8faff',
    minWidth: 0,
  },
  scoreLabel: {
    color: '#475569',
    fontSize: '14px',
    fontWeight: '700',
  },
  atsScore: {
    color: '#285bd4',
    fontSize: '42px',
    fontWeight: '800',
    margin: '12px 0',
  },
  matchScore: {
    color: '#16845b',
    fontSize: '42px',
    fontWeight: '800',
    margin: '12px 0',
  },
  track: {
    height: '9px',
    background: '#dfe7f6',
    borderRadius: '20px',
    overflow: 'hidden',
    margin: '12px 0',
  },
  atsFill: {
    height: '100%',
    background: '#3568e8',
    borderRadius: '20px',
  },
  matchFill: {
    height: '100%',
    background: '#16845b',
    borderRadius: '20px',
  },
  scoreStatus: { fontSize: '13px', color: '#334155' },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
    margin: '20px 0 10px',
  },
  summaryCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    padding: '18px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
  },
  summaryLabel: {
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '600',
  },
  matchedCount: { color: '#16845b', fontSize: '29px' },
  missingCount: { color: '#b7791f', fontSize: '29px' },
  skillSection: {
    padding: '22px 0',
    borderTop: '1px solid #edf0f5',
  },
  skillTitle: { fontSize: '16px', margin: '0 0 8px' },
  skillList: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  matchedBadge: {
    padding: '9px 13px',
    background: '#eaf7ef',
    color: '#176b48',
    border: '1px solid #c7ebd5',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
  },
  missingBadge: {
    padding: '9px 13px',
    background: '#fff8e9',
    color: '#8a5a13',
    border: '1px solid #f1dfb5',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
  },
  emptyState: {
    color: '#64748b',
    fontSize: '13px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '8px',
  },
  recommendations: {
    padding: '20px',
    marginTop: '10px',
    background: '#f5f8ff',
    border: '1px solid #dbe5f3',
    borderRadius: '10px',
  },
  recommendationList: {
    color: '#475569',
    fontSize: '13px',
    lineHeight: 1.8,
    paddingLeft: '20px',
    marginBottom: 0,
  },
  notice: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px',
    color: '#475569',
    fontSize: '13px',
    lineHeight: 1.7,
    marginTop: '18px',
  },
}

export default ResumeAnalysis
