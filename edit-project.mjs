import fs from 'node:fs';

let html = fs.readFileSync('index.html', 'utf8');
function section(start, end, replacement) {
  const a = html.indexOf(start), b = html.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error(`Missing section ${start}`);
  html = html.slice(0, a) + replacement + '\n\n        ' + html.slice(b);
}
function withinSection(title, fn) {
  const start = html.indexOf(`<section class="slide`, html.indexOf(`data-title="${title}"`) - 100);
  const end = html.indexOf('</section>', start) + 10;
  if (start < 0 || end < 10) throw new Error(title);
  html = html.slice(0, start) + fn(html.slice(start, end)) + html.slice(end);
}

section('<section class="slide foundations"', '<section class="slide rules-menu"', `<section class="slide foundations" data-id="foundations" data-title="Foundations">
          <div class="content"><h1 class="script">Foundations</h1>
            <p class="lesson-lead">A proof shows why a claim follows from accepted starting points.</p>
            <div class="foundation-grid">
              <div class="lesson-card" data-focus="start"><strong>Start</strong><p>Axioms are accepted basics. A hypothesis is the assumption in this claim.</p></div>
              <div class="lesson-card" data-focus="steps"><strong>Justify</strong><p>Use definitions, earlier results, and valid inference rules for each step.</p></div>
              <div class="lesson-card" data-focus="result"><strong>Establish</strong><p>The result is the conclusion. A theorem is a claim with a proof.</p></div>
            </div><p class="lesson-foot">A fallacy is a step that looks persuasive but does not follow.</p>
          </div>
        </section>

        <section class="slide symbols-slide" data-id="symbols" data-title="Logic Symbols and Statements">
          <div class="content"><h1 class="script">Logic Symbols and Statements</h1>
            <p class="lesson-lead">A <strong>proposition</strong> is a statement that is true or false. Letters <strong>p, q, r</strong> stand for statements.</p>
            <div class="symbol-grid">
              <div><strong>¬p</strong><span>not p: “not raining”</span></div><div><strong>p ∧ q</strong><span>p and q: “square and blue”</span></div>
              <div><strong>p ∨ q</strong><span>p or q: “tea or juice”—either or both</span></div><div><strong>p → q</strong><span>if p, then q: “if square, then rectangle”</span></div>
              <div><strong>∴ q</strong><span>therefore q: marks a conclusion</span></div>
            </div>
            <div class="implication-labels"><span><b>Hypothesis p</b> — it is a square</span><span><b>Conclusion q</b> — it is a rectangle</span></div>
            <p class="lesson-foot">p → q alone does not prove q → p or show that p causes q. The symbol guide stays in the menu.</p>
          </div>
        </section>`);

html = html.replaceAll('data-go="5"','data-go="modus-ponens"').replaceAll('data-go="6"','data-go="simplification"').replaceAll('data-go="7"','data-go="modus-tollens"').replaceAll('data-go="8"','data-go="hypothetical-syllogism"').replaceAll('data-go="9"','data-go="disjunctive-syllogism"').replaceAll('data-go="1"','data-go="cover"');
for (const [title,id] of Object.entries({'Methods of Proof':'cover','Our Team':'team','Rules of Inference':'rules','Modus Ponens':'modus-ponens','Simplification':'simplification','Modus Tollens':'modus-tollens','Hypothetical Syllogism':'hypothetical-syllogism','Disjunctive Syllogism':'disjunctive-syllogism','Fallacies':'fallacies','Proof of an Implication':'implication','Types of Proof':'proof-types','Direct Proof Example':'direct-proof','Scratch Space':'practice','Challenges':'challenges','Conclusion':'conclusion','Thank You':'thanks'})) {
  html = html.replace(`data-title="${title}"`, `data-id="${id}" data-title="${title}"`);
}

