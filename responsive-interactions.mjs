import {chromium} from 'playwright-core';
import fs from 'node:fs';import path from 'node:path';
const root=process.cwd(),url='file:///'+path.join(root,'index.html').replaceAll('\\','/');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-background-networking']});
const sizes=[[320,568],[360,800],[390,844],[412,915],[568,320],[800,360],[844,390],[915,412],[768,1024],[1024,768],[1366,768]];
const results=[];
for(const [width,height] of sizes){
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<=915,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const checks={size:`${width}x${height}`};
  const goto=async n=>{await page.goto(url+'#'+n)};
  const reach=async selector=>{
    const el=page.locator(selector).last();await el.scrollIntoViewIfNeeded();
    return el.evaluate(e=>{const c=e.closest('.content'),r=e.getBoundingClientRect(),b=c.getBoundingClientRect();return r.bottom<=b.bottom+3&&r.top>=b.top-3&&c.scrollWidth<=c.clientWidth+2});
  };
  await goto(2);await page.locator('#teamAllButton').click();checks.team={names:await page.locator('.team-card-name').count(),lastReachable:await reach('.team-card:last-child')};
  checks.rules=[];
  for(let n=6;n<=10;n++){await goto(n);await page.locator('.slide.is-active [data-reveal]').click();checks.rules.push({n,answer:await page.locator('.slide.is-active .answer').isVisible(),reachable:await reach('.slide.is-active .answer')})}
  await goto(11);await page.locator('#builderNext').click();await page.locator('#builderNext').click();checks.builder={derived:await page.locator('[data-build-step]:visible').count(),reachable:await reach('[data-build-step]:last-child')};
  await goto(12);for(const s of await page.locator('.fallacy-list summary').all())await s.click();checks.fallacies={open:await page.locator('.fallacy-list details[open]').count(),reachable:await reach('.fallacy-list details:last-child p')};
  if(width===568)await page.screenshot({path:path.join(root,'responsive-screenshots','568x320-fallacies-expanded.png')});
  await goto(13);await page.locator('#truthTableButton').click();const truth=[];for(const [p,q] of [[true,true],[true,false],[false,true],[false,false]]){const v=await page.locator('[data-truth]').evaluateAll(es=>es.map(x=>x.getAttribute('aria-pressed')==='true'));if(v[0]!==p)await page.locator('[data-truth="p"]').click();if(v[1]!==q)await page.locator('[data-truth="q"]').click();truth.push(await page.locator('#truthResult').textContent())}checks.truth={rows:await page.locator('#truthTable tbody tr').count(),cases:truth,reachable:await reach('#truthTable tbody tr:last-child')};
  if(width===844)await page.screenshot({path:path.join(root,'responsive-screenshots','844x390-truth-expanded.png')});
  await goto(14);checks.types={reachable:await reach('.proof-type:last-child p')};
  await goto(15);await page.locator('#showAllSteps').click();checks.direct={steps:await page.locator('.proof-step:visible').count(),reachable:await reach('.proof-step:last-child')};
  await goto(16);await page.locator('#practiceHintButton').click();await page.locator('#practiceSolutionButton').click();await page.locator('#practiceReason').fill('n=4k=2(2k)');const canvas=page.locator('#doodle');await canvas.scrollIntoViewIfNeeded();const box=await canvas.boundingBox();await page.mouse.move(box.x+20,box.y+20);await page.mouse.down();await page.mouse.move(box.x+50,box.y+40);await page.mouse.up();checks.practice={solution:await page.locator('#practiceSolution').isVisible(),canvasReachable:await reach('#doodle'),undo:await page.locator('#undoDoodle').isEnabled()};
  if(width===320)await page.screenshot({path:path.join(root,'responsive-screenshots','320x568-practice-expanded.png')});
  await goto(17);for(const [name,value] of [['q1','a'],['q2','b'],['q3','a']])await page.locator(`input[name="${name}"][value="${value}"]`).check();await page.locator('#challengeForm button[type="submit"]').click();checks.quiz={score:await page.locator('#challengeScore').textContent(),reachable:await reach('[data-feedback="q3"]')};
  if(width===390)await page.screenshot({path:path.join(root,'responsive-screenshots','390x844-quiz-feedback.png')});
  await goto(15);await page.locator('#explainButton').click();await page.locator('#nextExplanation').click();await page.locator('.transcript summary').click();checks.caption={step:await page.locator('#narrationStepCount').textContent(),transcript:await page.locator('#narrationTranscript li').count(),copyScroll:await page.locator('.narration-copy').evaluate(e=>e.scrollHeight>e.clientHeight+2),panelWide:await page.locator('#narrationPanel').evaluate(e=>e.scrollWidth>e.clientWidth+2)};
  if(width===568)await page.screenshot({path:path.join(root,'responsive-screenshots','568x320-caption-transcript.png')});
  checks.errors=errors;results.push(checks);await page.close();
}
fs.writeFileSync(path.join(root,'responsive-interactions-results.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(x=>({size:x.size,team:x.team,rules:x.rules.map(y=>y.answer&&y.reachable),builder:x.builder,fallacies:x.fallacies,truth:x.truth,types:x.types,direct:x.direct,practice:x.practice,quiz:x.quiz,caption:x.caption,errors:x.errors})),null,2));
await browser.close();
