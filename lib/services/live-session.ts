/**
 * Live Learning Service
 * 
 * Comprehensive service for live learning sessions including:
 * - WebRTC video conferencing with peer connections
 * - Supabase Realtime messaging and Q&A
 * - Breakout room management
 * - Session recording capabilities
 * - Collaborative whiteboard state management
 * 
 * Architecture:
 * - Simple Peer for WebRTC abstraction
 * - Supabase Realtime for signaling and messaging
 * - MediaRecorder API for recording
 * - Canvas API for whiteboard (handled in component)
 */

import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { logger } from '@/lib/utils/logger'

// =====================================================
// Types & Interfaces
// =====================================================

export interface LiveSession {
  id: string
  title: string
  instructorId: string
  courseId?: string
  scheduledStart: Date
  scheduledEnd: Date
  status: 'scheduled' | 'live' | 'ended'
  maxParticipants: number
  currentParticipants: number
  settings: SessionSettings
  createdAt: Date
}

export interface SessionSettings {
  allowChat: boolean
  allowQA: boolean
  allowScreenShare: boolean
  allowRecording: boolean
  allowBreakoutRooms: boolean
  waitingRoom: boolean
  muteOnJoin: boolean
  videoOnJoin: boolean
}

export interface Participant {
  id: string
  userId: string
  sessionId: string
  displayName: string
  role: 'instructor' | 'student' | 'moderator'
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isScreenSharing: boolean
  isHandRaised: boolean
  breakoutRoomId?: string
  joinedAt: Date
}

export interface ChatMessage {
  id: string
  sessionId: string
  userId: string
  displayName: string
  message: string
  timestamp: Date
  type: 'text' | 'system' | 'file'
  replyTo?: string
}

export interface QAQuestion {
  id: string
  sessionId: string
  userId: string
  displayName: string
  question: string
  timestamp: Date
  upvotes: number
  isAnswered: boolean
  answer?: string
  answeredBy?: string
  answeredAt?: Date
}

export interface BreakoutRoom {
  id: string
  sessionId: string
  name: string
  participants: string[] // participant IDs
  duration: number // minutes
  createdAt: Date
  expiresAt: Date
}

export interface WhiteboardState {
  sessionId: string
  elements: WhiteboardElement[]
  version: number
  lastModifiedBy: string
  lastModifiedAt: Date
}

export interface WhiteboardElement {
  id: string
  type: 'path' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text'
  data: any
  color: string
  strokeWidth: number
  userId: string
  timestamp: Date
}

// =====================================================
// Live Session Management
// =====================================================

export class LiveSessionService {
  private supabaseClient = supabase
  private channel: RealtimeChannel | null = null
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private localStream: MediaStream | null = null
  private mediaRecorder: MediaRecorder | null = null
  private recordedChunks: Blob[] = []

  /**
   * Create a new live session
   */
  async createSession(
    title: string,
    instructorId: string,
    scheduledStart: Date,
    scheduledEnd: Date,
    settings: SessionSettings,
    courseId?: string
  ): Promise<LiveSession> {
    const { data, error } = await this.supabaseClient
      .from('live_sessions')
      .insert({
        title,
        instructor_id: instructorId,
        course_id: courseId,
        scheduled_start: scheduledStart.toISOString(),
        scheduled_end: scheduledEnd.toISOString(),
        status: 'scheduled',
        max_participants: 100,
        current_participants: 0,
        settings,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      title: data.title,
      instructorId: data.instructor_id,
      courseId: data.course_id,
      scheduledStart: new Date(data.scheduled_start),
      scheduledEnd: new Date(data.scheduled_end),
      status: data.status,
      maxParticipants: data.max_participants,
      currentParticipants: data.current_participants,
      settings: data.settings,
      createdAt: new Date(data.created_at),
    }
  }

  /**
   * Join a live session
   */
  async joinSession(
    sessionId: string,
    userId: string,
    displayName: string,
    role: 'instructor' | 'student' | 'moderator' = 'student'
  ): Promise<Participant> {
    const { data, error } = await this.supabaseClient
      .from('session_participants')
      .insert({
        session_id: sessionId,
        user_id: userId,
        display_name: displayName,
        role,
        is_audio_enabled: false,
        is_video_enabled: false,
        is_screen_sharing: false,
        is_hand_raised: false,
      })
      .select()
      .single()

    if (error) throw error

    // Subscribe to session channel
    await this.subscribeToSession(sessionId)

    // Increment participant count
    await this.supabaseClient.rpc('increment_session_participants', { session_id: sessionId })

    return {
      id: data.id,
      userId: data.user_id,
      sessionId: data.session_id,
      displayName: data.display_name,
      role: data.role,
      isAudioEnabled: data.is_audio_enabled,
      isVideoEnabled: data.is_video_enabled,
      isScreenSharing: data.is_screen_sharing,
      isHandRaised: data.is_hand_raised,
      joinedAt: new Date(data.joined_at),
    }
  }

  /**
   * Leave a session
   */
  async leaveSession(sessionId: string, participantId: string): Promise<void> {
    // Remove participant
    await this.supabaseClient
      .from('session_participants')
      .delete()
      .eq('id', participantId)

    // Decrement count
    await this.supabaseClient.rpc('decrement_session_participants', { session_id: sessionId })

    // Clean up peer connections
    this.cleanupPeerConnections()

    // Unsubscribe
    if (this.channel) {
      await this.supabaseClient.removeChannel(this.channel)
      this.channel = null
    }
  }

  /**
   * Subscribe to session realtime updates
   */
  private async subscribeToSession(sessionId: string): Promise<void> {
    this.channel = this.supabaseClient.channel(`session:${sessionId}`)

    // Subscribe to presence for participant tracking
    this.channel
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel?.presenceState()
        logger.debug('[Live Session] Presence sync', { state })
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        logger.info('[Live Session] User joined', { newPresences })
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        logger.info('[Live Session] User left', { leftPresences })
      })

