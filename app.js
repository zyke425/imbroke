const slides = [...document.querySelectorAll('.slide')];
const stage = document.getElementById('stage');
const overview = document.getElementById('overview');
const thumbGrid = document.getElementById('thumbGrid');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const progress = document.getElementById('progress');
const progressFill = document.getElementById('progressFill');
const announcer = document.getElementById('announcer');
const app = document.querySelector('.app');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finaleSlide = document.querySelector('.thanks');
const confetti = finaleSlide.querySelector('.math-confetti');
const teamSlide = document.querySelector('.team');
const teamCarousel = teamSlide.querySelector('.team-carousel');
const teamDeck = document.getElementById('teamDeck');
const teamCards = [...teamDeck.querySelectorAll('.team-card')];
const teamPosition = document.getElementById('teamPosition');
const catViewport = document.querySelector('.viewport');
const catActor = document.getElementById('pixelCat');
const catBubble = document.getElementById('catBubble');
const catBubbleText = document.getElementById('catBubbleText');
const catJokesToggle = document.getElementById('catJokesToggle');
const explainButton = document.getElementById('explainButton');
const catVoiceToggle = document.getElementById('catVoiceToggle');
const narrationPanel = document.getElementById('narrationPanel');
const narrationText = document.getElementById('narrationText');
const focusButton = document.getElementById('focusButton');
function readPreference(key, fallback) {
  try { const value = localStorage.getItem(key); return value === null ? fallback : value === 'true'; }
  catch { return fallback; }
}
function savePreference(key, value) {
  try { localStorage.setItem(key, String(value)); } catch { /* Private browsing can block storage. */ }
}
let focusMode = readPreference('proof-focus-mode', false);
catJokesToggle.checked = readPreference('proof-cat-jokes', false);
focusButton.textContent = `Focus mode: ${focusMode ? 'On' : 'Off'}`;
focusButton.setAttribute('aria-pressed', String(focusMode));
function jokesEnabled() { return catJokesToggle.checked && !focusMode; }
const catObjects = {
  pencil: document.querySelector('.desk-pencil'),
  note: document.querySelector('.desk-note-prop'),
  ruler: document.querySelector('.desk-ruler')
};
let current = 0;
const catMovementAllowed = () => current <= 1 || current === slides.length - 1;
let busy = false;
let swipeStart = null;
let particleTimer = 0;
let teamFanTimer = 0;
let selectedTeam = 0;
let teamSwipeStart = null;
let suppressTeamClickUntil = 0;
let catRouteToken = 0;
let catResizeTimer = 0;
let catPosition = { x: 0, y: 0 };
let catSpeechLock = false;
let catBubbleActive = false;
let catBubbleVisible = false;
let catJokeInProgress = false;
let catJokeTimer = 0;
let catJokeToken = 0;
let catBubbleTrackToken = 0;
let catBubbleFrame = 0;
let catBubbleRetryTimer = 0;
let catNarrationToken = 0;
let catNarrationActive = false;
let lastExplainedSlide = -1;
let narrationSpeechFinish = null;
const narrationWaits = new Set();
const drawingNamespace = 'http://www.w3.org/2000/svg';
let visualExplanation = null;
const NARRATION_INITIAL_DELAY = 1200;
const NARRATION_SETTLE_DELAY = 500;
const NARRATION_VOICE_PAUSE = 1000;
let standaloneBag = [];
let conversationBag = [];
const catStandaloneJokes = [
  'Mahirap noh?',
  'Tara MagShift Nala kit XD',
  'Kay Nano Nag Comscie ka?',
  'pag shift nala lagi dai',
  'From Hello World, to  Hello Lord',
  'Aray Ko',
  'NAg Copy paste nanga sa AI, may Error pa'
];
const catConversations = [
  ['Kung wla kayong maisagot sa exam', 'Ilagay ninyo MAGMAHAL', 'dahil kailanman hindi mali ang magmamahal'],
  ['sabi daw kasi ni friend','pindot-pindot lang daw'],
  ['oh', 'Bakit ka naka Tulala ka', 'Diba Dream Course Moyan diba?']
];

// One short, plain-language explanation for every slide. Keys match the visible slide number.
const catNarration = {
  1: ['Today we will recognize valid reasoning, spot fallacies, and build a direct proof.', 'I can help explain any page when you ask.'],
  2: ['These are the people in Group 3 who put this presentation together.', 'We will walk through the ideas behind mathematical proofs as a team.'],
  3: ['A theorem is a claim. A proof shows why it follows from justified steps.', 'Axioms, hypotheses, and known theorems supply facts; valid rules connect them.'],
  4: ['These five patterns move from given premises to a justified conclusion.', 'Tap a card to inspect its symbolic rule and a short example.'],
  5: ['If p guarantees q and p happens, q follows.', 'If rain means a wet road and it is raining, the road is wet.'],
  6: ['When two things are both true, either one is true on its own.', 'If it is cold and raining, we may conclude that it is cold.'],
  7: ['If p implies q and q is false, then p must be false.', 'An angle that is not ninety degrees cannot be a right angle.'],
  8: ['Link two if-then statements through their shared middle statement.', 'If studying leads to passing, and passing leads to credit, studying leads to credit.'],
  9: ['There are two possibilities here. If one is ruled out, the other is left.', 'If the order is pizza or a burger, and it is not pizza, it must be a burger.'],
  10: ['A fallacy is reasoning that looks convincing but does not actually prove the claim.', 'Getting a result does not always tell us its cause, and a proof cannot assume its own answer.'],
  11: ['To prove p implies q directly, assume p and use justified steps to reach q.', 'The truth table has exactly one false case: p true and q false.'],
  12: ['These are three ways to show an if-then claim holds.', 'The result may always be true, the starting condition may be impossible, or we can build a direct chain of reasoning.'],
  13: ['We start with a number divisible by six, so it is six times some integer.', 'Since six contains a factor of three, that number must also be divisible by three.'],
  14: ['Try this mini-proof: if 8 divides x, show that 4 divides x.', 'Write x as 8 times an integer, then look for a factor of four.'],
  15: ['Choose an answer for each question, then check your work.', 'Review the feedback after you submit, and retry any question you missed.'],
  16: ['A proof moves from given facts through justified steps to a conclusion.', 'Use valid rules and check for wrong turns such as circular reasoning.'],
  17: ['That is the end of our proof journey. Thanks for listening!', 'If you have a question, we can go back to any slide and explain it again.']
};

function shuffledBag(items) {
  const bag = items.map((_, index) => index);
  for (let index = bag.length - 1; index > 0; index--) {
    const random = Math.floor(Math.random() * (index + 1));
    [bag[index], bag[random]] = [bag[random], bag[index]];
  }
  return bag;
}

function hideCatBubble() {
  catBubbleVisible = false;
  catBubble.classList.remove('is-visible');
  catBubble.setAttribute('aria-hidden', 'true');
  catSpeechLock = catNarrationActive;
}

function bubbleOverlapsContent(rect) {
  const slide = slides[current];
  const targets = slide.querySelectorAll('.content > *, .scratch-heading, .pen, .final-sticky, .clear-doodle, .doodle, .cover-formulas span');
  return [...targets].some(target => {
    if (target.hidden || getComputedStyle(target).display === 'none') return false;
    const box = target.getBoundingClientRect();
    return rect.left < box.right + 6 && rect.right > box.left - 6 && rect.top < box.bottom + 6 && rect.bottom > box.top - 6;
  });
}

