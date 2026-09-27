import fs from 'node:fs';
let js = fs.readFileSync('app.js','utf8');
function replaceBetween(a,b,text){const i=js.indexOf(a),j=js.indexOf(b,i+a.length);if(i<0||j<0)throw Error(a);js=js.slice(0,i)+text+'\n\n'+js.slice(j)}
js=js.replace("readPreference('proof-cat-jokes', true)","readPreference('proof-cat-jokes', false)");
replaceBetween('// One short, plain-language explanation for every slide.', 'function shuffledBag', `// Each entry drives the visible caption, focus, reveal, and optional speech together.
const catNarration = {
  cover: [
    {text:'Today we will test whether each step in an argument really follows.', focus:'.learning-goals'},
    {text:'Predict one thing a proof needs besides a true answer. We will look for justified steps.', focus:'.learning-goals'}],
  team: [{text:'These are the eight members of Group 3. Choose All members to see every name together.', focus:'.team-deck'}],
  foundations: [
    {text:'Start with the claim and its accepted assumptions. An axiom is a general starting point; a hypothesis belongs to this claim.', focus:'[data-focus="start"]'},
    {text:'A proof justifies each move with a definition, known result, or valid inference rule.', focus:'[data-focus="steps"]'},
    {text:'The conclusion is the claim we establish. A theorem is a claim that has a proof.', focus:'[data-focus="result"]'}],
  symbols: [
    {text:'A proposition has a truth value. The letters p, q, and r stand for whole statements.', focus:'.lesson-lead'},
    {text:'Read not p, p and q, p or q, p implies q, and therefore q. Logical or allows either or both.', focus:'.symbol-grid'},
    {text:'In p implies q, p is the hypothesis and q is the conclusion. The converse and a cause do not follow automatically.', focus:'.implication-labels'}],
  rules: [{text:'Each rule starts with premises and gives a conclusion that must follow if those premises hold.', focus:'.rules-list'}, {text:'Choose a rule to inspect its form and an assumed example.', focus:'.rules-list'}],
  'modus-ponens': [
    {text:'Here p means it snows today and q means we go skiing. The given premises are p and p implies q.', focus:'.premise'},
    {text:'If both premises hold, p triggers the conditional. Predict the conclusion before revealing it.', focus:'.rule-example'},
    {text:'Therefore q: we go skiing, under the assumed premises.', focus:'.answer', reveal:'rule'}],
  simplification: [
    {text:'Here p is below freezing and q is raining. The premise p and q says both are true.', focus:'.premise'},
    {text:'Can we conclude p, q, or both separately? Think before the reveal.', focus:'.rule-example'},
    {text:'Either conjunct follows separately. We can state p and we can state q.', focus:'.answer', reveal:'rule'}],
  'modus-tollens': [
    {text:'Here p means the angle is right and q means its measure is ninety degrees. The premises are p implies q and not q.', focus:'.premise'},
    {text:'If p were true, q would have to be true. But q is false. Predict what follows.', focus:'.rule-example'},
    {text:'Therefore not p: the angle is not right.', focus:'.answer', reveal:'rule'}],
  'hypothetical-syllogism': [
    {text:'The premises are p implies q and q implies r. The middle statement q links the two.', focus:'.premise'},
    {text:'Predict the conditional from p to r. The studying example is only an assumed premise.', focus:'.rule-example'},
    {text:'Therefore p implies r. This is a logical chain, not a real world grade guarantee.', focus:'.answer', reveal:'rule'}],
  'disjunctive-syllogism': [
    {text:'The or premise says at least one option holds. Here p is pizza and q is burger.', focus:'.premise'},
    {text:'The second premise rules out pizza. Which option remains?', focus:'.rule-example'},
    {text:'Burger remains, so q follows from the assumed premises.', focus:'.answer', reveal:'rule'}],
  'building-proof': [
    {text:'The given premises all concern the same shape: square, rectangle, and four sides.', focus:'.given'},
    {text:'What follows from p implies q and q implies r? Predict the new conditional.', focus:'.argument-lines'},
    {text:'Hypothetical Syllogism gives p implies r. This is a derived step.', focus:'[data-build-step]:nth-of-type(4)', buildCount:1},
    {text:'Now use the given p. Modus Ponens gives r: this shape has four sides.', focus:'[data-build-step]:nth-of-type(5)', buildCount:2}],
  fallacies: [
    {text:'Modus Ponens needs p. Affirming the consequent uses q instead and wrongly concludes p.', focus:'.fallacy-list details:nth-child(1)', fallacy:0},
    {text:'A sprinkler can make the road wet without rain. With p false and q true, both premises of that bad argument hold but p is false.', focus:'.fallacy-list details:nth-child(1)', fallacy:0},
    {text:'Denying the antecedent also fails in the no rain, wet road case. The sprinkler leaves q true.', focus:'.fallacy-list details:nth-child(2)', fallacy:1},
    {text:'Circular reasoning only restates the claim. It supplies no independent support.', focus:'.fallacy-list details:nth-child(3)', fallacy:2}],
  implication: [
    {text:'Read p implies q as if p, then q. Toggle the truth values to examine one case at a time.', focus:'.truth-switches'},
    {text:'When p is true and q is false, the conditional fails. That is its only false row.', focus:'.truth-box', truthCase:[true,false]},
    {text:'When p is false, no requirement is violated in that case. This does not prove q true or prove a statement about every integer.', focus:'.implication-copy', truthCase:[false,false]}],
  'proof-types': [
    {text:'These are three introductory approaches for implications over the integers.', focus:'.lesson-lead'},
    {text:'Trivial is a technical name: establish the conclusion independently. An integer square is nonnegative.', focus:'.proof-type:nth-child(1)', type:0},
    {text:'Vacuous means the hypothesis cannot hold in this domain. No integer has a negative square.', focus:'.proof-type:nth-child(2)', type:1},
    {text:'Direct means assume the hypothesis and justify steps until the conclusion follows.', focus:'.proof-type:nth-child(3)', type:2}],
  'direct-proof': [
    {text:'Our goal is to show three divides x. Assume six divides x, with x any integer.', focus:'.proof-goal', proofCount:0},
    {text:'By the definition of divides, x equals six k for some integer k.', focus:'.proof-step:nth-child(1)', proofCount:1},
    {text:'Factor six into two times three. This is an equality, not a new assumption.', focus:'.proof-step:nth-child(2)', proofCount:2},
    {text:'Regroup to write x as three times two k.', focus:'.proof-step:nth-child(3)', proofCount:3},
    {text:'Because k is an integer, two k is an integer. Call it m.', focus:'.proof-step:nth-child(4)', proofCount:4},
    {text:'Now x equals three m for an integer m, so three divides x. This covers zero and negative integers too.', focus:'.proof-step:nth-child(5)', proofCount:5}],
  practice: [
    {text:'Try the parallel claim: four divides n implies two divides n, for every integer n.', focus:'.lesson-lead'},
    {text:'Write your reasoning or draw on the paper. Use the hint only if needed.', focus:'.practice-actions'},
    {text:'When ready, choose Show solution and compare the reason for each step.', focus:'.practice-actions'}],
  challenges: [{text:'First identify a valid rule. The next question asks whether an inference is invalid.', focus:'.challenge-question:nth-child(1)'}, {text:'The final question needs the integer reason that completes a divisibility proof. Check only after choosing an answer.', focus:'.challenge-question:nth-child(3)'}],
  conclusion: [{text:'State the claim and identify its assumptions first.', focus:'.conclusion-list li:nth-child(1)'}, {text:'Justify each step with a valid reason and reach the result.', focus:'.conclusion-list li:nth-child(2)'}, {text:'Then check that the argument covers every case the claim requires.', focus:'.conclusion-list li:nth-child(3)'}],
  thanks: [{text:'That completes our lesson. Questions are welcome; we can revisit any step.', focus:'.final-content'}]
};
let lessonStepIndex = 0;
let autoPlayback = false;
let autoPlaybackTimer = 0;
let lessonSpeakToken = 0;
function currentLesson(){return catNarration[slides[current].dataset.id] || []}
`);