    // Subscribe to broadcast events (signaling, etc.)
    this.channel
      .on('broadcast', { event: 'signal' }, ({ payload }) => {
        this.handleSignal(payload)
      })
      .on('broadcast', { event: 'whiteboard' }, ({ payload }) => {
        // Whiteboard updates handled in component
      })

    await this.channel.subscribe()
  }

  /**
   * Handle WebRTC signaling
   */
  private handleSignal(signal: any): void {
    const { from, type, data } = signal

    switch (type) {
      case 'offer':
        this.handleOffer(from, data)
        break
      case 'answer':
        this.handleAnswer(from, data)
        break
      case 'ice-candidate':
        this.handleIceCandidate(from, data)
        break
    }
  }

  /**
   * Start local media stream
   */
  async startMediaStream(constraints: MediaStreamConstraints = { video: true, audio: true }): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      return this.localStream
    } catch (error) {
      console.error('[Live Session] Failed to get media:', error)
      throw error
    }
  }

  /**
   * Stop local media stream
   */
  stopMediaStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }
  }

  /**
   * Toggle audio
   */
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }

  /**
   * Toggle video
   */
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(): Promise<MediaStream> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      })

      // Replace video track in peer connections
      const videoTrack = screenStream.getVideoTracks()[0]
      this.peerConnections.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
        if (sender) {
          sender.replaceTrack(videoTrack)
        }
      })

      return screenStream
    } catch (error) {
      console.error('[Live Session] Screen share failed:', error)
      throw error
    }
  }

  /**
   * Stop screen sharing
   */
  async stopScreenShare(): Promise<void> {
    // Restore camera track
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      this.peerConnections.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack)
        }
      })
    }
  }

  /**
   * Create WebRTC peer connection
   */
  private createPeerConnection(participantId: string): RTCPeerConnection {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    }

    const pc = new RTCPeerConnection(configuration)

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!)
      })
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.channel) {
        this.channel.send({
          type: 'broadcast',
          event: 'signal',
          payload: {
            from: 'me', // Would be actual user ID
            to: participantId,
            type: 'ice-candidate',
            data: event.candidate,
          },
        })
      }
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      logger.debug('[Live Session] Received remote track', { kind: event.track.kind })
      // Remote stream handled in component
    }

    this.peerConnections.set(participantId, pc)
    return pc
  }

  /**
   * Handle WebRTC offer
   */
  private async handleOffer(from: string, offer: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.createPeerConnection(from)
    await pc.setRemoteDescription(new RTCSessionDescription(offer))

    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'signal',
        payload: {
          from: 'me',
          to: from,
          type: 'answer',
          data: answer,
        },
      })
    }
  }

  /**
   * Handle WebRTC answer
   */
  private async handleAnswer(from: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.peerConnections.get(from)
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer))
    }
  }

  /**
   * Handle ICE candidate
   */
  private async handleIceCandidate(from: string, candidate: RTCIceCandidateInit): Promise<void> {
    const pc = this.peerConnections.get(from)
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
    }
  }

  /**
   * Clean up peer connections
   */
  private cleanupPeerConnections(): void {
    this.peerConnections.forEach((pc) => pc.close())
    this.peerConnections.clear()
  }

  /**
   * Start recording session
   */
  startRecording(): void {
    if (!this.localStream) {
      throw new Error('No local stream available')
    }

    const options = { mimeType: 'video/webm; codecs=vp9' }
    this.mediaRecorder = new MediaRecorder(this.localStream, options)

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data)
      }
    }

    this.mediaRecorder.onstop = () => {
      // Recording stopped, chunks available
    }

    this.recordedChunks = []
    this.mediaRecorder.start(1000) // Collect data every second
  }

  /**
   * Stop recording and return blob
   */
  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        throw new Error('No recording in progress')
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' })
        this.recordedChunks = []
        resolve(blob)
      }

      this.mediaRecorder.stop()
    })
  }
}