for (const [title, mapping, reason] of [
 ['Modus Ponens','p = it snows today; q = we go skiing.','Assuming both premises, p gives the condition that triggers p → q.'],
 ['Simplification','p = it is below freezing; q = it is raining.','Both parts of p ∧ q hold, so p follows and q also follows separately.'],
 ['Modus Tollens','p = this angle is right; q = its measure is 90°.','If p held, q would hold. Since q does not hold, p cannot hold.'],
 ['Hypothetical Syllogism','p = you study hard; q = you pass; r = you get a good grade.','Under the assumed premises, the shared q links p to r.'],
 ['Disjunctive Syllogism','p = I ordered pizza; q = I ordered a burger.','At least one option is true. Ruling out p leaves q.']
]) {
  withinSection(title, s => s.replace('<div class="rule-columns">', `<p class="rule-mapping">${mapping}</p><div class="rule-columns">`).replace('<div class="premise">','<div class="premise" aria-label="Premises">').replace('<span class="conclusion-label">Therefore</span>','<span class="conclusion-label">Derived conclusion</span>').replace('<div class="rule-example">',`<div class="rule-example"><p class="rule-reason">${reason}</p>`).replace('<div class="answer" hidden>','<div class="answer" hidden><strong>Conclusion: </strong>'));
}
withinSection('Simplification', s => s.replace('>p</div></div>', '>p (or q separately)</div></div>').replace('Therefore, “It is below freezing now.”','Therefore, “It is below freezing now.” Separately, “It is raining now.”'));
withinSection('Hypothetical Syllogism', s => s.replace('Two implications can be chained through a shared statement.','This is a logical result of the assumed premises, not a guarantee about real grades.'));

section('<section class="slide fallacies"','<section class="slide implication"',`<section class="slide fallacies" data-id="fallacies" data-title="Fallacies">
          <div class="content"><h1 class="script">Fallacies</h1><p class="lesson-lead">Compare each proposed conclusion with what the premises actually allow.</p>
            <div class="fallacy-list">
              <details><summary>Affirming the consequent</summary><p><strong>Invalid:</strong> p → q; q; ∴ p. Let p = rain and q = wet road. The implication can be true when p is false and q is true: a sprinkler wets the road. Both premises are true, but “it rained” is false.</p></details>
              <details><summary>Denying the antecedent</summary><p><strong>Invalid:</strong> p → q; ¬p; ∴ ¬q. With no rain and a wet road, the assumed implication and ¬p are true, yet “the road is not wet” is false. A sprinkler explains the water.</p></details>
              <details><summary>Circular reasoning</summary><p>“This claim is true because the claim is true” merely repeats the claim. It supplies no independent reason.</p></details>
            </div><p class="lesson-foot"><strong>Valid Modus Ponens:</strong> p → q; p; ∴ q. The second premise is p, not q.</p>
          </div>
        </section>`);

section('<section class="slide implication"','<section class="slide types"',`<section class="slide implication" data-id="implication" data-title="Understanding an Implication">
          <div class="content"><h1 class="script">Understanding an Implication</h1>
            <div class="implication-layout"><div class="implication-copy"><p><strong>p → q</strong> means “if p, then q.” Here p is the hypothesis and q is the conclusion.</p><p>The conditional fails only when p is true and q is false.</p><p>When p is false, this case violates no requirement; it does not prove q true.</p><p>A truth-table row is one case. A proof of “for every integer” must cover every integer.</p></div>
              <div class="truth-box"><h2>Try all four cases</h2><div class="truth-switches"><button type="button" data-truth="p" aria-pressed="true">p: True</button><button type="button" data-truth="q" aria-pressed="true">q: True</button></div><div class="truth-result" id="truthResult" aria-live="polite">Implication: True</div><p id="truthExplanation" class="truth-explanation" aria-live="polite"></p><button class="text-button" id="truthTableButton" type="button" aria-expanded="false" aria-controls="truthTable">Show truth table</button><table class="truth-table" id="truthTable" hidden><caption>Implication truth values</caption><thead><tr><th>p</th><th>q</th><th>p → q</th></tr></thead><tbody><tr data-p="true" data-q="true"><td>T</td><td>T</td><td>T</td></tr><tr data-p="true" data-q="false"><td>T</td><td>F</td><td>F</td></tr><tr data-p="false" data-q="true"><td>F</td><td>T</td><td>T</td></tr><tr data-p="false" data-q="false"><td>F</td><td>F</td><td>T</td></tr></tbody></table></div></div>
          </div>
        </section>`);
