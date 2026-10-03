import {handler} from '../lib/admin-runtime.mjs';
export default handler;
export const config={path:'/api/admin/login',rateLimit:{windowLimit:10,windowSize:180,aggregateBy:['ip','domain']}};
