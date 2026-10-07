// Tymczasowy pokaz: wyłącz enabled, gdy zastąpi go własny katalog i spacer 360°.
// URL iframe pochodzi z Google Maps > Udostępnij > Umieszczanie mapy.
// Nie pobieramy ani nie przechowujemy obrazów Google lub fotografii użytkowników.
export const GOOGLE_TOUR_DEMO={
  enabled:true,
  embedUrl:'https://www.google.com/maps/embed?pb=!4v1791368149115!6m8!1m7!1swAmta0DYRjnLMgIu4dF27A!2m2!1d50.60722971984514!2d21.06791910633279!3f97.74076!4f0!5f0.7820865974627469',
  panoramaUrl:'https://www.google.com/maps/place/Parafia+Rzymsko-Katolicka+%C5%9Awi%C4%99tego+Jakuba+Starszego+Aposto%C5%82a/@50.6072297,21.0679191,228a,75y,97.74h,90t/data=!3m7!1e1!3m5!1swAmta0DYRjnLMgIu4dF27A!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D0%26panoid%3DwAmta0DYRjnLMgIu4dF27A%26yaw%3D97.74076!7i16384!8i8192!4m9!3m8!1s0x4717fcac03b9ddef:0xe108dc8499764559!8m2!3d50.6071908!4d21.0684604!10e5!14m1!1BCgIgARICCAI!16s%2Fg%2F11g6q3x7hq',
  galleryUrl:'https://www.google.com/maps/place/Parafia+Rzymsko-Katolicka+%C5%9Awi%C4%99tego+Jakuba+Starszego+Aposto%C5%82a/@50.6072017,21.068048,3a,75y,90t/data=!3m8!1e2!3m6!1sCIABIhC3qKB9jLVeoH0hTTv_DqLt!2e10!3e12!6shttps:%2F%2Flh3.googleusercontent.com%2Fgps-cs-s%2FAHRPTWmiomkLvtKUqY_xCECvOVmXwQq_DOYTxQjkBxA7YVFXuYeIZmaCDNAmOH3v_zAFfqY3B4MnHAQn43vWpKHawaARPLnlSCi0vkbKnkT35-PFCpS4SrDSyJ3x7eoIkNT-eyyGR5Q7Ix8udnqu%3Dw203-h152-k-no!7i4000!8i3000!4m9!3m8!1s0x4717fcac03b9ddef:0xe108dc8499764559!8m2!3d50.6071908!4d21.0684604!10e5!14m1!1BCgIgAQ!16s%2Fg%2F11g6q3x7hq',
};

export function setupGoogleTour({config=GOOGLE_TOUR_DEMO,document:doc=document,window:win=window,onModeChange=()=>{}}={}) {
  const photoPanel=doc.querySelector('#photoTourPanel');
  const demoElements=[...doc.querySelectorAll('[data-google-tour-demo]')];
  if(!config.enabled) {demoElements.forEach(element=>element.remove());photoPanel.hidden=false;return {destroy(){}};}
  const panel=doc.querySelector('#googleTourPanel'),photoMode=doc.querySelector('#photoTourMode'),googleMode=doc.querySelector('#googleTourMode');
  const frame=doc.querySelector('#googleTourFrame'),preview=doc.querySelector('#googleTourPreview'),load=doc.querySelector('#loadGoogleTour'),stop=doc.querySelector('#stopGoogleTour');
  const links=[['#googlePanoramaLink',config.panoramaUrl],['#googleGalleryLink',config.galleryUrl],['#googlePhotoGalleryLink',config.galleryUrl]];
  // Stałe źródła demonstracji; brak dowolnych iframe z treści redakcyjnych.
  const url=new URL(config.embedUrl);
  if(url.origin!=='https://www.google.com'||url.pathname!=='/maps/embed'||!url.searchParams.get('pb'))throw new Error('Invalid Google panorama embed');
  for(const [selector,source] of links) {
    const target=new URL(source);
    if(target.origin!=='https://www.google.com'||!target.pathname.startsWith('/maps/'))throw new Error('Invalid Google source');
    doc.querySelector(selector).href=target.href;
  }
  function unload() {frame.removeAttribute('src');frame.hidden=true;preview.hidden=false;stop.hidden=true;}
  function show(mode) {
    const google=mode==='google';
    if(!google)unload();
    panel.hidden=!google;photoPanel.hidden=google;
    googleMode.setAttribute('aria-pressed',String(google));photoMode.setAttribute('aria-pressed',String(!google));
    onModeChange(mode);
  }
  const showPhotos=()=>show('photos'),showGoogle=()=>show('google');
  function start() {
    if(panel.hidden)return;
    frame.src=url.href;frame.hidden=false;preview.hidden=true;stop.hidden=false;
  }
  function leavePage() {if(win.location.hash.slice(1).split('/')[0]!=='zwiedzanie')unload();}
  photoMode.addEventListener('click',showPhotos);googleMode.addEventListener('click',showGoogle);
  load.addEventListener('click',start);stop.addEventListener('click',unload);win.addEventListener('hashchange',leavePage);
  return {destroy(){
    unload();photoMode.removeEventListener('click',showPhotos);googleMode.removeEventListener('click',showGoogle);
    load.removeEventListener('click',start);stop.removeEventListener('click',unload);win.removeEventListener('hashchange',leavePage);
    photoPanel.hidden=false;demoElements.forEach(element=>element.remove());
  }};
}
