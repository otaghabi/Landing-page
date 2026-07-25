/*
|--------------------------------------------------------------------------
| تنظیمات GitHub
|--------------------------------------------------------------------------
| این سه مقدار را با اطلاعات مخزن خودت جایگزین کن.
*/
const githubUsername = "otaghabi";
const repositoryName = "Landing-page";
const imagesFolder = "images/slider";

/*
|--------------------------------------------------------------------------
| تنظیمات اسلایدشو
|--------------------------------------------------------------------------
| 6000 یعنی هر اسلاید 6 ثانیه نمایش داده شود.
*/
const autoplayDelay = 6000;
const maximumVisibleThumbnails = 7;

const slider = document.getElementById("slider");
const slidesContainer = document.getElementById("slides");
const thumbnailTrack = document.getElementById("thumbnailTrack");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const pauseButton = document.getElementById("pauseButton");
const pauseIcon = document.getElementById("pauseIcon");
const fullscreenButton = document.getElementById("fullscreenButton");
const slideCounter = document.getElementById("slideCounter");
const captionTitle = document.getElementById("captionTitle");
const captionDescription = document.getElementById("captionDescription");
const fileType = document.getElementById("fileType");
const fileName = document.getElementById("fileName");
const progressFill = document.getElementById("progressFill");
const ambientLayer = document.getElementById("ambientLayer");
const contentCard = document.getElementById("contentCard");

let slideItems = [];
let slideElements = [];
let thumbnailElements = [];
let currentSlide = 0;
let isPaused = false;
let progressAnimationId = null;
let progressStartedAt = null;
let remainingTime = autoplayDelay;
let touchStartX = 0;
let touchStartY = 0;

function isImageFile(name) {
    return /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(name);
}

function getExtension(name) {
    const parts = name.split(".");
    return parts.length > 1 ? parts.pop().toUpperCase() : "IMAGE";
}

function formatNumber(value) {
    return String(value).padStart(2, "0");
}

function createTitleFromFilename(name) {
    return name
        .replace(/\.[^.]+$/, "")
        .replace(/^\d+[-_\s]*/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim() || "تصویر بدون عنوان";
}

function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function showMessage(message, withLoader = false) {
    slidesContainer.innerHTML = `
        <div class="slider-message">
            <div>
                ${withLoader ? '<div class="loader"></div>' : ""}
                <p>${escapeHtml(message)}</p>
            </div>
        </div>
    `;

    previousButton.classList.add("is-hidden");
    nextButton.classList.add("is-hidden");
    thumbnailTrack.classList.add("is-hidden");
    pauseButton.classList.add("is-hidden");
    slideCounter.textContent = "00 / 00";
    progressFill.style.width = "0%";
}

function createSlide(item, index) {
    const article = document.createElement("article");
    article.className = "slide";
    article.setAttribute("aria-hidden", index === 0 ? "false" : "true");

    const image = document.createElement("img");
    image.src = item.url;
    image.alt = item.title;
    image.loading = index === 0 ? "eager" : "lazy";
    image.decoding = "async";

    article.appendChild(image);
    return article;
}

function createThumbnail(item, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "thumbnail";
    button.setAttribute("aria-label", `نمایش ${item.title}`);

    const image = document.createElement("img");
    image.src = item.url;
    image.alt = "";
    image.loading = "lazy";

    button.appendChild(image);

    button.addEventListener("click", () => {
        goToSlide(index, true);
    });

    return button;
}

function updateContent() {
    const item = slideItems[currentSlide];
    if (!item) return;

    contentCard.classList.add("is-changing");

    window.setTimeout(() => {
        captionTitle.textContent = item.title;
        captionDescription.textContent =
            `این تصویر به‌صورت خودکار از پوشه «${imagesFolder}» در مخزن GitHub بارگذاری شده است.`;
        fileType.textContent = item.extension;
        fileName.textContent = item.name;
        slideCounter.textContent =
            `${formatNumber(currentSlide + 1)} / ${formatNumber(slideItems.length)}`;
        ambientLayer.style.backgroundImage = `url("${item.url}")`;

        contentCard.classList.remove("is-changing");
        contentCard.style.animation = "none";
        void contentCard.offsetWidth;
        contentCard.style.animation = "";
    }, 180);
}

function updateActiveStates() {
    slideElements.forEach((slide, index) => {
        const active = index === currentSlide;
        slide.classList.toggle("active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
    });

    thumbnailElements.forEach((thumb, index) => {
        thumb.classList.toggle("active", index === currentSlide);
        thumb.setAttribute("aria-current", index === currentSlide ? "true" : "false");
    });

    centerActiveThumbnail();
}

function centerActiveThumbnail() {
    if (!thumbnailElements.length) return;

    const activeThumbnail = thumbnailElements[currentSlide];
    activeThumbnail.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
    });
}

function stopProgress() {
    if (progressAnimationId !== null) {
        cancelAnimationFrame(progressAnimationId);
        progressAnimationId = null;
    }
}

