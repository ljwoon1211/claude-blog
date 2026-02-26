// 모든 oRPC 프로시저에서 공유하는 요청 컨텍스트
import { type DB, db } from '@/server/db';

export type Context = {
  db: DB;
  headers: Headers;
};

export function createContext(request: Request): Context {
  return {
    db,
    headers: request.headers,
  };
}
