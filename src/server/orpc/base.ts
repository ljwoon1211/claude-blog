import { os as baseOs } from '@orpc/server';

import { type Context } from './context';

export const os = baseOs.$context<Context>();