withinSection('Types of Proof', s => s.replace('Types of Proof','Trivial, Vacuous, and Direct Proofs').replace('These are','These are').replace('<div class="type-grid">','<p class="lesson-lead">Three introductory approaches over the integers:</p><div class="type-grid">').replace('The conclusion holds for every integer, so the implication is true.','Prove the conclusion independently: every integer square is nonnegative. “Trivial” is a technical term.').replace('No integer has a negative square, so the hypothesis never holds.','Show the hypothesis cannot hold in this domain: an integer square is never negative.').replace('Assume p and build a logical chain: p → statement 1 → statement 2 → … → q.','Assume the hypothesis p and justify each step until the conclusion q follows.'));

section('<section class="slide rule-page" data-id="disjunctive-syllogism"','<section class="slide fallacies"', html.slice(html.indexOf('<section class="slide rule-page" data-id="disjunctive-syllogism"'), html.indexOf('<section class="slide fallacies"')) + `<section class="slide proof-builder" data-id="building-proof" data-title="Building a Proof with Inference Rules">
          <div class="content"><h1 class="script">Building a Proof with Inference Rules</h1><p class="lesson-lead">One shape: <strong>p</strong> = square; <strong>q</strong> = rectangle; <strong>r</strong> = has four sides.</p>
            <div class="argument-lines"><div class="given"><b>Given 1</b><span>p → q</span><small>Every square is a rectangle.</small></div><div class="given"><b>Given 2</b><span>q → r</span><small>Every rectangle has four sides.</small></div><div class="given"><b>Given 3</b><span>p</span><small>This shape is a square.</small></div><div class="derived" data-build-step hidden><b>Derived 4</b><span>p → r</span><small>Hypothetical Syllogism: link the two implications.</small></div><div class="derived result" data-build-step hidden><b>Conclusion 5</b><span>r</span><small>Modus Ponens: use p with p → r.</small></div></div>
            <div class="proof-controls"><button type="button" id="builderPrevious">Previous step</button><button type="button" id="builderNext">Next step</button><span id="builderCount">0 / 2 derived steps</span></div>
          </div>
        </section>`);

withinSection('Direct Proof Example', s => s.replace('<div class="proof-controls">','<p class="proof-goal"><b>Goal:</b> 3 divides x. <b>Assume:</b> 6 divides x, so x = 6k for an integer k. <small>a | b means b = at for some integer t.</small></p><div class="proof-controls">').replace('2 × 3','2 × 3').replace('x = 6k</span>','x = 6k</span>'));

section('<section class="slide blank"','<section class="slide challenges"',`<section class="slide blank practice" data-id="practice" data-title="Guided Proof Practice">
          <div class="content practice-content"><h1 class="script">Guided Proof Practice</h1><p class="lesson-lead">For every integer n, if 4 divides n, then 2 divides n.</p><div class="practice-actions"><button type="button" id="practiceHintButton" aria-expanded="false">Show hint</button><button type="button" id="practiceSolutionButton" aria-expanded="false">Show solution</button></div><p id="practiceHint" class="practice-reveal" hidden>Start with n = 4k for an integer k. Can you write it as 2 times an integer?</p><p id="practiceSolution" class="practice-reveal" hidden>n = 4k = 2(2k). Since k is an integer, 2k is an integer. Therefore 2 divides n.</p><label class="reason-label" for="practiceReason">Type your reasoning</label><textarea id="practiceReason" rows="3" placeholder="Start with the assumption..."></textarea></div>
          <canvas class="doodle" id="doodle" aria-label="Optional drawing canvas"></canvas><div class="doodle-controls"><button id="undoDoodle" type="button" disabled>Undo</button><button id="clearDoodle" type="button" disabled>Clear drawing</button></div>
        </section>`);