function positionCatBubble() {
  if (catNarrationActive || !jokesEnabled() || document.hidden || stage.classList.contains('is-flipping') || overview.open) return false;
  const area = catViewport.getBoundingClientRect();
  const cat = catActor.getBoundingClientRect();
  const paper = slides[current].querySelector('.paper').getBoundingClientRect();
  const mobile = matchMedia('(max-width:700px) and (orientation:portrait)').matches;
  const center = cat.left + cat.width / 2 - area.left;
  const leftSide = center < (paper.left + paper.right) / 2 - area.left;
  const lane = leftSide
    ? { min: 5, max: paper.left - area.left - 8 }
    : { min: paper.right - area.left + 8, max: area.width - 5 };
  if (!mobile && (center < lane.min - 12 || center > lane.max + 12 || lane.max - lane.min < 94)) return false;
  if (!mobile && catActor.classList.contains('is-walking') && catActor.dataset.safeWalk !== 'true') return false;
  catBubble.style.maxWidth = `${mobile ? Math.min(210, area.width - 22) : Math.min(210, lane.max - lane.min)}px`;
  const width = catBubble.offsetWidth;
  const height = catBubble.offsetHeight;
  const xChoices = mobile
    ? [center - width / 2, center + 9, center - width - 9]
    : [center - width / 2];
  for (const proposedX of xChoices) {
    const x = Math.max(mobile ? 6 : lane.min, Math.min(proposedX, (mobile ? area.width - 6 : lane.max) - width));
    for (const below of [false, true]) {
      const y = below ? cat.bottom - area.top + 8 : cat.top - area.top - height - 9;
      if (y < 5 || y + height > area.height - 5) continue;
      const rect = { left: area.left + x, right: area.left + x + width, top: area.top + y, bottom: area.top + y + height };
      if (mobile && bubbleOverlapsContent(rect)) continue;
      catBubble.style.left = `${x}px`;
      catBubble.style.top = `${y}px`;
      catBubble.style.setProperty('--bubble-tail-x', `${Math.max(8, Math.min(center - x - 4, width - 18))}px`);
      catBubble.classList.toggle('is-below', below);
      return true;
    }
  }
  return false;
}

function trackCatBubble(token) {
  if (!catBubbleActive || token !== catBubbleTrackToken) return;
  const safe = positionCatBubble();
  if (safe) {
    if (!catBubbleVisible) {
      catBubbleVisible = true;
      catBubble.classList.add('is-visible');
      catBubble.setAttribute('aria-hidden', 'false');
    }
    catSpeechLock = true;
  } else hideCatBubble();
  if (catBubbleVisible) catBubbleFrame = requestAnimationFrame(() => trackCatBubble(token));
  else catBubbleRetryTimer = setTimeout(() => trackCatBubble(token), 150);
}

function clearBubbleTracking() {
  cancelAnimationFrame(catBubbleFrame);
  clearTimeout(catBubbleRetryTimer);
  catBubbleFrame = 0;
  catBubbleRetryTimer = 0;
  catBubbleTrackToken++;
}

async function showCatJokeLine(line, token) {
  if (token !== catJokeToken || catNarrationActive || !jokesEnabled()) return;
  catBubbleText.textContent = line;
  catBubbleActive = true;
  clearBubbleTracking();
  const trackToken = ++catBubbleTrackToken;
  catBubbleFrame = requestAnimationFrame(() => trackCatBubble(trackToken));
  let remaining = Math.min(5000, 2600 + line.length * 38);
  while (remaining > 0 && token === catJokeToken && !catNarrationActive && jokesEnabled()) {
    await catPause(100);
    if (catBubbleVisible) remaining -= 100;
  }
  if (token !== catJokeToken) return;
  catBubbleActive = false;
  hideCatBubble();
}

async function runCatJokeSequence(lines) {
  if (catJokeInProgress || catNarrationActive || !jokesEnabled()) return;
  const token = catJokeToken;
  catJokeInProgress = true;
  for (const [index, line] of lines.entries()) {
    if (index) await catPause(650);
    if (token !== catJokeToken) return;
    await showCatJokeLine(line, token);
  }
  if (token !== catJokeToken) return;
  catJokeInProgress = false;
  scheduleCatJoke();
}

function scheduleCatJoke(initial = false) {
  clearTimeout(catJokeTimer);
  if (catNarrationActive || !jokesEnabled() || document.hidden || overview.open) return;
  catJokeTimer = setTimeout(() => {
    if (catNarrationActive || !jokesEnabled() || document.hidden || overview.open) return;
    if (!standaloneBag.length) standaloneBag = shuffledBag(catStandaloneJokes);
    if (!conversationBag.length) conversationBag = shuffledBag(catConversations);
    const conversation = Math.random() < .3;
    const lines = conversation ? catConversations[conversationBag.pop()] : [catStandaloneJokes[standaloneBag.pop()]];
    runCatJokeSequence(lines);
  }, initial ? 7000 + Math.random() * 4000 : 14000 + Math.random() * 10000);
}

function cancelCatJokes() {
  clearTimeout(catJokeTimer);
  catJokeToken++;
  catJokeInProgress = false;
  catBubbleActive = false;
  clearBubbleTracking();
  hideCatBubble();
}

function updateTeamStack() {
  const centerX = teamDeck.clientWidth / 2;
  const centerY = teamDeck.clientHeight / 2;
  teamCards.forEach(card => {
    card.style.setProperty('--stack-x', `${centerX - card.offsetLeft - card.offsetWidth / 2}px`);
    card.style.setProperty('--stack-y', `${centerY - card.offsetTop - card.offsetHeight / 2}px`);
  });
}

function fanTeamCards() {
  clearTimeout(teamFanTimer);
  updateTeamStack();
  teamSlide.classList.add('is-fanned');
  if (reducedMotion.matches) return;
  teamSlide.classList.add('is-fanning');
  teamFanTimer = setTimeout(() => teamSlide.classList.remove('is-fanning'), 1100);
}

function selectTeam(index, focus = false) {
  selectedTeam = (index + teamCards.length) % teamCards.length;
  teamCards.forEach((card, cardIndex) => {
    const selected = cardIndex === selectedTeam;
    card.classList.toggle('is-selected', selected);
    card.setAttribute('aria-pressed', String(selected));
  });
  teamPosition.textContent = `${String(selectedTeam + 1).padStart(2, '0')} / ${String(teamCards.length).padStart(2, '0')}`;
  if (focus) teamCards[selectedTeam].focus({ preventScroll: true });
}

function catGeometry() {
  const area = catViewport.getBoundingClientRect();
  const book = stage.getBoundingClientRect();
  const size = catActor.offsetWidth;
  const mobile = matchMedia('(max-width:700px) and (orientation:portrait)').matches;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const bottom = clamp(book.bottom - area.top - size + 10, 2, area.height - size - 2);
  const left = mobile ? book.left - area.left + 8 : book.left - area.left - size - 6;
  const right = mobile ? book.right - area.left - size - 8 : book.right - area.left + 6;
  const pencil = catObjects.pencil.getBoundingClientRect();
  const note = catObjects.note.getBoundingClientRect();
  const ruler = catObjects.ruler.getBoundingClientRect();
  return {
    area, size, mobile, bottom,
    left: clamp(left, 2, area.width - size - 2),
    right: clamp(right, 2, area.width - size - 2),
    pencilX: clamp(pencil.left - area.left + 8, 2, left),
    pencilY: clamp(pencil.top - area.top + pencil.height * .5 - size * .5, 2, bottom),
    noteX: clamp(note.left - area.left + 28, 2, left),
    noteY: clamp(note.top - area.top + note.height * .5 - size * .5, 2, bottom),
    rulerY: clamp(ruler.top - area.top + ruler.height * .5 - size * .5, 2, bottom)
  };
}

function setCatPose(pose) {
  catActor.classList.remove('is-walking', 'is-sitting', 'is-stretching', 'is-playing');
  catActor.classList.add(`is-${pose}`);
}

function touchCatObject(object) {
  const target = object === 'pen' ? slides[current].querySelector('.pen') : catObjects[object];
  if (!target || getComputedStyle(target).display === 'none') return;
  target.classList.remove('is-cat-touched');
  void target.offsetWidth;
  target.classList.add('is-cat-touched');
  setTimeout(() => target.classList.remove('is-cat-touched'), 600);
}

const catPause = duration => new Promise(resolve => setTimeout(resolve, duration));