replaceBetween('async function runVisualSequence', 'function stopCatNarration', `function applyLessonStep(index) {
  const steps=currentLesson();
  if (!catNarrationActive || !steps.length) return;
  lessonStepIndex=Math.max(0,Math.min(index,steps.length-1));
  const step=steps[lessonStepIndex];
  const slide=slides[current];
  clearVisualExplanation();
  beginVisualExplanation(slide);
  if (step.proofCount !== undefined) setProofVisible(step.proofCount, true);
  if (step.buildCount !== undefined) setBuilderVisible(step.buildCount, true);
  if (step.reveal === 'rule') {
    const answer=slide.querySelector('.answer'), button=slide.querySelector('[data-reveal]');
    if (answer && button) { answer.hidden=false; button.textContent='Hide conclusion'; button.setAttribute('aria-expanded','true'); }
  }
  if (step.fallacy !== undefined) {
    slide.querySelectorAll('.fallacy-list details').forEach((item,i)=>{item.open=i===step.fallacy});
  }
  if (step.type !== undefined) slide.querySelectorAll('.proof-type').forEach((item,i)=>{item.open=i===step.type});
  if (step.truthCase) {
    [truth.p,truth.q]=step.truthCase;
    document.querySelectorAll('[data-truth]').forEach(button=>{const value=truth[button.dataset.truth];button.setAttribute('aria-pressed',String(value));button.textContent=button.dataset.truth+': '+(value?'True':'False')});
    updateTruthTable();
    truthTable.hidden=false;
    document.getElementById('truthTableButton').setAttribute('aria-expanded','true');
    document.getElementById('truthTableButton').textContent='Hide truth table';
  }
  const target=slide.querySelector(step.focus);
  if (target && !target.hidden) {target.classList.add('teaching-focus'); target.scrollIntoView({block:'nearest',inline:'nearest'});}
  narrationText.textContent=step.text;
  document.getElementById('narrationStepCount').textContent=(lessonStepIndex+1)+' / '+steps.length;
  document.getElementById('previousExplanation').disabled=lessonStepIndex===0;
  document.getElementById('nextExplanation').disabled=lessonStepIndex===steps.length-1;
  catBubbleText.textContent=step.text;
  showCatBubble?.();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  narrationSpeechFinish?.();
  const token=++lessonSpeakToken;
  const voice=catVoiceToggle.checked?speakNarrationLine(step.text.replaceAll('→',' implies ').replaceAll('∧',' and ').replaceAll('∨',' or ').replaceAll('¬',' not ').replaceAll('∴',' therefore '),catNarrationToken):Promise.resolve();
  clearTimeout(autoPlaybackTimer);
  if(autoPlayback && lessonStepIndex<steps.length-1){
    Promise.all([voice,new Promise(resolve=>{autoPlaybackTimer=setTimeout(resolve,getReadingDelay(step.text))})]).then(()=>{
      if(catNarrationActive && token===lessonSpeakToken && autoPlayback) applyLessonStep(lessonStepIndex+1);
    });
  }
}
`);

