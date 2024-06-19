const NUM_TEST_IMAGES = 10000; // Adjust as needed
const BATCH_SIZE = 100;
const CACHE_SIZE_LIMIT = 500; // Adjust based on memory constraints

let currentIndex = 0;
let cache = new Map();
let incorrectImages = JSON.parse(localStorage.getItem("incorrectImages")) || [];

// Load initial batch of static data
fetch("../data/static_data.json")
	.then((response) => response.json())
	.then((data) => {
		data.forEach((item) => cache.set(item.index, item));
		renderIncorrectImages(); // Render the persisted incorrect images
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

		imageElement.src = "../data/" + data.image_path;
		titleElement.textContent = `Image #${index + 1}`;
		predictionElement.textContent = data.prediction;
		labelElement.textContent = data.label;

		const isIncorrect = data.prediction !== data.label;
		predictionElement.classList.toggle("incorrect", isIncorrect);
		predictionElement.classList.toggle("incorrect-border", isIncorrect);
		imageCard.classList.toggle("incorrect-border", isIncorrect);

		predictionElement.classList.toggle("correct", !isIncorrect);
		predictionElement.classList.toggle("correct-border", !isIncorrect);
		imageCard.classList.toggle("correct-border", !isIncorrect);

		if (isIncorrect && !incorrectImages.some((img) => img.index === index)) {
			addIncorrectImage(data, index);
		}

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
		.catch((error) => console.error("Error fetching image data:", error));
}

function manageCacheSize() {
	if (cache.size > CACHE_SIZE_LIMIT) {
		const keys = Array.from(cache.keys());
		for (let i = 0; i < BATCH_SIZE; i++) {
			cache.delete(keys[i]);
		}
	}
}

function addIncorrectImage(data, index) {
	const incorrectList = document.getElementById("incorrect-list");
	const listItem = document.createElement("li");
	listItem.textContent = `Image #${index + 1}: Predicted ${data.prediction}, Actual ${data.label}`;
	listItem.classList.add("list-group-item", "list-group-item-action");
	listItem.addEventListener("click", () => {
		displayImage(index);
	});
	incorrectList.appendChild(listItem);
	incorrectImages.push({ index, prediction: data.prediction, label: data.label });
	localStorage.setItem("incorrectImages", JSON.stringify(incorrectImages)); // Save to localStorage
}

function renderIncorrectImages() {
	const incorrectList = document.getElementById("incorrect-list");
	incorrectList.innerHTML = ""; // Clear any existing list items
	incorrectImages.forEach((img) => {
		const listItem = document.createElement("li");
		listItem.textContent = `Image #${img.index + 1}: Predicted ${img.prediction}, Actual ${img.label}`;
		listItem.classList.add("list-group-item", "list-group-item-action");
		listItem.addEventListener("click", () => {
			displayImage(img.index);
		});
		incorrectList.appendChild(listItem);
	});
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
