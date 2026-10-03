const LOCAL='https://www.kotuszow.pl/index.php/historia';
const BUSKI='https://www.powiatbuski1939-1945.pl/straty-materialne-kosciola/';
export function setupJourney({openHistory}) {
  const chapters=[
    {id:'temple',title:'Przekrocz próg świątyni',era:'Miejsce',image:'assets/kosciol-detal-wejscia.webp',description:'Brama, barokowe mury i historia kościoła, który powstał na nowo.'},
    {id:'book',title:'Siedem stuleci na dawnych kartach',era:'Początki i fundacje',image:'assets/archiwum/kotuszow-1929-s124.png',document:true,description:'Odkryj testament, dawne wnętrze i codzienność opisaną w 1929 roku.'},
    {id:'priests',title:'Ludzie, którzy zostawili ślad',era:'Proboszczowie',image:'assets/walesa-materski-sobczyk.webp',description:'Poznaj kapłanów, których dzieła stały się częścią pamięci Kotuszowa.'},
    {id:'war',title:'Nadzieja pośród ruin',era:'1944–1948',image:'assets/odbudowa-transport-drewna.webp',description:'Wojna, powrót mieszkańców i wspólna odbudowa. Prawdziwe fotografie i świadectwa.'},
    {id:'maps',title:'Znajdź Kotuszów na mapie',era:'Dawne drogi i granice',image:'assets/mapa-front-1944.webp',description:'Zobacz historyczne arkusze i mapy działań wojennych w okolicy.'},
    {id:'timeline',title:'Podróż przez daty',era:'1326–2021',image:'assets/muszla-jakubowa.svg',document:true,description:'Wybierz moment — od pierwszego proboszcza po powrót na szlak św. Jakuba.'},
    {id:'archive',title:'Zajrzyj do rodzinnej pamięci',era:'Archiwum',image:'assets/walesa-plebania-1983.webp',description:'Dawne fotografie, ludzie na plebanii i oryginalne strony historycznej księgi.'},
    {id:'landscape',title:'Jeszcze krok dalej',era:'W krajobrazie parafii',image:'assets/sady-kotuszow.webp',description:'Odkryj sady, Chańczę i krajobraz, który otacza naszą parafię.'}
  ];
  const overview=document.querySelector('#historyOverview');
  const intro=document.createElement('div');intro.className='journey-intro';
  const h=document.createElement('h2');h.textContent='Od czego zaczniemy?';
  const p=document.createElement('p');p.textContent='Wybierz opowieść i odkrywaj Kotuszów krok po kroku.';intro.append(h,p);
  const grid=document.createElement('div');grid.className='journey-grid';
  chapters.forEach((chapter,i)=>{
    const b=document.createElement('button');b.type='button';b.className='journey-card'+(chapter.document?' document':'');b.dataset.journey=chapter.id;
    const image=document.createElement('img');image.src=chapter.image;image.alt='';image.loading='lazy';
    const copy=document.createElement('span');copy.className='journey-card-copy';
    const era=document.createElement('small');era.textContent=`${String(i+1).padStart(2,'0')} · ${chapter.era}`;
    const title=document.createElement('strong');title.textContent=chapter.title;
    const description=document.createElement('p');description.textContent=chapter.description;
    const more=document.createElement('em');more.textContent='Zobacz tę opowieść →';copy.append(era,title,description,more);b.append(image,copy);
    b.addEventListener('click',()=>location.hash=`historia/${chapter.id}`);grid.append(b);
  });overview.append(intro,grid);

  const war=document.createElement('section');war.className='shell-width';war.dataset.journeyPanel='war';war.hidden=true;
  const title=document.createElement('h2');title.className='history-panel-title';title.textContent='Nadzieja pośród ruin';
  const lead=document.createElement('p');lead.textContent='Najpierw zniszczenie, potem mozolna odbudowa. Wybierz rozdział, aby poznać ludzi i wydarzenia stojące za tymi fotografiami.';
  const warLinks=document.createElement('div');warLinks.className='important-grid';
  for(const [id,label] of [['1944','Jak wojna zmieniła Kotuszów'],['sobczyk','Ks. Sobczyk i odbudowa kościoła'],['1955','Przywracanie wnętrza świątyni']]){
    const b=document.createElement('button');b.type='button';b.className='home-action home-action-secondary';b.textContent=label+' →';b.addEventListener('click',()=>openHistory(id));warLinks.append(b);
  }
  war.append(title,lead,warLinks,makeGallery([
    {image:'assets/szkola-zniszczenia.webp',caption:'Zniszczony budynek szkoły. Zdjęcie z lokalnego opracowania historii Kotuszowa.',source:LOCAL},
    {image:'assets/dom-ocalaly.webp',caption:'Jeden z ocalałych domów. Autor i dokładna data fotografii niepodani w źródle.',source:LOCAL},
    {image:'assets/odbudowa-transport-drewna.webp',caption:'Drewno na nowy dach kościoła transportowane przy pomocy krów. Fotografia archiwalna.',source:BUSKI}
  ]));document.querySelector('#page-historia').append(war);
  document.querySelector('[data-journey-panel="archive"]').prepend(makeGallery([
    {image:'assets/walesa-plebania-1983.webp',caption:'Lech Wałęsa na plebanii w Kotuszowie, 1983 r. Tak wydarzenie opisuje źródło lokalne.',source:LOCAL},
    {image:'assets/walesa-materski-sobczyk.webp',caption:'Lech Wałęsa, bp Edward Materski i ks. Antoni Sobczyk. Autor fotografii niepodany.',source:LOCAL}
  ]));
  const maps=document.querySelector('[data-journey-panel="maps"]>.shell-width');
  maps.append(makeGallery([
    {image:'assets/mapa-front-1944.webp',caption:'Linia frontu w 1944 r. Reprodukcja mapy opublikowana w lokalnym opracowaniu.',source:LOCAL},
    {image:'assets/mapa-ruchy-1944.webp',caption:'Ruchy wojsk w 1944 r. Osobna reprodukcja — nie współczesna mapa drogowa.',source:LOCAL}
  ]));

  const forward=document.createElement('div');forward.className='journey-forward shell-width';forward.hidden=true;
  const prompt=document.createElement('p');prompt.textContent='Dokąd pójdziemy dalej?';
  const next=document.createElement('button');next.type='button';forward.append(prompt,next);document.querySelector('#page-historia').append(forward);
  const bar=document.querySelector('#journeyBar');
  document.querySelector('#journeyBack').addEventListener('click',()=>location.hash='historia');
  const panels=[...document.querySelectorAll('[data-journey-panel]')];
  function sync(){
    const [route,id]=location.hash.slice(1).split('/');
    const index=chapters.findIndex(c=>c.id===id);const selected=route==='historia'&&index>=0;
    overview.hidden=selected;bar.hidden=!selected;forward.hidden=!selected;
    panels.forEach(panel=>panel.hidden=!selected||panel.dataset.journeyPanel!==id);
    if(selected){document.querySelector('#journeyPosition').textContent=`${index+1} / ${chapters.length} · ${chapters[index].era}`;
      const following=chapters[index+1];next.textContent=following?following.title+' →':'Wejdź do kościoła →';next.onclick=()=>location.hash=following?`historia/${following.id}`:'zwiedzanie';}
  }
  window.addEventListener('hashchange',sync);sync();
  // Temat parafialny ma pierwszeństwo nawet wtedy, gdy relację opublikowała gmina.
  const archive=document.createElement('section');archive.className='shell-width parish-news-archive';
  const archiveTitle=document.createElement('h2');archiveTitle.className='history-panel-title';archiveTitle.textContent='Z pamięci naszej wspólnoty';
  const archiveNote=document.createElement('p');archiveNote.textContent='Materiały archiwalne. Nowe ogłoszenia parafialne znajdziesz powyżej.';
  const newsGrid=document.querySelector('#fallbackNewsGrid');
  archive.append(archiveTitle,archiveNote,newsGrid);document.querySelector('#municipalNews').before(archive);
  document.querySelector('.curated-heading').remove();
}