js=js.replace("  clearVisualExplanation();\n  const cat = catActor.getBoundingClientRect();","  clearVisualExplanation();\n  clearTimeout(autoPlaybackTimer);\n  lessonSpeakToken++;\n  const cat = catActor.getBoundingClientRect();");
replaceBetween('async function startCatNarration()', 'let catBlinkTimer', `function startCatNarration() {
  if (catNarrationActive || busy || document.hidden || overview.open) return;
  const steps=currentLesson(); if (!steps.length) return;
  catNarrationActive=true;
  lessonStepIndex=0;
  lastExplainedSlide=-1;
  narrationPanel.hidden=false;
  app.classList.add('has-caption');
  cancelCatJokes();
  catSpeechLock=true;
  ++catRouteToken;
  const transcript=document.getElementById('narrationTranscript');
  transcript.replaceChildren(...steps.map(step=>{const item=document.createElement('li');item.textContent=step.text;return item}));
  updateExplainButton();
  applyLessonStep(0);
}
`);
js=js.replace("  catBubbleText.textContent=step.text;\n  showCatBubble?.();","  catBubbleText.textContent=step.text;");
js=js.replace("document.getElementById('stopNarration').addEventListener('click', () => stopCatNarration());","document.getElementById('stopNarration').addEventListener('click', () => stopCatNarration());\ndocument.getElementById('previousExplanation').addEventListener('click',()=>applyLessonStep(lessonStepIndex-1));\ndocument.getElementById('nextExplanation').addEventListener('click',()=>applyLessonStep(lessonStepIndex+1));\ndocument.getElementById('replayExplanation').addEventListener('click',()=>{if(catNarrationActive) applyLessonStep(0); else startCatNarration()});\ndocument.getElementById('catJokeNow').addEventListener('click',()=>{if(!catNarrationActive && jokesEnabled()) {cancelCatJokes(); tellCatJoke?.();}});\ndocument.getElementById('autoPlaybackToggle').addEventListener('change',event=>{autoPlayback=event.target.checked;clearTimeout(autoPlaybackTimer);if(autoPlayback&&catNarrationActive)applyLessonStep(lessonStepIndex)});");
js=js.replace("  progress.setAttribute('aria-valuenow', current + 1);","  progress.setAttribute('aria-valuenow', current + 1);\n  progress.setAttribute('aria-valuemax', slides.length);");
js=js.replace("button.addEventListener('click', () => goTo(Number(button.dataset.go) - 1));","button.addEventListener('click', () => { const target=slides.findIndex(slide=>slide.dataset.id===button.dataset.go); goTo(target >= 0 ? target : Number(button.dataset.go)-1); });");
js=js.replace("  const valid = !truth.p || truth.q;","  const valid = !truth.p || truth.q;\n  document.getElementById('truthExplanation').textContent = truth.p ? (truth.q ? 'p holds, and the promised q holds too.' : 'p holds but q fails. This is the only false row.') : (truth.q ? 'p does not hold; this case does not violate the conditional. q happens to be true here, but the conditional did not prove it.' : 'p does not hold; this case does not violate the conditional. It proves nothing about q in another case.');");
js=js.replace('function setProofVisible(count) {','function setProofVisible(count, fromLesson=false) {\n  if(catNarrationActive && !fromLesson && slides[current].dataset.id===\'direct-proof\') { const target=Math.max(0,Math.min(count,proofSteps.length)); applyLessonStep(target); return; }');
js=js.replace("const challengeAnswers = { q1: ['b', 'Either part of an AND statement follows separately.'], q2: ['b', 'Modus Tollens concludes ¬p from p → q and ¬q.'], q3: ['b', 'Assuming the conclusion is circular reasoning.'] };","const challengeAnswers = { q1: ['a', 'Modus Ponens uses p and p implies q to conclude q.'], q2: ['b', 'This affirms the consequent. q may hold for another reason, so p need not hold.'], q3: ['a', 'Two times k is an integer, so n is two times an integer.'] };");
js=js.replace("feedback.textContent = `${correct ? 'Correct.' : selected ? 'Try again.' : 'Choose an answer.'} ${explanation}`;","feedback.textContent = selected ? `${correct ? 'Correct.' : 'Try again.'} ${explanation}` : 'Choose an answer to see feedback.';");
js=js.replace("else if (event.key.toLowerCase() === 'e') startCatNarration();","else if (event.key.toLowerCase() === 'e') { if(catNarrationActive) applyLessonStep(lessonStepIndex+1); else startCatNarration(); }");
js=js.replace("else if (catNarrationActive && (event.key.toLowerCase() === 's' || event.key === 'Escape')) stopCatNarration();","else if (catNarrationActive && (event.key.toLowerCase() === 's' || event.key === 'Escape')) stopCatNarration();");
js=js.replace("const initial = Number(location.hash.slice(1));","const initial = Number(location.hash.slice(1));");
js += `\n// Presenter controlled derived statements and practice reveals.\nlet visibleBuilderSteps=0;\nfunction setBuilderVisible(count,fromLesson=false){\n  if(catNarrationActive&&!fromLesson&&slides[current].dataset.id==='building-proof'){applyLessonStep(count+1);return}\n  visibleBuilderSteps=Math.max(0,Math.min(count,2));\n  document.querySelectorAll('[data-build-step]').forEach((item,i)=>{item.hidden=i>=visibleBuilderSteps;item.classList.toggle('selected',i===visibleBuilderSteps-1)});\n  document.getElementById('builderCount').textContent=visibleBuilderSteps+' / 2 derived steps';\n  document.getElementById('builderPrevious').disabled=visibleBuilderSteps===0;\n  document.getElementById('builderNext').disabled=visibleBuilderSteps===2;\n}\nsetBuilderVisible(0);\ndocument.getElementById('builderPrevious').addEventListener('click',()=>setBuilderVisible(visibleBuilderSteps-1));\ndocument.getElementById('builderNext').addEventListener('click',()=>setBuilderVisible(visibleBuilderSteps+1));\nfor(const [buttonId,panelId] of [['practiceHintButton','practiceHint'],['practiceSolutionButton','practiceSolution']]){\n  document.getElementById(buttonId).addEventListener('click',event=>{const panel=document.getElementById(panelId);panel.hidden=!panel.hidden;event.currentTarget.setAttribute('aria-expanded',String(!panel.hidden));event.currentTarget.textContent=(panel.hidden?'Show ':'Hide ')+(panelId==='practiceHint'?'hint':'solution')});\n}\n`;
fs.writeFileSync('app.js',js);
