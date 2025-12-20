export enum UserStatus {
  ACTIVE = 'ACTIVE',
  WARNED = 'WARNED', // Chat stopped/blocked temporarily for current session
  SUSPENDED = 'SUSPENDED' // 3-hour ban
}

export enum MessageType {
  USER = 'USER',
  BOT = 'BOT',
  ERROR = 'ERROR',
  SYSTEM = 'SYSTEM'
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: number;
  sources?: { title: string; uri: string }[];
  // New fields for translation system
  translations?: Record<string, string>; // Cache: { 'Urdu': '...', 'Arabic': '...' }
  displayLanguage?: string; // 'Original' or specific language code
  audioData?: string; // Base64 PCM audio data
}

export enum SafetyStatus {
  SAFE = 'SAFE',
  UNSAFE = 'UNSAFE', // Bad words, inappropriate
  TAMPERING = 'TAMPERING' // Jailbreak, malicious injection
}

export interface SafetyCheckResult {
  status: SafetyStatus;
  reason: string;
}

export interface NewsItem {
  headline: string;
  datetime: string;
  location: string;
  reporters: string;
  platform: string;
}

export type AppView = 'chat' | 'calendar' | 'news';

export const SUPPORTED_LANGUAGES = [
  "English", "Arabic", "Urdu", "Hindi", "Bengali", 
  "Indonesian", "Turkish", "Persian", "Malay", 
  "French", "Spanish", "Russian", "Somali", "Swahili"
];