function makeGallery(records){
  const grid=document.createElement('div');grid.className='historical-gallery';
  records.forEach(record=>{
    const figure=document.createElement('figure');const a=document.createElement('a');a.href=record.image;a.target='_blank';a.rel='noopener';a.setAttribute('aria-label',record.caption+' — otwórz pełne zdjęcie');
    const image=document.createElement('img');image.src=record.image;image.alt=record.caption;image.loading='lazy';a.append(image);
    const caption=document.createElement('figcaption');caption.textContent=record.caption;
    const source=document.createElement('a');source.href=record.source;source.target='_blank';source.rel='noopener';source.textContent=record.source===LOCAL?'Źródło: Kotuszow.pl · historia opracowana przez Tomasza Skuzę':'Źródło: Powiat Buski 1939–1945';caption.append(source);figure.append(a,caption);grid.append(figure);
  });return grid;
}

function addHomeInvitations(){
  const section=document.createElement('section');section.className='home-discover shell-width';
  const title=document.createElement('h2');title.textContent='Zostań z nami jeszcze chwilę';
  const grid=document.createElement('div');grid.className='invitation-grid';
  const items=[
    {route:'zwiedzanie',image:'assets/kosciol-z-lotu-ptaka.webp',title:'Zobacz kościół inaczej',description:'Od kamiennej bramy po ołtarz. Wejdź, przybliż i odkryj.',cta:'Rozpocznij zwiedzanie →'},
    {route:'historia/war',image:'assets/odbudowa-transport-drewna.webp',title:'Poznaj siłę tej wspólnoty',description:'Jak mieszkańcy podnosili kościół z ruin? Ta historia porusza.',cta:'Zajrzyj do historii →'},
    {route:'cmentarz',image:'assets/muszla-jakubowa.svg',title:'Pamiętajmy o bliskich',description:'Znajdź miejsce spoczynku, plan cmentarza i przydatne informacje.',cta:'Przejdź do cmentarza →',memory:true}
  ];
  items.forEach(item=>{
    const a=document.createElement('a');a.className='invitation'+(item.memory?' is-memory':'');a.href='#'+item.route;
    const image=document.createElement('img');image.src=item.image;image.alt='';image.loading='lazy';
    const copy=document.createElement('div');copy.className='invitation-copy';const h=document.createElement('h3');h.textContent=item.title;
    const p=document.createElement('p');p.textContent=item.description;const strong=document.createElement('strong');strong.textContent=item.cta;copy.append(h,p,strong);a.append(image,copy);grid.append(a);
  });section.append(title,grid);document.querySelector('#page-start').append(section);
}
