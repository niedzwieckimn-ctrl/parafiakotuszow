export const priests=[
  {name:'Ks. Patryk Kowalik',period:'od 24 września 2026',body:['Ks. Patryk Kowalik objął probostwo parafii św. Jakuba w Kotuszowie 24 września 2026 roku.','W opisie parafii na stronie Diecezji Sandomierskiej odnotowano jego wcześniejszą posługę jako administratora od 2024 roku.'],sources:['diocese'],note:'Data objęcia probostwa: informacja przekazana podczas przygotowywania strony.'},
  {name:'Ks. kan. Jerzy Sobczyk',period:'do 2026 · emerytowany proboszcz',body:['Ks. kan. Jerzy Sobczyk jest obecnie w stanie spoczynku. W czasie jego posługi rozwijano jakubowy charakter parafii.','Wspierał odtworzenie Małopolskiej Drogi św. Jakuba oraz wprowadzenie relikwii Apostoła do świątyni. Te wydarzenia związały Kotuszów ze szlakiem pielgrzymkowym i kultem patrona parafii.'],sources:['local','niedziela','ekai'],note:'Informacja o stanie spoczynku przekazana podczas przygotowywania strony. Data rozpoczęcia probostwa nie została jeszcze potwierdzona.'},
  {name:'Ks. kan. Antoni Sobczyk',period:'1945–2002',history:'sobczyk'},
  {name:'Ks. Jan Górka',period:'brak pełnych dat',body:['Ks. Jan Górka ukończył budowę organistówki z salą ludową. Przedsięwzięcie rozpoczął ks. Adolf Zarzycki, a kontynuowali jego następcy.','Ks. Jan Wiśniewski odnotował jego udział w pracach nad zapleczem parafii. Zachowane zestawienie nie podaje pełnych dat jego posługi.'],sources:['book','local']},
  {name:'Ks. Kazimierz Wilamowski',period:'do 1919'},
  {name:'Ks. Tomasz Czaplicki',period:'do 1915'},
  {name:'Ks. Adolf Zarzycki',period:'1900–1913',body:['Ks. Adolf Zarzycki pełnił posługę w latach 1900–1913. Według ks. Jana Wiśniewskiego wzniósł plebanię oraz rozpoczął budowę organistówki z salą ludową.','Prace kontynuowali kolejni duchowni, a ukończył ks. Jan Górka. Ten zapis pokazuje, jak następcy przejmowali rozpoczęte przedsięwzięcia parafialne.'],sources:['book','local']},
  {name:'Ks. Antoni Toczyłowski',period:'do 1899'},
  {name:'Ks. Marceli Gąsiorowski',period:'do 1892',body:['Ks. Marceli Gąsiorowski został odnotowany w dawnym wykazie proboszczów jako kapłan pełniący posługę do 1892 roku.','Ks. Jan Wiśniewski zachował o nim krótką informację: „jest po nim dzwon”. To ślad pamięci związany z wyposażeniem używanym przez parafialną wspólnotę.'],sources:['book','local']},
  {name:'Ks. Koloman Myrczyk',period:'1848–1886'},
  {name:'Ks. Jan Skibicki',period:'do 1848'},
  {name:'Ks. Antoni Walczewski',period:'1805–1826'},
  {name:'Ks. Paweł Sosiński',period:'1778–1805',history:'sosinski'},
  {name:'Ks. Wawrzyniec Sapiński',period:'do 1778',history:'sapinski'},
  {name:'Ks. Józef Cmieliński',period:'1748'},
  {name:'Ks. Paweł Lisiecki',period:'1677'},
  {name:'Ks. Paweł',period:'1326',history:'1326'}
];
export function setupPriests({getHistory,sources}){
  const list=document.querySelector('#priestsChronology');let dialog;
  function open(priest){
    if(!dialog){dialog=document.createElement('dialog');dialog.className='history-dialog priest-dialog';dialog.setAttribute('aria-labelledby','priestTitle');document.body.append(dialog);}
    const entry=priest.history?getHistory(priest.history):null;
    const body=entry?.body||priest.body||[`W zachowanym wykazie dawnych proboszczów Kotuszowa odnotowano: ${priest.name}. Okres wskazany w zestawieniu: ${priest.period}.`,'Nie mamy jeszcze pełniejszego opisu jego życia i posługi.'];
    dialog.replaceChildren();const close=document.createElement('button');close.type='button';close.className='priest-close';close.textContent='Wróć do listy ×';close.addEventListener('click',()=>dialog.close());
    const period=document.createElement('p');period.className='eyebrow';period.textContent=priest.period;
    const title=document.createElement('h2');title.id='priestTitle';title.textContent=priest.name;dialog.append(close,period,title);
    for(const text of body){const p=document.createElement('p');p.textContent=text;dialog.append(p);}
    const sourceTitle=document.createElement('h3');sourceTitle.textContent='Źródła';dialog.append(sourceTitle);
    for(const source of entry?.sources||(priest.sources||['local']).map(key=>sources[key])){const a=document.createElement('a');a.className='priest-source';a.href=source.url;a.textContent=source.label;a.target='_blank';a.rel='noopener';dialog.append(a);}
    if(priest.note){const note=document.createElement('p');note.className='priest-source-note';note.textContent=priest.note;dialog.append(note);}
    dialog.showModal();dialog.scrollTop=0;
  }
  priests.forEach(priest=>{const li=document.createElement('li'),date=document.createElement('span'),button=document.createElement('button');date.className='priest-period';date.textContent=priest.period;button.type='button';button.textContent=priest.name+' →';button.addEventListener('click',()=>open(priest));li.append(date,button);list.append(li);});
}
