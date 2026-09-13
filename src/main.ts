import './style.css'

type Task = { id: number; text: string; done: boolean; tag: string }
type DailyRecord = { date: string; completed: number; total: number; focusMinutes: number; mood: string }
type DaymarkState = { tasks: Task[]; note: string; mood: string; focusMinutes: number; date: string; history?: DailyRecord[]; intentionHistory?: string[] }

const today = new Date()
const dateKey = today.toISOString().slice(0, 10)
const dateLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(today)
const getCookie = (name: string) => document.cookie.split('; ').find((entry) => entry.startsWith(`${name}=`))?.split('=').slice(1).join('=')
const setCookie = (name: string, value: string) => { document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=31536000; Path=/; SameSite=Lax` }
const saved = localStorage.getItem('daymark-state')
let state: DaymarkState
try {
  state = saved ? JSON.parse(saved) : {
    tasks: [
      { id: 1, text: 'Write the next physical step for your priority', done: false, tag: 'priority' },
      { id: 2, text: 'Clear one small piece of friction', done: false, tag: 'admin' },
      { id: 3, text: 'Choose a real stopping point for today', done: false, tag: 'life' },
    ],
    note: '', mood: 'steady', focusMinutes: 0, date: dateKey,
  }
} catch {
  state = { tasks: [], note: '', mood: 'steady', focusMinutes: 0, date: dateKey }
}

if (!state.tasks) state.tasks = []
if (!state.note) state.note = ''
if (!state.mood) state.mood = 'steady'
if (!state.history) state.history = []
if (!state.intentionHistory) state.intentionHistory = []
const cookieMood = getCookie('daymark-mood')
if (cookieMood && ['scattered', 'low-key', 'steady', 'bright'].includes(cookieMood)) state.mood = cookieMood

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character] ?? character))
const defaultTasks: Task[] = [
  { id: 1, text: 'Write the next physical step for your priority', done: false, tag: 'priority' },
  { id: 2, text: 'Clear one small piece of friction', done: false, tag: 'admin' },
  { id: 3, text: 'Choose a real stopping point for today', done: false, tag: 'life' },
]
const legacyTaskText: Record<string, string> = {
  'Choose the one thing that makes today count': 'Write the next physical step for your priority',
  'Give your inbox a ten-minute pass': 'Clear one small piece of friction',
  'Make space for something that restores you': 'Choose a real stopping point for today',
}
state.tasks = state.tasks.map((task) => legacyTaskText[task.text] ? { ...task, text: legacyTaskText[task.text] } : task)
if (state.tasks.length === 0) state.tasks = defaultTasks

if (!state.date) state.date = dateKey
if (state.focusMinutes === undefined) state.focusMinutes = 0

if (state.date !== dateKey) {
  state.history.unshift({ date: state.date, completed: state.tasks.filter((task) => task.done).length, total: state.tasks.length, focusMinutes: state.focusMinutes, mood: state.mood })
  state.history = state.history.slice(0, 30)
  state.tasks = state.tasks.map((task) => ({ ...task, done: false }))
  state.focusMinutes = 0
  state.note = ''
  state.mood = 'steady'
  state.date = dateKey
  localStorage.setItem('daymark-state', JSON.stringify(state))
}

const app = document.querySelector<HTMLDivElement>('#app')!
let timerSeconds = 25 * 60
let timerRunning = false
let timerId: number | undefined
const savedTimerPreset = Number(getCookie('daymark-timer'))
let timerPreset = [5, 25, 50].includes(savedTimerPreset) ? savedTimerPreset : 25
let hasPainted = false
const dailyCues = ['Start smaller than your ambition.', 'Protect the first good hour.', 'One clear thing is enough.', 'Leave a little room for surprise.', 'Progress can be quiet.', 'Return to what is in front of you.', 'Let today be useful, not perfect.']
const moodGuidance: Record<string, { cue: string; suggestion: string; preset: number }> = {
  scattered: { cue: 'Make the next step visible, then stop there.', suggestion: 'Try a five-minute reset.', preset: 5 },
  'low-key': { cue: 'A gentle pace is still a pace.', suggestion: 'Try twenty-five quiet minutes.', preset: 25 },
  steady: { cue: 'One clear thing is enough.', suggestion: 'Try a twenty-five-minute stretch.', preset: 25 },
  bright: { cue: 'Use the good energy on what matters most.', suggestion: 'Try a fifty-minute deep dive.', preset: 50 },
}
const guidance = moodGuidance[state.mood] ?? { cue: dailyCues[today.getDay()], suggestion: 'Choose a focus length.', preset: 25 }

const persist = () => localStorage.setItem('daymark-state', JSON.stringify(state))
const completed = () => state.tasks.filter((task) => task.done).length
const notificationStatus = () => 'Notification' in window ? Notification.permission : 'unsupported'
const rememberedIntentions = () => [...new Set((state.intentionHistory ?? []).filter((text) => text.length > 2))].slice(-6).reverse()
const updateTimerDisplay = () => {
  const minutes = Math.floor(timerSeconds / 60).toString().padStart(2, '0')
  const seconds = (timerSeconds % 60).toString().padStart(2, '0')
  const timerValue = document.querySelector<HTMLElement>('#timer-value')
  const timerLabel = document.querySelector<HTMLElement>('#timer-label')
  const timerTrack = document.querySelector<HTMLElement>('#timer-track-fill')
  const statusDot = document.querySelector<HTMLElement>('.status-dot')
  if (timerValue) timerValue.textContent = `${minutes}:${seconds}`
  if (timerLabel) timerLabel.textContent = timerRunning ? 'in focus' : 'ready when you are'
  if (timerTrack) timerTrack.style.width = `${Math.max(3, (timerSeconds / (timerPreset * 60)) * 100)}%`
  statusDot?.classList.toggle('active', timerRunning)
}
const activeDays = () => (state.history?.filter((record) => record.completed > 0 || record.focusMinutes > 0).length ?? 0) + (completed() > 0 || state.focusMinutes > 0 ? 1 : 0)
const records = () => [...(state.history ?? [])].reverse().concat({ date: dateKey, completed: completed(), total: state.tasks.length, focusMinutes: state.focusMinutes, mood: state.mood })
const statistics = () => {
  const all = records()
  const totalFocus = all.reduce((sum, record) => sum + record.focusMinutes, 0)
  const totalCompleted = all.reduce((sum, record) => sum + record.completed, 0)
  const totalPlanned = all.reduce((sum, record) => sum + record.total, 0)
  const moods = all.reduce<Record<string, number>>((counts, record) => { counts[record.mood] = (counts[record.mood] ?? 0) + 1; return counts }, {})
  const favoriteMood = Object.entries(moods).sort((first, second) => second[1] - first[1])[0]?.[0] ?? 'steady'
  const bestFocus = Math.max(0, ...all.map((record) => record.focusMinutes))
  const averageFocus = all.length ? Math.round(totalFocus / all.length) : 0
  const bestFocusDay = all.find((record) => record.focusMinutes === bestFocus)?.date ?? dateKey
  return { all, totalFocus, totalCompleted, totalPlanned, completionRate: totalPlanned ? Math.round((totalCompleted / totalPlanned) * 100) : 0, favoriteMood, bestFocus, averageFocus, bestFocusDay }
}
const render = () => {
  document.body.dataset.mood = state.mood
  document.body.dataset.static = hasPainted ? 'true' : 'false'
  const percent = state.tasks.length ? Math.round((completed() / state.tasks.length) * 100) : 0
  const minutes = Math.floor(timerSeconds / 60).toString().padStart(2, '0')
  const seconds = (timerSeconds % 60).toString().padStart(2, '0')
  const pulse = Array.from({ length: 7 }, (_, index) => index === 6 ? completed() > 0 || state.focusMinutes > 0 : Boolean(state.history?.[6 - index]?.completed || state.history?.[6 - index]?.focusMinutes))
  const stats = statistics()
  const chartRecords = stats.all.slice(-14)
  const maxFocus = Math.max(1, ...chartRecords.map((record) => record.focusMinutes))
  const recentIntentions = rememberedIntentions()
  const intentionPlaceholder = recentIntentions[0] ? `Continue with: ${recentIntentions[0]}` : 'Add a concrete intention...'
  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="/" aria-label="Daymark home"><span class="brand-mark">D</span><span>daymark</span></a>
      <div class="top-mood" aria-label="How are you arriving?"><span>Today</span>${['scattered', 'low-key', 'steady', 'bright'].map((mood) => `<button class="mood ${state.mood === mood ? 'selected' : ''}" data-mood="${mood}" title="Arriving ${mood}"><span>${mood === 'scattered' ? '◌' : mood === 'low-key' ? '—' : mood === 'steady' ? '○' : '✦'}</span><b>${mood}</b></button>`).join('')}</div>
      <div class="top-actions"><span class="saved-state">Saved on this device</span><button class="icon-button" id="stats" title="View private statistics" aria-label="View private statistics">◒</button><button class="icon-button" id="help" title="How Daymark works" aria-label="How Daymark works">?</button><button class="icon-button" id="export" title="Export your day" aria-label="Export your day">↓</button><button class="avatar" title="Your local profile" aria-label="Your local profile">A</button></div>
    </header>
    <main>
      <section class="intro reveal">
        <div><p class="eyebrow">${dateLabel}</p><h1>Make room for<br><em>what matters.</em></h1><p class="subhead">A small, private place to choose your focus and move through the day with less noise.</p><div class="daily-cue"><span>Today / ${state.mood}</span><em>${guidance.cue}</em></div><div class="mood-status"><span class="mood-signal-dot"></span><strong>${state.mood}</strong><span>${guidance.suggestion}</span></div></div>
        <div class="day-score"><div class="score-ring" style="--progress:${percent * 3.6}deg"><strong>${percent}%</strong><span>in motion</span></div><p>${completed()} of ${state.tasks.length} intentions complete</p></div>
      </section>
      <div class="workspace">
        <section class="panel intentions-panel reveal delay-1">
          <div class="panel-heading"><div><p class="eyebrow">01 / intentions</p><h2>What would feel good<br>to finish?</h2></div><div class="heading-tools"><span class="count">${completed()}/${state.tasks.length}</span><button class="text-button" id="clear-completed">Clear done</button></div></div>
          <div class="task-list">${state.tasks.length ? state.tasks.map((task) => `<label class="task ${task.done ? 'is-done' : ''}"><input type="checkbox" data-task="${task.id}" aria-label="Complete ${escapeHtml(task.text)}" ${task.done ? 'checked' : ''}><span class="checkbox"></span><span class="task-text">${escapeHtml(task.text)}</span><span class="tag ${task.tag}">${task.tag}</span><button type="button" class="remove-task" data-remove="${task.id}" aria-label="Remove ${escapeHtml(task.text)}">×</button></label>`).join('') : '<div class="empty-tasks"><span>○</span><p>Your list is clear.</p><small>Add one thing worth making room for.</small></div>'}</div>
          <form class="add-task" id="task-form"><input id="task-input" aria-label="New intention" placeholder="${escapeHtml(intentionPlaceholder)}" maxlength="80"><button type="submit" title="Add intention" aria-label="Add intention">+</button></form><div class="suggestions"><span>${recentIntentions.length ? 'Your repeats' : 'Try one'}</span>${(recentIntentions.length ? recentIntentions : ['Reply to one important message', 'Take a real lunch break', 'Put tomorrow in motion']).map((suggestion) => `<button type="button" class="suggestion" data-suggestion="${escapeHtml(suggestion)}">${escapeHtml(suggestion)}</button>`).join('')}</div>
        </section>
        <aside class="side-column">
          <section class="panel focus-panel reveal delay-2"><div class="panel-heading compact"><div><p class="eyebrow">02 / focus</p><h2>One clear stretch</h2></div><span class="status-dot ${timerRunning ? 'active' : ''}"></span></div><div class="timer"><span class="timer-label" id="timer-label">${timerRunning ? 'in focus' : 'ready when you are'}</span><strong id="timer-value">${minutes}:${seconds}</strong><div class="timer-track"><span id="timer-track-fill" style="width:${Math.max(3, (timerSeconds / (timerPreset * 60)) * 100)}%"></span></div></div><p class="focus-nudge">${guidance.suggestion}</p><div class="timer-presets">${[25, 50, 5].map((preset) => `<button class="preset ${timerPreset === preset ? 'selected' : ''}" data-preset="${preset}">${preset} min</button>`).join('')}</div><div class="timer-actions"><button class="primary-button" id="timer-toggle">${timerRunning ? 'Pause' : 'Start focus'}</button><button class="quiet-button" id="timer-reset">Reset</button></div><div class="alert-setting"><span>Finished-session alerts</span><button class="text-button" id="notifications">${notificationStatus() === 'granted' ? 'On' : notificationStatus() === 'denied' ? 'Blocked' : notificationStatus() === 'unsupported' ? 'Unavailable' : 'Enable'}</button></div><p class="microcopy">${state.focusMinutes ? `${state.focusMinutes} focused minutes logged today. ` : ''}No account. No tracking.</p></section>
          <section class="panel note-panel reveal delay-3"><div class="panel-heading compact"><div><p class="eyebrow">03 / unload</p><h2>Clear your head</h2></div><span class="note-icon">✳</span></div><textarea id="note" placeholder="The thought I don't want to carry around..." maxlength="240">${escapeHtml(state.note)}</textarea><div class="note-footer"><span>${state.note.length}/240</span><span>private by default</span></div></section>
        </aside>
      </div>
      <section class="today-strip reveal delay-3"><div><strong>${completed()}</strong><span>done today</span></div><div><strong>${state.focusMinutes}</strong><span>focused minutes</span></div><div><strong>${activeDays()}</strong><span>days in motion</span></div></section>
      <section class="week-pulse reveal delay-3"><div><p class="eyebrow">Your recent rhythm</p><p class="pulse-copy">Small returns count.</p></div><div class="pulse-days" aria-label="Seven day activity"><span class="pulse-label">7 days ago</span>${pulse.map((active) => `<i class="pulse-dot ${active ? 'active' : ''}"></i>`).join('')}<span class="pulse-label">today</span></div></section>
      <section class="ad-slot" aria-label="Sponsor space"><span>SPACE FOR A THOUGHTFUL SPONSOR</span><span>Tools that help you do less, better.</span></section>
    </main>
    <div class="help-dialog" id="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title"><div class="help-card"><button class="close-help" id="close-help" aria-label="Close help">×</button><p class="eyebrow">A little orientation</p><h2 id="help-title">Your day, in one quiet place.</h2><p>Choose a few intentions, give one thing your full attention, and unload the thoughts that keep circling. Daymark saves everything only in this browser.</p><div class="help-list"><span><b>01</b> Intentions are your shortlist, not a guilt list.</span><span><b>02</b> Pick a focus length that fits the moment.</span><span><b>03</b> Export anytime. Clear everything when you leave.</span></div><button class="primary-button" id="close-help-action">Got it</button></div></div>
    <div class="stats-dialog" id="stats-dialog" role="dialog" aria-modal="true" aria-labelledby="stats-title"><div class="stats-card"><button class="close-help" id="close-stats" aria-label="Close statistics">×</button><p class="eyebrow">Private statistics / 30 days</p><h2 id="stats-title">Notice your rhythm.</h2><p class="stats-intro">Useful patterns, kept on this device. No tracking, no comparison.</p><div class="stats-grid"><div><strong>${stats.totalFocus}</strong><span>focused minutes</span></div><div><strong>${stats.totalCompleted}</strong><span>intentions complete</span></div><div><strong>${stats.completionRate}%</strong><span>completion rate</span></div><div><strong>${activeDays()}</strong><span>active days</span></div><div><strong>${stats.averageFocus}</strong><span>average focus / day</span></div><div><strong>${stats.bestFocusDay === dateKey ? 'today' : stats.bestFocusDay.slice(5)}</strong><span>best focus day</span></div></div><div class="chart-heading"><span>Focus minutes</span><small>last ${chartRecords.length} days</small></div><div class="focus-chart">${chartRecords.map((record) => `<div class="chart-column" title="${record.focusMinutes} focused minutes"><span class="chart-bar" style="height:${Math.max(record.focusMinutes ? 10 : 3, (record.focusMinutes / maxFocus) * 100)}%"></span></div>`).join('')}</div><div class="favorite-mood"><span>Most common arrival</span><strong>${stats.favoriteMood}</strong></div><div class="stats-note">${state.intentionHistory?.length ?? 0} intentions remembered for future planning</div><button class="primary-button" id="close-stats-action">Close</button></div></div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div><footer><span>DAYMARK / A quiet tool for noisy days</span><button id="clear-data">Clear local data</button></footer>`
  bindEvents()
  hasPainted = true
}