// =====================================================
// Chat & Q&A Functions
// =====================================================

/**
 * Send chat message
 */
export async function sendChatMessage(
  sessionId: string,
  userId: string,
  displayName: string,
  message: string
): Promise<ChatMessage> {
  // Using imported supabase instance

  const { data, error } = await supabase
    .from('session_chat_messages')
    .insert({
      session_id: sessionId,
      user_id: userId,
      display_name: displayName,
      message,
      type: 'text',
    })
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    sessionId: data.session_id,
    userId: data.user_id,
    displayName: data.display_name,
    message: data.message,
    timestamp: new Date(data.timestamp),
    type: data.type,
  }
}

/**
 * Submit Q&A question
 */
export async function submitQuestion(
  sessionId: string,
  userId: string,
  displayName: string,
  question: string
): Promise<QAQuestion> {
  // Using imported supabase instance

  const { data, error } = await supabase
    .from('session_qa_questions')
    .insert({
      session_id: sessionId,
      user_id: userId,
      display_name: displayName,
      question,
      upvotes: 0,
      is_answered: false,
    })
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    sessionId: data.session_id,
    userId: data.user_id,
    displayName: data.display_name,
    question: data.question,
    timestamp: new Date(data.timestamp),
    upvotes: data.upvotes,
    isAnswered: data.is_answered,
  }
}

/**
 * Upvote Q&A question
 */
export async function upvoteQuestion(questionId: string): Promise<void> {
  // Using imported supabase instance

  await supabase.rpc('upvote_question', { question_id: questionId })
}

/**
 * Answer Q&A question
 */
export async function answerQuestion(
  questionId: string,
  answer: string,
  answeredBy: string
): Promise<void> {
  // Using imported supabase instance

  await supabase
    .from('session_qa_questions')
    .update({
      is_answered: true,
      answer,
      answered_by: answeredBy,
      answered_at: new Date().toISOString(),
    })
    .eq('id', questionId)
}

// =====================================================
// Breakout Room Functions
// =====================================================

/**
 * Create breakout rooms
 */
export async function createBreakoutRooms(
  sessionId: string,
  roomCount: number,
  duration: number // minutes
): Promise<BreakoutRoom[]> {
  // Using imported supabase instance

  const rooms: BreakoutRoom[] = []
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + duration)

  for (let i = 0; i < roomCount; i++) {
    const { data, error } = await supabase
      .from('breakout_rooms')
      .insert({
        session_id: sessionId,
        name: `Room ${i + 1}`,
        participants: [],
        duration,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    rooms.push({
      id: data.id,
      sessionId: data.session_id,
      name: data.name,
      participants: data.participants,
      duration: data.duration,
      createdAt: new Date(data.created_at),
      expiresAt: new Date(data.expires_at),
    })
  }

  return rooms
}

/**
 * Assign participant to breakout room
 */
export async function assignToBreakoutRoom(
  participantId: string,
  roomId: string
): Promise<void> {
  // Using imported supabase instance

  await supabase
    .from('session_participants')
    .update({ breakout_room_id: roomId })
    .eq('id', participantId)

  // Add to room's participants array
  await supabase.rpc('add_participant_to_room', {
    room_id: roomId,
    participant_id: participantId,
  })
}

/**
 * Return all participants to main session
 */
export async function closeBreakoutRooms(sessionId: string): Promise<void> {
  // Using imported supabase instance

  // Clear breakout room assignments
  await supabase
    .from('session_participants')
    .update({ breakout_room_id: null })
    .eq('session_id', sessionId)

  // Delete breakout rooms
  await supabase
    .from('breakout_rooms')
    .delete()
    .eq('session_id', sessionId)
}


