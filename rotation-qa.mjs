import { chromium } from 'playwright-core';
import path from 'node:path';

const root = process.cwd();
const url = 'file:///' + path.join(root, 'index.html').replaceAll('\\', '/');
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--disable-background-networking'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const rotate = async (width, height) => { await page.setViewportSize({ width, height }); await page.waitForTimeout(320); };
const scrollCheck = async () => page.evaluate(() => {
  const content = document.querySelector('.slide.is-active .content');
  const footer = document.querySelector('.footer');
  const viewport = document.querySelector('.viewport');
  const fr = footer.getBoundingClientRect(), vr = viewport.getBoundingClientRect();
  return { horizontal: document.documentElement.scrollWidth > innerWidth + 2 || content.scrollWidth > content.clientWidth + 2, footer: fr.bottom <= innerHeight + 2 && fr.top >= vr.bottom - 2, vertical: content.scrollHeight > content.clientHeight + 2 ? getComputedStyle(content).overflowY === 'auto' : true };
});
const rotations = [[844,390],[320,568],[568,320],[412,915],[915,412],[390,844]];
const navCount = async () => page.locator('#slideCount').textContent();

await page.goto(url + '#15');
await page.evaluate(() => { window.__rotationMarker = crypto.randomUUID(); });
await page.locator('#explainButton').click();
for (let i = 0; i < 3; i++) await page.locator('#nextExplanation').click();
const proofBefore = await page.evaluate(() => ({ slide: document.querySelector('.slide.is-active').dataset.id, step: document.querySelector('#narrationStepCount').textContent, text: document.querySelector('#narrationText').textContent, visibleSteps: document.querySelectorAll('.slide.is-active .proof-step:not([hidden])').length, marker: window.__rotationMarker }));
assert(proofBefore.visibleSteps === 3, `Proof reveal count was ${proofBefore.visibleSteps}`);
for (const [width,height] of rotations) {
  await rotate(width,height);
  const now = await page.evaluate(() => ({ slide: document.querySelector('.slide.is-active').dataset.id, step: document.querySelector('#narrationStepCount').textContent, text: document.querySelector('#narrationText').textContent, visibleSteps: document.querySelectorAll('.slide.is-active .proof-step:not([hidden])').length, marker: window.__rotationMarker, caption: !document.querySelector('#narrationPanel').hidden }));
  assert(JSON.stringify(now) === JSON.stringify({ ...proofBefore, caption: true }), `Proof narration changed at ${width}x${height}: ${JSON.stringify(now)}`);
  const fit = await scrollCheck(); assert(!fit.horizontal && fit.footer && fit.vertical, `Proof layout failed at ${width}x${height}: ${JSON.stringify(fit)}`);
}
await page.locator('#nextExplanation').click();
assert((await page.locator('#narrationStepCount').textContent()) !== proofBefore.step, 'Explanation cannot advance after rotation');
await page.locator('#stopNarration').click();

await page.goto(url + '#11');
await page.locator('#builderNext').click(); await page.locator('#builderNext').click();
const builderBefore = await page.locator('#builderCount').textContent();
await rotate(844,390); await rotate(390,844);
assert((await page.locator('#builderCount').textContent()) === builderBefore, 'Derived proof steps changed after rotation');

await page.goto(url + '#17');
for (const [name,value] of [['q1','a'],['q2','b'],['q3','a']]) await page.locator(`input[name="${name}"][value="${value}"]`).check();
await page.locator('#challengeForm button[type="submit"]').click();
const scoreBefore = await page.locator('#challengeScore').textContent();
const feedbackBefore = await page.locator('.challenge-feedback').allTextContents();
for (const [width,height] of rotations) {
  await rotate(width,height);
  assert((await navCount()).includes('17 / 19'), `Quiz slide changed at ${width}x${height}`);
  assert((await page.locator('#challengeScore').textContent()) === scoreBefore, `Quiz score changed at ${width}x${height}`);
  assert(JSON.stringify(await page.locator('.challenge-feedback').allTextContents()) === JSON.stringify(feedbackBefore), `Quiz feedback changed at ${width}x${height}`);
  for (const [name,value] of [['q1','a'],['q2','b'],['q3','a']]) assert(await page.locator(`input[name="${name}"][value="${value}"]`).isChecked(), `Quiz choice ${name} changed at ${width}x${height}`);
}

