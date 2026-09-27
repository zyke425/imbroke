import { chromium } from 'playwright-core';
import path from 'node:path';
import fs from 'node:fs';
const root=process.cwd();
const out=path.join(root,'screenshots');fs.mkdirSync(out,{recursive:true});
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-background-networking']});
const fileUrl='file:///'+path.join(root,'index.html').replaceAll('\\','/');
const summary=[];
for(const [label,width,height] of [['desktop-1366',1366,768],['desktop-1920',1920,1080],['phone',390,844],['short-landscape',844,390]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  const page=await context.newPage();const errors=[];const missing=[];const external=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text())});
  page.on('requestfailed',request=>missing.push(request.url()+' '+request.failure()?.errorText));
  page.on('request',request=>{if(!request.url().startsWith('file:'))external.push(request.url())});
  await page.goto(fileUrl);await page.waitForTimeout(250);
  const slides=await page.locator('.slide').count();
  const counts=[];const overflows=[];
  for(const n of [1,3,4,6,11,12,13,14,15,16,17,18,19]){
    await page.goto(fileUrl+'#'+n);await page.waitForTimeout(50);
    const title=await page.locator('.slide.is-active').getAttribute('data-title');counts.push([n,title]);
    const overflow=await page.locator('.slide.is-active .content').first().evaluate(el=>({scroll:el.scrollHeight,client:el.clientHeight,wide:el.scrollWidth>el.clientWidth+2}));
    if(overflow.scroll>overflow.client+3||overflow.wide)overflows.push({n,...overflow});
    if([4,11,12,13,15,16,17].includes(n))await page.screenshot({path:path.join(out,label+'-slide-'+String(n).padStart(2,'0')+'.png')});
  }
  if(label==='desktop-1366'){
    await page.goto(fileUrl+'#6');await page.locator('#explainButton').click();await page.locator('#nextExplanation').click();await page.locator('#nextExplanation').click();
    summary.push({check:'rule lesson',caption:await page.locator('#narrationText').textContent(),answerVisible:await page.locator('.slide.is-active .answer').isVisible(),step:await page.locator('#narrationStepCount').textContent()});
    await page.locator('#replayExplanation').click();summary.push({check:'replay',step:await page.locator('#narrationStepCount').textContent()});
    await page.locator('#stopNarration').click();summary.push({check:'stop',answerVisible:await page.locator('.slide.is-active .answer').isVisible(),panelVisible:await page.locator('#narrationPanel').isVisible()});
    await page.goto(fileUrl+'#11');await page.locator('#builderNext').click();await page.locator('#builderNext').click();summary.push({check:'builder',visible:await page.locator('[data-build-step]:visible').count()});
    await page.goto(fileUrl+'#12');await page.locator('.fallacy-list summary').first().click();summary.push({check:'fallacy',open:await page.locator('.fallacy-list details').first().getAttribute('open')});
    await page.goto(fileUrl+'#13');const cases=[];for(const [p,q] of [[true,true],[true,false],[false,true],[false,false]]){const current=await page.locator('[data-truth]').evaluateAll(els=>els.map(e=>e.getAttribute('aria-pressed')==='true'));if(current[0]!==p)await page.locator('[data-truth="p"]').click();if(current[1]!==q)await page.locator('[data-truth="q"]').click();cases.push({p,q,result:await page.locator('#truthResult').textContent(),explain:await page.locator('#truthExplanation').textContent()})}summary.push({check:'truth',cases});
    await page.goto(fileUrl+'#15');for(let i=0;i<5;i++)await page.locator('#nextStep').click();summary.push({check:'direct proof',visible:await page.locator('.proof-step:visible').count(),reason:await page.locator('#stepExplanation').textContent()});
    await page.goto(fileUrl+'#16');await page.locator('#practiceReason').fill('n = 4k, so n = 2(2k).');await page.locator('#practiceHintButton').click();await page.locator('#practiceSolutionButton').click();const box=await page.locator('#doodle').boundingBox();await page.mouse.move(box.x+30,box.y+30);await page.mouse.down();await page.mouse.move(box.x+70,box.y+50);await page.mouse.up();await page.locator('#undoDoodle').click();summary.push({check:'practice',typed:await page.locator('#practiceReason').inputValue(),solution:await page.locator('#practiceSolution').isVisible(),undoDisabled:await page.locator('#undoDoodle').isDisabled()});
    await page.goto(fileUrl+'#17');await page.locator('input[name="q1"][value="a"]').check();await page.locator('#challengeForm button[type="submit"]').click();summary.push({check:'quiz unanswered',feedback:await page.locator('[data-feedback="q2"]').textContent()});
    await page.locator('#challengeForm button[type="reset"]').click();summary.push({check:'quiz reset',feedbackVisible:await page.locator('[data-feedback="q1"]').isVisible()});
    await page.goto(fileUrl+'#4');await page.locator('#utilitiesButton').click();await page.locator('#focusButton').click();summary.push({check:'focus',state:await page.locator('#focusButton').textContent()});
    await page.pdf({path:path.join(root,'handout-check.pdf'),printBackground:true,landscape:true,format:'A4',preferCSSPageSize:true});
  }
  summary.push({view:label,slides,counts,overflows,errors,missing,external});
  await context.close();
}
await browser.close();fs.writeFileSync(path.join(root,'browser-check-results.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));
