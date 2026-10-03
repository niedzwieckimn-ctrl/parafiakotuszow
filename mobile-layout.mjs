export function setupMobileHome(){
  const opening=document.querySelector('.home-opening'),copy=opening.querySelector('.opening-copy'),photo=opening.querySelector('.opening-photo'),actions=document.querySelector('.opening-actions');
  const details=document.createElement('section');details.id='mobileDailyDetails';details.className='mobile-daily-details';details.setAttribute('aria-label','Myśl na dziś');details.hidden=true;opening.append(details);
  const movable=[actions,copy.querySelector('.opening-reflection'),copy.querySelector('#dailyWordProvenance')];
  const anchors=movable.map(element=>{const anchor=document.createComment('desktop-position');element.before(anchor);return anchor;});
  const media=matchMedia('(max-width:700px)');
  function sync(){
    if(media.matches){photo.before(actions);details.append(...movable.slice(1));}
    else movable.forEach((element,index)=>anchors[index].after(element));
    details.hidden=!media.matches||document.querySelector('#dailyWordContent').hidden;
  }
  media.addEventListener('change',sync);sync();return {refresh:sync};
}
