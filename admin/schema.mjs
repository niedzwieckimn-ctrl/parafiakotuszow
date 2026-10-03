const field = (name, label, type = 'text', extra = {}) => ({ name, label, type, ...extra });
const common = [field('title','Tytuł'), field('date','Data','date'), field('published','Widoczne na stronie','checkbox',{default:false})];
export const collections = [
  {name:'ogloszenia',label:'Ogłoszenia',fields:[...common,
    field('category','Rodzaj','select',{options:['Ogłoszenia','Nabożeństwa','Wydarzenia','Wspólnota'],default:'Ogłoszenia'}),
    field('pinned','Ważne — pokaż jako pierwsze','checkbox'),field('summary','Krótki opis','textarea'),field('body','Pełna treść','textarea',{optional:true}),field('image','Zdjęcie / plakat','image',{optional:true})]},
  {name:'intencje',label:'Msze i intencje',fields:[...common,field('masses','Msze święte','masses')]},
  {name:'galeria',label:'Zdjęcia i zwiedzanie',fields:[...common,field('image','Fotografia','image'),field('description','Opis','textarea'),field('author','Autor / właściciel zbiorów'),field('license','Licencja lub zgoda na publikację'),field('source','Link do źródła','url',{optional:true}),field('w_spacerze','Pokaż też w zwiedzaniu — tylko kościół i jego detale','checkbox')]},
  {name:'slowo-na-dzis',label:'Słowo otuchy',fields:[...common,
    field('liturgicalDay','Dzień liturgiczny'),field('quote','Dosłowny, krótki cytat biblijny','textarea'),field('reference','Księga i werset'),field('reflection','Myśl na dziś — refleksja autorska','textarea'),field('readingsUrl','Czytania na tę datę','url'),field('cycle','Rok / cykl czytań'),field('calendarScope','Kalendarz','hidden',{default:'PL-SANDOMIERZ-KOTUSZOW'}),field('calendarNote','Źródła weryfikacji — Polska, diecezja, parafia','textarea'),field('verifiedAt','Data sprawdzenia','date'),field('reviewed','Sprawdzono dosłowny cytat i refleksję','checkbox'),field('localCalendarVerified','Potwierdzono obchody diecezji i parafii','checkbox')]}
];
export const places = ['Kościół w Kotuszowie','Kaplica w Chańczy'];
