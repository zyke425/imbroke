import {chromium} from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const url='file:///'+path.join(root,'index.html').replaceAll('\\','/');
const out=path.join(root,'responsive-screenshots');fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-background-networking']});
const sizes=[[320,568],[360,800],[390,844],[412,915],[568,320],[800,360],[844,390],[915,412],[768,1024],[1024,768],[1366,768],[1920,1080]];
const results=[];
for(const [width,height] of sizes){
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<=915,reducedMotion:'reduce'});
  const errors=[],external=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(!request.url().startsWith('file:'))external.push(request.url())});
  const slides=[];
  for(let n=1;n<=19;n++){
    await page.goto(url+'#'+n);
    const state=await page.locator('.slide.is-active').evaluate(slide=>{
      const c=slide.querySelector('.content'),stage=slide.closest('.stage'),app=document.querySelector('.app');
      const cr=c?.getBoundingClientRect(),sr=stage.getBoundingClientRect();
      return {id:slide.dataset.id,bodyWide:document.documentElement.scrollWidth>innerWidth+2,
        contentWide:c?c.scrollWidth>c.clientWidth+2:false,contentTall:c?c.scrollHeight>c.clientHeight+2:false,
        scrollMode:c?getComputedStyle(c).overflowY:'none',stageHeight:Math.round(sr.height),contentHeight:cr?Math.round(cr.height):0,
        footerVisible:(()=>{const r=document.querySelector('.footer').getBoundingClientRect();return r.bottom<=innerHeight+2&&r.top>=-2})(),
        tinyControls:[...slide.querySelectorAll('button:not([hidden])')].filter(x=>getComputedStyle(x).display!=='none'&&x.getBoundingClientRect().width>0&&x.getBoundingClientRect().height<36).map(x=>x.textContent.trim().slice(0,30))};
    });slides.push(state);
    if([4,11,13,15,16,17].includes(n)&&[320,390,568,844,768].includes(width))await page.screenshot({path:path.join(out,`${width}x${height}-slide-${n}.png`)});
  }
  results.push({size:`${width}x${height}`,slides,errors,external});
  await page.close();
}
await browser.close();
fs.writeFileSync(path.join(root,'responsive-baseline.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(x=>({size:x.size,stageMin:Math.min(...x.slides.map(s=>s.stageHeight)),bodyWide:x.slides.filter(s=>s.bodyWide).map(s=>s.id),contentWide:x.slides.filter(s=>s.contentWide).map(s=>s.id),scrollClipped:x.slides.filter(s=>s.contentTall&&!['auto','scroll'].includes(s.scrollMode)).map(s=>s.id),footerHidden:x.slides.filter(s=>!s.footerVisible).map(s=>s.id),errors:x.errors})),null,2));
