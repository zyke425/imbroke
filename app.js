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
const catJokesState = document.getElementById('catJokesState');
const explainButton = document.getElementById('explainButton');
const catVoiceToggle = document.getElementById('catVoiceToggle');
const catVoiceState = document.getElementById('catVoiceState');
const catObjects = {
  pencil: document.querySelector('.desk-pencil'),
  note: document.querySelector('.desk-note-prop'),
  ruler: document.querySelector('.desk-ruler')
};
let current = 0;
let busy = false;
let swipeStart = null;
let particleTimer = 0;
let teamFanTimer = 0;
let selectedTeam = 0;
let teamSwipeX = null;
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
const NARRATION_TYPE_SPEED = 40;
const NARRATION_FADE_DURATION = 400;
const NARRATION_BETWEEN_MESSAGES = 700;
const NARRATION_VOICE_PAUSE = 1000;
const NARRATION_FINAL_PAUSE = 1200;
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
  1: ['Today we are learning how mathematicians show that an idea is true.', 'I can help explain any page when you ask.'],
  2: ['These are the people in Group 3 who put this presentation together.', 'We will walk through the ideas behind mathematical proofs as a team.'],
  3: ['A theorem is a claim we can prove. A proof is the reasoning that shows why it is true.', 'Axioms are starting assumptions, and rules of inference connect the steps.'],
  4: ['Rules of inference are reliable patterns for moving from facts we know to a new conclusion.', 'The next pages show five common patterns.'],
  5: ['If one fact guarantees another, and the first fact happens, the second follows.', 'If snow means skiing and it is snowing, we can conclude that we will go skiing.'],
  6: ['When two things are both true, either one is true on its own.', 'So if it is freezing and raining, we can safely say it is freezing.'],
  7: ['If something would cause a result, but that result did not happen, the original condition cannot be true.', 'An angle that is not ninety degrees cannot be a right angle.'],
  8: ['Think of this as linking two if-then statements.', 'If studying leads to passing, and passing leads to a good grade, studying leads to a good grade.'],
  9: ['There are two possibilities here. If one is ruled out, the other is left.', 'If the order was pizza or a burger, and it was not pizza, it must have been a burger.'],
  10: ['A fallacy is reasoning that looks convincing but does not actually prove the claim.', 'Getting a result does not always tell us its cause, and a proof cannot assume its own answer.'],
  11: ['To prove an if-then claim directly, start by assuming the if part and work toward the then part.', 'The claim only fails when the first part is true and the second part is false.'],
  12: ['These are three ways to show an if-then claim holds.', 'The result may always be true, the starting condition may be impossible, or we can build a direct chain of reasoning.'],
  13: ['We start with a number divisible by six, so it is six times some integer.', 'Since six contains a factor of three, that number must also be divisible by three.'],
  14: ['This is your space to try a proof or draw an example.', 'Start with what you know, then justify each step toward your conclusion.'],
  15: ['Try the questions before opening the answers.', 'Use simplification for an and statement, modus tollens when a result fails, and avoid circular reasoning.'],
  16: ['A good proof is a chain where every step has a reason.', 'Choose a method that fits the claim, and check that no step relies on a fallacy.'],
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
  if ((!catNarrationActive && !catJokesToggle.checked) || document.hidden || stage.classList.contains('is-flipping') || overview.classList.contains('open')) return false;
  const area = catViewport.getBoundingClientRect();
  const cat = catActor.getBoundingClientRect();
  if (catNarrationActive) {
    catBubble.style.maxWidth = `${Math.min(280, area.width - 20)}px`;
    const width = catBubble.offsetWidth;
    const height = catBubble.offsetHeight;
    const center = cat.left + cat.width / 2 - area.left;
    const x = Math.max(6, Math.min(center - width / 2, area.width - width - 6));
    const y = Math.max(5, Math.min(cat.top - area.top - height - 10, area.height - height - 5));
    catBubble.style.left = `${x}px`;
    catBubble.style.top = `${y}px`;
    catBubble.style.setProperty('--bubble-tail-x', `${Math.max(8, Math.min(center - x - 4, width - 18))}px`);
    catBubble.classList.remove('is-below');
    return true;
  }
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
  if (token !== catJokeToken || catNarrationActive || !catJokesToggle.checked) return;
  catBubbleText.textContent = line;
  catBubbleActive = true;
  clearBubbleTracking();
  const trackToken = ++catBubbleTrackToken;
  catBubbleFrame = requestAnimationFrame(() => trackCatBubble(trackToken));
  let remaining = Math.min(5000, 2600 + line.length * 38);
  while (remaining > 0 && token === catJokeToken && !catNarrationActive && catJokesToggle.checked) {
    await catPause(100);
    if (catBubbleVisible) remaining -= 100;
  }
  if (token !== catJokeToken) return;
  catBubbleActive = false;
  hideCatBubble();
}

