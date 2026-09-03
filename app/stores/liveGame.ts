import { defineStore } from 'pinia'
import type {
  Game,
  LeaderboardEntry,
  Player,
  QuestionEndedPayload,
  QuestionStartedPayload,
  SelfState,
  ServerMessage,
  Team
} from '#shared/types'

export const useLiveGameStore = defineStore('liveGame', () => {
  const game = ref<Game | null>(null)
  const teams = ref<Team[]>([])
  const players = ref<Player[]>([])
  const self = ref<SelfState | null>(null)
  const totalQuestions = ref(0)
  const currentQuestion = ref<QuestionStartedPayload | null>(null)
  const lastResults = ref<QuestionEndedPayload | null>(null)
  const leaderboard = ref<LeaderboardEntry[]>([])
  const finalLeaderboard = ref<LeaderboardEntry[] | null>(null)
  const myTeamLocked = ref(false)
  const answeredTeamIds = ref<Set<string>>(new Set())
  const answerAck = ref<{ correct: boolean; locked: boolean; message: string; scoreAwarded?: number } | null>(null)
  const lastTeamAnswered = ref<{ teamId: string; correct: boolean; answeredByName?: string } | null>(null)
  const kicked = ref<string | null>(null)
  const cancelled = ref<string | null>(null)
  const lastError = ref<string | null>(null)

  const myTeam = computed(() => self.value?.team ?? null)

  function reset() {
    game.value = null
    teams.value = []
    players.value = []
    self.value = null
    totalQuestions.value = 0
    currentQuestion.value = null
    lastResults.value = null
    leaderboard.value = []
    finalLeaderboard.value = null
    myTeamLocked.value = false
    answeredTeamIds.value = new Set()
    answerAck.value = null
    lastTeamAnswered.value = null
    kicked.value = null
    cancelled.value = null
    lastError.value = null
  }

  function applyServerMessage(msg: ServerMessage) {
    switch (msg.type) {
      case 'STATE_SYNC': {
        game.value = msg.state.game
        teams.value = msg.state.teams
        players.value = msg.state.players
        self.value = msg.state.self
        totalQuestions.value = msg.state.totalQuestions
        currentQuestion.value = msg.state.currentQuestion
        lastResults.value = msg.state.lastResults
        leaderboard.value = msg.state.leaderboard
        myTeamLocked.value = msg.state.myTeamLocked
        answeredTeamIds.value = new Set(msg.state.lockedTeamIds)
        break
      }
      case 'PLAYER_JOINED': {
        if (!players.value.find((p) => p.id === msg.player.id)) players.value.push(msg.player)
        break
      }
      case 'PLAYER_LEFT': {
        players.value = players.value.filter((p) => p.id !== msg.playerId)
        break
      }
      case 'PLAYER_UPDATED': {
        const idx = players.value.findIndex((p) => p.id === msg.player.id)
        if (idx >= 0) players.value[idx] = msg.player
        else players.value.push(msg.player)
        if (self.value && self.value.player.id === msg.player.id) {
          self.value = {
            player: msg.player,
            team: msg.player.teamId ? teams.value.find((t) => t.id === msg.player.teamId) ?? null : null
          }
        }
        break
      }
      case 'TEAM_CREATED': {
        if (!teams.value.find((t) => t.id === msg.team.id)) teams.value.push(msg.team)
        break
      }
      case 'TEAM_UPDATED': {
        const idx = teams.value.findIndex((t) => t.id === msg.team.id)
        if (idx >= 0) teams.value[idx] = msg.team
        else teams.value.push(msg.team)
        if (self.value?.team?.id === msg.team.id) self.value = { ...self.value, team: msg.team }
        break
      }
      case 'TEAM_DELETED': {
        teams.value = teams.value.filter((t) => t.id !== msg.teamId)
        if (self.value?.team?.id === msg.teamId) self.value = { ...self.value, team: null }
        break
      }
      case 'GAME_STARTED': {
        if (game.value) game.value = { ...game.value, status: 'ACTIVE', startedAt: msg.startedAt }
        break
      }
      case 'QUESTION_STARTED': {
        currentQuestion.value = msg.payload
        lastResults.value = null
        myTeamLocked.value = false
        answeredTeamIds.value = new Set()
        answerAck.value = null
        lastTeamAnswered.value = null
        if (game.value) {
          game.value = { ...game.value, status: 'QUESTION_ACTIVE', currentQuestionIndex: msg.payload.index, paused: false }
        }
        break
      }
      case 'ANSWER_ACK': {
        answerAck.value = {
          correct: msg.correct,
          locked: msg.locked,
          message: msg.message,
          scoreAwarded: msg.scoreAwarded
        }
        if (msg.locked) myTeamLocked.value = true
        break
      }
      case 'TEAM_ANSWERED': {
        lastTeamAnswered.value = { teamId: msg.teamId, correct: msg.correct, answeredByName: msg.answeredByName }
        if (msg.correct) {
          answeredTeamIds.value = new Set(answeredTeamIds.value).add(msg.teamId)
          if (self.value?.team?.id === msg.teamId) myTeamLocked.value = true
        }
        break
      }
      case 'QUESTION_ENDED': {
        lastResults.value = msg.payload
        leaderboard.value = msg.payload.leaderboard
        if (game.value) game.value = { ...game.value, status: 'QUESTION_RESULTS' }
        for (const tr of msg.payload.teamResults) {
          const t = teams.value.find((team) => team.id === tr.teamId)
          if (t) t.score = tr.totalScore
        }
        break
      }
      case 'GAME_PAUSED': {
        if (game.value) game.value = { ...game.value, paused: true }
        break
      }
      case 'GAME_RESUMED': {
        if (game.value) game.value = { ...game.value, paused: false }
        break
      }
      case 'GAME_FINISHED': {
        leaderboard.value = msg.leaderboard
        finalLeaderboard.value = msg.leaderboard
        if (game.value) game.value = { ...game.value, status: 'FINISHED' }
        break
      }
      case 'GAME_CANCELLED': {
        cancelled.value = msg.message
        break
      }
      case 'KICKED': {
        kicked.value = msg.message
        break
      }
      case 'ERROR': {
        lastError.value = msg.message
        break
      }
    }
  }

  return {
    game,
    teams,
    players,
    self,
    myTeam,
    totalQuestions,
    currentQuestion,
    lastResults,
    leaderboard,
    finalLeaderboard,
    myTeamLocked,
    answeredTeamIds,
    answerAck,
    lastTeamAnswered,
    kicked,
    cancelled,
    lastError,
    applyServerMessage,
    reset
  }
})
