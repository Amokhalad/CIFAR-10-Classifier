const NUM_TEST_IMAGES = 10000;
const BATCH_SIZE = 100;
const CACHE_SIZE_LIMIT = 500;

let cache = new Map();
let currentIndex = 0;

// Load initial batch of static data
fetch("static_data.json")
	.then((response) => response.json())
	.then((data) => {
		data.forEach((item) => cache.set(item.index, item));
		displayImage(currentIndex); // Initial load
		document.getElementById("previous").addEventListener("click", showPreviousImage);
		document.getElementById("next").addEventListener("click", showNextImage);
		document.getElementById("random").addEventListener("click", showRandomImage);
		preloadImages(currentIndex, BATCH_SIZE); // Preload the initial batch of images
	})
	.catch((error) => console.error("Error loading static data:", error));

async function displayImage(index) {
	if (cache.has(index)) {
		const data = cache.get(index);
		const imageElement = document.getElementById("image");
		const titleElement = document.getElementById("image-title");
		const predictionElement = document.getElementById("prediction");
		const labelElement = document.getElementById("label");
		const imageCard = document.querySelector(".image-card");

		// Clear the previous prediction and reset classes
		predictionElement.innerHTML = "";
		predictionElement.className = "card-text";
		imageCard.className = "card image-card shadow";

		// Show loader for prediction
		const loader = document.createElement("div");
		loader.className = "spinner-border text-primary"; // Bootstrap spinner class
		loader.setAttribute("role", "status");
		predictionElement.appendChild(loader);

		imageElement.src = data.image_path;
		titleElement.textContent = `Image #${index + 1}`;
		labelElement.textContent = data.label;

		setTimeout(() => {
			predictionElement.textContent = data.prediction;
			const isIncorrect = data.prediction !== data.label;
			updatePredictionElement(predictionElement, imageCard, isIncorrect);
		}, Math.floor(Math.random() * (1000 - 500)) + 500);

		currentIndex = index;
	} else {
		fetchImageData(index); // Fetch data if not in cache
	}
}

function fetchImageData(index) {
	fetch("static_data.json")
		.then((response) => response.json())
		.then((data) => {
			const item = data.find((item) => item.index === index);
			if (item) {
				cache.set(index, item);
				manageCacheSize();
				displayImage(index);
			}
		})
		.catch((error) => {
			console.error("Error fetching image data:", error);
			alert("Failed to load image. Please try again.");
		});
}

function manageCacheSize() {
	if (cache.size > CACHE_SIZE_LIMIT) {
		const keys = Array.from(cache.keys());
		for (let i = 0; i < BATCH_SIZE; i++) {
			cache.delete(keys[i]);
		}
	}
}

const showPreviousImage = () => {
	currentIndex = Math.max(0, currentIndex - 1);
	displayImage(currentIndex);
	preloadImages(currentIndex, BATCH_SIZE);
};

const showNextImage = () => {
	currentIndex = Math.min(currentIndex + 1, NUM_TEST_IMAGES - 1);
	displayImage(currentIndex);
	preloadImages(currentIndex, BATCH_SIZE);
};

const showRandomImage = () => {
	currentIndex = Math.floor(Math.random() * NUM_TEST_IMAGES);
	displayImage(currentIndex);
	preloadImages(currentIndex, BATCH_SIZE);
};

const preloadImages = (startIdx, count) => {
	for (let i = startIdx; i < Math.min(startIdx + count, NUM_TEST_IMAGES); i++) {
		if (!cache.has(i)) {
			fetchImageData(i);
		}
	}
};

function updatePredictionElement(predictionElement, imageCard, isIncorrect) {
	predictionElement.classList.toggle("incorrect", isIncorrect);
	predictionElement.classList.toggle("incorrect-border", isIncorrect);
	imageCard.classList.toggle("incorrect-border", isIncorrect);

	predictionElement.classList.toggle("correct", !isIncorrect);
	predictionElement.classList.toggle("correct-border", !isIncorrect);
	imageCard.classList.toggle("correct-border", !isIncorrect);
}
