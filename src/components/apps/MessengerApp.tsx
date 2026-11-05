import React, { useEffect, useRef, useState } from 'react';
import { CheckCheck, ChevronLeft, Eye, Search, Send, Smile, X } from 'lucide-react';
import { useMessenger } from '../../context/MessengerContext';
import { STICKERS, THREADS } from './messengerStory';
import { playTapSound, vibrate } from '../../utils/haptics';

export const MessengerApp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state, openThread, setDraft, reveal, sendText, sendSticker } = useMessenger();
  const [stickersOpen, setStickersOpen] = useState(false);
  const [query, setQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const thread = THREADS.find((item) => item.id === state.activeThread);
  const messages = thread ? state.messages[thread.id] : [];
  const normalizedQuery = query.trim().toLocaleLowerCase('ru');
  const visibleThreads = THREADS.filter((item) => item.title.toLocaleLowerCase('ru').includes(normalizedQuery));

  useEffect(() => {
    if (thread && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread?.id, messages.length, state.typing]);

  const goBack = () => {
    vibrate(15);
    if (thread) { openThread(null); setStickersOpen(false); }
    else onBack();
  };

  return (
    <div className="relative w-full h-full min-w-0 flex flex-col bg-[#0b0c11] select-none text-white overflow-hidden">
      <header className="shrink-0 flex items-center gap-2 px-3 h-[62px] border-b border-white/10 bg-[#111218]">
        {thread ? (
          <>
            <button type="button" aria-label="Назад к чатам" onClick={goBack} className="w-10 h-10 grid place-items-center shrink-0 rounded-full hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"><ChevronLeft size={23} /></button>
            <img src={thread.avatar} alt="" className="w-9 h-9 object-cover rounded-full shrink-0" />
            <div className="min-w-0 flex-1"><h1 className="text-sm font-semibold truncate">{thread.title}</h1><p className="text-xs text-[#a3a7b4] truncate">{state.typing === thread.id ? 'печатает…' : thread.subtitle}</p></div>
          </>
        ) : (
          <><div className="min-w-0 flex-1"><h1 className="text-xl font-semibold">ПодвалГрам</h1><p className="text-xs text-[#a3a7b4]">Сообщения</p></div></>
        )}
        {!thread && <button type="button" aria-label="Закрыть мессенджер" onClick={onBack} className="w-10 h-10 grid place-items-center shrink-0 rounded-full hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"><X size={18} /></button>}
      </header>

      {!thread ? (
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y">
          <label className="mx-4 mt-4 mb-2 flex items-center gap-2 h-10 px-3 rounded-xl bg-white/[0.08] text-zinc-400">
            <Search size={18} className="shrink-0" /><span className="sr-only">Поиск чатов</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск чатов" className="w-full bg-transparent text-sm text-white placeholder:text-zinc-400 outline-none" />
          </label>
          {visibleThreads.map((item) => {
            const last = state.messages[item.id][state.messages[item.id].length - 1];
            return <button key={item.id} type="button" aria-label={`Открыть чат ${item.title}`} onClick={() => { playTapSound(); openThread(item.id); }}
              className="w-full min-w-0 flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.06] active:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400">
              <img src={item.avatar} alt="" className="w-12 h-12 shrink-0 rounded-full object-cover" />
              <span className="flex-1 min-w-0 border-b border-white/[0.07] pb-3"><span className="flex items-center justify-between gap-2"><span className="font-semibold text-sm truncate">{item.title}</span><span className="text-[11px] text-zinc-500 shrink-0">{last.time}</span></span><span className="block text-sm text-zinc-400 truncate mt-1">{last.isMe ? 'Вы: ' : ''}{last.isSticker ? 'Стикер · ' : last.isSpoilerPhoto ? 'Фото · ' : ''}{last.text}</span></span>
            </button>;
          })}
          {visibleThreads.length === 0 && <p className="p-6 text-sm text-zinc-400 text-center">Чатов с таким именем нет</p>}
        </div>
      ) : (
        <>
          {thread.id === 'committee' && state.clueRevealed && <div className="shrink-0 bg-amber-400/10 px-4 py-2 text-xs text-amber-200">Код разблокировки: 20 • • <span className="text-zinc-400">· часть 1/2</span></div>}
          <div ref={scrollRef} data-testid="chat-messages" className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y px-3 py-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-end gap-2 min-w-0 ${msg.isMe ? 'justify-end' : ''}`}>
                {!msg.isMe && <img src={msg.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />}
                <div className={`flex flex-col min-w-0 max-w-[min(80%,310px)] ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  {thread.id === 'committee' && !msg.isMe && <span className="text-[11px] text-amber-300 font-semibold mb-1 ml-1">{msg.sender}</span>}
                  {msg.isSpoilerPhoto ? (
                    <div className="max-w-full p-1.5 rounded-2xl bg-[#22232a] border border-white/10">
                      <button type="button" aria-label={state.revealed[msg.id] ? 'Фото раскрыто' : 'Раскрыть фото в чате'} disabled={!!state.revealed[msg.id]}
                        onClick={() => { vibrate(20); reveal(msg.id); }} className="relative block w-48 max-w-full aspect-[4/5] rounded-xl overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400">
                        <img src={msg.photoUrl} alt="Новогодний пентхаус" className={`w-full h-full object-cover transition-[filter] duration-200 ${state.revealed[msg.id] ? '' : 'blur-xl brightness-50'}`} />
                        {!state.revealed[msg.id] && <span className="absolute inset-0 grid place-content-center justify-items-center gap-2 bg-black/30 text-sm font-semibold"><Eye size={24} />Спойлер · открыть фото</span>}
                      </button>
                      <p className="text-xs leading-relaxed px-1 pt-2 text-zinc-200 break-words">{msg.text}</p>
                    </div>
                  ) : msg.isSticker ? <div className="w-28 max-w-full"><img src={msg.stickerUrl} alt={msg.text} className="w-28 h-28 object-contain" /><span className="text-xs text-zinc-400 break-words">{msg.text}</span></div>
                    : <div className={`max-w-full px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${msg.isMe ? 'bg-[#2866d9]' : 'bg-[#252630]'}`}>{msg.text}</div>}
                  <span className="flex items-center gap-1 text-[10px] text-zinc-500 px-1 mt-1">{msg.time}{msg.isMe && <CheckCheck size={12} className="text-sky-400" />}</span>
                </div>
              </div>
            ))}
            {state.typing === thread.id && <p className="text-xs text-sky-300 pl-9" role="status">{thread.title} печатает…</p>}
          </div>
          <div className="shrink-0 min-w-0 border-t border-white/10 bg-[#14151b] px-3 pt-2 pb-9">
            {stickersOpen && <div className="grid grid-cols-3 gap-2 pb-2" aria-label="Выбор стикера">
              {STICKERS.map((sticker) => <button type="button" key={sticker.id} onClick={() => { sendSticker(thread.id, sticker.image, sticker.caption); setStickersOpen(false); }} className="min-w-0 p-1 rounded-xl bg-white/[0.07] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"><img src={sticker.image} alt="" className="w-12 h-12 object-contain mx-auto" /><span className="block text-[10px] truncate">{sticker.name}</span></button>)}
            </div>}
            <form onSubmit={(event) => { event.preventDefault(); sendText(thread.id); }} className="flex items-center gap-2 min-w-0">
              <button type="button" aria-label="Открыть стикеры" aria-expanded={stickersOpen} onClick={() => setStickersOpen((value) => !value)} className="w-10 h-10 shrink-0 grid place-items-center rounded-full bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"><Smile size={21} /></button>
              <input aria-label="Сообщение" placeholder="Сообщение…" value={state.draft[thread.id]} onChange={(event) => setDraft(thread.id, event.target.value)} className="min-w-0 flex-1 h-10 px-3 rounded-2xl bg-white/[0.08] border border-white/10 text-sm placeholder:text-zinc-400 outline-none focus:border-sky-500" />
              <button type="submit" aria-label="Отправить сообщение" disabled={!state.draft[thread.id].trim()} className="w-10 h-10 shrink-0 grid place-items-center rounded-full bg-[#2866d9] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><Send size={18} /></button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
