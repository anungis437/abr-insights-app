// middleware.ts
// Next.js middleware entrypoint - activates proxy/session/CSP logic
import proxy, { config } from './proxy'

export default proxy
export { config }
