import {getStore} from '@netlify/blobs';
import {createDailyWordService} from '../lib/daily-word.mjs';
export default createDailyWordService({getStore:()=>getStore({name:'parafia-daily-word-v1',consistency:'strong'})});
