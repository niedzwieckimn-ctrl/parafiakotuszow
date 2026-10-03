const imagePath=value=>typeof value==='string'&&/^\/?assets\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:jpe?g|png|webp|gif|avif)$/i.test(value)?value:'';
export function photoCount(count){return `${count} ${count===1?'zdjęcie':count%10>=2&&count%10<=4&&(count%100<12||count%100>14)?'zdjęcia':'zdjęć'}`;}
export function albumImages(entry){return [...new Set((Array.isArray(entry.photos)&&entry.photos.length?entry.photos:[entry.image]).map(imagePath).filter(Boolean))];}
let viewer=null;
export function openAlbum(entry){
  const images=albumImages(entry);if(!images.length)return;
  if(!viewer){
    const make=(tag,props)=>Object.assign(document.createElement(tag),props);
    const dialog=make('dialog',{className:'album-viewer'}),heading=make('h2',{id:'albumViewerTitle'}),close=make('button',{type:'button',textContent:'Zamknij ×',className:'album-close'}),image=make('img',{className:'album-full-image'}),counter=make('p',{className:'album-position'}),credit=make('p',{className:'album-credit'}),previous=make('button',{type:'button',textContent:'← Poprzednie'}),next=make('button',{type:'button',textContent:'Następne →'}),navigation=make('div',{className:'album-navigation'});
    counter.setAttribute('aria-live','polite');dialog.setAttribute('aria-labelledby','albumViewerTitle');navigation.append(previous,counter,next);dialog.append(close,heading,image,navigation,credit);document.body.append(dialog);
    viewer={dialog,heading,image,counter,credit,previous,next,images:[],index:0,title:''};
    function show(index){viewer.index=Math.max(0,Math.min(index,viewer.images.length-1));image.src=viewer.images[viewer.index];image.alt=`${viewer.title} — zdjęcie ${viewer.index+1}`;counter.textContent=`${viewer.index+1} / ${viewer.images.length}`;previous.disabled=viewer.index===0;next.disabled=viewer.index===viewer.images.length-1;}
    viewer.show=show;close.addEventListener('click',()=>dialog.close());previous.addEventListener('click',()=>show(viewer.index-1));next.addEventListener('click',()=>show(viewer.index+1));
    dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();show(viewer.index-1);}if(event.key==='ArrowRight'){event.preventDefault();show(viewer.index+1);}});
    let start=null;image.addEventListener('touchstart',event=>{start=event.touches.length===1?event.touches[0].clientX:null;},{passive:true});image.addEventListener('touchend',event=>{if(start!==null){const distance=event.changedTouches[0].clientX-start;if(Math.abs(distance)>55)show(viewer.index+(distance<0?1:-1));}start=null;},{passive:true});
    dialog.addEventListener('close',()=>{image.removeAttribute('src');viewer.images=[];});
  }
  viewer.title=entry.title||'Album parafialny';viewer.images=images;viewer.heading.textContent=viewer.title;viewer.credit.textContent=[entry.description,entry.author,entry.license].filter(Boolean).join(' · ');viewer.show(0);viewer.dialog.showModal();
}