async function walkCat(point, duration, token) {
  while (catSpeechLock && token === catRouteToken) {
    setCatPose('sitting');
    await catPause(120);
  }
  if (token !== catRouteToken) return false;
  const paper = slides[current].querySelector('.paper').getBoundingClientRect();
  const area = catViewport.getBoundingClientRect();
  const leftLimit = paper.left - area.left;
  const rightLimit = paper.right - area.left;
  catActor.dataset.safeWalk = String(
    (catPosition.x < leftLimit && point.x < leftLimit) ||
    (catPosition.x > rightLimit && point.x > rightLimit)
  );
  setCatPose('walking');
  catActor.style.setProperty('--cat-facing', point.x >= catPosition.x ? '1' : '-1');
  catActor.style.transition = `transform ${duration}ms linear`;
  requestAnimationFrame(() => {
    if (token === catRouteToken) catActor.style.transform = `translate3d(${point.x}px,${point.y}px,0)`;
  });
  await catPause(duration + 35);
  if (token !== catRouteToken) return false;
  catPosition = point;
  setCatPose('sitting');
  catActor.dataset.safeWalk = 'false';
  return true;
}

async function playCat(object, token) {
  if (token !== catRouteToken) return false;
  setCatPose(object === 'ruler' ? 'sitting' : 'playing');
  touchCatObject(object);
  await catPause(950);
  if (token !== catRouteToken) return false;
  setCatPose('sitting');
  await catPause(550);
  return token === catRouteToken;
}

function visiblePen() {
  const pen = slides[current].querySelector('.pen');
  return pen && getComputedStyle(pen).display !== 'none' ? pen : null;
}

async function runCatRoute(token) {
  while (token === catRouteToken && catMovementAllowed() && !document.hidden && !reducedMotion.matches) {
    const place = catGeometry();
    await catPause(1600);
    if (token !== catRouteToken) return;
    if (place.mobile) {
      if (!await walkCat({ x: place.right, y: place.bottom }, 4300, token)) return;
      if (visiblePen() && !await playCat('pen', token)) return;
      if (!visiblePen()) await catPause(1200);
      if (!await walkCat({ x: place.left, y: place.bottom }, 4300, token)) return;
      setCatPose('stretching');
      await catPause(700);
      setCatPose('sitting');
      continue;
    }
    if (!await walkCat({ x: place.pencilX, y: place.pencilY }, 1800, token)) return;
    if (!await playCat('pencil', token)) return;
    if (!await walkCat({ x: place.noteX, y: place.noteY }, 2600, token)) return;
    if (!await playCat('note', token)) return;
    if (!await walkCat({ x: place.left, y: place.bottom }, 2200, token)) return;
    setCatPose('stretching');
    await catPause(700);
    if (!await walkCat({ x: place.right, y: place.bottom }, 6800, token)) return;
    if (!await walkCat({ x: place.right, y: place.rulerY }, 2500, token)) return;
    if (!await playCat('ruler', token)) return;
    const pen = visiblePen();
    if (pen) {
      const penRect = pen.getBoundingClientRect();
      const penY = Math.min(Math.max(penRect.bottom - place.area.top - place.size * .7, 2), place.bottom);
      if (!await walkCat({ x: place.right, y: penY }, 1700, token)) return;
      if (!await playCat('pen', token)) return;
    }
    if (!await walkCat({ x: place.right, y: place.bottom }, 2200, token)) return;
    if (!await walkCat({ x: place.left, y: place.bottom }, 6800, token)) return;
  }
}

function startCat() {
  const token = ++catRouteToken;
  const place = catGeometry();
  catPosition = { x: place.left, y: place.bottom };
  catActor.style.transition = 'none';
  catActor.style.transform = `translate3d(${catPosition.x}px,${catPosition.y}px,0)`;
  catActor.dataset.safeWalk = 'false';
  setCatPose('sitting');
  if (catMovementAllowed() && !reducedMotion.matches && !focusMode && !catNarrationActive && !document.hidden) runCatRoute(token);
}

function updateExplainButton() {
  explainButton.textContent = catNarrationActive
    ? '⏹ Stop Explaining'
    : lastExplainedSlide === current ? '🐱 Explain Again' : '🐱 Explain This Slide';
  explainButton.classList.toggle('is-explaining', catNarrationActive);
  explainButton.setAttribute('aria-pressed', String(catNarrationActive));
  explainButton.title = catNarrationActive ? 'Stop the explanation (S or Esc)' : 'Explain the current slide (E)';
}

function waitForNarration(duration) {
  return new Promise(resolve => {
    const wait = { id: 0, resolve };
    wait.id = setTimeout(() => {
      narrationWaits.delete(wait);
      resolve(true);
    }, duration);
    narrationWaits.add(wait);
  });
}

function getReadingDelay(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(4000, Math.min(words / 150 * 60000 + 1000, 8000));
}

function clearVisualExplanation() {
  if (!visualExplanation) return;
  const { slide, restore } = visualExplanation;
  restore.reverse().forEach(reset => reset());
  slide.querySelectorAll('.teaching-focus,.teaching-muted').forEach(element => {
    element.classList.remove('teaching-focus', 'teaching-muted');
  });
  slide.querySelectorAll('.explain-extra').forEach(element => element.remove());
  slide.classList.remove('is-explaining-slide');
  visualExplanation = null;
}

function beginVisualExplanation(slide) {
  clearVisualExplanation();
  slide.classList.add('is-explaining-slide');
  const layer = document.createElement('div');
  layer.className = 'visual-explanation-layer explain-extra';
  layer.setAttribute('aria-hidden', 'true');
  const svg = document.createElementNS(drawingNamespace, 'svg');
  svg.classList.add('visual-ink');
  layer.appendChild(svg);
  slide.querySelector('.leaf').appendChild(layer);
  visualExplanation = { slide, layer, svg, marks: [], restore: [] };
}

function focusTeaching(targets, peers = []) {
  if (!visualExplanation) return;
  const slide = visualExplanation.slide;
  slide.querySelectorAll('.teaching-focus,.teaching-muted').forEach(element => {
    element.classList.remove('teaching-focus', 'teaching-muted');
  });
  const active = targets.filter(Boolean);
  peers.forEach(element => {
    if (!active.some(target => element === target || element.contains(target))) element.classList.add('teaching-muted');
  });
  active.forEach(element => element.classList.add('teaching-focus'));
}

