export function constrainPan(x,y,zoom,width,height) {
  return {x:Math.max(-(zoom-1)*width/2,Math.min((zoom-1)*width/2,x)),y:Math.max(-(zoom-1)*height/2,Math.min((zoom-1)*height/2,y))};
}
export function attachPhotoGestures(stage,image,onChange=()=>{}) {
  let zoom=1,x=0,y=0,lastTap=0,lastTapPoint=null;const pointers=new Map();
  const clamp=value=>Math.max(1,Math.min(5,value));
  const center=()=>{const r=stage.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};};
  function draw(){({x,y}=constrainPan(x,y,zoom,stage.clientWidth,stage.clientHeight));image.style.transform=`translate3d(${x}px,${y}px,0) scale(${zoom})`;stage.classList.toggle('is-zoomed',zoom>1);onChange({zoom,x,y});}
  function reset(){pointers.clear();zoom=1;x=0;y=0;draw();}
  function setZoom(value){zoom=clamp(value);if(zoom===1){x=0;y=0;}draw();}
  function zoomToPoint(point,amount=3){
    const css=getComputedStyle(image),left=parseFloat(css.paddingLeft)||0,right=parseFloat(css.paddingRight)||0,top=parseFloat(css.paddingTop)||0,bottom=parseFloat(css.paddingBottom)||0;
    const width=stage.clientWidth-left-right,height=stage.clientHeight-top-bottom;
    const fit=(css.objectFit==='cover'?Math.max:Math.min)(width/image.naturalWidth,height/image.naturalHeight);
    zoom=clamp(amount);x=-((left-right)/2+(point.x/100-.5)*image.naturalWidth*fit)*zoom;y=-((top-bottom)/2+(point.y/100-.5)*image.naturalHeight*fit)*zoom;draw();
  }
  const midpoint=points=>({x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2});
  stage.addEventListener('pointerdown',event=>{
    if(event.target.closest('button,a'))return;
    stage.setPointerCapture(event.pointerId);pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pointers.size===1){const now=Date.now(),p={x:event.clientX,y:event.clientY};if(lastTapPoint&&now-lastTap<300&&Math.hypot(p.x-lastTapPoint.x,p.y-lastTapPoint.y)<25){const c=center();if(zoom>1){zoom=1;x=0;y=0;}else{zoom=2.5;x=-(p.x-c.x)*(zoom-1);y=-(p.y-c.y)*(zoom-1);}draw();lastTap=0;}else{lastTap=now;lastTapPoint=p;}}else lastTap=0;
  });
  stage.addEventListener('pointermove',event=>{
    const old=pointers.get(event.pointerId);if(!old)return;const before=[...pointers.values()];pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});const after=[...pointers.values()];
    if(after.length===2){const distance=p=>Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),oldDistance=distance(before);if(!oldDistance)return;const next=clamp(zoom*distance(after)/oldDistance),a=midpoint(before),b=midpoint(after),c=center(),ratio=next/zoom;x=b.x-c.x-(a.x-c.x-x)*ratio;y=b.y-c.y-(a.y-c.y-y)*ratio;zoom=next;}
    else if(zoom>1){x+=event.clientX-old.x;y+=event.clientY-old.y;}draw();
  });
  const release=event=>{pointers.delete(event.pointerId);if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);};
  stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',event=>pointers.delete(event.pointerId));
  stage.addEventListener('wheel',event=>{if(!event.ctrlKey)return;event.preventDefault();setZoom(zoom+(event.deltaY<0?.15:-.15));},{passive:false});
  image.addEventListener('load',()=>{zoom=1;x=0;y=0;draw();});new ResizeObserver(draw).observe(stage);
  return {reset,setZoom,zoomToPoint,getState:()=>({zoom,x,y})};
}
let viewer;
export function openPhoto({image,title='Fotografia',credit=''}) {
  if(typeof image!=='string'||!/^\/?assets\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(jpe?g|png|webp|gif|avif)$/i.test(image))return;
  if(!viewer){
    const make=(tag,props={})=>Object.assign(document.createElement(tag),props);
    const dialog=make('dialog',{className:'photo-viewer'}),header=make('header'),heading=make('h2',{id:'photoViewerHeading'}),close=make('button',{type:'button',textContent:'Zamknij ×'}),stage=make('div',{className:'photo-viewer-stage'}),photo=make('img',{draggable:false}),footer=make('footer'),caption=make('p'),reset=make('button',{type:'button',textContent:'Całe zdjęcie'});
    dialog.setAttribute('aria-labelledby',heading.id);header.append(heading,close);stage.append(photo);footer.append(caption,reset);dialog.append(header,stage,footer);document.body.append(dialog);
    const gesture=attachPhotoGestures(stage,photo);reset.addEventListener('click',gesture.reset);close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{gesture.reset();photo.removeAttribute('src');});viewer={dialog,heading,caption,photo,gesture};
  }
  viewer.heading.textContent=title;viewer.caption.textContent=credit;viewer.photo.src=image;viewer.photo.alt=title;viewer.gesture.reset();if(!viewer.dialog.open)viewer.dialog.showModal();
}
export function setupPhotoLinks(){
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-full-photo]');
    const anchor=event.target.closest('.historical-gallery a[href^="assets/"],.chapter-figure a[href^="assets/"],.aerial-history a[href^="assets/"]');
    if(button||anchor){event.preventDefault();const el=button||anchor;openPhoto({image:button?button.dataset.fullPhoto:anchor.getAttribute('href'),title:el.querySelector('img')?.alt||'Fotografia',credit:el.closest('figure')?.querySelector('figcaption')?.textContent||''});}
  });
}
