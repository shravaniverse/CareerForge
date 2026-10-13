
import { useCallback, useEffect, useState } from 'react'

import ResumeAnalysis from './ResumeAnalysis.jsx'
import MockInterview from './MockInterview.jsx'
import PlacementResources from './PlacementResources.jsx'

function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState('Dashboard')
  const [profile, setProfile] = useState(null)
  const [profileMessage, setProfileMessage] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [interviewProgress, setInterviewProgress] = useState(0)
  const [resourceProgress, setResourceProgress] = useState(0)

  const token = localStorage.getItem('token')

  const loadInterviewProgress = useCallback(async () => {
    if (!token) {
      setInterviewProgress(0)
      return
    }

    try {
      const response = await fetch(
        'http://localhost:8080/api/mock-interview/summary',
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          cache: 'no-store'
        }
      )

      if (!response.ok) {
        console.error('Could not load interview progress:', response.status)
        return
      }

      const data = await response.json()
      const count = Number(data.completedCount)

      setInterviewProgress(
        Number.isFinite(count) ? Math.max(0, Math.min(6, count)) : 0
      )
    } catch (error) {
      console.error('Interview progress API error:', error)
    }
  }, [token])

  const loadResourceProgress = useCallback(async () => {
    if (!token) {
      setResourceProgress(0)
      return
    }

    try {
      const response = await fetch(
        'http://localhost:8080/api/learning-progress',
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          cache: 'no-store'
        }
      )

      if (!response.ok) {
        console.error('Could not load learning progress:', response.status)
        return
      }

      const data = await response.json()

      const count = Array.isArray(data)
        ? data.filter((item) => item.completed === true).length
        : 0

      setResourceProgress(Math.min(24, count))
    } catch (error) {
      console.error('Learning progress API error:', error)
    }
  }, [token])

  const refreshProgress = useCallback(() => {
    loadInterviewProgress()
    loadResourceProgress()
  }, [loadInterviewProgress, loadResourceProgress])

  useEffect(() => {
    refreshProgress()

    const handleFocus = () => {
      refreshProgress()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [refreshProgress, activePage])

  const loadProfile = async () => {
    if (!token) {
      setProfileMessage('Please log in again.')
      return
    }

    setLoadingProfile(true)
    setProfileMessage('')

    try {
      const response = await fetch('http://localhost:8080/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        setProfileMessage(data.message || 'Could not load profile.')
        return
      }

      setProfile({
        name: data.name || '',
        email: data.email || user?.email || '',
        phone: data.phone || '',
        college: data.college || '',
        degree: data.degree || '',
        graduationYear: data.graduationYear ?? ''
      })
    } catch {
      setProfileMessage('Could not connect to backend.')
    } finally {
      setLoadingProfile(false)
    }
  }

  const saveProfile = async (event) => {
    event.preventDefault()

    if (!profile || !token) {
      setProfileMessage('Please log in again.')
      return
    }

    setSavingProfile(true)
    setProfileMessage('')

    try {
      const response = await fetch('http://localhost:8080/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          college: profile.college,
          degree: profile.degree,
          graduationYear: profile.graduationYear
            ? Number(profile.graduationYear)
            : null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setProfileMessage(data.message || 'Could not update profile.')
        return
      }

      setProfile((previous) => ({
        ...previous,
        ...data,
        email: previous.email
      }))

      setProfileMessage('Profile updated successfully!')
    } catch {
      setProfileMessage('Could not connect to backend.')
    } finally {
      setSavingProfile(false)
    }
  }

  const openPage = (page) => {
    setActivePage(page)

    if (page === 'My Profile') {
      setProfile(null)
      loadProfile()
    }

    if (page === 'Dashboard') {
      refreshProgress()
    }
  }

  const features = [
    {
      title: 'My Profile',
      description: 'Manage your personal and academic details.',
      icon: '👤',
      color: '#e0e7ff'
    },
    {
      title: 'Resume Analysis',
      description: 'Upload your resume and check job skill matches.',
      icon: '📄',
      color: '#dbeafe'
    },
    {
      title: 'Mock Interview',
      description: 'Practise interview questions and improve confidence.',
      icon: '🎯',
      color: '#fef3c7'
    },
    {
      title: 'Placement Resources',
      description: 'Prepare Java, SQL, aptitude and technical topics.',
      icon: '📚',
      color: '#dcfce7'
    }
  ]

  const menuItems = [
    'Dashboard',
    'My Profile',
    'Resume Analysis',
    'Mock Interview',
    'Placement Resources'
  ]

  const interviewTotal = 6
  const resourceTotal = 24

  const interviewPercent = Math.min(
    100,
    Math.round((interviewProgress / interviewTotal) * 100)
  )

  const resourcePercent = Math.min(
    100,
    Math.round((resourceProgress / resourceTotal) * 100)
  )

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>CareerForge</h2>
        <p style={styles.menuTitle}>WORKSPACE</p>

        <nav style={styles.navigation}>
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => openPage(item)}
              style={{
                ...styles.menuButton,
                background: activePage === item ? '#dbeafe' : 'transparent',
                color: activePage === item ? '#1d4ed8' : '#475569',
                fontWeight: activePage === item ? '700' : '500'
              }}
            >
              {item === 'Dashboard' && '⌂ '}
              {item === 'My Profile' && '👤 '}
              {item === 'Resume Analysis' && '📄 '}
              {item === 'Mock Interview' && '🎯 '}
              {item === 'Placement Resources' && '📚 '}
              {item}
            </button>
          ))}
        </nav>

        <div style={styles.sidebarBottom}>
          <p style={styles.sidebarHint}>
            Small steps every day bring you closer to your dream job.
          </p>

          <button style={styles.logout} onClick={onLogout}>
            ↪ Logout
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>YOUR CAREER JOURNEY</p>
            <h1 style={styles.pageTitle}>{activePage}</h1>
            <p style={styles.subtitle}>
              Welcome to your placement preparation workspace.
            </p>
          </div>

          <div style={styles.userBadge}>
            <span style={styles.avatar}>👋</span>
            <div>
              <strong>{profile?.name || user?.name || 'Student'}</strong>
              <p style={styles.userRole}>Student</p>
            </div>
          </div>
        </header>

        {activePage === 'Dashboard' && (
          <>
            <section style={styles.welcome}>
              <div style={styles.welcomeText}>
                <p style={styles.welcomeEyebrow}>READY TO LEVEL UP?</p>
                <h2>Hello, {profile?.name || user?.name || 'Student'}!</h2>
                <p style={styles.welcomeDescription}>
                  Build your skills, strengthen your resume, and prepare
                  confidently for your dream job.
                </p>

                <button
                  style={styles.primaryButton}
                  onClick={() => openPage('Mock Interview')}
                >
                  Continue Preparation →
                </button>
              </div>

              <div style={styles.welcomeIcon}>🚀</div>
            </section>

            <section style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statTop}>
                  <span style={styles.statIcon}>🎯</span>
                  <span style={styles.statLabel}>MOCK INTERVIEW</span>
                </div>

                <h2 style={styles.statNumber}>
                  {interviewProgress}
                  <span style={styles.statTotal}> / {interviewTotal}</span>
                </h2>

                <p style={styles.statDescription}>Questions attempted</p>

                <div style={styles.progressTrack}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${interviewPercent}%`,
                      background: '#2563eb'
                    }}
                  />
                </div>

                <p style={styles.progressText}>
                  {interviewPercent}% completed
                </p>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statTop}>
                  <span style={styles.statIcon}>📚</span>
                  <span style={styles.statLabel}>LEARNING RESOURCES</span>
                </div>

                <h2 style={styles.statNumber}>
                  {resourceProgress}
                  <span style={styles.statTotal}> / {resourceTotal}</span>
                </h2>

                <p style={styles.statDescription}>Topics marked complete</p>

                <div style={styles.progressTrack}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${resourcePercent}%`,
                      background: '#16a34a'
                    }}
                  />
                </div>

                <p style={styles.progressText}>
                  {resourcePercent}% completed
                </p>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statTop}>
                  <span style={styles.statIcon}>💼</span>
                  <span style={styles.statLabel}>CAREER READINESS</span>
                </div>

                <h2 style={styles.statHeading}>Keep going!</h2>
                <p style={styles.statDescription}>
                  Every practice session helps you improve.
                </p>

                <button
                  style={styles.textButton}
                  onClick={() => openPage('Resume Analysis')}
                >
                  Check your resume →
                </button>
              </div>
            </section>

            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Your Preparation Tools</h2>
              <p style={styles.sectionDescription}>
                Everything you need to prepare for placements in one place.
              </p>
            </div>

            <section style={styles.grid}>
              {features.map((feature) => (
                <div key={feature.title} style={styles.card}>
                  <div
                    style={{
                      ...styles.featureIcon,
                      background: feature.color
                    }}
                  >
                    {feature.icon}
                  </div>

                  <h3 style={styles.featureTitle}>{feature.title}</h3>
                  <p style={styles.featureDescription}>
                    {feature.description}
                  </p>

                  <button
                    style={styles.cardButton}
                    onClick={() => openPage(feature.title)}
                  >
                    Open {feature.title === 'My Profile' ? 'Profile' : 'Tool'} →
                  </button>
                </div>
              ))}
            </section>

            <section style={styles.tipCard}>
              <span style={styles.tipIcon}>💡</span>
              <div>
                <h3 style={styles.tipTitle}>Preparation tip</h3>
                <p style={styles.tipDescription}>
                  Practise a few interview questions every day and revise
                  completed learning topics regularly. Consistency matters!
                </p>
              </div>
            </section>
          </>
        )}

        {activePage === 'My Profile' && (
          <section style={styles.contentCard}>
            <h2>My Profile</h2>
            <p style={styles.contentDescription}>
              Keep your personal and academic information up to date.
            </p>

            {loadingProfile && <p>Loading your profile...</p>}

            {profile && (
              <form onSubmit={saveProfile} style={styles.form}>
                <label>
                  Full Name
                  <input
                    style={styles.input}
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Email Address
                  <input
                    style={styles.input}
                    type="email"
                    value={profile.email}
                    readOnly
                  />
                </label>

                <label>
                  Phone
                  <input
                    style={styles.input}
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                </label>

                <label>
                  College
                  <input
                    style={styles.input}
                    value={profile.college}
                    onChange={(e) =>
                      setProfile({ ...profile, college: e.target.value })
                    }
                    placeholder="Enter college name"
                  />
                </label>

                <label>
                  Degree
                  <input
                    style={styles.input}
                    value={profile.degree}
                    onChange={(e) =>
                      setProfile({ ...profile, degree: e.target.value })
                    }
                    placeholder="e.g. B.Tech - AIML"
                  />
                </label>

                <label>
                  Graduation Year
                  <input
                    style={styles.input}
                    type="number"
                    min="2000"
                    max="2100"
                    value={profile.graduationYear}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        graduationYear: e.target.value
                      })
                    }
                    placeholder="e.g. 2027"
                  />
                </label>

                <button
                  style={styles.primaryButton}
                  type="submit"
                  disabled={savingProfile}
                >
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            )}

            {profileMessage && (
              <p style={styles.profileMessage}>{profileMessage}</p>
            )}

            {!profile && !loadingProfile && (
              <button style={styles.primaryButton} onClick={loadProfile}>
                Load Profile
              </button>
            )}
          </section>
        )}

        {activePage === 'Resume Analysis' && <ResumeAnalysis />}

        {activePage === 'Mock Interview' && (
          <MockInterview key={user?.email || 'current-user'} />
        )}

        {activePage === 'Placement Resources' && <PlacementResources />}
      </main>
    </div>
  )
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f1f5fb',
    color: '#172033',
    fontFamily: "system-ui, 'Segoe UI', Arial, sans-serif"
  },
  sidebar: {
    width: '250px',
    minHeight: '100vh',
    padding: '28px 18px 20px',
    background: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0
  },
  logo: {
    color: '#1d4ed8',
    fontSize: '25px',
    margin: '0 0 36px',
    letterSpacing: '-0.8px'
  },
  menuTitle: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '800',
    letterSpacing: '1.3px',
    margin: '0 0 12px 10px'
  },
  navigation: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px'
  },
  menuButton: {
    padding: '13px 12px',
    border: 'none',
    borderRadius: '9px',
    textAlign: 'left',
    fontSize: '14px',
    cursor: 'pointer'
  },
  sidebarBottom: {
    marginTop: 'auto',
    paddingTop: '30px'
  },
  sidebarHint: {
    padding: '14px',
    borderRadius: '10px',
    background: '#f1f5f9',
    color: '#64748b',
    fontSize: '12px',
    lineHeight: 1.7,
    marginBottom: '14px'
  },
  logout: {
    width: '100%',
    padding: '12px',
    background: '#fff1f2',
    color: '#be123c',
    border: '1px solid #ffe4e6',
    borderRadius: '9px',
    cursor: 'pointer',
    fontWeight: '600',
    textAlign: 'left'
  },
  main: {
    flex: 1,
    padding: '32px',
    minWidth: 0
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '26px'
  },
  eyebrow: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: '1.5px',
    marginBottom: '7px'
  },
  pageTitle: {
    color: '#172554',
    fontSize: '32px',
    margin: '0 0 7px',
    letterSpacing: '-0.7px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b'
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#ffffff',
    padding: '12px 17px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px'
  },
  avatar: {
    display: 'grid',
    placeItems: 'center',
    width: '40px',
    height: '40px',
    background: '#dbeafe',
    borderRadius: '50%',
    fontSize: '21px'
  },
  userRole: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '3px'
  },
  welcome: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    padding: '30px',
    background: 'linear-gradient(120deg, #dbeafe, #eff6ff)',
    border: '1px solid #bfdbfe',
    borderRadius: '18px'
  },
  welcomeText: {
    flex: '1 1 300px'
  },
  welcomeEyebrow: {
    color: '#1d4ed8',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '1.4px',
    marginBottom: '10px'
  },
  welcomeIcon: {
    fontSize: '68px',
    padding: '10px 24px'
  },
  welcomeDescription: {
    maxWidth: '560px',
    lineHeight: 1.8,
    marginBottom: '22px',
    color: '#475569'
  },
  primaryButton: {
    padding: '12px 17px',
    background: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '18px',
    marginTop: '22px'
  },
  statCard: {
    padding: '22px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    minWidth: 0
  },
  statTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '18px'
  },
  statIcon: {
    fontSize: '22px'
  },
  statLabel: {
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '0.8px',
    color: '#64748b'
  },
  statNumber: {
    fontSize: '32px',
    margin: '0 0 4px',
    color: '#172554'
  },
  statTotal: {
    fontSize: '17px',
    color: '#94a3b8',
    fontWeight: '500'
  },
  statHeading: {
    fontSize: '23px',
    margin: '0 0 9px'
  },
  statDescription: {
    color: '#64748b',
    fontSize: '13px',
    marginBottom: '16px',
    lineHeight: 1.6
  },
  progressTrack: {
    height: '7px',
    background: '#e2e8f0',
    borderRadius: '20px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '20px',
    transition: 'width 0.3s ease'
  },
  progressText: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '9px'
  },
  textButton: {
    padding: '0',
    border: 'none',
    background: 'transparent',
    color: '#2563eb',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '13px'
  },
  sectionHeader: {
    marginTop: '32px',
    marginBottom: '18px'
  },
  sectionTitle: {
    fontSize: '23px',
    margin: '0 0 7px'
  },
  sectionDescription: {
    color: '#64748b',
    fontSize: '13px',
    lineHeight: 1.6
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px'
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '22px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    minWidth: 0
  },
  featureIcon: {
    display: 'grid',
    placeItems: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    fontSize: '24px',
    marginBottom: '18px'
  },
  featureTitle: {
    fontSize: '17px',
    margin: '0 0 9px'
  },
  featureDescription: {
    color: '#64748b',
    fontSize: '13px',
    lineHeight: 1.8,
    minHeight: '46px',
    marginBottom: '20px'
  },
  cardButton: {
    marginTop: 'auto',
    padding: '10px 13px',
    background: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #dbeafe',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '13px'
  },
  tipCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    marginTop: '24px',
    padding: '20px',
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '12px'
  },
  tipIcon: {
    fontSize: '25px'
  },
  tipTitle: {
    fontSize: '15px',
    margin: '0 0 6px'
  },
  tipDescription: {
    color: '#78716c',
    fontSize: '13px',
    lineHeight: 1.7
  },
  contentCard: {
    marginTop: '10px',
    padding: '28px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    maxWidth: '750px',
    boxSizing: 'border-box'
  },
  contentDescription: {
    color: '#64748b',
    fontSize: '14px',
    marginBottom: '20px',
    lineHeight: 1.7
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '20px'
  },
  input: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '7px',
    padding: '12px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#ffffff',
    color: '#172033'
  },
  profileMessage: {
    marginTop: '16px',
    fontSize: '14px',
    color: '#166534'
  }
}

export default Dashboard
