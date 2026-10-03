import {selectDailyWord,warsawDay,readingsUrl,CALENDAR_SCOPE} from './calendar.mjs';
export function validAutomaticWord(entry,date) {
  return !!(entry&&entry.date===date&&entry.automated===true&&entry.generationMethod==='liturgical-rules-v1'&&entry.calendarScope===CALENDAR_SCOPE&&entry.readingsUrl===readingsUrl(date)&&entry.calendarUrl===`https://gcatholic.org/calendar/${date.slice(0,4)}/PL-sand1-pl#${date.slice(5).replace('-','')}`&&['title','liturgicalDay','quote','reference','reflection','cycle'].every(key=>typeof entry[key]==='string'&&entry[key].trim()&&entry[key].length<=1200)&&entry.quote.split(/\s+/).length<=25);
}
export function displayedWord(manual,automatic,now=new Date()) {
  const selected=selectDailyWord(manual,now);
  if(selected.entry)return {...selected,mode:'manual'};
  return validAutomaticWord(automatic,selected.date)?{date:selected.date,entry:automatic,url:automatic.readingsUrl,mode:'automatic'}:{...selected,mode:'readings'};
}
export function createAutomaticLoader({fetcher=fetch,now=()=>new Date(),onChange=()=>{}}={}) {
  let entry=null,result=null,pending='',sequence=0;
  return {
    get entry(){return validAutomaticWord(entry,warsawDay(now()))?entry:null;},
    get notice(){return result?.date===warsawDay(now())?result.notice||'':'';},
    get calendarUrl(){const date=warsawDay(now());return `https://gcatholic.org/calendar/${date.slice(0,4)}/PL-sand1-pl#${date.slice(5).replace('-','')}`;},
    async refresh() {
      const date=warsawDay(now());if(pending===date)return;
      const ticket=++sequence;pending=date;
      if(entry?.date!==date){entry=null;result=null;onChange();}
      try {
        const response=await fetcher(`/api/slowo-na-dzis?date=${date}`,{cache:'no-cache',signal:AbortSignal.timeout(18000)});
        const data=await response.json();
        if(ticket!==sequence||date!==warsawDay(now()))return;
        result=data.date===date?data:null;
        entry=response.ok&&data.date===date&&validAutomaticWord(data.entry,date)?data.entry:null;
      } catch {if(ticket!==sequence||date!==warsawDay(now()))return;entry=null;result=null;}
      finally{if(ticket===sequence){pending='';onChange();}}
    }
  };
}