function renderVisualMarks(animate = true) {
  if (!visualExplanation) return;
  const { layer, svg, marks } = visualExplanation;
  const area = layer.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${area.width} ${area.height}`);
  svg.replaceChildren();
  for (const mark of marks) {
    const first = mark.from.getBoundingClientRect();
    const x1 = first.left - area.left;
    const y1 = first.top - area.top;
    let pathData;
    if (mark.kind === 'underline') {
      const y = y1 + first.height + 3;
      pathData = `M ${x1 + 3} ${y} Q ${x1 + first.width / 2} ${y + 4} ${x1 + first.width - 3} ${y}`;
    } else if (mark.kind === 'circle') {
      const cx = x1 + first.width / 2;
      const cy = y1 + first.height / 2;
      const rx = first.width / 2 + 8;
      const ry = first.height / 2 + 6;
      pathData = `M ${cx - rx} ${cy} C ${cx - rx} ${cy - ry * 1.4} ${cx + rx} ${cy - ry * 1.4} ${cx + rx} ${cy} C ${cx + rx} ${cy + ry * 1.4} ${cx - rx} ${cy + ry * 1.4} ${cx - rx} ${cy}`;
    } else {
      const second = mark.to.getBoundingClientRect();
      const sx = x1 + first.width / 2;
      const sy = y1 + first.height + 4;
      const ex = second.left - area.left + second.width / 2;
      const ey = second.top - area.top - 5;
      const bend = (ey - sy) * .55;
      pathData = `M ${sx} ${sy} C ${sx + 8} ${sy + bend} ${ex - 8} ${ey - bend} ${ex} ${ey} m -6 -6 l 6 6 l -6 6`;
    }
    const path = document.createElementNS(drawingNamespace, 'path');
    path.setAttribute('d', pathData);
    path.classList.add('teaching-ink', `teaching-${mark.kind}`);
    svg.appendChild(path);
    if (animate && !reducedMotion.matches) {
      const length = path.getTotalLength();
      path.style.setProperty('--draw-length', `${length}px`);
      path.classList.add('is-drawing');
    }
  }
}

function drawVisualMark(kind, from, to = null) {
  if (!visualExplanation || !from) return;
  visualExplanation.marks.push({ kind, from, to });
  renderVisualMarks();
}

function clearVisualMarks() {
  if (!visualExplanation) return;
  visualExplanation.marks = [];
  visualExplanation.svg.replaceChildren();
}

function addExplanationExtra(container, className, text = '') {
  const element = document.createElement('div');
  element.className = `${className} explain-extra`;
  element.textContent = text;
  container.appendChild(element);
  return element;
}

async function showConceptFlow(slide, concepts, token, warning = '') {
  const flow = addExplanationExtra(slide.querySelector('.content'), 'concept-flow');
  flow.setAttribute('aria-label', concepts.join(' to '));
  const pathRow = document.createElement('div');
  pathRow.className = 'flow-path';
  flow.appendChild(pathRow);
  const nodes = [];
  const arrows = [];
  concepts.forEach((concept, index) => {
    if (index) {
      const arrow = document.createElementNS(drawingNamespace, 'svg');
      arrow.setAttribute('viewBox', '0 0 32 16');
      arrow.classList.add('flow-arrow');
      const path = document.createElementNS(drawingNamespace, 'path');
      path.setAttribute('d', 'M 2 8 Q 14 6 28 8 m -6 -5 l 6 5 l -6 5');
      arrow.appendChild(path);
      pathRow.appendChild(arrow);
      arrows.push(arrow);
    }
    const node = document.createElement('span');
    node.className = 'flow-node';
    node.textContent = concept;
    pathRow.appendChild(node);
    nodes.push(node);
  });
  if (warning) {
    const note = document.createElement('span');
    note.className = 'flow-warning';
    note.textContent = warning;
    flow.appendChild(note);
  }
  flow.scrollIntoView({ block: 'nearest' });
  for (const [index, node] of nodes.entries()) {
    if (token !== catNarrationToken) return;
    if (index) arrows[index - 1].classList.add('is-revealed');
    node.classList.add('is-revealed');
    node.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (!await waitForNarration(550)) return;
  }
  flow.querySelector('.flow-warning')?.classList.add('is-revealed');
}

function showRuleConclusion(slide) {
  const answer = slide.querySelector('.answer');
  const button = slide.querySelector('[data-reveal]');
  if (!answer || !button) return;
  const wasHidden = answer.hidden;
  const previousText = button.textContent;
  const previousExpanded = button.getAttribute('aria-expanded');
  visualExplanation.restore.push(() => {
    answer.hidden = wasHidden;
    button.textContent = previousText;
    button.setAttribute('aria-expanded', previousExpanded);
  });
  answer.hidden = false;
  button.textContent = 'Hide conclusion';
  button.setAttribute('aria-expanded', 'true');
  drawVisualMark('underline', answer);
}

async function showTruthCases(slide, token) {
  const table = slide.querySelector('#truthTable');
  table.hidden = false;
  document.getElementById('truthTableButton').setAttribute('aria-expanded', 'true');
  document.getElementById('truthTableButton').textContent = 'Hide truth table';
  updateTruthTable();
}

async function runVisualSequence(slideNumber, messageIndex, token) {
  const slide = slides[slideNumber - 1];
  if (token !== catNarrationToken || slide !== slides[current]) return;
  if ([1, 2, 14, 17].includes(slideNumber)) return;
  beginVisualExplanation(slide);
  const one = selector => slide.querySelector(selector);
  const many = selector => [...slide.querySelectorAll(selector)];

  if (slideNumber === 3) {
    const rows = many('.definition-list .paper-strip');
    if (messageIndex === 0) {
      focusTeaching([rows[0], rows[1]], rows);
      drawVisualMark('underline', rows[0]);
      drawVisualMark('underline', rows[1]);
    } else {
      focusTeaching([rows[2], rows[3], rows[4]], rows);
      drawVisualMark('underline', rows[2]);
      await showConceptFlow(slide, ['AXIOMS', 'HYPOTHESES', 'LOGIC', 'PROOF', 'THEOREM'], token, 'Fallacies ✕ are wrong turns');
    }
  } else if (slideNumber === 4) {
    if (messageIndex === 0) await showConceptFlow(slide, ['FACTS', 'VALID RULE', 'CONCLUSION'], token);
    else {
      const links = many('.rule-link');
      for (const link of links) {
        if (token !== catNarrationToken) return;
        focusTeaching([link], links);
        clearVisualMarks();
        drawVisualMark('underline', link);
        if (!await waitForNarration(480)) return;
      }
    }
  } else if (slideNumber >= 5 && slideNumber <= 9) {
    const columns = many('.rule-columns > *');
    if (messageIndex === 0) {
      const formula = one('.rule-formula');
      focusTeaching([formula], columns);
      drawVisualMark('arrow', one('.premise'), one('.conclusion-symbol'));
      const keys = { 5: '→  if P, then Q', 6: '∧  means AND', 7: '→  if…then   ·   ¬  means NOT', 8: '→  if…then', 9: '∨  means OR   ·   ¬  means NOT' };
      addExplanationExtra(formula, 'symbol-key', keys[slideNumber]);
    } else {
      focusTeaching([one('.rule-example')], columns);
      showRuleConclusion(slide);
    }
  } else if (slideNumber === 10) {
    const cards = many('.fallacy-list details');
    focusTeaching([cards[0]], cards);
    drawVisualMark('underline', cards[0].querySelector('summary'));
    if (messageIndex === 1) {
      const demo = addExplanationExtra(one('.content'), 'fallacy-demo');
      demo.innerHTML = '<span>Rain → wet road</span><span>Wet road does not prove rain.</span><span>No rain does not mean dry road.</span><strong>A sprinkler could explain the water. ✕</strong>';
      if (!await waitForNarration(900) || token !== catNarrationToken) return;
      focusTeaching([cards[1]], cards);
      clearVisualMarks();
      drawVisualMark('underline', cards[1].querySelector('summary'));
      if (!await waitForNarration(900) || token !== catNarrationToken) return;
      focusTeaching([cards[2]], cards);
      clearVisualMarks();
      drawVisualMark('underline', cards[2].querySelector('summary'));
    }
  } else if (slideNumber === 11) {
    const halves = many('.implication-layout > *');
    if (messageIndex === 0) {
      focusTeaching([halves[0]], halves);
      drawVisualMark('underline', one('.implication-copy p:nth-child(2)'));
      await showConceptFlow(slide, ['P: a square', 'Q: four sides'], token);
    } else {
      focusTeaching([halves[1]], halves);
      await showTruthCases(slide, token);
    }
  } else if (slideNumber === 12) {
    const cards = many('.proof-type');
    if (messageIndex === 0) {
      focusTeaching(cards, cards);
      drawVisualMark('underline', one('.script'));
      addExplanationExtra(one('.content'), 'symbol-key', '→  means if P, then Q');
    } else {
      const hints = ['Result already true', 'Starting condition impossible', 'Follow justified steps'];
      for (const [index, card] of cards.entries()) {
        if (token !== catNarrationToken) return;
        focusTeaching([card], cards);
        clearVisualMarks();
        drawVisualMark('underline', card.querySelector('summary'));
        addExplanationExtra(card, 'proof-hint', hints[index]);
        if (!await waitForNarration(850)) return;
      }
    }
  } else if (slideNumber === 13) {
    const steps = many('.proof-step');
    if (messageIndex === 0) {
      focusTeaching([steps[0], steps[1]], steps);
      drawVisualMark('underline', steps[0]);
    } else {
      for (const [index, step] of steps.entries()) {
        if (token !== catNarrationToken) return;
        setProofVisible(index + 1);
        focusTeaching([step], steps);
        clearVisualMarks();
        if (index) drawVisualMark('arrow', steps[index - 1], step);
        else drawVisualMark('underline', step);
        if (!await waitForNarration(650)) return;
      }
    }
  } else if (slideNumber === 15) {
    const cards = many('.challenge-question');
    if (messageIndex === 1) {
      addExplanationExtra(one('.content'), 'symbol-key', '→  if…then   ·   ¬  means NOT');
      for (const card of cards) {
        if (token !== catNarrationToken) return;
        focusTeaching([card], cards);
        clearVisualMarks();
        drawVisualMark('underline', card.querySelector('legend'));
        if (!await waitForNarration(850)) return;
      }
    }
  } else if (slideNumber === 16) {
    const points = many('.conclusion-list li');
    focusTeaching(messageIndex === 0 ? [points[0]] : [points[1], points[2]], points);
    drawVisualMark('underline', messageIndex === 0 ? points[0] : points[2]);
    if (messageIndex === 1) addExplanationExtra(one('.content'), 'symbol-key', '→  means if P, then Q');
  }
}

function stopCatNarration(completed = false) {
  if (!catNarrationActive) return;
  clearVisualExplanation();
  const cat = catActor.getBoundingClientRect();
  const area = catViewport.getBoundingClientRect();
  catPosition = { x: cat.left - area.left, y: cat.top - area.top };
  catActor.style.transition = 'none';
  catActor.style.transform = `translate3d(${catPosition.x}px,${catPosition.y}px,0)`;
  catNarrationToken++;
  catNarrationActive = false;
  lastExplainedSlide = completed ? current : -1;
  for (const wait of narrationWaits) {
    clearTimeout(wait.id);
    wait.resolve(false);
  }
  narrationWaits.clear();
  narrationSpeechFinish?.();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  catBubbleActive = false;
  clearBubbleTracking();
  catBubble.classList.remove('is-narrating', 'is-line-complete');
  catBubbleText.textContent = '';
  narrationPanel.hidden = true;
  narrationText.textContent = '';
  app.classList.remove('has-caption');
  hideCatBubble();
  catSpeechLock = false;
  setCatPose('sitting');
  updateExplainButton();
  const routeToken = ++catRouteToken;
  if (catMovementAllowed() && !reducedMotion.matches && !focusMode && !document.hidden) runCatRoute(routeToken);
  scheduleCatJoke();
}

function speakNarrationLine(line, token) {
  if (!catVoiceToggle.checked || !('speechSynthesis' in window)) return Promise.resolve();
  return new Promise(resolve => {
    const utterance = new SpeechSynthesisUtterance(line);
    utterance.rate = 1;
    let finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      if (narrationSpeechFinish === finish) narrationSpeechFinish = null;
      resolve();
    }
    narrationSpeechFinish = finish;
    utterance.onend = finish;
    utterance.onerror = finish;
    if (token === catNarrationToken) {
      try { speechSynthesis.speak(utterance); }
      catch { finish(); }
    } else finish();
  });
}

async function startCatNarration() {
  if (catNarrationActive || busy || document.hidden || overview.open) return;
  clearVisualExplanation();
  const lines = catNarration[current + 1];
  if (!lines) return;
  const slide = current;
  const token = ++catNarrationToken;
  catNarrationActive = true;
  narrationText.textContent = lines.join(' ');
  narrationPanel.hidden = false;
  app.classList.add('has-caption');
  requestAnimationFrame(sizeDoodle);
  lastExplainedSlide = -1;
  cancelCatJokes();
  catSpeechLock = true;
  const cat = catActor.getBoundingClientRect();
  const area = catViewport.getBoundingClientRect();
  catPosition = { x: cat.left - area.left, y: cat.top - area.top };
  ++catRouteToken;
  catActor.style.transition = 'none';
  catActor.style.transform = `translate3d(${catPosition.x}px,${catPosition.y}px,0)`;
  catActor.dataset.safeWalk = 'false';
  setCatPose('sitting');
  updateExplainButton();

  if (!await waitForNarration(NARRATION_INITIAL_DELAY) || token !== catNarrationToken) return;

  const place = catGeometry();
  const targetX = Math.abs(catPosition.x - place.left) <= Math.abs(catPosition.x - place.right) ? place.left : place.right;
  const target = { x: targetX, y: place.bottom };
  if (!reducedMotion.matches) {
    if (!await waitForNarration(30) || token !== catNarrationToken) return;
    catActor.style.setProperty('--cat-facing', target.x >= catPosition.x ? '1' : '-1');
    setCatPose('walking');
    catActor.style.transition = 'transform 450ms linear';
    catActor.style.transform = `translate3d(${target.x}px,${target.y}px,0)`;
    if (!await waitForNarration(470) || token !== catNarrationToken) return;
  } else {
    catActor.style.transform = `translate3d(${target.x}px,${target.y}px,0)`;
  }
  catPosition = target;
  setCatPose('sitting');
  catActor.style.setProperty('--cat-facing', target.x === place.left ? '1' : '-1');
  if (!await waitForNarration(NARRATION_SETTLE_DELAY) || token !== catNarrationToken) return;

  for (const [index, line] of lines.entries()) {
    if (token !== catNarrationToken || slide !== current) return;
    const isLast = index === lines.length - 1;
    const readingDelay = isLast ? Math.min(getReadingDelay(line), 6000) : getReadingDelay(line);
    const voicePause = catVoiceToggle.checked
      ? speakNarrationLine(line, token).then(() => token === catNarrationToken ? waitForNarration(NARRATION_VOICE_PAUSE) : false)
      : Promise.resolve();
    await Promise.all([waitForNarration(readingDelay), voicePause, runVisualSequence(slide + 1, index, token)]);
    if (token !== catNarrationToken || slide !== current) return;
    clearVisualExplanation();
    if (!await waitForNarration(isLast ? 300 : 400)) return;
  }
  stopCatNarration(true);
}

let catBlinkTimer = 0;
function scheduleCatBlink() {
  clearTimeout(catBlinkTimer);
  if (reducedMotion.matches || focusMode || document.hidden) return;
  catBlinkTimer = setTimeout(() => {
    catActor.classList.add('is-blinking');
    setTimeout(() => catActor.classList.remove('is-blinking'), 150);
    scheduleCatBlink();
  }, 2600 + Math.random() * 2800);
}

function stopFinale() {
  clearTimeout(particleTimer);
  finaleSlide.classList.remove('final-playing');
  confetti.replaceChildren();
}

function startFinale() {
  stopFinale();
  if (reducedMotion.matches) return;
  void finaleSlide.offsetWidth;
  finaleSlide.classList.add('final-playing');
  const symbols = ['∴', '∀', '∃', '→', '⇔', '∧', '∨', '¬', '√', 'π', '∑', '∎'];
  const colors = ['#b69a67', '#315d65', '#6d8b79', '#53635b'];
  symbols.forEach((symbol, index) => {
    const particle = document.createElement('span');
    particle.className = 'math-particle';
    particle.textContent = symbol;
    particle.style.setProperty('--start-x', `${9 + index * 7.3}%`);
    particle.style.setProperty('--particle-color', colors[index % colors.length]);
    particle.style.setProperty('--particle-size', `${1.25 + index % 3 * .3}cqw`);
    particle.style.setProperty('--particle-delay', `${index % 4 * 95}ms`);
    particle.style.setProperty('--drift-x', `${index % 2 ? -1.3 : 1.2}cqw`);
    particle.style.setProperty('--drift-rot', `${index % 2 ? -18 : 14}deg`);
    confetti.appendChild(particle);
  });
  particleTimer = setTimeout(() => confetti.replaceChildren(), 2050);
}

slides.forEach((slide, index) => {
  const paper = document.createElement('div');
  paper.className = 'paper';
  paper.setAttribute('aria-hidden', 'true');
  const spiral = document.createElement('div');
  spiral.className = 'spiral';
  spiral.setAttribute('aria-hidden', 'true');
  const stack = document.createElement('div');
  stack.className = 'page-stack';
  stack.setAttribute('aria-hidden', 'true');
  for (let layer = 0; layer < 3; layer++) stack.appendChild(document.createElement('span'));
  for (let ring = 0; ring < 13; ring++) {
    const coil = document.createElement('span');
    coil.style.top = `${ring * 8}%`;
    spiral.appendChild(coil);
  }
  slide.prepend(spiral);
  slide.prepend(stack);
  slide.prepend(paper);
  const leaf = document.createElement('div');
  leaf.className = 'leaf';
  for (const child of [...slide.children]) {
    if (!child.matches('.spiral,.page-stack')) leaf.appendChild(child);
  }
  const curl = document.createElement('div');
  curl.className = 'page-curl';
  curl.setAttribute('aria-hidden', 'true');
  leaf.appendChild(curl);
  slide.appendChild(leaf);
  slide.inert = index !== 0;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'thumb';
  button.setAttribute('aria-label', `Go to slide ${index + 1}: ${slide.dataset.title}`);
  const art = document.createElement('span');
  art.className = 'thumb-art';
  const heading = document.createElement('strong');
  heading.textContent = slide.dataset.title;
  art.appendChild(heading);
  const label = document.createElement('span');
  label.className = 'thumb-label';
  label.textContent = `${String(index + 1).padStart(2, '0')} · ${slide.dataset.title}`;
  button.append(art, label);
  button.addEventListener('click', () => { closeOverview(); goTo(index); });
  thumbGrid.appendChild(button);
});
const thumbs = [...thumbGrid.children];

function updateUI() {
  document.getElementById('slideCount').textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length}`;
  document.getElementById('slideName').textContent = slides[current].dataset.title;
  announcer.textContent = `Slide ${current + 1} of ${slides.length}: ${slides[current].dataset.title}`;
  prevButton.disabled = current === 0;
  nextButton.disabled = current === slides.length - 1;
  progress.setAttribute('aria-valuenow', current + 1);
  progressFill.style.width = `${((current + 1) / slides.length) * 100}%`;
  thumbs.forEach((thumb, index) => thumb.classList.toggle('selected', index === current));
  history.replaceState(null, '', `#${current + 1}`);
}

