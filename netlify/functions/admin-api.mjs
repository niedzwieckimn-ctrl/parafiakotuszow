import {handler} from '../lib/admin-runtime.mjs';
export default handler;
export const config={path:'/api/admin/*',excludedPath:'/api/admin/login',rateLimit:{windowLimit:120,windowSize:60,aggregateBy:['ip','domain']}};
