import { Plain } from '@/components/ui';
import { SignupForm } from './SignupForm';

// 가입하면 바로 로그인되고 화면이 새로 그려진다. 이때 홈으로 보내 버리면 복구 코드를 못 보니,
// 로그인된 상태여도 이 화면에서는 보내지 않는다.
export default function SignupPage() {
  return <Plain><SignupForm /></Plain>;
}