async function runCatJokeSequence(lines) {
  if (catJokeInProgress || catNarrationActive || !catJokesToggle.checked) return;
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
  if (catNarrationActive || !catJokesToggle.checked || document.hidden || overview.classList.contains('open')) return;
  catJokeTimer = setTimeout(() => {
    if (catNarrationActive || !catJokesToggle.checked || document.hidden || overview.classList.contains('open')) return;
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
  while (token === catRouteToken && !document.hidden && !reducedMotion.matches) {
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
  if (!reducedMotion.matches && !document.hidden) runCatRoute(token);
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
  const box = slide.querySelector('.truth-box');
  const table = document.createElement('table');
  table.className = 'truth-walkthrough explain-extra';
  table.innerHTML = '<caption>→ means “if P, then Q”</caption><thead><tr><th>P</th><th>Q</th><th>P → Q</th></tr></thead><tbody><tr><td>True</td><td>True</td><td>True</td></tr><tr class="critical"><td>True</td><td>False</td><td>False</td></tr><tr><td>False</td><td>True</td><td>True</td></tr><tr><td>False</td><td>False</td><td>True</td></tr></tbody>';
  box.appendChild(table);
  table.scrollIntoView({ block: 'nearest' });
  for (const row of table.tBodies[0].rows) {
    if (token !== catNarrationToken) return;
    row.classList.add('is-revealed');
    if (!await waitForNarration(row.classList.contains('critical') ? 1100 : 650)) return;
  }
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
        focusTeaching([step], steps);
        clearVisualMarks();
        if (index) drawVisualMark('arrow', steps[index - 1], step);
        else drawVisualMark('underline', step);
        if (!await waitForNarration(650)) return;
      }
    }
  } else if (slideNumber === 15) {
    const cards = many('.challenge-list details');
    if (messageIndex === 1) {
      addExplanationExtra(one('.content'), 'symbol-key', '→  if…then   ·   ¬  means NOT');
      for (const card of cards) {
        if (token !== catNarrationToken) return;
        focusTeaching([card], cards);
        clearVisualMarks();
        drawVisualMark('underline', card.querySelector('summary'));
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
  hideCatBubble();
  catSpeechLock = false;
  setCatPose('sitting');
  updateExplainButton();
  const routeToken = ++catRouteToken;
  if (!reducedMotion.matches && !document.hidden) runCatRoute(routeToken);
  scheduleCatJoke();
}

async function typeNarrationLine(line, token) {
  catBubbleText.textContent = '';
  catBubble.classList.remove('is-line-complete');
  for (const character of line) {
    if (token !== catNarrationToken) return;
    catBubbleText.textContent += character;
    if (!await waitForNarration(reducedMotion.matches ? 1 : NARRATION_TYPE_SPEED)) return;
  }
  catBubble.classList.add('is-line-complete');
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
  if (catNarrationActive || busy || document.hidden || overview.classList.contains('open')) return;
  clearVisualExplanation();
  const lines = catNarration[current + 1];
  if (!lines) return;
  const slide = current;
  const token = ++catNarrationToken;
  catNarrationActive = true;
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
  catBubble.classList.add('is-narrating');
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
    catBubbleText.textContent = '';
    catBubbleActive = true;
    clearBubbleTracking();
    const trackToken = ++catBubbleTrackToken;
    trackCatBubble(trackToken);
    await typeNarrationLine(line, token);
    if (token !== catNarrationToken || slide !== current) return;
    const isLast = index === lines.length - 1;
    const readingDelay = isLast ? Math.min(getReadingDelay(line), 6000) : getReadingDelay(line);
    const voicePause = catVoiceToggle.checked
      ? speakNarrationLine(line, token).then(() => token === catNarrationToken ? waitForNarration(NARRATION_VOICE_PAUSE) : false)
      : Promise.resolve();
    await Promise.all([waitForNarration(readingDelay), voicePause, runVisualSequence(slide + 1, index, token)]);
    if (token !== catNarrationToken || slide !== current) return;
    catBubbleActive = false;
    clearBubbleTracking();
    hideCatBubble();
    if (!await waitForNarration(NARRATION_FADE_DURATION)) return;
    clearVisualExplanation();
    if (!await waitForNarration(isLast ? NARRATION_FINAL_PAUSE : NARRATION_BETWEEN_MESSAGES)) return;
  }
  stopCatNarration(true);
}

function scheduleCatBlink() {
  setTimeout(() => {
    if (!reducedMotion.matches && !document.hidden) {
      catActor.classList.add('is-blinking');
      setTimeout(() => catActor.classList.remove('is-blinking'), 150);
    }
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
  }, duration);
  setTimeout(() => next.classList.remove('is-arriving'), reducedMotion.matches ? 1 : duration + 300);
  if (!reducedMotion.matches) setTimeout(() => next.classList.remove('is-settling'), duration + 280);
}

function openOverview() {
  stopCatNarration();
  cancelCatJokes();
  overview.classList.add('open');
  overview.setAttribute('aria-hidden', 'false');
  stage.inert = true;
  thumbs[current].focus();
}

function closeOverview() {
  overview.classList.remove('open');
  overview.setAttribute('aria-hidden', 'true');
  stage.inert = false;
  document.getElementById('overviewButton').focus();
  scheduleCatJoke();
}

prevButton.addEventListener('click', () => goTo(current - 1));
nextButton.addEventListener('click', () => goTo(current + 1));
explainButton.addEventListener('click', () => catNarrationActive ? stopCatNarration() : startCatNarration());
catJokesToggle.addEventListener('change', () => {
  catJokesState.textContent = catJokesToggle.checked ? 'On' : 'Off';
  if (catJokesToggle.checked) scheduleCatJoke();
  else if (!catNarrationActive) cancelCatJokes();
});
catVoiceToggle.addEventListener('change', () => {
  catVoiceState.textContent = catVoiceToggle.checked ? 'On' : 'Off';
  if (!catVoiceToggle.checked) {
    narrationSpeechFinish?.();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
});
if (!('speechSynthesis' in window)) {
  catVoiceToggle.disabled = true;
  catVoiceToggle.closest('label').title = 'Voice is unavailable in this browser';
}
document.getElementById('overviewButton').addEventListener('click', openOverview);
document.getElementById('closeOverview').addEventListener('click', closeOverview);
document.getElementById('fullscreenButton').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
});

document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target.closest('input,select,textarea,[contenteditable]')) return;
  if (overview.classList.contains('open')) {
    if (event.key === 'Escape') closeOverview();
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
});