function goTo(index) {
  if (busy || index < 0 || index >= slides.length || index === current) return;
  stopCatNarration();
  cancelCatJokes();
  scheduleCatJoke();
  busy = true;
  stopFinale();
  app.classList.remove('intro');
  const previous = slides[current];
  const next = slides[index];
  const forward = index > current;
  const turning = forward ? previous : next;
  const under = forward ? next : previous;
  previous.classList.remove('is-arriving', 'is-settling', 'is-presenting');
  next.classList.add('is-arriving');
  previous.classList.remove('is-active');
  under.classList.add('is-under');
  turning.classList.add(forward ? 'is-turning-forward' : 'is-turning-back');
  stage.classList.add('is-flipping');
  if (next.matches('.rules-menu,.fallacies,.implication,.types,.worked,.conclusion,.cover')) {
    stage.classList.add('chapter-shift', index % 2 ? 'chapter-pan-left' : 'chapter-pan-right');
  }
  previous.inert = true;
  next.inert = false;
  current = index;
  updateUI();
  updateExplainButton();
  const duration = reducedMotion.matches ? 1 : parseFloat(getComputedStyle(stage).getPropertyValue('--duration'));
  setTimeout(() => {
    under.classList.remove('is-under');
    turning.classList.remove('is-turning-forward', 'is-turning-back');
    next.classList.add('is-active');
    if (!reducedMotion.matches) next.classList.add('is-settling');
    if (previous === teamSlide) {
      clearTimeout(teamFanTimer);
      teamSlide.classList.remove('is-fanned', 'is-fanning');
    }
    if (next === teamSlide) fanTeamCards();
    if (next.matches('.rules-menu,.conclusion')) next.classList.add('is-presenting');
    if (next === finaleSlide) startFinale();
    stage.classList.remove('is-flipping', 'chapter-shift', 'chapter-pan-left', 'chapter-pan-right');
    busy = false;
    startCat();
  }, duration);
  setTimeout(() => next.classList.remove('is-arriving'), reducedMotion.matches ? 1 : duration + 300);
  if (!reducedMotion.matches) setTimeout(() => next.classList.remove('is-settling'), duration + 280);
}

