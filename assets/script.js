const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
const carousel = document.querySelector("[data-carousel]");
const track = document.querySelector("[data-carousel-track]");
const slides = Array.from(track.children);
const prevButton = document.querySelector("[data-carousel-prev]");
const nextButton = document.querySelector("[data-carousel-next]");
const indicators = Array.from(
  document.querySelectorAll("[data-carousel-indicator]")
);
const animatedElements = document.querySelectorAll("[data-animate]");
const growthSection = document.querySelector(".indicadores");
const growthNumbers = document.querySelectorAll(".indicador-card__numero");
const form = document.querySelector(".contato__form");
const feedback = document.querySelector(".form-feedback");
const yearSpan = document.querySelector("#current-year");

let currentSlide = 0;
let autoplayInterval;
let startX = 0;
let isDragging = false;
let growthHasAnimated = false;

const updateNavState = () => {
  menuToggle?.setAttribute(
    "aria-expanded",
    nav?.classList.contains("is-open").toString()
  );
};

menuToggle?.addEventListener("click", () => {
  nav?.classList.toggle("is-open");
  updateNavState();
});

const setSlide = (index) => {
  currentSlide = (index + slides.length) % slides.length;
  const amountToMove = slides[currentSlide].offsetLeft;
  track.style.transform = `translateX(-${amountToMove}px)`;

  indicators.forEach((indicator) =>
    indicator.classList.remove("is-active")
  );
  indicators[currentSlide]?.classList.add("is-active");
};

const nextSlide = () => setSlide(currentSlide + 1);
const prevSlide = () => setSlide(currentSlide - 1);

nextButton?.addEventListener("click", () => {
  nextSlide();
  restartAutoplay();
});

prevButton?.addEventListener("click", () => {
  prevSlide();
  restartAutoplay();
});

indicators.forEach((indicator) => {
  indicator.addEventListener("click", () => {
    const index = Number(indicator.dataset.carouselIndicator);
    setSlide(index);
    restartAutoplay();
  });
});

const startAutoplay = () => {
  autoplayInterval = setInterval(nextSlide, 5000);
};

const stopAutoplay = () => clearInterval(autoplayInterval);

const restartAutoplay = () => {
  stopAutoplay();
  startAutoplay();
};

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  animatedElements.forEach((element) => revealObserver.observe(element));
} else {
  animatedElements.forEach((element) => element.classList.add("is-visible"));
}

carousel?.addEventListener("mouseover", stopAutoplay);
carousel?.addEventListener("mouseout", startAutoplay);

carousel?.addEventListener("touchstart", (event) => {
  stopAutoplay();
  startX = event.touches[0].clientX;
  isDragging = true;
});

carousel?.addEventListener("touchmove", (event) => {
  if (!isDragging) return;
  const currentX = event.touches[0].clientX;
  const diff = startX - currentX;
  if (diff > 50) {
    nextSlide();
    isDragging = false;
  } else if (diff < -50) {
    prevSlide();
    isDragging = false;
  }
});

carousel?.addEventListener("touchend", () => {
  isDragging = false;
  startAutoplay();
});

const validateForm = () => {
  if (!form) return false;
  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }
  return true;
};

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (validateForm()) {
    feedback.textContent = "Mensagem enviada com sucesso!";
    feedback.style.color = "var(--green)";
    form.reset();
  } else {
    feedback.textContent = "Por favor, preencha os campos corretamente.";
    feedback.style.color = "var(--blue)";
  }
});

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

setSlide(0);
startAutoplay();

const animateNumber = (element) => {
  const target = Number(element.dataset.target) || 0;
  const duration = 1500;
  const startTime = performance.now();
  const prefix = element.dataset.prefix ?? "";
  const suffix = element.dataset.suffix ?? "";

  const update = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(progress * target);
    element.textContent = `${prefix}${value}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };

  requestAnimationFrame(update);
};

if ("IntersectionObserver" in window && growthSection) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !growthHasAnimated) {
          growthNumbers.forEach((number) => animateNumber(number));
          growthHasAnimated = true;
          observer.disconnect();
        }
      });
    },
    {
      threshold: 0.4,
    }
  );
  observer.observe(growthSection);
} else {
  growthNumbers.forEach((number) => animateNumber(number));
}

