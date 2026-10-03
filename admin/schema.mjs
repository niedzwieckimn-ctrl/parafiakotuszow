const field = (name, label, type = 'text', extra = {}) => ({ name, label, type, ...extra });
const common = [field('title','Tytuł'), field('date','Data','date'), field('published','Widoczne na stronie','checkbox',{default:false})];
export const collections = [
  {name:'ogloszenia',label:'Ogłoszenia',fields:[...common,
    field('category','Rodzaj','select',{options:['Ogłoszenia','Nabożeństwa','Wydarzenia','Wspólnota'],default:'Ogłoszenia'}),
    field('pinned','Ważne — pokaż jako pierwsze','checkbox'),field('summary','Krótki opis','textarea'),field('body','Pełna treść','textarea',{optional:true}),field('image','Zdjęcie / plakat','image',{optional:true})]},
  {name:'intencje',label:'Msze i intencje',fields:[...common.map(f=>f.name==='title'?{...f,optional:true}:f),field('masses','Msze święte','masses')]},
  {name:'galeria',label:'Zdjęcia i albumy',fields:[...common,field('image','Zdjęcie główne','image'),field('photos','Zdjęcia w albumie','photos',{optional:true}),field('description','Opis','textarea',{optional:true}),field('author','Autor zdjęć'),field('license','Zgoda na publikację'),field('source','Link do źródła','url',{optional:true}),field('w_spacerze','Pokaż zdjęcie kościoła w zwiedzaniu','checkbox')]},
  {name:'slowo-na-dzis',label:'Słowo na dziś',fields:[...common,
    field('liturgicalDay','Dzień liturgiczny'),field('quote','Dosłowny, krótki cytat biblijny','textarea'),field('reference','Księga i werset'),field('reflection','Myśl na dziś — refleksja autorska','textarea'),field('readingsUrl','Czytania na tę datę','url'),field('cycle','Rok / cykl czytań'),field('calendarScope','Kalendarz','hidden',{default:'PL-SANDOMIERZ-KOTUSZOW'}),field('calendarNote','Źródła weryfikacji — Polska, diecezja, parafia','textarea'),field('verifiedAt','Data sprawdzenia','date'),field('reviewed','Sprawdzono dosłowny cytat i refleksję','checkbox'),field('localCalendarVerified','Potwierdzono obchody diecezji i parafii','checkbox')]}
];
export const places = ['Kościół w Kotuszowie','Kaplica w Chańczy'];