let overviewOpener = null;
function openOverview() {
  if (overview.open) return;
  stopCatNarration();
  cancelCatJokes();
  overviewOpener = document.activeElement;
  closeUtilities();
  overview.showModal();
  overview.classList.add('open');
  app.inert = true;
  thumbs[current].focus();
}

function closeOverview() {
  if (!overview.open) return;
  overview.close();
}
overview.addEventListener('close', () => {
  overview.classList.remove('open');
  app.inert = false;
  (overviewOpener?.isConnected ? overviewOpener : document.getElementById('overviewButton')).focus();
  scheduleCatJoke();
});

prevButton.addEventListener('click', () => goTo(current - 1));
nextButton.addEventListener('click', () => goTo(current + 1));
explainButton.addEventListener('click', () => catNarrationActive ? stopCatNarration() : startCatNarration());
document.getElementById('stopNarration').addEventListener('click', () => stopCatNarration());
catJokesToggle.addEventListener('change', () => {
  savePreference('proof-cat-jokes', catJokesToggle.checked);
  if (jokesEnabled()) scheduleCatJoke();
  else if (!catNarrationActive) cancelCatJokes();
});
catVoiceToggle.addEventListener('change', () => {
  if (!catVoiceToggle.checked) {
    narrationSpeechFinish?.();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
});
if (!('speechSynthesis' in window)) {
  catVoiceToggle.disabled = true;
  catVoiceToggle.closest('label').title = 'Voice unavailable here; written captions still work';
  document.getElementById('voiceAvailability').textContent = 'Voice unavailable here; written captions still work.';
}
document.getElementById('overviewButton').addEventListener('click', openOverview);
document.getElementById('closeOverview').addEventListener('click', closeOverview);
document.getElementById('fullscreenButton').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    else announcer.textContent = 'Fullscreen is unavailable in this browser.';
  } catch { announcer.textContent = 'Fullscreen request was declined. The presentation remains usable in the window.'; }
});
const utilitiesButton = document.getElementById('utilitiesButton');
const utilitiesMenu = document.getElementById('utilitiesMenu');
function closeUtilities() { utilitiesMenu.hidden = true; utilitiesButton.setAttribute('aria-expanded', 'false'); }
utilitiesButton.addEventListener('click', () => {
  utilitiesMenu.hidden = !utilitiesMenu.hidden;
  utilitiesButton.setAttribute('aria-expanded', String(!utilitiesMenu.hidden));
  if (!utilitiesMenu.hidden) utilitiesMenu.querySelector('button').focus();
});
document.addEventListener('pointerdown', event => { if (!event.target.closest('.utilities')) closeUtilities(); });
focusButton.addEventListener('click', () => {
  focusMode = !focusMode;
  savePreference('proof-focus-mode', focusMode);
  focusButton.textContent = `Focus mode: ${focusMode ? 'On' : 'Off'}`;
  focusButton.setAttribute('aria-pressed', String(focusMode));
  cancelCatJokes();
  startCat();
  scheduleCatBlink();
  scheduleCatJoke();
});
const infoDialog = document.getElementById('infoDialog');
const infoTitle = document.getElementById('infoTitle');
const infoContent = document.getElementById('infoContent');
const infoPanels = {
  symbols: ['Symbol guide', '<dl class="symbol-guide"><dt>p, q, r</dt><dd>Statements that can be true or false.</dd><dt>→</dt><dd>“If … then …”</dd><dt>∧</dt><dd>AND: both statements are true.</dd><dt>∨</dt><dd>OR: at least one is true; both may be true.</dd><dt>¬</dt><dd>NOT: reverses a truth value.</dd><dt>∴</dt><dd>Therefore: marks a conclusion.</dd></dl>'],
  keyboard: ['Keyboard help', '<dl class="symbol-guide"><dt>→ / Page Down / Space</dt><dd>Next slide</dd><dt>← / Page Up</dt><dd>Previous slide</dd><dt>Home / End</dt><dd>First / last slide</dd><dt>O</dt><dd>All slides overview</dd><dt>E / S</dt><dd>Explain / stop explanation</dd><dt>F</dt><dd>Fullscreen</dd><dt>?</dt><dd>This help</dd><dt>Escape</dt><dd>Close a panel or stop explanation</dd></dl>']
};
utilitiesMenu.querySelectorAll('[data-panel]').forEach(button => button.addEventListener('click', () => {
  const [title, content] = infoPanels[button.dataset.panel];
  infoTitle.textContent = title;
  infoContent.innerHTML = content;
  closeUtilities();
  infoDialog.showModal();
}));
document.getElementById('closeInfo').addEventListener('click', () => infoDialog.close());
infoDialog.addEventListener('close', () => utilitiesButton.focus());
document.getElementById('printButton').addEventListener('click', () => { closeUtilities(); window.print(); });
let printDetails = [];
addEventListener('beforeprint', () => {
  stopCatNarration();
  printDetails = [...document.querySelectorAll('.slide details')].map(detail => [detail, detail.open]);
  printDetails.forEach(([detail]) => { detail.open = true; });
});
addEventListener('afterprint', () => {
  printDetails.forEach(([detail, wasOpen]) => { detail.open = wasOpen; });
  printDetails = [];
});

