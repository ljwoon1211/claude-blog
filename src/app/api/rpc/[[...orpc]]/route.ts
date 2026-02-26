import { RPCHandler } from '@orpc/server/fetch';

import { appRouter } from '@/server/orpc';
import { createContext } from '@/server/orpc/context';

const handler = new RPCHandler(appRouter);

export async function GET(request: Request) {
  const result = await handler.handle(request, {
    context: createContext(request),
  });
  return result.response;
}

export async function POST(request: Request) {
  const result = await handler.handle(request, {
    context: createContext(request),
  });
  return result.response;
}

export async function PUT(request: Request) {
  const result = await handler.handle(request, {
    context: createContext(request),
  });
  return result.response;
}

export async function PATCH(request: Request) {
  const result = await handler.handle(request, {
    context: createContext(request),
  });
  return result.response;
}

export async function DELETE(request: Request) {
  const result = await handler.handle(request, {
    context: createContext(request),
  });
  return result.response;
}