const bindEvents = () => {
  const showToast = (message: string) => { const toast = document.querySelector('#toast'); if (!toast) return; toast.textContent = message; toast.classList.add('show'); window.setTimeout(() => toast.classList.remove('show'), 2400) }
  document.querySelectorAll<HTMLInputElement>('[data-task]').forEach((input) => input.addEventListener('change', () => {
    const task = state.tasks.find((item) => item.id === Number(input.dataset.task))
    if (task) task.done = input.checked
    persist(); render(); showToast(input.checked ? 'Marked complete.' : 'Back on your list.')
  }))
  document.querySelectorAll<HTMLButtonElement>('[data-remove]').forEach((button) => button.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); state.tasks = state.tasks.filter((task) => task.id !== Number(button.dataset.remove)); persist(); render(); showToast('Removed from today.') }))
  document.querySelector<HTMLFormElement>('#task-form')?.addEventListener('submit', (event) => {
    event.preventDefault()
    const input = document.querySelector<HTMLInputElement>('#task-input')!
    if (!input.value.trim()) return
    const text = input.value.trim()
    state.tasks.push({ id: Date.now(), text, done: false, tag: 'today' })
    state.intentionHistory = [...(state.intentionHistory ?? []), text].slice(-40)
    persist(); render(); requestAnimationFrame(() => document.querySelector<HTMLInputElement>('#task-input')?.focus())
  })
  document.querySelectorAll<HTMLButtonElement>('[data-suggestion]').forEach((button) => button.addEventListener('click', () => { const text = button.dataset.suggestion ?? ''; state.tasks.push({ id: Date.now(), text, done: false, tag: 'today' }); state.intentionHistory = [...(state.intentionHistory ?? []), text].slice(-40); persist(); render(); showToast('Added to today.') }))
  document.querySelector('#clear-completed')?.addEventListener('click', () => { state.tasks = state.tasks.filter((task) => !task.done); persist(); render() })
  document.querySelector<HTMLTextAreaElement>('#note')?.addEventListener('input', (event) => { state.note = (event.target as HTMLTextAreaElement).value; persist(); const count = document.querySelector('.note-footer span'); if (count) count.textContent = `${state.note.length}/240` })
  document.querySelectorAll<HTMLButtonElement>('[data-mood]').forEach((button) => button.addEventListener('click', () => { state.mood = button.dataset.mood ?? 'steady'; setCookie('daymark-mood', state.mood); timerPreset = moodGuidance[state.mood]?.preset ?? 25; setCookie('daymark-timer', String(timerPreset)); timerRunning = false; window.clearInterval(timerId); timerSeconds = timerPreset * 60; persist(); render() }))
  document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((button) => button.addEventListener('click', () => { timerRunning = false; window.clearInterval(timerId); timerPreset = Number(button.dataset.preset); setCookie('daymark-timer', String(timerPreset)); timerSeconds = timerPreset * 60; render() }))
  document.querySelector('#timer-toggle')?.addEventListener('click', () => { timerRunning = !timerRunning; if (timerRunning) timerId = window.setInterval(() => { timerSeconds = Math.max(0, timerSeconds - 1); if (timerSeconds === 0) { state.focusMinutes += timerPreset; persist(); timerRunning = false; window.clearInterval(timerId); render(); showToast(`${timerPreset} focused minutes logged.`); if (notificationStatus() === 'granted') new Notification('Daymark: focus complete', { body: `${timerPreset} minutes are yours. Take a breath before the next thing.`, tag: 'daymark-focus-complete' }); return } updateTimerDisplay() }, 1000); else window.clearInterval(timerId); updateTimerDisplay(); const toggle = document.querySelector<HTMLButtonElement>('#timer-toggle'); if (toggle) toggle.textContent = timerRunning ? 'Pause' : 'Start focus'; showToast(timerRunning ? 'Focus mode started.' : 'Focus paused.') })
  document.querySelector('#timer-reset')?.addEventListener('click', () => { timerRunning = false; window.clearInterval(timerId); timerSeconds = timerPreset * 60; render() })
  document.querySelector('#notifications')?.addEventListener('click', async () => { if (!('Notification' in window)) { showToast('Browser alerts are not available here.'); return } const permission = await Notification.requestPermission(); render(); showToast(permission === 'granted' ? 'Focus alerts are on.' : 'Alerts stayed off.') })
  document.querySelector('#export')?.addEventListener('click', () => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `daymark-${dateKey}.json`; link.click(); URL.revokeObjectURL(link.href) })
  document.querySelector('#clear-data')?.addEventListener('click', () => { if (confirm('Clear your Daymark data from this device?')) { localStorage.removeItem('daymark-state'); location.reload() } })
  document.querySelector('#help')?.addEventListener('click', () => { document.querySelector('#help-dialog')?.classList.add('open') })
  document.querySelector('#close-help')?.addEventListener('click', () => { document.querySelector('#help-dialog')?.classList.remove('open') })
  document.querySelector('#close-help-action')?.addEventListener('click', () => { document.querySelector('#help-dialog')?.classList.remove('open') })
  document.querySelector('#stats')?.addEventListener('click', () => { document.querySelector('#stats-dialog')?.classList.add('open') })
  document.querySelector('#close-stats')?.addEventListener('click', () => { document.querySelector('#stats-dialog')?.classList.remove('open') })
  document.querySelector('#close-stats-action')?.addEventListener('click', () => { document.querySelector('#stats-dialog')?.classList.remove('open') })
  window.onkeydown = (event) => { if (event.key === 'Escape') { document.querySelector('#help-dialog')?.classList.remove('open'); document.querySelector('#stats-dialog')?.classList.remove('open') } if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return; if (event.key === '/') { event.preventDefault(); document.querySelector<HTMLInputElement>('#task-input')?.focus() } if (event.key.toLowerCase() === 'f') document.querySelector<HTMLButtonElement>('#timer-toggle')?.click(); if (event.key === '?') document.querySelector<HTMLButtonElement>('#help')?.click(); if (event.key.toLowerCase() === 's') document.querySelector<HTMLButtonElement>('#stats')?.click() }
}

render()
