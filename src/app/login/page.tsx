import { LoginForm } from '@/features/auth/components/login-form';

export const metadata = {
  title: '로그인 - 기술 블로그',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4">
      <LoginForm />
    </div>
  );
}