document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target.closest('input,select,textarea,[contenteditable]')) return;
  if (overview.open) {
    if (event.key === 'Escape') { event.preventDefault(); closeOverview(); }
    return;
  }
  if (infoDialog.open) return;
  if (!utilitiesMenu.hidden) {
    if (event.key === 'Escape') { closeUtilities(); utilitiesButton.focus(); }
    return;
  }
  if (['ArrowRight', 'PageDown'].includes(event.key) || (event.key === ' ' && !event.target.closest('button,summary'))) {
    event.preventDefault();
    goTo(current + 1);
  } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    goTo(current - 1);
  } else if (event.key === 'Home') goTo(0);
  else if (event.key === 'End') goTo(slides.length - 1);
  else if (event.key.toLowerCase() === 'e') startCatNarration();
  else if (catNarrationActive && (event.key.toLowerCase() === 's' || event.key === 'Escape')) stopCatNarration();
  else if (event.key.toLowerCase() === 'o') openOverview();
  else if (event.key.toLowerCase() === 'f') document.getElementById('fullscreenButton').click();
  else if (event.key === '?') utilitiesMenu.querySelector('[data-panel="keyboard"]').click();
});

const swipeInteractive = 'button, form, fieldset, input, select, textarea, label, summary, details, canvas, a, [contenteditable], .team-carousel, .concept-flow, .flow-path';
stage.addEventListener('touchstart', event => {
  const target = event.target instanceof Element ? event.target : event.target.parentElement;
  if (event.touches.length !== 1 || target.closest(swipeInteractive)) { swipeStart = null; return; }
  const touch = event.touches[0];
  swipeStart = { x: touch.clientX, y: touch.clientY, id: touch.identifier };
}, { passive: true });
stage.addEventListener('touchmove', event => {
  if (!swipeStart || event.touches.length !== 1) { swipeStart = null; return; }
  const touch = event.touches[0];
  const dx = touch.clientX - swipeStart.x;
  const dy = touch.clientY - swipeStart.y;
  if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) swipeStart = null;
}, { passive: true });
stage.addEventListener('touchend', event => {
  if (!swipeStart || event.changedTouches.length !== 1) { swipeStart = null; return; }
  const touch = event.changedTouches[0];
  if (touch.identifier !== swipeStart.id) { swipeStart = null; return; }
  const dx = touch.clientX - swipeStart.x;
  const dy = touch.clientY - swipeStart.y;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(current + (dx < 0 ? 1 : -1));
  swipeStart = null;
}, { passive: true });
stage.addEventListener('touchcancel', () => { swipeStart = null; }, { passive: true });

document.querySelectorAll('[data-go]').forEach(button => {
  button.addEventListener('click', () => goTo(Number(button.dataset.go) - 1));
});
document.querySelectorAll('[data-reveal]').forEach(button => {
  button.addEventListener('click', () => {
    const answer = button.nextElementSibling;
    const open = answer.hidden;
    answer.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    button.textContent = open ? 'Hide conclusion' : 'Show conclusion';
  });
});
teamCards.forEach((card, index) => card.addEventListener('click', () => {
  if (performance.now() >= suppressTeamClickUntil) selectTeam(index);
}));
document.getElementById('teamAllButton').addEventListener('click', event => {
  const all = teamSlide.classList.toggle('all-members');
  event.currentTarget.setAttribute('aria-pressed', String(all));
  event.currentTarget.textContent = all ? 'Carousel view' : 'All members';
});
teamCarousel.querySelectorAll('[data-team-direction]').forEach(button => {
  button.addEventListener('click', () => {
    if (performance.now() >= suppressTeamClickUntil) selectTeam(selectedTeam + Number(button.dataset.teamDirection));
  });
});
teamCarousel.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'Home' || event.key === 'End') {
    event.preventDefault();
    event.stopPropagation();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? teamCards.length - 1 : selectedTeam + (event.key === 'ArrowRight' ? 1 : -1);
    selectTeam(next, true);
  }
});
teamCarousel.addEventListener('touchstart', event => {
  const touch = event.touches[0];
  teamSwipeStart = event.touches.length === 1 && event.target.closest('.team-deck')
    ? { x: touch.clientX, y: touch.clientY, id: touch.identifier } : null;
}, { passive: true });
teamCarousel.addEventListener('touchend', event => {
  event.stopPropagation();
  if (!teamSwipeStart || event.changedTouches.length !== 1) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - teamSwipeStart.x;
  const dy = touch.clientY - teamSwipeStart.y;
  if (touch.identifier === teamSwipeStart.id && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    selectTeam(selectedTeam + (dx < 0 ? 1 : -1));
    suppressTeamClickUntil = performance.now() + 350;
  }
  teamSwipeStart = null;
}, { passive: true });
teamCarousel.addEventListener('touchcancel', () => { teamSwipeStart = null; }, { passive: true });
document.querySelectorAll('.definition-list button').forEach(button => {
  button.addEventListener('click', () => {
    button.classList.toggle('selected');
    button.setAttribute('aria-pressed', String(button.classList.contains('selected')));
  });
});

document.querySelectorAll('.proof-type').forEach(card => {
  card.querySelector('summary').addEventListener('click', () => {
    const grid = card.closest('.type-grid');
    grid.classList.add('has-focus');
    grid.querySelectorAll('.proof-type').forEach(item => item.classList.toggle('is-focused', item === card));
  });
});

const truth = { p: true, q: true };
const truthResult = document.getElementById('truthResult');
const truthTable = document.getElementById('truthTable');
function updateTruthTable() {
  const valid = !truth.p || truth.q;
  truthResult.textContent = `Implication: ${valid ? 'True' : 'False'}`;
  truthResult.classList.toggle('false', !valid);
  truthTable.querySelectorAll('tbody tr').forEach(row => {
    row.classList.toggle('is-current', row.dataset.p === String(truth.p) && row.dataset.q === String(truth.q));
  });
}
document.querySelectorAll('[data-truth]').forEach(button => {
  button.addEventListener('click', () => {
    const key = button.dataset.truth;
    truth[key] = !truth[key];
    button.setAttribute('aria-pressed', String(truth[key]));
    button.textContent = `${key}: ${truth[key] ? 'True' : 'False'}`;
    updateTruthTable();
  });
});
document.getElementById('truthTableButton').addEventListener('click', event => {
  truthTable.hidden = !truthTable.hidden;
  event.currentTarget.setAttribute('aria-expanded', String(!truthTable.hidden));
  event.currentTarget.textContent = truthTable.hidden ? 'Show truth table' : 'Hide truth table';
});
updateTruthTable();

