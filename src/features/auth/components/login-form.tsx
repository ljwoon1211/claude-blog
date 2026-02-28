'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';

import { useLogin } from '../hooks/use-login';
import { type LoginFormValues, loginSchema } from '../schemas/login.schema';

export function LoginForm() {
  const form = useForm<LoginFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(loginSchema as any),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate: login, isPending } = useLogin();

  function onSubmit(data: LoginFormValues) {
    login(data);
  }

  return (
    <Card className="mx-auto w-full max-w-md shadow-md">
      <CardHeader className="space-y-2 pb-6 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight">
          관리자 로그인
        </CardTitle>
        <CardDescription className="text-base">
          블로그 관리를 위해 로그인해주세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    이메일
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-11"
                      type="email"
                      placeholder="admin@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    비밀번호
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-11"
                      type="password"
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="h-11 w-full text-lg"
              disabled={isPending}
            >
              {isPending ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