stage.addEventListener('touchstart', event => { swipeStart = event.touches[0].clientX; }, { passive: true });
stage.addEventListener('touchend', event => {
  if (swipeStart === null || event.target.closest('button,summary,canvas')) return;
  const delta = event.changedTouches[0].clientX - swipeStart;
  if (Math.abs(delta) > 55) goTo(current + (delta < 0 ? 1 : -1));
  swipeStart = null;
}, { passive: true });

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
teamCarousel.addEventListener('touchstart', event => { teamSwipeX = event.touches[0].clientX; }, { passive: true });
teamCarousel.addEventListener('touchend', event => {
  event.stopPropagation();
  if (teamSwipeX === null) return;
  const delta = event.changedTouches[0].clientX - teamSwipeX;
  if (Math.abs(delta) > 40) {
    selectTeam(selectedTeam + (delta < 0 ? 1 : -1));
    suppressTeamClickUntil = performance.now() + 350;
  }
  teamSwipeX = null;
}, { passive: true });
teamCarousel.addEventListener('touchcancel', () => { teamSwipeX = null; }, { passive: true });
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
document.querySelectorAll('[data-truth]').forEach(button => {
  button.addEventListener('click', () => {
    const key = button.dataset.truth;
    truth[key] = !truth[key];
    button.setAttribute('aria-pressed', String(truth[key]));
    button.textContent = `${key}: ${truth[key] ? 'True' : 'False'}`;
    const valid = !truth.p || truth.q;
    truthResult.textContent = `Implication: ${valid ? 'True' : 'False'}`;
    truthResult.classList.toggle('false', !valid);
  });
});