section('<section class="slide challenges"','<section class="slide conclusion"',`<section class="slide challenges" data-id="challenges" data-title="Challenges"><div class="content"><h1 class="script">Challenges</h1><form class="challenge-list" id="challengeForm">
          <fieldset class="challenge-question"><legend>1. p → q and p are given. Which rule gives q?</legend><label><input type="radio" name="q1" value="a"> Modus Ponens</label><label><input type="radio" name="q1" value="b"> Modus Tollens</label><label><input type="radio" name="q1" value="c"> Simplification</label><p class="challenge-feedback" data-feedback="q1" hidden></p><p class="print-answer">Answer: Modus Ponens uses the hypothesis p.</p></fieldset>
          <fieldset class="challenge-question"><legend>2. p → q and q are given. Is “therefore p” valid?</legend><label><input type="radio" name="q2" value="a"> Yes</label><label><input type="radio" name="q2" value="b"> No</label><p class="challenge-feedback" data-feedback="q2" hidden></p><p class="print-answer">Answer: No. This affirms the consequent; q may have another cause.</p></fieldset>
          <fieldset class="challenge-question"><legend>3. n = 4k = 2(2k). What completes the proof?</legend><label><input type="radio" name="q3" value="a"> 2k is an integer, so 2 divides n</label><label><input type="radio" name="q3" value="b"> k must be positive</label><p class="challenge-feedback" data-feedback="q3" hidden></p><p class="print-answer">Answer: 2k is an integer, so 2 divides n.</p></fieldset>
          <div class="challenge-actions"><button class="action-btn" type="submit">Check answers</button><button class="action-btn secondary" type="reset">Retry / reset</button><strong id="challengeScore" aria-live="polite"></strong></div></form></div></section>`);
withinSection('Conclusion', s => s.replace('<ul class="conclusion-list">','<ul class="conclusion-list">').replace('A mathematical proof is a chain of justified statements leading to a conclusion.','State the claim and identify its assumptions.').replace('Rules of inference preserve valid reasoning; fallacies only imitate it.','Justify each step using a definition, known fact, or valid inference rule.').replace('For p → q, choose a proof method that fits the hypothesis and the conclusion.','Reach the conclusion, then check that the reasoning covers every required case.'));

html = html.replace('type="checkbox" checked></label><label>Voice narration','type="checkbox"></label><button type="button" id="catJokeNow">Tell a short joke</button><label>Voice narration');
html = html.replace('<div class="narration-panel" id="narrationPanel" role="status" aria-live="polite" hidden><div><strong>Cat explanation</strong><p id="narrationText"></p></div><button id="stopNarration" type="button">Stop</button></div>', '<div class="narration-panel" id="narrationPanel" hidden><div class="narration-copy"><strong>Cat explanation <span id="narrationStepCount"></span></strong><p id="narrationText" role="status" aria-live="polite"></p></div><div class="narration-controls"><button id="previousExplanation" type="button">Previous explanation</button><button id="nextExplanation" type="button">Next explanation</button><button id="replayExplanation" type="button">Replay</button><button id="stopNarration" type="button">Stop</button></div><details class="transcript"><summary>Full transcript</summary><ol id="narrationTranscript"></ol></details></div>');
html = html.replace('01 / 17','01 / 19').replace('aria-valuemax="17"','aria-valuemax="19"');
html = html.replace(/aria-label="Slide \d+: [^"]*"/g, '');
fs.writeFileSync('index.html', html);
