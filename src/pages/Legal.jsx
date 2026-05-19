import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function Legal() {
  const navigate = useNavigate()

  return (
    <div className="min-h-svh bg-[#0a0a0a] px-5 pt-12 pb-16">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-[#5a5555] text-sm mb-8 active:opacity-60"
      >
        <ChevronLeft size={16} />
        戻る
      </button>

      <h1
        className="text-2xl text-[#c9a84c] mb-1"
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
      >
        Legal
      </h1>
      <p className="text-[#3a3535] text-[10px] tracking-widest uppercase mb-10">
        利用規約・プライバシーポリシー
      </p>

      <Section title="利用規約">
        <Item label="対象年齢">
          本アプリはシーシャ（水タバコ）のフレーバーレシピを管理するツールです。たばこ製品に関する内容を含むため、20歳以上の方のみご利用いただけます。
        </Item>
        <Item label="免責事項">
          本アプリの利用により生じたいかなる損害についても、開発者は責任を負いません。レシピ情報はあくまで個人的な記録・共有を目的としたものです。
        </Item>
        <Item label="禁止事項">
          本アプリを違法な目的、または20歳未満の方へのたばこ製品の提供・推奨を目的として使用することを禁じます。
        </Item>
        <Item label="変更について">
          本利用規約は予告なく変更される場合があります。
        </Item>
      </Section>

      <div className="h-px bg-[rgba(201,168,76,0.1)] my-8" />

      <Section title="プライバシーポリシー">
        <Item label="個人情報の収集">
          本アプリはお客様の個人情報を収集しません。氏名・メールアドレス・位置情報などの個人を特定できる情報は一切取得しません。
        </Item>
        <Item label="データの保存場所">
          レシピ・フレーバー情報などのアプリデータは、すべてお使いのデバイス内（ローカルストレージ）にのみ保存されます。外部サーバーへの送信は行いません。
        </Item>
        <Item label="共有コード・QRコードについて">
          レシピの共有に使用するコードにはレシピ名・フレーバー名・グラム数のみが含まれます。個人を特定できる情報は含まれません。
        </Item>
        <Item label="アクセス解析">
          本アプリは現時点でアクセス解析ツールを使用していません。
        </Item>
        <Item label="お問い合わせ">
          本ポリシーに関するご質問はアプリ内のフィードバック機能またはSNSよりお問い合わせください。
        </Item>
      </Section>

      <p className="text-[#3a3535] text-[10px] text-center mt-10">
        最終更新: 2026年5月
      </p>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="mb-2">
      <p className="text-[#c9a84c] text-[10px] tracking-widest uppercase mb-4">{title}</p>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Item({ label, children }) {
  return (
    <div>
      <p className="text-[#f0ede8] text-xs font-medium mb-1">{label}</p>
      <p className="text-[#5a5555] text-xs leading-relaxed">{children}</p>
    </div>
  )
}
