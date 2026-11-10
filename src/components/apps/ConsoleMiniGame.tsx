import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Cpu, ArrowRight, Terminal } from 'lucide-react';
import { vibrate, playTapSound, playUnlockSound } from '../../utils/haptics';

export interface ConsoleMiniGameProps {
  isDecrypted: boolean;
  onDecryptSuccess: () => void;
  onOpenRootNote: () => void;
}

interface SshNode {
  id: string;
  code: string;
  label: string;
}

const SSH_NODES: SshNode[] = [
  { id: 'node-1', code: '0x4F', label: 'SSH_HANDSHAKE' },
  { id: 'node-2', code: '0xA9', label: 'RSA_KEY_BYPASS' },
  { id: 'node-3', code: '0x7C', label: 'ROOT_CIPHER_UNLOCK' },
];

/**
 * Modular SSH Decryption Mini-Game for ConsoleApp (>_)
 * Separated into its own clean component so it can be easily replaced in the future.
 */
export const ConsoleMiniGame: React.FC<ConsoleMiniGameProps> = ({
  isDecrypted,
  onDecryptSuccess,
  onOpenRootNote,
}) => {
  const [hackedNodes, setHackedNodes] = useState<Record<string, boolean>>(() =>
    isDecrypted
      ? { 'node-1': true, 'node-2': true, 'node-3': true }
      : ({} as Record<string, boolean>)
  );

  const completedCount = isDecrypted
    ? SSH_NODES.length
    : Object.values(hackedNodes).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / SSH_NODES.length) * 100);

  const handleToggleNode = (nodeId: string, idx: number) => {
    if (isDecrypted || hackedNodes[nodeId]) return;
    vibrate(25);
    playTapSound(520 + idx * 140, 0.05);

    const next = { ...hackedNodes, [nodeId]: true };
    setHackedNodes(next);

    const nextCount = Object.values(next).filter(Boolean).length;
    if (nextCount >= SSH_NODES.length) {
      setTimeout(() => {
        vibrate([40, 80, 120]);
        playUnlockSound();
        onDecryptSuccess();
      }, 180);
    }
  };

  const handleQuickHackNext = () => {
    if (isDecrypted) return;
    const nextUnfinished = SSH_NODES.findIndex((n) => !hackedNodes[n.id]);
    if (nextUnfinished !== -1) {
      handleToggleNode(SSH_NODES[nextUnfinished].id, nextUnfinished);
    }
  };

  return (
    <div
      data-testid="console-minigame"
      className="rounded-2xl bg-[#0b0f14] border border-emerald-500/25 p-4 space-y-4 shadow-[0_12px_36px_rgba(0,0,0,0.65)] font-mono"
    >
      {/* Top Status Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold tracking-wider text-zinc-200 uppercase">
            SSH DECRYPTOR // ROOT_31_12
          </span>
        </div>
        <span
          className={`text-[11px] px-2 py-0.5 rounded border font-bold ${
            isDecrypted
              ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
              : 'bg-amber-500/15 border-amber-400/40 text-amber-300'
          }`}
        >
          {progressPercent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span>ЦЕЛЬ: ПАРОЛИ И ДОСТУПЫ НА 31.12 (ROOT)</span>
          <span>
            {completedCount}/{SSH_NODES.length} УЗЛОВ
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-zinc-900 border border-white/10 overflow-hidden">
          <motion.div
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className={`h-full ${
              isDecrypted
                ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                : 'bg-amber-400'
            }`}
          />
        </div>
      </div>

      {/* Interactive SSH Nodes Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {SSH_NODES.map((node, idx) => {
          const active = isDecrypted || Boolean(hackedNodes[node.id]);
          return (
            <motion.button
              key={node.id}
              type="button"
              data-testid={`ssh-node-${idx + 1}`}
              whileTap={!active ? { scale: 0.94 } : undefined}
              onClick={() => handleToggleNode(node.id, idx)}
              disabled={active}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[82px] cursor-pointer ${
                active
                  ? 'bg-emerald-950/35 border-emerald-400/50 text-emerald-300 shadow-[inset_0_0_16px_rgba(16,185,129,0.15)]'
                  : 'bg-[#121720] hover:bg-[#171e29] border-white/15 text-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{node.code}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    active ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500 animate-pulse'
                  }`}
                />
              </div>
              <div className="mt-2">
                <div className="text-[9px] text-zinc-400 truncate">{node.label}</div>
                <div className="text-[10px] font-bold mt-0.5">
                  {active ? '[ OK ]' : '[ ВЗЛОМАТЬ ]'}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Action / Status Footer */}
      {!isDecrypted ? (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-2 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-400/25 rounded-xl px-3 py-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Активируйте все 3 SSH-узла выше для расшифровки файла ROOT.</span>
          </div>

          <button
            type="button"
            data-testid="console-hack-step-btn"
            onClick={handleQuickHackNext}
            className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 text-emerald-300 text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Terminal className="w-4 h-4" />
            <span>ДЕШИФРОВАТЬ СЛЕДУЮЩИЙ УЗЕЛ ({completedCount}/3)</span>
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="space-y-3 pt-1"
        >
            <div
              data-testid="console-access-granted"
              className="flex items-center gap-2.5 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/40 rounded-xl px-3.5 py-3 shadow-[0_0_24px_rgba(16,185,129,0.18)]"
            >
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>ACCESS GRANTED: Заметка ROOT расшифрована!</span>
            </div>

            <motion.button
              type="button"
              data-testid="return-to-notes-btn"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                vibrate(25);
                playTapSound(640, 0.04);
                onOpenRootNote();
              }}
              className="w-full py-3 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-sans font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(52,211,153,0.35)] transition-all cursor-pointer"
            >
              <span>Вернуться в Заметки за кодом</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </motion.button>
          </motion.div>
      )}
    </div>
  );
};

export default ConsoleMiniGame;
