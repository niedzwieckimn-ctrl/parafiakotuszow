import {getStore} from '@netlify/blobs';
import sharp from 'sharp';
import {createService} from './admin-service.mjs';
import {fail} from './admin-security.mjs';
export async function sanitizeImage(bytes,type) {
    try {
      const format={'image/jpeg':'jpeg','image/png':'png','image/webp':'webp'}[type];
      const image=sharp(bytes,{limitInputPixels:40000000,failOn:'warning'});
      const metadata=await image.metadata();
      if(metadata.format!==format || (metadata.pages || 1)!==1 || !metadata.width || !metadata.height) fail(422,'Typ lub zawartość zdjęcia jest niepoprawna. Animacje nie są obsługiwane.');
      return await image.rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).toFormat(format).toBuffer();
    } catch(error) {if(error.status)throw error;fail(422,'Nie można odczytać zdjęcia. Użyj poprawnego JPG, PNG lub WebP.');}
}
export const handler=createService({getStore:()=>getStore({name:'parafia-admin-private-v1',consistency:'strong'}),imageProcessor:sanitizeImage});
