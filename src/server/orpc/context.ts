// 모든 oRPC 프로시저에서 공유하는 요청 컨텍스트
import { type DB, db } from '@/server/db';

export type Context = {
  db: DB;
  headers?: Headers;
};

export function createContext(request?: Request): Context {
  return {
    db,
    headers: request?.headers,
  };
}

/** 요청에서 클라이언트 IP를 추출 (Vercel 환경 우선) */
export function extractClientIp(headers?: Headers): string {
  // Vercel이 설정하는 신뢰할 수 있는 헤더 우선 사용
  return (
    headers?.get('x-real-ip') ??
    headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}
