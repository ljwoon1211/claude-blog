import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { orpcQuery } from '@/shared/api/orpc-react';

export function useLogin() {
  const router = useRouter();

  return useMutation(
    orpcQuery.auth.login.mutationOptions({
      onSuccess: () => {
        toast.success('로그인에 성공했습니다.');
        router.push('/admin'); // 어드민 페이지로 이동
      },
      onError: (error: Error) => {
        toast.error(error.message || '로그인에 실패했습니다.');
      },
    }),
  );
}
