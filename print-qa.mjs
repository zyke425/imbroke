import { chromium } from 'playwright-core';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import path from 'node:path';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-background-networking']});
const page=await browser.newPage({viewport:{width:1366,height:768}});
const external=[],errors=[];page.on('request',r=>{if(!r.url().startsWith('file:'))external.push(r.url())});page.on('pageerror',e=>errors.push(e.message));
const url='file:///'+path.join(process.cwd(),'index.html').replaceAll('\\','/');await page.goto(url);
await page.evaluate(()=>document.fonts.ready);
await page.emulateMedia({media:'print'});
const bytes=await page.pdf({landscape:true,printBackground:true,preferCSSPageSize:true});
const pdf=await getDocument({data:new Uint8Array(bytes),useSystemFonts:true}).promise;
const texts=[];for(let n=1;n<=pdf.numPages;n++){const p=await pdf.getPage(n),data=await p.getTextContent();texts.push(data.items.map(x=>x.str).join(' '));}
const result={pages:pdf.numPages,cover:texts[0]?.toLowerCase().includes('methods of'),team:texts.some(x=>x.includes('John Kenneth Ometer')),direct:texts.some(x=>x.includes('3 divides x')),thanks:texts.at(-1)?.toLowerCase().includes('thank you'),external,errors};
if(result.pages!==19||!result.cover||!result.team||!result.direct||!result.thanks||external.length||errors.length)throw new Error(JSON.stringify(result));
console.log(JSON.stringify(result));await browser.close();
