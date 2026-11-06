export type ScreenType = 'bait' | 'glitch' | 'lock' | 'home';

export type AppId =
  | 'messenger'
  | 'safe'
  | 'notes'
  | 'gallery'
  | 'settings'
  | 'clock'
  | 'weather'
  | 'minesweeper'
  | null;

export interface NotificationItem {
  id: string;
  sender: string;
  avatar: string;
  title: string;
  message: string;
  time: string;
  unread?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderRole?: string;
  avatar: string;
  text?: string;
  time: string;
  isMe?: boolean;
  isSpoilerPhoto?: boolean;
  photoUrl?: string;
  isSticker?: boolean;
  stickerUrl?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  fullText: string[];
  pinned?: boolean;
  clueDigit?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  date: string;
  tag: string;
  isEasterEgg?: boolean;
}
