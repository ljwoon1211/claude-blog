import { createORPCReactQueryUtils } from '@orpc/react-query';

import { orpc } from './orpc';

export const orpcQuery = createORPCReactQueryUtils(orpc);
