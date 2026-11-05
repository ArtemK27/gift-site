import {
  MessageCircle,
  Lock,
  FileText,
  Image as ImageIcon,
  Settings,
  Clock,
  CloudSnow,
  Terminal,
  LucideIcon,
} from 'lucide-react';
import { AppId } from '../../types';

export interface AppItemConfig {
  id: AppId | 'console';
  name: string;
  icon: LucideIcon;
  badge?: string;
  bg: string;
  iconColor?: string;
}

export const PAGE_0_APPS: AppItemConfig[] = [
  {
    id: 'messenger',
    name: 'ПодвалГрам',
    icon: MessageCircle,
    badge: '4',
    bg: 'bg-gradient-to-tr from-sky-400 via-sky-500 to-blue-600',
  },
  {
    id: 'safe',
    name: 'VIP Сейф',
    icon: Lock,
    badge: 'PIN',
    bg: 'bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600',
  },
  {
    id: 'notes',
    name: 'Заметки',
    icon: FileText,
    badge: '2',
    bg: 'bg-gradient-to-tr from-yellow-300 via-amber-400 to-amber-500',
  },
  {
    id: 'gallery',
    name: 'Фото',
    icon: ImageIcon,
    badge: '3D',
    bg: 'bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-600',
  },
  {
    id: 'settings',
    name: 'Настройки',
    icon: Settings,
    bg: 'bg-gradient-to-tr from-zinc-700 to-zinc-600',
  },
];

export const PAGE_1_APPS: AppItemConfig[] = [
  {
    id: 'clock',
    name: 'Часы',
    icon: Clock,
    badge: '00:00',
    bg: 'bg-gradient-to-tr from-zinc-900 via-zinc-800 to-black',
  },
  {
    id: 'weather',
    name: 'Погода',
    icon: CloudSnow,
    badge: '-5°',
    bg: 'bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600',
  },
  {
    id: 'console',
    name: 'Консоль',
    icon: Terminal,
    badge: 'SSH',
    bg: 'bg-gradient-to-tr from-zinc-800 to-zinc-700',
    iconColor: 'text-emerald-400',
  },
];

export const DOCK_APPS: AppItemConfig[] = [
  {
    id: 'messenger',
    name: 'ПодвалГрам',
    icon: MessageCircle,
    bg: 'bg-gradient-to-tr from-sky-400 via-sky-500 to-blue-600',
  },
  {
    id: 'safe',
    name: 'VIP Сейф',
    icon: Lock,
    bg: 'bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600',
  },
  {
    id: 'notes',
    name: 'Заметки',
    icon: FileText,
    bg: 'bg-gradient-to-tr from-yellow-300 via-amber-400 to-amber-500',
  },
  {
    id: 'gallery',
    name: 'Фото',
    icon: ImageIcon,
    bg: 'bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-600',
  },
];