document.querySelectorAll('.proof-step').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.proof-step').forEach(step => {
      step.classList.remove('selected');
      step.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('selected');
    button.setAttribute('aria-pressed', 'true');
    document.getElementById('stepExplanation').textContent = button.dataset.explain;
    const workedSlide = button.closest('.worked');
    workedSlide.classList.toggle('is-proved', button === workedSlide.querySelector('.proof-step:last-child'));
    if (!reducedMotion.matches) {
      workedSlide.querySelector('.proof-pen').animate([
        { transform: 'rotate(-12deg) translate(0, 0)' },
        { transform: 'rotate(-16deg) translate(-1.2cqw, -.5cqw)', offset: .55 },
        { transform: 'rotate(-12deg) translate(0, 0)' }
      ], { duration: 560, easing: 'ease-in-out' });
    }
  });
});

const doodle = document.getElementById('doodle');
const ink = doodle.getContext('2d');
let drawing = false;
function sizeDoodle() {
  const rect = doodle.getBoundingClientRect();
  const ratio = devicePixelRatio || 1;
  doodle.width = Math.round(rect.width * ratio);
  doodle.height = Math.round(rect.height * ratio);
  ink.setTransform(ratio, 0, 0, ratio, 0, 0);
  ink.lineWidth = 2.5;
  ink.lineCap = 'round';
  ink.lineJoin = 'round';
  ink.strokeStyle = '#1b2630';
}
function point(event) {
  const rect = doodle.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}
doodle.addEventListener('pointerdown', event => {
  drawing = true;
  doodle.setPointerCapture(event.pointerId);
  const { x, y } = point(event);
  ink.beginPath();
  ink.moveTo(x, y);
  ink.lineTo(x + .01, y + .01);
  ink.stroke();
});
doodle.addEventListener('pointermove', event => {
  if (!drawing) return;
  const { x, y } = point(event);
  ink.lineTo(x, y);
  ink.stroke();
});
doodle.addEventListener('pointerup', () => { drawing = false; });
doodle.addEventListener('pointercancel', () => { drawing = false; });
document.getElementById('clearDoodle').addEventListener('click', () => ink.clearRect(0, 0, doodle.width, doodle.height));
addEventListener('resize', sizeDoodle);
addEventListener('resize', updateTeamStack);
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
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopCatNarration();
    cancelCatJokes();
    catRouteToken++;
    catActor.style.transition = 'none';
    setCatPose('sitting');
  } else {
    startCat();
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
