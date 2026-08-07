import { Bot, Users, AlertTriangle, Smartphone, MessageCircle, Phone } from 'lucide-react'

export type CaseCategory = 'auto' | 'hitl' | 'exception'
export type Channel = 'app' | 'whatsapp' | 'call'
export type AiStage = 'Processed' | 'Extracted' | 'Pending' | 'Not Submitted'

export const CATEGORY_META: Record<CaseCategory, { label: string; description: string; icon: typeof Bot }> = {
  auto: { label: 'Auto', description: 'Straight-through processed by AI', icon: Bot },
  hitl: { label: 'HITL', description: 'Human-in-the-loop review', icon: Users },
  exception: { label: 'Exception', description: 'Escalated for manual handling', icon: AlertTriangle },
}

export const CHANNEL_META: Record<Channel, { label: string; description: string; icon: typeof Smartphone }> = {
  app: { label: 'App', description: 'Mobile app self-service FNOL', icon: Smartphone },
  whatsapp: { label: 'WhatsApp', description: 'Conversational bot intake', icon: MessageCircle },
  call: { label: 'Call', description: 'IVR / agent-assisted call', icon: Phone },
}

export const STATUS_TONE: Record<string, string> = {
  'Auto-Approved': 'bg-success-100 text-success',
  Approved: 'bg-success-100 text-success',
  Rejected: 'bg-danger-100 text-danger',
  Pending: 'bg-warning-100 text-warning',
}

export function confidenceTone(confidence: number) {
  if (confidence >= 85) return 'text-success'
  if (confidence >= 60) return 'text-warning'
  return 'text-danger'
}

export function confidenceBarTone(confidence: number) {
  if (confidence >= 85) return 'bg-success'
  if (confidence >= 60) return 'bg-warning'
  return 'bg-danger'
}
