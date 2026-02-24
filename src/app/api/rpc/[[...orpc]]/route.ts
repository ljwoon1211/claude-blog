import { RPCHandler } from '@orpc/server/fetch';

import { appRouter } from '@/server/orpc';
import { createContext } from '@/server/orpc/context';

const handler = new RPCHandler(appRouter);

export async function GET(request: Request) {
  return handler.handle(request, {
    context: createContext(),
  });
}

export async function POST(request: Request) {
  return handler.handle(request, {
    context: createContext(),
  });
}

export async function PUT(request: Request) {
  return handler.handle(request, {
    context: createContext(),
  });
}

export async function PATCH(request: Request) {
  return handler.handle(request, {
    context: createContext(),
  });
}

export async function DELETE(request: Request) {
  return handler.handle(request, {
    context: createContext(),
  });
}
