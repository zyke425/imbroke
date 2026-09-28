import { chromium } from 'playwright-core';
import path from 'node:path';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const url='file:///'+path.join(process.cwd(),'index.html').replaceAll('\\','/');
for(const [w,h] of [[320,568],[568,320],[768,1024]]){
 const page=await browser.newPage({viewport:{width:w,height:h}});const items=[];
 for(let n=1;n<=19;n++){await page.goto(url+'#'+n);items.push(await page.locator('.slide.is-active').evaluate(s=>{const title=s.querySelector('h1,h2');return {id:s.dataset.id,title:title?.textContent.trim().slice(0,25),px:title?parseFloat(getComputedStyle(title).fontSize):null}}));}
 console.log(`${w}x${h}`,JSON.stringify(items));await page.close();
}
await browser.close();
