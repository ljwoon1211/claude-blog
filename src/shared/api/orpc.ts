import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import type { RouterClient } from '@orpc/server';

import type { AppRouter } from '@/server/orpc';

const rpcLink = new RPCLink({
  url:
    typeof window !== 'undefined'
      ? '/api/rpc'
      : `${process.env.NEXT_PUBLIC_APP_URL}/api/rpc`,
  headers: () => ({}),
});

export const orpc = createORPCClient<RouterClient<AppRouter>>(rpcLink);