function startProgress(duration = autoplayDelay) {
    stopProgress();

    if (slideItems.length <= 1 || isPaused) {
        return;
    }

    remainingTime = duration;
    progressStartedAt = null;

    const animate = (timestamp) => {
        if (progressStartedAt === null) {
            progressStartedAt = timestamp;
        }

        const elapsed = timestamp - progressStartedAt;
        const progress = Math.min(elapsed / duration, 1);

        progressFill.style.width = `${progress * 100}%`;

        if (progress >= 1) {
            nextSlide();
            return;
        }

        progressAnimationId = requestAnimationFrame(animate);
    };

    progressAnimationId = requestAnimationFrame(animate);
}

function resetProgress() {
    progressFill.style.width = "0%";
    startProgress(autoplayDelay);
}

function goToSlide(index, userInitiated = false) {
    if (!slideItems.length) return;

    currentSlide = (index + slideItems.length) % slideItems.length;
    updateActiveStates();
    updateContent();

    if (userInitiated && isPaused) {
        progressFill.style.width = "0%";
        return;
    }

    resetProgress();
}

function nextSlide() {
    goToSlide(currentSlide + 1);
}

function previousSlide() {
    goToSlide(currentSlide - 1);
}

function togglePause() {
    isPaused = !isPaused;

    if (isPaused) {
        stopProgress();
        pauseIcon.textContent = "▶";
        pauseButton.setAttribute("aria-label", "ادامه اسلایدشو");
        pauseButton.title = "ادامه اسلایدشو";
    } else {
        pauseIcon.textContent = "Ⅱ";
        pauseButton.setAttribute("aria-label", "توقف اسلایدشو");
        pauseButton.title = "توقف اسلایدشو";
        startProgress(autoplayDelay);
    }
}

async function toggleFullscreen() {
    try {
        if (!document.fullscreenElement) {
            await slider.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    } catch (error) {
        console.error("Fullscreen error:", error);
    }
}

function buildSlider(items) {
    slideItems = items;
    slidesContainer.innerHTML = "";
    thumbnailTrack.innerHTML = "";

    items.forEach((item, index) => {
        slidesContainer.appendChild(createSlide(item, index));
        thumbnailTrack.appendChild(createThumbnail(item, index));
    });

    slideElements = Array.from(slidesContainer.querySelectorAll(".slide"));
    thumbnailElements = Array.from(thumbnailTrack.querySelectorAll(".thumbnail"));

    previousButton.classList.toggle("is-hidden", items.length <= 1);
    nextButton.classList.toggle("is-hidden", items.length <= 1);
    thumbnailTrack.classList.toggle("is-hidden", items.length <= 1);
    pauseButton.classList.toggle("is-hidden", items.length <= 1);

    if (items.length > maximumVisibleThumbnails) {
        thumbnailTrack.style.justifyContent = "flex-start";
        thumbnailTrack.style.overflowX = "auto";
        thumbnailTrack.style.scrollbarWidth = "none";
    }

    goToSlide(0);
}

async function loadImagesFromGitHub() {
    if (githubUsername === "USERNAME" || repositoryName === "REPOSITORY") {
        showMessage(
            "ابتدا نام کاربری GitHub و نام مخزن را در فایل script.js وارد کنید."
        );
        return;
    }

    showMessage("در حال دریافت تصاویر از GitHub...", true);

    const encodedPath = imagesFolder
        .split("/")
        .map(encodeURIComponent)
        .join("/");

    const apiUrl =
        `https://api.github.com/repos/` +
        `${encodeURIComponent(githubUsername)}/` +
        `${encodeURIComponent(repositoryName)}/contents/` +
        `${encodedPath}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                Accept: "application/vnd.github+json"
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(
                    "مخزن یا پوشه تصاویر پیدا نشد. نام‌ها، مسیر پوشه و Public بودن مخزن را بررسی کنید."
                );
            }

            if (response.status === 403) {
                throw new Error(
                    "محدودیت موقت GitHub API فعال شده است. چند دقیقه بعد دوباره تلاش کنید."
                );
            }

            throw new Error(`خطای GitHub API با کد ${response.status}`);
        }

        const files = await response.json();

        if (!Array.isArray(files)) {
            throw new Error("آدرس مشخص‌شده مربوط به یک پوشه معتبر نیست.");
        }

        const items = files
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
            )
            .map((file) => ({
                name: file.name,
                title: createTitleFromFilename(file.name),
                extension: getExtension(file.name),
                url: file.download_url
            }));

        if (!items.length) {
            throw new Error("هیچ فایل تصویری معتبری در پوشه پیدا نشد.");
        }

        buildSlider(items);
    } catch (error) {
        console.error(error);
        showMessage(error.message || "بارگذاری تصاویر با خطا مواجه شد.");
    }
}

previousButton.addEventListener("click", () => {
    previousSlide();
});

nextButton.addEventListener("click", () => {
    nextSlide();
});

pauseButton.addEventListener("click", togglePause);
fullscreenButton.addEventListener("click", toggleFullscreen);

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

slider.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches[0];
    touchStartX = touch.screenX;
    touchStartY = touch.screenY;
}, { passive: true });

slider.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.screenX - touchStartX;
    const deltaY = touch.screenY - touchStartY;

    if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
            previousSlide();
        } else {
            nextSlide();
        }
    }
}, { passive: true });

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        stopProgress();
    } else if (!isPaused) {
        startProgress(autoplayDelay);
    }
});

loadImagesFromGitHub();
