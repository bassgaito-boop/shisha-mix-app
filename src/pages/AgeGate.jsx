import { useLocalStorage } from '../hooks/useLocalStorage'

export default function AgeGate() {
  const [, setAgeVerified] = useLocalStorage('ageVerified', false)

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-8 bg-[#0a0a0a] relative overflow-hidden">
      {/* 背景の煙エフェクト */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(201,168,76,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 text-center max-w-xs w-full">
        <p className="text-[#c9a84c] tracking-[0.3em] text-xs uppercase mb-4 font-medium">
          Welcome to
        </p>
        <h1
          className="text-4xl text-[#f0ede8] mb-2 leading-tight"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Shisha Mix
        </h1>
        <p
          className="text-lg text-[#9a9090] mb-12 tracking-widest"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Recipe Lab
        </p>

        <div
          className="w-16 h-px mx-auto mb-12"
          style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }}
        />

        <p className="text-[#9a9090] text-sm leading-relaxed mb-2">
          本アプリはシーシャ（水タバコ）の
        </p>
        <p className="text-[#9a9090] text-sm leading-relaxed mb-8">
          レシピ管理を目的としています。
        </p>

        <p className="text-[#f0ede8] text-sm font-medium mb-8 tracking-wide">
          あなたは20歳以上ですか？
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setAgeVerified(true)}
            className="flex-1 py-4 text-[#0a0a0a] font-semibold text-sm tracking-widest uppercase transition-all duration-300 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c97a)',
              boxShadow: '0 0 20px rgba(201,168,76,0.3)',
            }}
          >
            Yes, I am
          </button>
          <button
            onClick={() => alert('ご利用いただけません。')}
            className="flex-1 py-4 text-[#5a5555] font-semibold text-sm tracking-widest uppercase border border-[rgba(201,168,76,0.2)] transition-all duration-300 active:scale-95"
          >
            No
          </button>
        </div>
      </div>
    </div>
  )
}