const proofSteps = [...document.querySelectorAll('.proof-step')];
let visibleProofSteps = 0;
function setProofVisible(count) {
  visibleProofSteps = Math.max(0, Math.min(count, proofSteps.length));
  proofSteps.forEach((step, index) => {
    step.hidden = index >= visibleProofSteps;
    step.classList.toggle('selected', index === visibleProofSteps - 1);
    step.setAttribute('aria-pressed', String(index === visibleProofSteps - 1));
  });
  document.getElementById('stepExplanation').textContent = visibleProofSteps ? proofSteps[visibleProofSteps - 1].dataset.explain : 'Choose Next step to begin the proof.';
  document.getElementById('stepCount').textContent = `${visibleProofSteps} / ${proofSteps.length} steps`;
  document.getElementById('previousStep').disabled = visibleProofSteps === 0;
  document.getElementById('nextStep').disabled = visibleProofSteps === proofSteps.length;
  document.getElementById('showAllSteps').disabled = visibleProofSteps === proofSteps.length;
  document.querySelector('.worked').classList.toggle('is-proved', visibleProofSteps === proofSteps.length);
}
document.getElementById('previousStep').addEventListener('click', () => setProofVisible(visibleProofSteps - 1));
document.getElementById('nextStep').addEventListener('click', () => setProofVisible(visibleProofSteps + 1));
document.getElementById('showAllSteps').addEventListener('click', () => setProofVisible(proofSteps.length));
proofSteps.forEach((step, index) => step.addEventListener('click', () => setProofVisible(index + 1)));
setProofVisible(1);

const challengeForm = document.getElementById('challengeForm');
const challengeAnswers = { q1: ['b', 'From p ∧ q, both p and q are true; either may be stated alone.'], q2: ['b', 'Modus Tollens concludes ¬p from p → q and ¬q.'], q3: ['b', 'Using the conclusion as its own reason is circular reasoning.'] };
challengeForm.addEventListener('submit', event => {
  event.preventDefault();
  let score = 0;
  for (const [key, [answer, explanation]] of Object.entries(challengeAnswers)) {
    const selected = challengeForm.querySelector(`input[name="${key}"]:checked`);
    const feedback = challengeForm.querySelector(`[data-feedback="${key}"]`);
    const correct = selected?.value === answer;
    if (correct) score++;
    feedback.textContent = `${correct ? 'Correct.' : selected ? 'Try again.' : 'Choose an answer.'} ${explanation}`;
    feedback.hidden = false;
    feedback.classList.toggle('incorrect', !correct);
  }
  document.getElementById('challengeScore').textContent = `${score} / 3 correct`;
});
challengeForm.addEventListener('reset', () => {
  challengeForm.querySelectorAll('.challenge-feedback').forEach(feedback => { feedback.hidden = true; feedback.textContent = ''; });
  document.getElementById('challengeScore').textContent = '';
});

const doodle = document.getElementById('doodle');
const ink = doodle.getContext('2d');
const strokes = [];
let activeStroke = null;
let activePointer = null;
const undoDoodle = document.getElementById('undoDoodle');
const clearDoodle = document.getElementById('clearDoodle');
function updateDoodleControls() {
  undoDoodle.disabled = strokes.length === 0;
  clearDoodle.disabled = strokes.length === 0;
}
function drawDoodle() {
  const width = doodle.clientWidth;
  const height = doodle.clientHeight;
  ink.clearRect(0, 0, width, height);
  ink.lineWidth = 2.8;
  ink.lineCap = 'round';
  ink.lineJoin = 'round';
  ink.strokeStyle = '#1b2630';
  for (const stroke of strokes) {
    if (!stroke.length) continue;
    ink.beginPath();
    ink.moveTo(stroke[0].x * width, stroke[0].y * height);
    if (stroke.length === 1) ink.lineTo(stroke[0].x * width + .01, stroke[0].y * height + .01);
    for (const point of stroke.slice(1)) ink.lineTo(point.x * width, point.y * height);
    ink.stroke();
  }
}
function sizeDoodle() {
  const rect = doodle.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const ratio = window.devicePixelRatio || 1;
  const width = Math.round(rect.width * ratio);
  const height = Math.round(rect.height * ratio);
  if (doodle.width !== width) doodle.width = width;
  if (doodle.height !== height) doodle.height = height;
  ink.setTransform(ratio, 0, 0, ratio, 0, 0);
  drawDoodle();
}
function point(event) {
  const rect = doodle.getBoundingClientRect();
  return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) };
}
doodle.addEventListener('pointerdown', event => {
  if (activePointer !== null) return;
  event.preventDefault();
  activePointer = event.pointerId;
  activeStroke = [point(event)];
  strokes.push(activeStroke);
  doodle.setPointerCapture(event.pointerId);
  drawDoodle();
  updateDoodleControls();
});
doodle.addEventListener('pointermove', event => {
  if (event.pointerId !== activePointer || !activeStroke) return;
  activeStroke.push(point(event));
  drawDoodle();
});
doodle.addEventListener('pointerup', event => { if (event.pointerId === activePointer) { activeStroke?.push(point(event)); activeStroke = null; activePointer = null; drawDoodle(); } });
doodle.addEventListener('pointercancel', event => { if (event.pointerId === activePointer) { activeStroke = null; activePointer = null; drawDoodle(); } });
undoDoodle.addEventListener('click', () => { strokes.pop(); drawDoodle(); updateDoodleControls(); });
clearDoodle.addEventListener('click', () => { strokes.length = 0; drawDoodle(); updateDoodleControls(); });
if ('ResizeObserver' in window) new ResizeObserver(sizeDoodle).observe(doodle);
addEventListener('resize', sizeDoodle);
addEventListener('resize', updateTeamStack);
addEventListener('resize', () => { swipeStart = null; teamSwipeStart = null; });
function refreshPresentationLayout() {
  clearTimeout(catResizeTimer);
  catResizeTimer = setTimeout(() => {
    if (!catNarrationActive) {
      startCat();
      return;
    }
    const place = catGeometry();
    const cat = catActor.getBoundingClientRect();
    const x = cat.left - place.area.left;
    catPosition = { x: Math.abs(x - place.left) <= Math.abs(x - place.right) ? place.left : place.right, y: place.bottom };
    catActor.style.transition = 'none';
    catActor.style.transform = `translate3d(${catPosition.x}px,${catPosition.y}px,0)`;
    setCatPose('sitting');
    catActor.style.setProperty('--cat-facing', catPosition.x === place.left ? '1' : '-1');
    renderVisualMarks(false);
  }, 160);
}
addEventListener('resize', refreshPresentationLayout);
document.addEventListener('fullscreenchange', refreshPresentationLayout);
reducedMotion.addEventListener('change', () => {
  stopCatNarration();
  startCat();
  scheduleCatBlink();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopCatNarration();
    cancelCatJokes();
    catRouteToken++;
    catActor.style.transition = 'none';
    setCatPose('sitting');
    clearTimeout(catBlinkTimer);
  } else {
    startCat();
    scheduleCatBlink();
    scheduleCatJoke();
  }
});
addEventListener('hashchange', () => {
  const requested = Number(location.hash.slice(1));
  if (Number.isInteger(requested) && requested >= 1 && requested <= slides.length) goTo(requested - 1);
});

const initial = Number(location.hash.slice(1));
if (Number.isInteger(initial) && initial > 1 && initial <= slides.length) {
  slides[0].classList.remove('is-active');
  slides[0].inert = true;
  current = initial - 1;
  slides[current].classList.add('is-active');
  slides[current].inert = false;
}
sizeDoodle();
updateTeamStack();
updateUI();
updateExplainButton();
startCat();
scheduleCatBlink();
scheduleCatJoke(true);
if (slides[current] === teamSlide) setTimeout(fanTeamCards, reducedMotion.matches ? 0 : 130);
if (slides[current].matches('.rules-menu,.conclusion')) slides[current].classList.add('is-presenting');
if (slides[current] === finaleSlide) startFinale();
if (current === 0 && !reducedMotion.matches) {
  app.classList.add('intro');
  setTimeout(() => app.classList.remove('intro'), 1700);
}
