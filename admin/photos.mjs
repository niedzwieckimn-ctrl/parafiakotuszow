export const MAX_ALBUM_PHOTOS=30;
export const MAX_SOURCE_BYTES=20*1024*1024;
const TYPES=new Set(['image/jpeg','image/png','image/webp']);
export function checkPhoto(file) {
  if(!TYPES.has(file.type))throw new Error('Wybierz zdjęcia JPG, PNG lub WebP.');
  if(!file.size||file.size>MAX_SOURCE_BYTES)throw new Error('Jedno zdjęcie może mieć do 20 MB.');
}
export async function preparePhoto(file) {
  checkPhoto(file);
  let bitmap;
  try{bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});}catch{throw new Error('Nie można odczytać zdjęcia. Wybierz inny plik JPG, PNG lub WebP.');}
  try{
    if(!bitmap.width||!bitmap.height||bitmap.width*bitmap.height>40000000)throw new Error('Zdjęcie jest zbyt duże. Wybierz wersję do 40 megapikseli.');
    for(const [longSide,quality] of [[2400,.84],[1800,.76],[1400,.68]]) {
      const ratio=Math.min(1,longSide/Math.max(bitmap.width,bitmap.height));
      const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Nie udało się przygotować zdjęcia. Spróbuj w innej przeglądarce.');
      ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));
      canvas.width=canvas.height=1;
      if(blob&&blob.size<900*1024)return blob;
    }
    throw new Error('Nie udało się zmniejszyć zdjęcia. Wybierz mniejszy plik.');
  }finally{bitmap.close();}
}
