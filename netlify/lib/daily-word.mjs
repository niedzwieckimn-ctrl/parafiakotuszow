import {plainText} from '../functions/news.mjs';
import {warsawDay,readingsUrl,CALENDAR_SCOPE} from '../../calendar.mjs';

export const GENERATOR_VERSION='liturgical-rules-v2';
const MONTHS=['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
export const calendarUrl=year=>`https://gcatholic.org/calendar/${year}/PL-sand1-pl`;
export const calendarFeed=year=>`https://gcatholic.org/calendar/ics/${year}-pl-PL-sand1.ics?v=3`;
const fold=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('ł','l').toLowerCase();
const validDate=date=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&new Date(date+'T12:00:00Z').toISOString().slice(0,10)===date;
const words=value=>value.trim().split(/\s+/).length;

export function parseCalendar(ics,year) {
  const source=ics.replace(/\r?\n[ \t]/g,'');
  if(!source.includes('BEGIN:VCALENDAR')||!source.includes(`Kalendarz liturgiczny ${year} (Sandomierz)`))throw new Error('Incorrect calendar');
  const days={};
  for(const event of source.matchAll(/BEGIN:VEVENT\r?\n([\s\S]*?)END:VEVENT/g)) {
    const date=event[1].match(/^DTSTART;VALUE=DATE:(\d{8})\r?$/m)?.[1];
    const uid=event[1].match(/^UID:([^\r\n]+)/m)?.[1];
    const raw=event[1].match(/^SUMMARY:([^\r\n]+)/m)?.[1];
    if(!date||!raw||!uid?.startsWith(`${year}-pl-PL-sand1-`)||date.slice(0,4)!==String(year))continue;
    const rank=raw.match(/\[([^\]]+)\]/)?.[1]||'';
    if(rank==='w'||rank==='w*')continue; // Optional observances do not override the principal day.
    const title=raw.replace(/\\([,;\\])/g,'$1').replace(/\\n/g,' ').replace(/\[[^\]]+\]\s*/,'').replace(/^[^\p{L}]+/u,'').trim();
    const key=`${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`;
    if(!validDate(key)||title.length<4||title.length>250)continue;
    if(days[key])throw new Error('Ambiguous principal day');
    days[key]={title,rank};
  }
  if(Object.keys(days).length<350)throw new Error('Incomplete calendar');
  return days;
}
function readReference(text) {
  if(text[0]!=='(')return null;
  let depth=0;
  for(let i=0;i<Math.min(text.length,200);i++) {
    if(text[i]==='(')depth++;
    if(text[i]===')'&&--depth===0)return {reference:text.slice(1,i).trim(),text:text.slice(i+1).trim()};
  }
  return null;
}
export function parseReadings(html,date) {
  if(!validDate(date))throw new Error('Invalid date');
  const [year,month,day]=date.split('-').map(Number);
  const heading=html.slice(0,html.indexOf('<h2>Czytania'));
  const expected=new RegExp(`\\b0?${day}\\s+${MONTHS[month-1]}\\s+${year}\\b`);
  if(!expected.test(plainText(heading)))throw new Error('Source date mismatch');
  const title=plainText(heading.match(/<p\b[^>]*class=["']subtitle["'][^>]*>([\s\S]*?)<\/p>/i)?.[1]||'');
  if(!title)throw new Error('Missing liturgical day');
  const body=html.match(/<h2>Czytania<\/h2>([\s\S]*?)<\/section>/i)?.[1];
  if(!body)throw new Error('Missing readings');
  const blocks=[];let current=null;
  for(const part of body.matchAll(/<p\b[^>]*>([\s\S]*?)(?=<p\b|$)/gi)) {
    const text=plainText(part[1]);
    const parsed=readReference(text);
    if(parsed) {
      if(!/^(?:[1-3]\s*)?[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+\s+\d/.test(parsed.reference))throw new Error('Unexpected reference');
      current={reference:parsed.reference,parts:[]};blocks.push(current);
      if(parsed.text)current.parts.push(parsed.text.replace(/^REFREN:\s*/i,''));
    } else if(current&&text)current.parts.push(text);
  }
  if(blocks.length<3||!blocks.some(b=>/^Ps\s/.test(b.reference))||!blocks.some(b=>/^(Mt|Mk|Łk|J)\s/.test(b.reference)))throw new Error('Incomplete readings');
  return {title,blocks:blocks.map(block=>({...block,text:block.parts.join(' ')}))};
}
export function compatibleDays(calendarDay,readingsDay) {
  const normalize=value=>fold(value).replace(/\bokresu\b/g,'').replace(/[.,()–—-]/g,' ').replace(/\s+/g,' ').trim();
  const a=normalize(calendarDay),b=normalize(readingsDay);
  if(a===b)return true;
  // Never accept another week just because both headings say 'Saturday'.
  if(/\b[ivxl]+\b/.test(a)&&/(tygodnia|niedziela)/.test(a))return false;
  const generic=/^(sw|swieto|swiet\w*|uroczystosc|wspomnienie|bl|blogoslaw\w*|prezb\w*|bisk\w*|doktor\w*|kosci\w*|dziew\w*|meczen\w*|apostol\w*|ewangel\w*|zakon\w*|oraz|towarz\w*|i)$/;
  const tokens=value=>value.split(' ').filter(word=>word.length>=4&&!generic.test(word)).map(word=>word.slice(0,5));
  const required=tokens(a),source=tokens(b);
  return required.length>0&&required.every(word=>source.includes(word));
}
export function readingUse(day,readings,date) {
  if(compatibleDays(day.title,readings.title))return 'matching-day';
  // OWMR 358 permits weekday readings for memorials without proper NT readings.
  // A deliberately explicit allowlist: never extrapolate this rule to every memorial.
  const withoutProperNT=/faustyn.*kowalsk|wincent.*kadlubk|teres.*dzieciatka|teres.*jezusa|ignac.*antioch|jan.*kant|franciszk.*ksawer|ambroz|franciszk.*salez/;
  const weekday=['niedziela','poniedzialek','wtorek','sroda','czwartek','piatek','sobota'][new Date(date+'T12:00:00Z').getUTCDay()];
  if(day.rank==='W'&&withoutProperNT.test(fold(day.title))&&weekday!=='niedziela'&&fold(readings.title).startsWith(weekday+' ')&&/tygodnia/.test(readings.title))return 'weekday-memorial';
  return null;
}
export function localRestriction(date) {
  // These local celebrations can require other readings than the national day.
  // Historical dedication date and patron documented by the diocese. No guessed transfers.
  if(date.endsWith('-07-25'))return 'Uroczystość św. Jakuba — patrona parafii. Potrzebne potwierdzenie czytań miejscowej uroczystości.';
  if(date.endsWith('-11-11'))return 'Rocznica poświęcenia kościoła w Kotuszowie. Potrzebne potwierdzenie miejscowych obchodów i czytań.';
  return '';
}
export function readingCycle(date) {
  const year=Number(date.slice(0,4));
  const december3=new Date(Date.UTC(year,11,3));
  december3.setUTCDate(3-december3.getUTCDay());
  const liturgicalYear=date>=december3.toISOString().slice(0,10)?year+1:year;
  return `Rok niedzielny ${['C','A','B'][liturgicalYear%3]}; cykl powszedni ${year%2?'I':'II'}`;
}

// The exact quote is always taken from today's biblical text, not from another author’s reflection.
const anchors=[
  {quote:'cieszcie się, że wasze imiona zapisane są w niebie',reference:'Łk 10,20',passage:/^Łk 10,\s*17-24$/,theme:'name'},
  {quote:'Kamień odrzucony przez budujących stał się głowicą węgła',reference:'Mt 21,42',passage:/^Mt 21,\s*33-43$/,theme:'stone'},
];
const THEMES=[
  {id:'vineyard',pattern:/winnic|rolnik/,title:'Zatroszcz się o powierzone dobro',first:'Jezus opowiada o winnicy powierzonej rolnikom. Ta przypowieść skłania do pytania, jak odpowiadamy na otrzymane dobro i czy robimy miejsce dla Boga.',steps:['Zauważ jedną rzecz, o którą możesz dziś zadbać z większą wdzięcznością i uczciwością.','Nie odkładaj drobnego dobra, które zależy od Ciebie: słowa pojednania, troski albo pomocy.','Przynieś Bogu także to, co zaniedbane, i szukaj jednego małego kroku ku zmianie.']},
  {id:'faith',pattern:/wiar.*gorczy|gorczy.*wiar|przymnoz.*wiar/,title:'Mały krok wiary ma znaczenie',first:'Jezus mówi o wierze jak ziarnko gorczycy. Nie chodzi o popisywanie się siłą, lecz o zaufanie, które może zacząć się bardzo skromnie.',steps:['Powierz Mu dziś jedną sprawę i spróbuj zrobić najbliższy dobry krok.','Nie porównuj swojej wiary z wiarą innych; przynieś Bogu także własną niepewność.','Zacznij od prostej prośby o wiarę i spokojnie podejmij to, co należy do Ciebie.']},
  {id:'listening',pattern:/sluchaj.*slowa.*boz|slowa.*boz.*sluchaj|slowa.*boz.*zachow/,title:'Zabierz Słowo w swój dzień',first:'Jezus wskazuje na słuchanie słowa Bożego i zachowywanie go. Ta bliskość nie kończy się na przeczytaniu zdania; może wzrastać w codziennym życiu.',steps:['Wybierz jedną myśl z Ewangelii i znajdź dla niej miejsce w dzisiejszym postępowaniu.','Zatrzymaj się przed rozmową i zapytaj, jak odpowiedzieć z większą życzliwością.','Nie wymagaj od siebie doskonałości. Wróć do Słowa i zacznij od jednego dobrego gestu.']},
  {id:'neighbour',pattern:/samarytan|blizni|opatrz.*ran/,title:'Dobro jest bliżej, niż myślisz',first:'Ewangelia zachęca, aby dostrzec człowieka, który potrzebuje pomocy. Miłość bliźniego przybiera kształt obecności, troski i konkretnego działania.',steps:['Rozejrzyj się dziś uważnie: może ktoś blisko Ciebie potrzebuje rozmowy lub drobnej pomocy.','Nie musisz zmieniać całego świata, aby nie przejść obojętnie obok jednej osoby.','Daj komuś trochę swojego czasu, bez pośpiechu i bez oceniania.']},
  {id:'presence',pattern:/marto|marta.*maria|jednego.*potrzeba/,title:'Zrób miejsce na chwilę obecności',first:'Pośród wielu zajęć Jezus zaprasza do uważnego słuchania. Obowiązki są ważne, ale nie muszą zabierać całego miejsca na spotkanie z Nim i z ludźmi.',steps:['Znajdź dziś krótką chwilę ciszy, w której niczego nie musisz udowadniać.','Spróbuj w jednej rozmowie być naprawdę obecnym, zamiast myśleć już o kolejnym zadaniu.','Zatrzymaj się na moment i powierz Bogu to, co rozprasza Twoje serce.']},
  {id:'mercy',pattern:/milosier|przebacz|odpuszcz|laskaw/,title:'Zrób miejsce dla miłosierdzia',first:'Dzisiejsze słowa prowadzą ku miłosierdziu. Możesz stanąć przed Bogiem bez udawania, że wszystko jest już uporządkowane.',steps:['Zacznij od szczerej modlitwy i jednego gestu życzliwości.','Jeśli nosisz w sercu żal, opowiedz o nim Bogu; nie musisz przejść tej drogi w jednej chwili.','Spróbuj dziś spojrzeć na siebie i drugiego człowieka z większą cierpliwością.']},
  {id:'trust',pattern:/ufam|zauf|nadziej|schron|ucieczk|opoka|skala/,title:'Możesz powierzyć Mu ten dzień',first:'Te słowa są zaproszeniem do zaufania. Wiara nie usuwa wszystkich pytań, ale pozwala przynieść je Bogu.',steps:['Powiedz Mu także o tym, co jest dziś dla Ciebie trudne.','Zrób spokojnie najbliższy dobry krok, bez wymagania od siebie odpowiedzi na wszystko.','Zatrzymaj się na chwilę i powierz Mu jedną troskę, którą nosisz w sercu.']},
  {id:'light',pattern:/swiatl|oswieca|slowo|slow|napomn|przykaz|ustaw|naucz|zrozum/,title:'Światło na kolejny krok',first:'Dzisiejsze słowa zapraszają do słuchania Boga. Nie musisz od razu rozumieć całej drogi, aby szukać światła na jej najbliższy odcinek.',steps:['Wróć dziś do jednego zdania z czytania i pozwól mu towarzyszyć Twoim decyzjom.','Daj sobie chwilę ciszy przed decyzją, która budzi w Tobie niepokój.','Poproś o uważność i odwagę do małego, uczciwego kroku.']},
  {id:'love',pattern:/milosc|miluje|koch|dobroc|dobry|dzieck|dzieci/,title:'Dobro zaczyna się blisko',first:'Dzisiejsze słowa zwracają uwagę ku miłości i dobru. Ich miejscem może być zwyczajna rozmowa, cierpliwe słuchanie i obecność przy drugim człowieku.',steps:['Wybierz jeden mały gest, którym okażesz dziś komuś troskę.','Nie lekceważ cichego dobra, które możesz zrobić bez rozgłosu.','Spróbuj spotkać najbliższą osobę z uwagą, nie tylko z gotową odpowiedzią.']},
  {id:'joy',pattern:/rados|ciesz|wesel|dziekuj|chwal|wyslaw|blogoslaw/,title:'Zauważ mały powód do wdzięczności',first:'W dzisiejszych słowach jest miejsce na wdzięczność. Nie trzeba zaprzeczać trudnościom, aby zauważyć dobro, które jest obok.',steps:['Przypomnij sobie jedną osobę lub chwilę, za którą chcesz podziękować Bogu.','Zatrzymaj na moment to, co dobre, zamiast przejść obok niego w pośpiechu.','Podziękuj dziś komuś za drobny gest; takie słowa również budują wspólnotę.']},
  {id:'prayer',pattern:/modl|wolam|wolaj|wysluch|prosze|uslysz/,title:'Możesz mówić do Boga szczerze',first:'Te słowa pomagają wejść w modlitwę. Nie musisz dobierać pięknych zdań; możesz zacząć od tego, co naprawdę przeżywasz.',steps:['Powiedz Bogu jednym zdaniem, czego dziś potrzebuje Twoje serce.','Pozostań przez chwilę w ciszy, także jeśli nie przychodzą łatwe odpowiedzi.','Zanieś w modlitwie również człowieka, który potrzebuje dziś wsparcia.']},
];
const VARIATIONS={
  mercy:{titles:['Łagodność otwiera serce','Możesz zacząć od nowa','Zrób miejsce dla miłosierdzia'],openings:['Miłosierdzie pozwala przyjść do Boga także z tym, co boli i zawstydza. Szczerość może być początkiem drogi ku pojednaniu.','Psalm przypomina o Bożej łaskawości. Możesz szukać jej nie tylko dla siebie, ale też w swoim spojrzeniu na drugiego człowieka.']},
  trust:{titles:['Zaufanie na zwyczajny dzień','Powierz Mu swoją troskę','Nie musisz znać całej drogi'],openings:['W obrazie schronienia i nadziei jest miejsce również na Twoją niepewność. Zaufanie Bogu nie wymaga udawania, że niczego się nie boisz.','Psalm uczy powierzania Bogu tego, czego nie potrafimy sami uporządkować. Nie musisz mieć gotowych odpowiedzi, by zacząć się modlić.']},
  light:{titles:['Szukaj światła w Słowie','Jeden krok w dobrym kierunku','Daj sobie chwilę na słuchanie'],openings:['Prośba o mądrość jest modlitwą człowieka, który wciąż się uczy. Możesz przynieść Bogu swoje decyzje, wątpliwości i pragnienie dobra.','Słowo Boże zaprasza do uważności. Może pomóc zobaczyć najbliższy krok, nawet kiedy dalsza droga pozostaje niejasna.']},
  love:{titles:['Dobro zaczyna się blisko','Miłość w małych gestach','Zauważ człowieka obok'],openings:['Dobro nie zawsze potrzebuje wielkich słów. Może wyrazić się w spokojnej rozmowie, uczciwej decyzji albo cierpliwej obecności.','Miłość, o której przypomina dzisiejszy fragment, szuka miejsca w zwyczajnym życiu. Nawet drobny gest może być ważny dla człowieka obok.']},
  joy:{titles:['Zauważ dobro tego dnia','Wdzięczność pośród codzienności','Zachowaj mały powód do radości'],openings:['Wdzięczność nie wymaga, aby cały dzień był łatwy. Możesz zauważyć dobro i jednocześnie szczerze przeżywać to, co trudne.','Psalm zaprasza do chwalenia Boga. Zatrzymaj się przy tym, co dobre, także jeśli obok pozostają pytania i troski.']},
  prayer:{titles:['Twoja modlitwa nie musi być idealna','Powiedz Bogu, co nosisz w sercu','Jest miejsce na szczerą modlitwę'],openings:['Wołanie do Boga może być bardzo proste. Nie potrzebujesz pięknych zdań, aby mówić o swoim zmęczeniu, wdzięczności lub nadziei.','Prośba o wysłuchanie przypomina, że modlitwa mieści także bezradność. Możesz zwrócić się do Boga tak, jak potrafisz dzisiaj.']},
};
const choiceSeed=value=>{let seed=2166136261;for(const char of value)seed=Math.imul(seed^char.codePointAt(0),16777619);return seed>>>0;};
function reflectionFor(theme,date,context='') {
  if(theme==='name')return {title:'Jesteś ważny dla Boga',reflection:'Wśród codziennych trosk zachowaj w sercu tę pewność: Bóg zna Twoje imię. Więź z Nim może być źródłem radości także wtedy, gdy przeżywasz trudny dzień.'};
  if(theme==='stone')return {title:'Odrzucenie nie musi mieć ostatniego słowa',reflection:'Jezus przywołuje obraz odrzuconego kamienia. Możesz przynieść Mu także swoje doświadczenie odrzucenia, bez udawania, że nie boli. Szukaj dziś jednego małego kroku ku dobru i ludziom, którzy mogą Ci towarzyszyć.'};
  const profile=THEMES.find(item=>item.id===theme);
  const seed=choiceSeed(`${date}|${context}`),variation=VARIATIONS[theme];
  if(profile)return {title:variation?variation.titles[seed%variation.titles.length]:profile.title,reflection:`${variation?variation.openings[Math.floor(seed/7)%variation.openings.length]:profile.first} ${profile.steps[Math.floor(seed/17)%profile.steps.length]}`};
  return {title:'Zatrzymaj się przy dzisiejszym Słowie',reflection:[
    'Przeczytaj te słowa powoli, razem z całym dzisiejszym czytaniem. Zauważ, co porusza Twoje serce, i opowiedz o tym Bogu. Nie potrzebujesz od razu gotowej odpowiedzi, aby zrobić miejsce na modlitwę.',
    'Te słowa są zaproszeniem do chwili uważności. Wróć do ich miejsca w dzisiejszym czytaniu i zapytaj, co możesz zabrać z niego w zwyczajny dzień. Daj sobie czas na modlitwę, także z pytaniami.',
    'Zatrzymaj się na chwilę przy tym fragmencie i przeczytaj całe dzisiejsze czytanie. Przynieś Bogu to, co jest w Tobie: wdzięczność, troskę lub pytanie. Szczera modlitwa nie wymaga doskonałych słów.',
  ][seed%3]};
}
export function composeWord(readings,day,date) {
  const gospel=readings.blocks.filter(block=>/^(Mt|Mk|Łk|J)\s/.test(block.reference)).at(-1);
  for(const anchor of anchors)if(gospel&&anchor.passage.test(gospel.reference)&&gospel.text.includes(anchor.quote))return {quote:anchor.quote,reference:anchor.reference,...reflectionFor(anchor.theme,date)};
  // These profiles describe the actual Gospel passage, not a generic daily slogan.
  const specific=THEMES.slice(0,5).find(theme=>theme.pattern.test(fold(gospel?.text||'')));
  if(specific&&gospel){
    const short=gospel.parts.flatMap(part=>part.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).map(text=>text.trim()).filter(text=>words(text)>=4&&words(text)<=25&&text.length<=300);
    const selected=short.find(text=>specific.pattern.test(fold(text)));
    if(selected)return {quote:selected,reference:gospel.reference,...reflectionFor(specific.id,date,`${gospel.reference}|${selected}`)};
  }
  const psalm=readings.blocks.find(block=>/^Ps\s/.test(block.reference));
  // Prefer a complete short sentence/stanza, never a chopped long biblical sentence.
  const candidates=(psalm?.parts||[]).flatMap(part=>part.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).map(text=>text.trim()).filter(text=>words(text)>=4&&words(text)<=25&&text.length<=300&&!/\bP\s+Pan\b/.test(text));
  if(!candidates.length)throw new Error('No safe short quotation');
  const scored=candidates.map(quote=>({quote,theme:THEMES.find(item=>item.pattern.test(fold(quote)))}));
  const preferred=scored.filter(item=>item.theme);
  const selected=(preferred.length?preferred:scored)[choiceSeed(`${date}|${psalm.reference}`)%(preferred.length||scored.length)];
  const theme=specific?.id||selected.theme?.id;
  return {quote:selected.quote,reference:psalm.reference,...reflectionFor(theme,date,`${gospel?.reference||psalm.reference}|${selected.quote}`)};
}

async function boundedFetch(url,fetcher,signal) {
  const response=await fetcher(url,{signal,redirect:'error',headers:{Accept:'text/html, text/calendar;q=0.9','User-Agent':'Parafia-Kotuszow-DailyWord/1.0'}});
  if(!response.ok)throw new Error('Source unavailable');
  const reader=response.body?.getReader();if(!reader)throw new Error('Missing source');
  const chunks=[];let size=0;
  try {while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>1000000){await reader.cancel();throw new Error('Source too large');}chunks.push(Buffer.from(value));}}finally{reader.releaseLock();}
  return Buffer.concat(chunks).toString('utf8');
}
export function createDailyWordService({fetcher=fetch,getStore=()=>null,now=()=>new Date()}={}) {
  const inFlight=new Map();
  return async request=>{
    const today=warsawDay(now()),year=Number(today.slice(0,4));
    const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=60','Netlify-CDN-Cache-Control':'public, durable, max-age=1800','Netlify-Vary':'query=date','X-Content-Type-Options':'nosniff'};
    const respond=(body,status=200)=>new Response(request.method==='HEAD'?null:JSON.stringify(body),{status,headers:status===200?headers:{...headers,'Cache-Control':'no-store','Netlify-CDN-Cache-Control':'no-store'}});
    const fallback=reason=>({date:today,entry:null,readingsUrl:readingsUrl(today),calendarUrl:calendarUrl(year)+`#${today.slice(5).replace('-','')}`,reason});
    if(!['GET','HEAD'].includes(request.method))return respond({error:'Użyj GET.'},405);
    const requested=new URL(request.url).searchParams.get('date');
    if(requested!==today)return respond({...fallback('date-mismatch'),error:'Zażądano innego dnia. Odśwież datę strony.'},400);
    let store;try{store=getStore();}catch{store=null;}
    const key=`${GENERATOR_VERSION}/${today}`;
    try {
      const cached=await store?.get(key,{type:'json'}).catch(()=>null);
      if(cached?.date===today&&cached.entry?.generationMethod===GENERATOR_VERSION&&Date.now()-cached.fetchedAt<6*3600000)return respond(cached);
      const flightKey=`${new URL(request.url).origin}:${today}`;
      if(!inFlight.has(flightKey))inFlight.set(flightKey,(async()=>{
        const restriction=localRestriction(today);if(restriction)return {...fallback('parish-observance'),notice:restriction,fetchedAt:Date.now()};
        const signal=AbortSignal.timeout(15000);
        const calendarKey=`calendar-v1/${year}`;
        const saved=await store?.get(calendarKey,{type:'json'}).catch(()=>null);
        const calendarPromise=saved?.year===year&&Date.now()-saved.fetchedAt<86400000?Promise.resolve(saved.days):boundedFetch(calendarFeed(year),fetcher,signal).then(async text=>{const days=parseCalendar(text,year);await store?.setJSON(calendarKey,{year,days,fetchedAt:Date.now()}).catch(()=>{});return days;});
        const [days,source]=await Promise.all([calendarPromise,boundedFetch(readingsUrl(today),fetcher,signal)]);
        const day=days[today];if(!day)throw new Error('Missing calendar day');
        const readings=parseReadings(source,today);
        const use=readingUse(day,readings,today);
        if(!use)return {...fallback('local-calendar-mismatch'),notice:`Kalendarz diecezji: ${day.title}. Nie potwierdzono właściwego zestawu czytań dla tego obchodu.`,fetchedAt:Date.now()};
        const composed=composeWord(readings,day,today);
        const entry={date:today,liturgicalDay:day.title,...composed,cycle:readingCycle(today),readingsUrl:readingsUrl(today),calendarUrl:calendarUrl(year)+`#${today.slice(5).replace('-','')}`,calendarScope:CALENDAR_SCOPE,generationMethod:GENERATOR_VERSION,generatedAt:now().toISOString(),automated:true,readingUse:use,readingsDay:readings.title,calendarNote:'Automatyczne porównanie daty i głównego obchodu: Mateusz oraz kalendarz Sandomierza GCatholic. W wybranych wspomnieniach bez własnych czytań NT stosowane są czytania dnia powszedniego (OWMR 358). Znane miejscowe uroczystości wymagające własnych czytań są chronione. Nie jest to zatwierdzenie redaktora ani oficjalne Ordo.'};
        const result={date:today,entry,fetchedAt:Date.now()};
        await store?.setJSON(key,result).catch(()=>{});
        return result;
      })());
      try{return respond(await inFlight.get(flightKey));}finally{inFlight.delete(flightKey);}
    }catch{return respond(fallback('source-unavailable'),502);}
  };
}
