import { randomUUID } from 'node:crypto'
import { db } from './db'
import type {
  AnswerRecord,
  Game,
  GameStatus,
  Player,
  Question,
  QuestionConfig,
  QuestionType,
  Team
} from '#shared/types'

// ---------------------------------------------------------------------------
// Row <-> domain mapping
// ---------------------------------------------------------------------------

interface GameRow {
  id: string
  title: string
  pin: string | null
  status: string
  current_question_index: number
  result_delay_seconds: number
  paused: number
  created_at: number
  started_at: number | null
  finished_at: number | null
}

function mapGame(row: GameRow): Game {
  return {
    id: row.id,
    title: row.title,
    pin: row.pin,
    status: row.status as GameStatus,
    currentQuestionIndex: row.current_question_index,
    resultDelaySeconds: row.result_delay_seconds,
    paused: !!row.paused,
    createdAt: row.created_at,
    startedAt: row.started_at,
    finishedAt: row.finished_at
  }
}

interface QuestionRow {
  id: string
  game_id: string
  type: string
  text: string
  config: string
  time_limit: number
  points: number
  order_index: number
}

function mapQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    gameId: row.game_id,
    type: row.type as QuestionType,
    text: row.text,
    config: JSON.parse(row.config) as QuestionConfig,
    timeLimit: row.time_limit,
    points: row.points,
    order: row.order_index
  }
}

interface TeamRow {
  id: string
  game_id: string
  name: string
  color: string
  score: number
}

function mapTeam(row: TeamRow): Team {
  return { id: row.id, gameId: row.game_id, name: row.name, color: row.color, score: row.score }
}

interface PlayerRow {
  id: string
  game_id: string
  team_id: string | null
  name: string
  session_token: string
  connected: number
  joined_at: number
}

function mapPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    gameId: row.game_id,
    teamId: row.team_id,
    name: row.name,
    connected: !!row.connected,
    joinedAt: row.joined_at
  }
}

// ---------------------------------------------------------------------------
// Games
// ---------------------------------------------------------------------------

export function createGame(title: string): Game {
  const id = randomUUID()
  const now = Date.now()
  db.prepare(
    `INSERT INTO games (id, title, pin, status, current_question_index, result_delay_seconds, paused, created_at, started_at, finished_at)
     VALUES (?, ?, NULL, 'DRAFT', 0, 6, 0, ?, NULL, NULL)`
  ).run(id, title, now)
  return getGame(id)!
}

export function getGame(id: string): Game | null {
  const row = db.prepare('SELECT * FROM games WHERE id = ?').get(id) as GameRow | undefined
  return row ? mapGame(row) : null
}

export function getGameByPin(pin: string): Game | null {
  const row = db.prepare('SELECT * FROM games WHERE pin = ?').get(pin) as GameRow | undefined
  return row ? mapGame(row) : null
}

export function listGames(): Game[] {
  const rows = db.prepare('SELECT * FROM games ORDER BY created_at DESC').all() as GameRow[]
  return rows.map(mapGame)
}

export function updateGameTitle(id: string, title: string): void {
  db.prepare('UPDATE games SET title = ? WHERE id = ?').run(title, id)
}

export function updateGameStatus(id: string, status: GameStatus): void {
  db.prepare('UPDATE games SET status = ? WHERE id = ?').run(status, id)
}

export function setGamePin(id: string, pin: string): void {
  db.prepare('UPDATE games SET pin = ? WHERE id = ?').run(pin, id)
}

export function setGameStarted(id: string): void {
  db.prepare("UPDATE games SET status = 'ACTIVE', started_at = ? WHERE id = ?").run(Date.now(), id)
}

export function setGameFinished(id: string): void {
  db.prepare("UPDATE games SET status = 'FINISHED', finished_at = ? WHERE id = ?").run(Date.now(), id)
}

export function resetGameForRestart(id: string): void {
  db.prepare(
    "UPDATE games SET status = 'LOBBY', current_question_index = 0, paused = 0, started_at = NULL, finished_at = NULL WHERE id = ?"
  ).run(id)
}

export function setGamePaused(id: string, paused: boolean): void {
  db.prepare('UPDATE games SET paused = ? WHERE id = ?').run(paused ? 1 : 0, id)
}

export function setCurrentQuestionIndex(id: string, index: number): void {
  db.prepare('UPDATE games SET current_question_index = ? WHERE id = ?').run(index, id)
}

