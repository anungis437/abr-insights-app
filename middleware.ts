// middleware.ts
// Next.js entrypoint for request-time middleware
// Delegates to proxy.ts for CSP nonce injection and session handling
import proxy, { config } from './proxy'

export default proxy
export { config }
