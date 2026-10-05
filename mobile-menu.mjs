export function setupMobileMenu({button,nav,doc=document,media=matchMedia('(max-width:960px)')}){
  const header=button.closest('header');
  const background=[...doc.querySelectorAll('main,body>footer,.skip-link')];
  const previousInert=new Map();
  let open=false;

  function close({restoreFocus=false}={}){
    const wasOpen=open;
    open=false;
    nav.classList.remove('is-open');
    button.setAttribute('aria-expanded','false');
    button.querySelector('.sr-only').textContent='Otwórz menu';
    doc.body.classList.remove('menu-open');
    for(const [element,value] of previousInert)element.inert=value;
    previousInert.clear();
    nav.inert=media.matches;
    if(wasOpen&&restoreFocus&&media.matches)button.focus({preventScroll:true});
  }

  function show(){
    if(!media.matches)return;
    open=true;
    nav.inert=false;
    nav.classList.add('is-open');
    button.setAttribute('aria-expanded','true');
    button.querySelector('.sr-only').textContent='Zamknij menu';
    doc.body.classList.add('menu-open');
    for(const element of background){previousInert.set(element,element.inert);element.inert=true;}
    (nav.querySelector('[aria-current="page"]')||nav.querySelector('a'))?.focus({preventScroll:true});
  }

  button.addEventListener('click',()=>open?close({restoreFocus:true}):show());
  doc.addEventListener('keydown',event=>{
    if(!open)return;
    if(event.key==='Escape'){event.preventDefault();close({restoreFocus:true});return;}
    if(event.key!=='Tab')return;
    const controls=[...header.querySelectorAll('a[href],button:not([disabled])')].filter(element=>!element.inert);
    const first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&doc.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&doc.activeElement===last){event.preventDefault();first.focus();}
  });
  media.addEventListener('change',()=>close());
  close();
  return {close,show};
}