await page.goto(url + '#16');
await page.locator('#practiceHintButton').click(); await page.locator('#practiceSolutionButton').click();
await page.locator('#practiceReason').fill('Let n = 4k = 2(2k).');
const canvas = page.locator('#doodle'); await canvas.scrollIntoViewIfNeeded();
const box = await canvas.boundingBox();
await page.mouse.move(box.x + 20, box.y + 20); await page.mouse.down(); await page.mouse.move(box.x + 70, box.y + 55, { steps: 6 }); await page.mouse.up();
const inkState = async () => page.evaluate(() => {
  const c = document.querySelector('#doodle'); const data = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  let marked = 0; for (let i=3;i<data.length;i+=4) if (data[i]) marked++;
  return { marked, width: c.width, height: c.height, strokes: strokes.length };
});
const inkBefore = await inkState(); assert(inkBefore.marked > 0 && inkBefore.strokes === 1, `Drawing did not record: ${JSON.stringify(inkBefore)}`);
const inkSizes = [];
for (const [width,height] of rotations) {
  await rotate(width,height);
  const ink = await inkState(); inkSizes.push({ size:`${width}x${height}`,...ink });
  assert(ink.marked > 0 && ink.strokes === 1, `Drawing lost after rotation at ${width}x${height}`);
  assert(await page.locator('#undoDoodle').isEnabled(), `Undo unavailable at ${width}x${height}`);
  assert(await page.locator('#practiceHint').isVisible() && await page.locator('#practiceSolution').isVisible(), `Practice reveals lost at ${width}x${height}`);
  assert((await page.locator('#practiceReason').inputValue()) === 'Let n = 4k = 2(2k).', `Practice input lost at ${width}x${height}`);
  const fit = await scrollCheck(); assert(!fit.horizontal && fit.footer && fit.vertical, `Practice layout failed at ${width}x${height}`);
}
assert(inkSizes.some(x=>x.width!==inkBefore.width), 'Drawing canvas never resized');
await page.locator('#undoDoodle').click(); assert((await inkState()).strokes === 0, 'Undo failed after rotation');

// Native gestures from lesson content should never change the slide. A single
// horizontal gesture from the paper margin remains the presentation shortcut.
await page.goto(url + '#13');
await page.locator('.slide.is-active .content').waitFor();
const gestures = await page.evaluate(() => {
  const stage = document.querySelector('.stage'), content = document.querySelector('.slide.is-active .content');
  const touch = (x,y,id=1) => new Touch({ identifier:id, target:stage, clientX:x, clientY:y });
  const dispatch = (target,type,touches,changed) => target.dispatchEvent(new TouchEvent(type,{ bubbles:true, cancelable:true, touches, targetTouches:touches, changedTouches:changed }));
  const a=touch(250,130),b=touch(80,130); dispatch(content,'touchstart',[a],[a]); dispatch(content,'touchend',[],[b]);
  const c=touch(240,130),d=touch(90,130),second=touch(170,150,2); dispatch(stage,'touchstart',[c],[c]); dispatch(stage,'touchmove',[d,second],[d,second]); dispatch(stage,'touchend',[],[d]);
  return { afterContent: document.querySelector('.slide.is-active').dataset.id, touchAction:getComputedStyle(content).touchAction, canvasAction:getComputedStyle(document.querySelector('#doodle')).touchAction, zoomAllowed:!document.querySelector('meta[name="viewport"]').content.includes('user-scalable=no') };
});
assert(gestures.afterContent === 'implication' && gestures.touchAction.includes('pinch-zoom') && gestures.canvasAction.includes('pinch-zoom') && gestures.zoomAllowed, `Touch gesture settings failed: ${JSON.stringify(gestures)}`);
await page.evaluate(() => { const stage=document.querySelector('.stage');const t=(x)=>new Touch({identifier:1,target:stage,clientX:x,clientY:120});const a=t(110),b=t(260);stage.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[a],changedTouches:[a]}));stage.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],changedTouches:[b]})); });
assert((await navCount()).includes('12 / 19'), 'Margin swipe did not navigate');
assert(errors.length === 0, `Page errors: ${errors.join('; ')}`);
console.log(JSON.stringify({ proof:proofBefore, quiz:{score:scoreBefore,feedback:feedbackBefore}, drawing:{initial:inkBefore,rotations:inkSizes}, gestures, errors, result:'PASS' },null,2));
await browser.close();
