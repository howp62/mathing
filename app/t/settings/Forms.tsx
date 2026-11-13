'use client';
import { useActionState, useState } from 'react';
import { changePassword, updateAiSettings } from '@/app/actions/teacher';

type Provider = 'none' | 'anthropic' | 'openai' | 'google';

export function AiForm({ current, providers, defaults }: {
  current: { provider: Provider; model: string; hasKey: boolean; dailyCap: number; freeTier: boolean };
  providers: { id: Provider; label: string }[];
  defaults: Record<Exclude<Provider, 'none'>, string>;
}) {
  const [state, action, pending] = useActionState(updateAiSettings, undefined);
  const [provider, setProvider] = useState<Provider>(current.provider);
  const [freeTier, setFreeTier] = useState(current.freeTier);
  return (
    <form action={action}>
      {state?.error && <p className="msg error" role="alert">{state.error}</p>}
      {state?.ok && <p className="msg ok" role="status">{state.ok}</p>}
      <div className="field">
        <label htmlFor="provider">사용할 AI</label>
        <select id="provider" name="provider" value={provider} onChange={(e) => setProvider(e.target.value as Provider)}>
          {providers.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>
      {provider !== 'none' && (
        <>
          <div className="field">
            <label htmlFor="apiKey">API 키</label>
            <input id="apiKey" name="apiKey" type="password" autoComplete="off" placeholder={current.hasKey ? '저장된 키가 있어요. 바꿀 때만 새로 넣으세요.' : 'AI 회사 사이트에서 발급한 키'} />
            <small>키는 암호화해서 저장하고 다시 화면에 보여주지 않아요.</small>
          </div>
          {current.hasKey && (
            <label className="tgl" style={{ marginBottom: 14 }}><input type="checkbox" name="clearKey" /> 저장된 키 지우기</label>
          )}
          <div className="field">
            <label htmlFor="model">모델 이름 (비워 두면 기본값)</label>
            <input id="model" name="model" defaultValue={current.model} placeholder={defaults[provider]} autoComplete="off" />
            <small>기본값: {defaults[provider]}. 회사가 모델 이름을 바꾸면 여기서 고칠 수 있어요.</small>
          </div>
          <div className="field">
            <label htmlFor="dailyCap">반 하나당 하루 최대 사용 횟수</label>
            <input id="dailyCap" name="dailyCap" type="number" min={0} max={5000} defaultValue={current.dailyCap} />
          </div>
          <label className="tgl"><input type="checkbox" name="freeTier" checked={freeTier} onChange={(e) => setFreeTier(e.target.checked)} /> 무료 요금제 키예요</label>
          {freeTier && <p className="note warn">무료 요금제에서는 학생 글이 AI 회사의 서비스 개선에 쓰일 수 있어요. 학생 글을 보내기 전에 꼭 확인하세요.</p>}
        </>
      )}
      <div style={{ marginTop: 16 }}><button className="btn" disabled={pending}>{pending ? '저장 중…' : '저장'}</button></div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  return (
    <form action={action}>
      {state?.error && <p className="msg error" role="alert">{state.error}</p>}
      {state?.ok && <p className="msg ok" role="status">{state.ok}</p>}
      <div className="row">
        <div className="field"><label htmlFor="current">지금 비밀번호</label><input id="current" name="current" type="password" required autoComplete="current-password" /></div>
        <div className="field"><label htmlFor="next">새 비밀번호 (8자 이상)</label><input id="next" name="next" type="password" required minLength={8} autoComplete="new-password" /></div>
      </div>
      <button className="btn ghost" disabled={pending}>{pending ? '바꾸는 중…' : '비밀번호 바꾸기'}</button>
    </form>
  );
}
