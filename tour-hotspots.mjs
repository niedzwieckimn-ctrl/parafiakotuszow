// Coordinates refer to the actual photographic frame, not the surrounding stage.
// Navigation connects photographs. It does not claim continuous 3D or 360 capture.
export const tourPoints={
 'assets/kosciol-brama.webp':[{x:52,y:58,label:'Podejdź do kościoła',target:'assets/kosciol-fasada.webp'}],
 'assets/kosciol-fasada.webp':[{x:51,y:75,label:'Wejście do świątyni',target:'assets/kosciol-detal-wejscia.webp'},{x:78,y:47,label:'Obejdź kościół',target:'assets/kosciol-od-prezbiterium.webp'}],
 'assets/kosciol-detal-wejscia.webp':[{x:51,y:64,label:'Wejdź do nawy',target:'assets/kosciol-wnetrze.webp'}],
 'assets/kosciol-wnetrze.webp':[{x:64,y:43,label:'Podejdź do ołtarza',target:'assets/prezbiterium-front.webp'},{x:27,y:40,label:'Ambona',detail:'Drewniana ambona jest widoczna przy ścianie nawy. Przybliż fotografię, aby obejrzeć jej kształt i dekorację.'},{x:47,y:83,label:'Spójrz ku organom',target:'assets/nawa-organy-wspolnota.webp'}],
 'assets/prezbiterium-front.webp':[{x:51,y:44,label:'Obraz Matki Bożej',target:'assets/obraz-maryi-detal.webp'},{x:17,y:80,label:'Wróć do nawy',target:'assets/kosciol-wnetrze.webp'}],
 'assets/obraz-maryi-detal.webp':[{x:50,y:35,label:'Obejrzyj obraz',detail:'Zbliżenie obrazu Matki Bożej z Dzieciątkiem. Możesz przybliżyć fotografię, aby zobaczyć twarze oraz ozdobną sukienkę. Historyczne informacje i ich źródła znajdziesz w zakładce Historia.'},{x:78,y:82,label:'Cały ołtarz',target:'assets/prezbiterium-front.webp'}],
 'assets/nawa-organy-wspolnota.webp':[{x:48,y:23,label:'Organy i chór',detail:'Widok chóru muzycznego i organów od strony prezbiterium. Fotografia pokazuje także zgromadzoną wspólnotę; nie przedstawia aktualnie odbywającego się nabożeństwa.'},{x:83,y:72,label:'Spójrz ku ołtarzowi',target:'assets/prezbiterium-front.webp'}],
 'assets/kosciol-od-prezbiterium.webp':[{x:65,y:38,label:'Wieża i bryła',detail:'Spojrzenie na bryłę kościoła od strony prezbiterium. Przybliż zdjęcie, aby obejrzeć dachy, przypory i wieżę.'},{x:26,y:77,label:'Wróć do wejścia',target:'assets/kosciol-detal-wejscia.webp'}],
 'assets/oltarz-2025.webp':[{x:52,y:42,label:'Obraz z bliska',target:'assets/obraz-maryi-detal.webp'}],
 'assets/chor-2025.webp':[{x:50,y:30,label:'Widok ku organom',target:'assets/nawa-organy-wspolnota.webp'}],
 'assets/wnetrze-ku-chorowi-2025.webp':[{x:50,y:30,label:'Organy i wspólnota',target:'assets/nawa-organy-wspolnota.webp'}],
 'assets/liturgia-przy-oltarzu.webp':[{x:50,y:34,label:'Obraz z bliska',target:'assets/obraz-maryi-detal.webp'}]
};
export function setupHotspots({stage,image,scenes,onNavigate}) {
  const layer=document.getElementById('tourHotspots');
  const dialog=document.getElementById('tourDetailDialog');
  let current=null;
  function align(){
    if(!current || !image.naturalWidth || !stage.clientWidth)return;
    const css=getComputedStyle(image),left=parseFloat(css.paddingLeft),right=parseFloat(css.paddingRight),top=parseFloat(css.paddingTop),bottom=parseFloat(css.paddingBottom);
    const width=stage.clientWidth-left-right,height=stage.clientHeight-top-bottom;
    const scale=(css.objectFit==='cover'?Math.max:Math.min)(width/image.naturalWidth,height/image.naturalHeight);
    const photoW=image.naturalWidth*scale,photoH=image.naturalHeight*scale;
    for(const button of layer.children){const point=current.points[Number(button.dataset.point)];button.style.left=`${left+(width-photoW)/2+photoW*point.x/100}px`;button.style.top=`${top+(height-photoH)/2+photoH*point.y/100}px`;}
    layer.style.transform=image.style.transform;
  }
  function render(scene){
    const defined=tourPoints[scene.image];
    const index=scenes.indexOf(scene);
    const fallback=[{x:50,y:80,label:'Kolejny widok',target:scenes[(index+1)%scenes.length].image}];
    current={scene,points:defined || fallback};
    layer.replaceChildren(...current.points.map((point,index)=>{
      const button=document.createElement('button');button.type='button';button.className='tour-hotspot';button.dataset.point=String(index);button.setAttribute('aria-label',point.label);button.title=point.label;
      const symbol=document.createElement('span');symbol.className='hotspot-symbol';symbol.textContent=point.target?'➜':'i';symbol.setAttribute('aria-hidden','true');
      const label=document.createElement('span');label.className='hotspot-label';label.textContent=point.label;button.append(symbol,label);
      button.addEventListener('pointerdown',event=>event.stopPropagation());
      button.addEventListener('click',()=>{if(point.target){const target=scenes.findIndex(item=>item.image===point.target);if(target>=0)onNavigate(target);}else{document.getElementById('tourDetailTitle').textContent=point.label;document.getElementById('tourDetailText').textContent=point.detail;const link=document.getElementById('tourDetailSource');link.href=scene.source || scene.image;link.textContent=scene.credit || 'Źródło fotografii';dialog.showModal();}});
      return button;
    }));align();
  }
  image.addEventListener('load',align);
  new ResizeObserver(align).observe(stage);
  document.getElementById('closeTourDetail').addEventListener('click',()=>dialog.close());
  return {render,align};
}