export function deleteGame(id: string): void {
  db.prepare('DELETE FROM games WHERE id = ?').run(id)
}

export function pinExists(pin: string): boolean {
  const row = db.prepare('SELECT 1 FROM games WHERE pin = ?').get(pin)
  return !!row
}

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

export function listQuestions(gameId: string): Question[] {
  const rows = db
    .prepare('SELECT * FROM questions WHERE game_id = ? ORDER BY order_index ASC')
    .all(gameId) as QuestionRow[]
  return rows.map(mapQuestion)
}

export function getQuestion(id: string): Question | null {
  const row = db.prepare('SELECT * FROM questions WHERE id = ?').get(id) as QuestionRow | undefined
  return row ? mapQuestion(row) : null
}

export function createQuestion(input: Omit<Question, 'id'>): Question {
  const id = randomUUID()
  db.prepare(
    `INSERT INTO questions (id, game_id, type, text, config, time_limit, points, order_index)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.gameId,
    input.type,
    input.text,
    JSON.stringify(input.config),
    input.timeLimit,
    input.points,
    input.order
  )
  return getQuestion(id)!
}

export function createQuestions(
  gameId: string,
  startOrder: number,
  inputs: Array<Omit<Question, 'id' | 'gameId' | 'order'>>
): Question[] {
  const ids = inputs.map(() => randomUUID())
  const insert = db.prepare(
    `INSERT INTO questions (id, game_id, type, text, config, time_limit, points, order_index)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
  const tx = db.transaction((rows: Array<{ id: string; input: Omit<Question, 'id' | 'gameId' | 'order'> }>) => {
    rows.forEach(({ id, input }, idx) => {
      insert.run(
        id,
        gameId,
        input.type,
        input.text,
        JSON.stringify(input.config),
        input.timeLimit,
        input.points,
        startOrder + idx
      )
    })
  })
  tx(inputs.map((input, i) => ({ id: ids[i]!, input })))
  return ids.map((id) => getQuestion(id)!)
}

export function updateQuestion(id: string, input: Omit<Question, 'id' | 'gameId'>): void {
  db.prepare(
    `UPDATE questions SET type = ?, text = ?, config = ?, time_limit = ?, points = ?, order_index = ? WHERE id = ?`
  ).run(input.type, input.text, JSON.stringify(input.config), input.timeLimit, input.points, input.order, id)
}

export function deleteQuestion(id: string): void {
  db.prepare('DELETE FROM questions WHERE id = ?').run(id)
}

export function deleteQuestions(ids: string[]): void {
  const stmt = db.prepare('DELETE FROM questions WHERE id = ?')
  const tx = db.transaction((idList: string[]) => {
    idList.forEach((id) => stmt.run(id))
  })
  tx(ids)
}

export function reorderQuestions(gameId: string, orderedIds: string[]): void {
  const stmt = db.prepare('UPDATE questions SET order_index = ? WHERE id = ? AND game_id = ?')
  const tx = db.transaction((ids: string[]) => {
    ids.forEach((qid, idx) => stmt.run(idx, qid, gameId))
  })
  tx(orderedIds)
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

export function listTeams(gameId: string): Team[] {
  const rows = db.prepare('SELECT * FROM teams WHERE game_id = ? ORDER BY rowid ASC').all(gameId) as TeamRow[]
  return rows.map(mapTeam)
}

export function getTeam(id: string): Team | null {
  const row = db.prepare('SELECT * FROM teams WHERE id = ?').get(id) as TeamRow | undefined
  return row ? mapTeam(row) : null
}

export function createTeam(gameId: string, name: string, color: string): Team {
  const id = randomUUID()
  db.prepare('INSERT INTO teams (id, game_id, name, color, score) VALUES (?, ?, ?, ?, 0)').run(
    id,
    gameId,
    name,
    color
  )
  return getTeam(id)!
}

export function updateTeam(id: string, fields: { name?: string; color?: string }): void {
  const current = getTeam(id)
  if (!current) return
  const name = fields.name ?? current.name
  const color = fields.color ?? current.color
  db.prepare('UPDATE teams SET name = ?, color = ? WHERE id = ?').run(name, color, id)
}

export function incrementTeamScore(id: string, delta: number): void {
  db.prepare('UPDATE teams SET score = MAX(0, score + ?) WHERE id = ?').run(delta, id)
}

export function resetTeamScores(gameId: string): void {
  db.prepare('UPDATE teams SET score = 0 WHERE game_id = ?').run(gameId)
}

export function deleteTeam(id: string): void {
  db.prepare('UPDATE players SET team_id = NULL WHERE team_id = ?').run(id)
  db.prepare('DELETE FROM teams WHERE id = ?').run(id)
}

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------

export function listPlayers(gameId: string): Player[] {
  const rows = db.prepare('SELECT * FROM players WHERE game_id = ? ORDER BY joined_at ASC').all(gameId) as PlayerRow[]
  return rows.map(mapPlayer)
}

export function getPlayer(id: string): Player | null {
  const row = db.prepare('SELECT * FROM players WHERE id = ?').get(id) as PlayerRow | undefined
  return row ? mapPlayer(row) : null
}

export function getPlayerByToken(token: string): Player | null {
  const row = db.prepare('SELECT * FROM players WHERE session_token = ?').get(token) as PlayerRow | undefined
  return row ? mapPlayer(row) : null
}

export function findPlayerByNameInGame(gameId: string, name: string): Player | null {
  const row = db
    .prepare('SELECT * FROM players WHERE game_id = ? AND LOWER(name) = LOWER(?)')
    .get(gameId, name) as PlayerRow | undefined
  return row ? mapPlayer(row) : null
}

export function createPlayer(gameId: string, name: string, teamId: string | null): { player: Player; token: string } {
  const id = randomUUID()
  const token = randomUUID()
  const now = Date.now()
  db.prepare(
    `INSERT INTO players (id, game_id, team_id, name, session_token, connected, joined_at)
     VALUES (?, ?, ?, ?, ?, 0, ?)`
  ).run(id, gameId, teamId, name, token, now)
  return { player: getPlayer(id)!, token }
}

export function setPlayerTeam(id: string, teamId: string | null): void {
  db.prepare('UPDATE players SET team_id = ? WHERE id = ?').run(teamId, id)
}

export function setPlayerConnected(id: string, connected: boolean): void {
  db.prepare('UPDATE players SET connected = ? WHERE id = ?').run(connected ? 1 : 0, id)
}

export function deletePlayer(id: string): void {
  db.prepare('DELETE FROM players WHERE id = ?').run(id)
}

// ---------------------------------------------------------------------------
// Answers
// ---------------------------------------------------------------------------

export function createAnswer(input: Omit<AnswerRecord, 'id'>): AnswerRecord {
  const id = randomUUID()
  db.prepare(
    `INSERT INTO answers (id, question_id, player_id, team_id, answer, correct, score, submitted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.questionId,
    input.playerId,
    input.teamId,
    JSON.stringify(input.answer),
    input.correct ? 1 : 0,
    input.score,
    input.submittedAt
  )
  return { ...input, id }
}

export function getAnswersForQuestion(questionId: string): AnswerRecord[] {
  const rows = db.prepare('SELECT * FROM answers WHERE question_id = ?').all(questionId) as {
    id: string
    question_id: string
    player_id: string
    team_id: string
    answer: string
    correct: number
    score: number
    submitted_at: number
  }[]
  return rows.map((r) => ({
    id: r.id,
    questionId: r.question_id,
    playerId: r.player_id,
    teamId: r.team_id,
    answer: JSON.parse(r.answer),
    correct: !!r.correct,
    score: r.score,
    submittedAt: r.submitted_at
  }))
}

export function deleteAnswersForQuestion(questionId: string): void {
  db.prepare('DELETE FROM answers WHERE question_id = ?').run(questionId)
}

export function deleteAnswersForGame(gameId: string): void {
  db.prepare('DELETE FROM answers WHERE question_id IN (SELECT id FROM questions WHERE game_id = ?)').run(gameId)
}

export function hasTeamAnsweredCorrectly(questionId: string, teamId: string): boolean {
  const row = db
    .prepare('SELECT 1 FROM answers WHERE question_id = ? AND team_id = ? AND correct = 1')
    .get(questionId, teamId)
  return !!row
}

// ---------------------------------------------------------------------------
// Sessions (Game Master auth)
// ---------------------------------------------------------------------------

export function createSession(): string {
  const token = randomUUID()
  db.prepare('INSERT INTO sessions (token, created_at) VALUES (?, ?)').run(token, Date.now())
  return token
}

export function isValidSession(token: string | undefined | null): boolean {
  if (!token) return false
  const row = db.prepare('SELECT 1 FROM sessions WHERE token = ?').get(token)
  return !!row
}

export function deleteSession(token: string): void {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
}
