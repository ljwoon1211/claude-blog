import { serve } from 'inngest/next';

import { inngest } from '@/server/inngest/client';
import { cleanupOrphanImages } from '@/server/inngest/functions/cleanup-orphan-images';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [cleanupOrphanImages],
});
