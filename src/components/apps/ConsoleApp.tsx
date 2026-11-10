import React from 'react';
import { ChevronLeft, Terminal, X, Lock, Unlock } from 'lucide-react';
import { vibrate, playTapSound } from '../../utils/haptics';
import { useSettings } from '../../context/SettingsContext';
import { ConsoleMiniGame } from './ConsoleMiniGame';

export interface ConsoleAppProps {
  onBack: () => void;
  onOpenRootNote: () => void;
}

export const ConsoleApp: React.FC<ConsoleAppProps> = ({ onBack, onOpenRootNote }) => {
  const { questProgress, unlockQuestStep } = useSettings();
  const isDecrypted = Boolean(questProgress.rootNoteDecrypted);

  const handleDecryptSuccess = () => {
    unlockQuestStep('console_decrypt');
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#06080b] text-zinc-100 select-none z-30 overflow-hidden font-mono">
      {/* Top Terminal Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2.5 bg-[#090d12]/95 backdrop-blur-xl border-b border-white/10 z-20 font-sans">
        <button
          type="button"
          onClick={() => {
            vibrate(15);
            playTapSound(400, 0.04);
            onBack();
          }}
          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 active:opacity-60 transition-opacity -ml-1 py-1 px-1.5 rounded-lg cursor-pointer"
          aria-label="Назад"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          <span className="text-base font-normal">Назад</span>
        </button>

        <div className="flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-bold tracking-tight text-white font-mono">
            Консоль (&gt;_)
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            vibrate(20);
            playTapSound(420, 0.04);
            onBack();
          }}
          aria-label="Закрыть консоль"
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white/80 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Terminal Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-3.5 pb-10 space-y-4 overscroll-contain touch-pan-y">
        {/* System Log Output Box */}
        <div className="rounded-xl bg-[#0a0e13] border border-white/10 p-3.5 text-[11px] leading-relaxed text-zinc-400 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 pb-1.5 mb-1.5 border-b border-white/[0.06]">
            <span>root@podval-os:~# ssh-decrypt</span>
            <span className="flex items-center gap-1 text-[10px]">
              {isDecrypted ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Unlock className="w-3 h-3" /> UNLOCKED
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> SSH LOCKED
                </span>
              )}
            </span>
          </div>
          <p className="text-zinc-300">
            &gt; Обнаружен зашифрованный контейнер:{' '}
            <span className="text-white font-semibold">«ПАРОЛИ И ДОСТУПЫ НА 31.12 (ROOT)»</span>
          </p>
          <p>
            &gt; Протокол защиты: <span className="text-emerald-400">SSH-2048 // 3 узла</span>
          </p>
          <p className={isDecrypted ? 'text-emerald-400 font-semibold' : 'text-amber-300'}>
            &gt; СТАТУС:{' '}
            {isDecrypted
              ? 'ACCESS GRANTED: Заметка ROOT расшифрована!'
              : 'Ожидание дешифровки узлов...'}
          </p>
        </div>

        {/* Modular Mini-Game Component */}
        <ConsoleMiniGame
          isDecrypted={isDecrypted}
          onDecryptSuccess={handleDecryptSuccess}
          onOpenRootNote={onOpenRootNote}
        />
      </div>
    </div>
  );
};

export default ConsoleApp;
