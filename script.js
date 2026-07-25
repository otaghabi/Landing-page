/*
 * اطلاعات مخزن GitHub خودتان را وارد کنید.
 */
const githubUsername = "otaghabi";
const repositoryName = "Landing-page";
const imagesFolder = "images/slider";

/*
 * زمان نمایش هر عکس:
 * 5000 یعنی 5 ثانیه.
 */
const autoplayDelay = 5000;

const slider = document.getElementById("slider");
const slidesContainer = document.getElementById("slides");
const dotsContainer = document.getElementById("dots");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const pauseButton = document.getElementById("pauseButton");
const pauseIcon = document.getElementById("pauseIcon");
const progressBar = document.getElementById("progressBar");

let slides = [];
let dots = [];
let currentSlide = 0;
let isPaused = false;
let animationFrameId = null;
let progressStartTime = null;
let touchStartX = 0;
let touchStartY = 0;

function isImageFile(filename) {
    return /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(filename);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function showStatus(message) {
    stopAutoplay();

    slidesContainer.innerHTML = `
        <div class="status">
            <p>${escapeHtml(message)}</p>
        </div>
    `;

    previousButton.classList.add("hidden");
    nextButton.classList.add("hidden");
    pauseButton.classList.add("hidden");
    dotsContainer.classList.add("hidden");
    progressBar.style.width = "0%";
}

function createSlide(imageFile, index) {
    const slide = document.createElement("article");
    slide.className = "slide";
    slide.setAttribute("aria-hidden", index === 0 ? "false" : "true");

    const backgroundImage = document.createElement("img");
    backgroundImage.className = "slide__background";
    backgroundImage.src = imageFile.download_url;
    backgroundImage.alt = "";
    backgroundImage.setAttribute("aria-hidden", "true");

    const mainImage = document.createElement("img");
    mainImage.className = "slide__image";
    mainImage.src = imageFile.download_url;
    mainImage.alt = imageFile.name;
    mainImage.loading = index === 0 ? "eager" : "lazy";
    mainImage.decoding = "async";

    slide.append(backgroundImage, mainImage);
    return slide;
}

function createDot(index) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot";
    dot.setAttribute("aria-label", `نمایش تصویر ${index + 1}`);

    dot.addEventListener("click", () => {
        showSlide(index);
    });

    return dot;
}

function updateActiveState() {
    slides.forEach((slide, index) => {
        const active = index === currentSlide;
        slide.classList.toggle("active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
    });

    dots.forEach((dot, index) => {
        const active = index === currentSlide;
        dot.classList.toggle("active", active);
        dot.setAttribute("aria-current", active ? "true" : "false");
    });
}

function showSlide(index) {
    if (!slides.length) {
        return;
    }

    currentSlide = (index + slides.length) % slides.length;
    updateActiveState();
    startAutoplay();
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function previousSlide() {
    showSlide(currentSlide - 1);
}

function stopAutoplay() {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    progressStartTime = null;
}

function startAutoplay() {
    stopAutoplay();
    progressBar.style.width = "0%";

    if (slides.length <= 1 || isPaused) {
        return;
    }

    const animateProgress = (timestamp) => {
        if (progressStartTime === null) {
            progressStartTime = timestamp;
        }

        const elapsed = timestamp - progressStartTime;
        const percentage = Math.min((elapsed / autoplayDelay) * 100, 100);

        progressBar.style.width = `${percentage}%`;

        if (percentage >= 100) {
            progressStartTime = null;
            nextSlide();
            return;
        }

        animationFrameId = requestAnimationFrame(animateProgress);
    };

    animationFrameId = requestAnimationFrame(animateProgress);
}

function togglePause() {
    isPaused = !isPaused;

    if (isPaused) {
        stopAutoplay();
        pauseIcon.textContent = "▶";
        pauseButton.setAttribute("aria-label", "ادامه اسلایدشو");
    } else {
        pauseIcon.textContent = "Ⅱ";
        pauseButton.setAttribute("aria-label", "توقف اسلایدشو");
        startAutoplay();
    }
}

function buildSlider(imageFiles) {
    slidesContainer.innerHTML = "";
    dotsContainer.innerHTML = "";

    imageFiles.forEach((imageFile, index) => {
        slidesContainer.appendChild(createSlide(imageFile, index));
        dotsContainer.appendChild(createDot(index));
    });

    slides = Array.from(slidesContainer.querySelectorAll(".slide"));
    dots = Array.from(dotsContainer.querySelectorAll(".dot"));

    const hasMultipleSlides = slides.length > 1;

    previousButton.classList.toggle("hidden", !hasMultipleSlides);
    nextButton.classList.toggle("hidden", !hasMultipleSlides);
    pauseButton.classList.toggle("hidden", !hasMultipleSlides);
    dotsContainer.classList.toggle("hidden", !hasMultipleSlides);

    currentSlide = 0;
    updateActiveState();
    startAutoplay();
}

async function loadImagesFromGitHub() {
    if (githubUsername === "USERNAME" || repositoryName === "REPOSITORY") {
        showStatus(
            "نام کاربری GitHub و نام مخزن را در فایل script.js وارد کنید."
        );
        return;
    }

    const encodedFolderPath = imagesFolder
        .split("/")
        .map(encodeURIComponent)
        .join("/");

    const apiUrl =
        `https://api.github.com/repos/` +
        `${encodeURIComponent(githubUsername)}/` +
        `${encodeURIComponent(repositoryName)}/contents/` +
        `${encodedFolderPath}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                Accept: "application/vnd.github+json"
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(
                    "مخزن یا پوشه تصاویر پیدا نشد. مسیر images/slider را بررسی کنید."
                );
            }

            if (response.status === 403) {
                throw new Error(
                    "محدودیت موقت GitHub فعال شده است. چند دقیقه بعد دوباره امتحان کنید."
                );
            }

            throw new Error(`خطای GitHub با کد ${response.status}`);
        }

        const files = await response.json();

        if (!Array.isArray(files)) {
            throw new Error("مسیر تصاویر یک پوشه معتبر نیست.");
        }

        const imageFiles = files
            .filter((file) => (
                file.type === "file" &&
                file.download_url &&
                isImageFile(file.name)
            ))
            .sort((a, b) =>
                a.name.localeCompare(b.name, undefined, {
                    numeric: true,
                    sensitivity: "base"
                })
            );

        if (!imageFiles.length) {
            throw new Error("هیچ عکسی در پوشه images/slider پیدا نشد.");
        }

        buildSlider(imageFiles);
    } catch (error) {
        console.error(error);
        showStatus(error.message || "دریافت تصاویر انجام نشد.");
    }
}

previousButton.addEventListener("click", previousSlide);
nextButton.addEventListener("click", nextSlide);
pauseButton.addEventListener("click", togglePause);

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
        previousSlide();
    } else if (event.key === "ArrowLeft") {
        nextSlide();
    } else if (event.key === " ") {
        event.preventDefault();
        togglePause();
    }
});

slider.addEventListener(
    "touchstart",
    (event) => {
        const touch = event.changedTouches[0];
        touchStartX = touch.screenX;
        touchStartY = touch.screenY;
    },
    { passive: true }
);

slider.addEventListener(
    "touchend",
    (event) => {
        const touch = event.changedTouches[0];
        const deltaX = touch.screenX - touchStartX;
        const deltaY = touch.screenY - touchStartY;

        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                previousSlide();
            } else {
                nextSlide();
            }
        }
    },
    { passive: true }
);

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        stopAutoplay();
    } else if (!isPaused) {
        startAutoplay();
    }
});

loadImagesFromGitHub();
