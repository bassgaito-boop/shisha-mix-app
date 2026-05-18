import { useState } from 'react'

/** @param {{ onVerify: () => void }} props */
export default function AgeGate({ onVerify }) {
  const [denied, setDenied] = useState(false)

  if (denied) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center px-8 bg-[#0a0a0a]">
        <p className="text-[#9a9090] text-sm tracking-wide text-center leading-relaxed">
          ご利用いただけません。
        </p>
        <p className="text-[#5a5555] text-xs mt-3 text-center">
          たばこは20歳になってから
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-8 bg-[#0a0a0a] relative overflow-hidden">
      {/* 背景グロー */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(201,168,76,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 text-center max-w-xs w-full">
        {/* アプリ名 */}
        <h1
          className="text-4xl font-bold tracking-[0.2em] mb-10"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            color: '#c9a84c',
          }}
        >
          SHISHA MIX
        </h1>

        {/* 区切り線 */}
        <div
          className="w-16 h-px mx-auto mb-10"
          style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }}
        />

        {/* 注意文 */}
        <p className="text-[#9a9090] text-sm leading-relaxed mb-2">
          このアプリはたばこ製品に関する
        </p>
        <p className="text-[#9a9090] text-sm leading-relaxed mb-8">
          内容を含みます。
        </p>

        {/* 確認文 */}
        <p className="text-[#f0ede8] text-base font-medium mb-8 tracking-wide">
          あなたは20歳以上ですか？
        </p>

        {/* ボタン群 */}
        <div className="flex gap-3">
          <button
            onClick={onVerify}
            className="flex-1 py-4 text-[#0a0a0a] font-semibold text-sm tracking-widest transition-all duration-300 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c97a)',
              boxShadow: '0 0 20px rgba(201,168,76,0.3)',
            }}
          >
            はい
          </button>
          <button
            onClick={() => setDenied(true)}
            className="flex-1 py-4 text-[#5a5555] font-semibold text-sm tracking-widest border border-[rgba(201,168,76,0.2)] bg-[#161616] transition-all duration-300 active:scale-95"
          >
            いいえ
          </button>
        </div>
      </div>

      {/* 下部注意書き */}
      <p className="absolute bottom-8 text-[#3a3535] text-xs tracking-wide">
        たばこは20歳になってから
      </p>
    </div>
  )
}
