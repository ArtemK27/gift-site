import { ChatMessage } from '../../types';

// Черновик истории. Меняйте названия, аватары, исходные реплики и ответы здесь.
// id чатов и сообщений оставляйте уникальными: по ним привязаны прогресс и спойлеры.
export type ThreadId = 'committee' | 'sangwoo' | 'wanning' | 'kai';
export interface ThreadStory {
  id: ThreadId;
  title: string;
  avatar: string;
  subtitle: string;
  messages: ChatMessage[];
  reply: { sender: string; avatar: string; text: string };
}

export const THREADS: ThreadStory[] = [
  {
    id: 'committee', title: 'Новогодний Комитет 🎄', avatar: './assets/avatar_sangwoo.jpg', subtitle: 'Сану, Мо Жань, Чу Ваньнин и Kai Angel',
    messages: [
      { id: 'c1', sender: 'Сану', senderRole: 'Killing Stalking', avatar: './assets/avatar_sangwoo.jpg', text: 'Я принёс новогоднюю гирлянду... и биту на всякий случай. Мандарины кто-нибудь взял? 🔪🎄', time: '23:51' },
      { id: 'c2', sender: 'Чу Ваньнин', avatar: './assets/avatar_chu_wanning.jpg', text: 'Мо Вэйюй, положи нож и отойди от хунтуней. Ты их сожжёшь ещё до боя курантов.', time: '23:52' },
      { id: 'c3', sender: 'Мо Жань', avatar: './assets/avatar_mo_ran.jpg', text: 'Учитель! Я просто хотел украсить их золотой стружкой ради праздника! ✨', time: '23:53' },
      { id: 'c4', sender: 'Kai Angel', avatar: './assets/avatar_kai_angel.jpg', text: 'мы с 9mice щас на студии в шубах дропаем новогодний металл. вайб нереальный 🦇❄️', time: '23:54' },
      { id: 'c5', sender: 'Сану', avatar: './assets/avatar_sangwoo.jpg', isSpoilerPhoto: true, photoUrl: './assets/art_spoiler_sangwoo.jpg', text: 'Чекайте новогодний пентхаус. Подарок ждёт в Сейфе 🍷', time: '23:55' },
      { id: 'c6', sender: 'Мо Жань', avatar: './assets/avatar_mo_ran.jpg', text: 'Наша подруга уже здесь! Скинь стикер в чат, и мы выдадим первую часть кода от сейфа 🎁', time: '23:56' },
    ],
    reply: { sender: 'Мо Жань', avatar: './assets/avatar_mo_ran.jpg', text: 'Увидели! Но сначала отправь нам стикер — тогда Сану выдаст первые две цифры 😉' },
  },
  {
    id: 'sangwoo', title: 'Сану', avatar: './assets/avatar_sangwoo.jpg', subtitle: 'был в сети недавно',
    messages: [
      { id: 's1', sender: 'Сану', avatar: './assets/avatar_sangwoo.jpg', text: 'Ты где ходишь? Хунтуни стынут. В общем чате уже ждут твой стикер.', time: '23:49' },
      { id: 's2', sender: 'Сану', avatar: './assets/avatar_sangwoo.jpg', text: 'Я пока проверю, закрыта ли дверь в пентхаус. Не трогай сейф без подсказок.', time: '23:50' },
    ],
    reply: { sender: 'Сану', avatar: './assets/avatar_sangwoo.jpg', text: 'Напиши в Комитет. Там подсказка, которую я не отправлю лично 🔪' },
  },
  {
    id: 'wanning', title: 'Чу Ваньнин', avatar: './assets/avatar_chu_wanning.jpg', subtitle: 'в сети',
    messages: [
      { id: 'w1', sender: 'Чу Ваньнин', avatar: './assets/avatar_chu_wanning.jpg', text: 'Я записал рецепт хунтуней в Заметках. Если будешь искать код, начни с него.', time: '23:48' },
      { id: 'w2', sender: 'Чу Ваньнин', avatar: './assets/avatar_chu_wanning.jpg', text: 'И не говори Мо Жаню, что я оставил ему порцию.', time: '23:52' },
    ],
    reply: { sender: 'Чу Ваньнин', avatar: './assets/avatar_chu_wanning.jpg', text: 'Не спеши: после моей заметки посмотри райдер VIPERR. Там будет продолжение.' },
  },
  {
    id: 'kai', title: 'Kai Angel', avatar: './assets/avatar_kai_angel.jpg', subtitle: 'слушает VIPERR',
    messages: [
      { id: 'k1', sender: 'Kai Angel', avatar: './assets/avatar_kai_angel.jpg', text: 'пока все ищут мандарины, мы с 9mice готовим саундтрек для полуночи 🦇', time: '23:47' },
      { id: 'k2', sender: 'Kai Angel', avatar: './assets/avatar_kai_angel.jpg', text: 'если нужна вторая половина кода, загляни в наш райдер в Заметках.', time: '23:54' },
    ],
    reply: { sender: 'Kai Angel', avatar: './assets/avatar_kai_angel.jpg', text: 'включай трек в острове сверху, пока идёшь за подсказкой ❄️' },
  },
];

// Реакция на первый стикер в группе: эти строки можно переписать, но «20» важно для квеста.
export const STICKER_REACTIONS = [
  { sender: 'Kai Angel', avatar: './assets/avatar_kai_angel.jpg', text: 'ВАУ ВОТ ЭТО СТИЛЬ 🦇✨ Наш человек!' },
  { sender: 'Сану', avatar: './assets/avatar_sangwoo.jpg', text: 'Ха-ха, заценил. Заслужила! Первые две цифры от Сейфа — «20». Вторые две спрятаны в Заметках, иди проверяй! 🗝️' },
];

export const STICKERS = [
  { id: 'st-1', name: 'Сану & Пряник', image: './assets/sticker_sangwoo.png', caption: 'С Новым Годом, добыча 🎄' },
  { id: 'st-2', name: 'Кот Шицзунь', image: './assets/sticker_chu_wanning.png', caption: 'Хунтуни готовы! 🥟' },
  { id: 'st-3', name: 'Viperr Конфетти', image: './assets/sticker_viperr.png', caption: 'Heavy Metal 2027 🦇✨' },
];
