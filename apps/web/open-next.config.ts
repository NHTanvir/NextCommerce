import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// Default everything: the storefront has no ISR cache to share and no
// durable state, so the plain Worker handler is all it needs.
export default defineCloudflareConfig({});
