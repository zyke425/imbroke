const slides = Array.from(document.querySelectorAll(".slide"));
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const dotNav = document.getElementById("dotNav");
const slideIndicator = document.getElementById("slideIndicator");
const slideTitle = document.getElementById("slideTitle");
const progressBar = document.getElementById("progressBar");
const particleLayer = document.getElementById("particleLayer");

let currentSlide = getStartingSlide();
let isChangingSlide = false;
const transitionDelay = 850;

function getStartingSlide() {
  const match = window.location.hash.match(/^#slide-(\d+)$/);

  if (!match) {
    return 0;
  }

  const requestedSlide = Number(match[1]) - 1;

  if (requestedSlide < 0 || requestedSlide >= slides.length) {
    return 0;
  }

  return requestedSlide;
}

function createDots() {
  slides.forEach((slide, index) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to slide ${index + 1}: ${slide.dataset.title}`);

    dot.addEventListener("click", () => {
      goToSlide(index);
    });

    dotNav.appendChild(dot);
  });
}

function updateSlideClasses() {
  slides.forEach((slide, index) => {
    slide.classList.remove("is-active", "is-past", "is-future");

    if (index === currentSlide) {
      slide.classList.add("is-active");
    } else if (index < currentSlide) {
      slide.classList.add("is-past");
    } else {
      slide.classList.add("is-future");
    }
  });
}

function updateNavigation() {
  const dots = Array.from(dotNav.querySelectorAll(".dot"));
  const progress = ((currentSlide + 1) / slides.length) * 100;

  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === slides.length - 1;

  slideIndicator.textContent = `${currentSlide + 1} / ${slides.length}`;
  slideTitle.textContent = slides[currentSlide].dataset.title;
  progressBar.style.width = `${progress}%`;

  dots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === currentSlide);
    dot.setAttribute("aria-current", index === currentSlide ? "step" : "false");
  });
}

function goToSlide(nextIndex) {
  if (isChangingSlide || nextIndex === currentSlide) {
    return;
  }

  if (nextIndex < 0 || nextIndex >= slides.length) {
    return;
  }

  isChangingSlide = true;
  currentSlide = nextIndex;
  updateSlideClasses();
  updateNavigation();
  runSlideEffects();

  window.setTimeout(() => {
    isChangingSlide = false;
  }, transitionDelay);
}

function nextSlide() {
  goToSlide(currentSlide + 1);
}

function previousSlide() {
  goToSlide(currentSlide - 1);
}

function formatNumber(value) {
  return Math.round(value).toLocaleString("en-PH");
}

function animateCounters() {
  const counters = slides[currentSlide].querySelectorAll("[data-counter]");

  counters.forEach((counter) => {
    const target = Number(counter.dataset.target);
    const prefix = counter.dataset.prefix || "";
    const duration = 950;
    const startTime = performance.now();

    function updateCounter(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = target * easedProgress;

      counter.textContent = `${prefix}${formatNumber(currentValue)}`;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = `${prefix}${formatNumber(target)}`;
      }
    }

    counter.textContent = `${prefix}0`;
    requestAnimationFrame(updateCounter);
  });
}

function runSlideEffects() {
  if (slides[currentSlide].dataset.title === "Financial Plan") {
    animateCounters();
  }
}

function createBackgroundMotion() {
  const queueLabels = ["Q-014", "Q-027", "Q-038", "Q-052", "Q-061", "Q-084"];

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.setProperty("--left", `${Math.random() * 100}%`);
    particle.style.setProperty("--top", `${Math.random() * 100}%`);
    particle.style.setProperty("--size", `${3 + Math.random() * 5}px`);
    particle.style.setProperty("--duration", `${6 + Math.random() * 8}s`);
    particle.style.setProperty("--delay", `${Math.random() * -8}s`);
    particleLayer.appendChild(particle);
  }

  queueLabels.forEach((label) => {
    const bubble = document.createElement("span");
    bubble.className = "queue-bubble";
    bubble.textContent = label;
    bubble.style.setProperty("--left", `${8 + Math.random() * 84}%`);
    bubble.style.setProperty("--top", `${10 + Math.random() * 78}%`);
    bubble.style.setProperty("--duration", `${8 + Math.random() * 7}s`);
    bubble.style.setProperty("--delay", `${Math.random() * -8}s`);
    particleLayer.appendChild(bubble);
  });
}

prevBtn.addEventListener("click", previousSlide);
nextBtn.addEventListener("click", nextSlide);

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    nextSlide();
  }

  if (event.key === "ArrowLeft") {
    previousSlide();
  }
});

createDots();
createBackgroundMotion();
updateSlideClasses();
updateNavigation();
runSlideEffects();
