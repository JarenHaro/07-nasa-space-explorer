// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.getElementById('GetImages');
const gallery = document.getElementById('gallery');
const imageModal = document.getElementById('imageModal');
const closeModalButton = document.getElementById('closeModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalDescription = document.getElementById('modalDescription');

// 2) Set up default dates and min/max allowed dates
setupDateInputs(startInput, endInput);

// 3) Run this function when the user clicks "Get Space Images"
getImagesButton.addEventListener('click', fetchSpaceImages);

// 4) Close the modal when the X button is clicked
closeModalButton.addEventListener('click', closeImageModal);

// 5) Close the modal when the dark overlay area is clicked
imageModal.addEventListener('click', (event) => {
  if (event.target === imageModal) {
    closeImageModal();
  }
});

// 6) Close the modal when the Escape key is pressed
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !imageModal.classList.contains('hidden')) {
    closeImageModal();
  }
});

async function fetchSpaceImages() {
  // Get the dates the user selected
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Build the NASA API URL using template literals
  const url = `https://api.nasa.gov/planetary/apod?api_key=${api_key}&start_date=${startDate}&end_date=${endDate}`;

  // Show a simple loading message while the request is happening
  gallery.innerHTML = '<p>Loading space images...</p>';

  try {
    // STEP A: fetch sends the request and waits for the response
    const response = await fetch(url);

    // STEP B: check if the response is successful (status 200-299)
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    // STEP C: convert the response body to JavaScript data (JSON)
    const data = await response.json();

    // NASA can return one object or an array. We always want an array.
    const images = Array.isArray(data) ? data : [data];

    // STEP D: format and display the data in the page
    renderImages(images);
  } catch (error) {
    // If anything goes wrong, show the error message
    gallery.innerHTML = `<p>Something went wrong: ${error.message}</p>`;
  }
}

function renderImages(images) {
  if (images.length === 0) {
    gallery.innerHTML = '<p>No results found for that date range.</p>';
    return;
  }

  // Build one HTML card per API item
  const cardsHtml = images
    .map((image) => {
      const safeTitle = escapeHtmlAttribute(image.title);
      const safeDate = escapeHtmlAttribute(image.date);
      const safeDescription = escapeHtmlAttribute(image.explanation);
      const largeImageUrl = image.hdurl || image.url;

      const mediaHtml =
        image.media_type === 'image'
          ? `<img src="${image.url}" alt="${safeTitle}" data-large-url="${largeImageUrl}" data-title="${safeTitle}" data-date="${safeDate}" data-description="${safeDescription}" />`
          : '<p>This item is a video, not an image.</p>';

      return `
        <article class="gallery-item">
          ${mediaHtml}
          <p><strong>${image.title}</strong> (${image.date})</p>
          <p>${image.explanation}</p>
        </article>
      `;
    })
    .join('');

  gallery.innerHTML = cardsHtml;

  // Add click behavior to every image after the cards are on the page
  const galleryImages = gallery.querySelectorAll('.gallery-item img');

  galleryImages.forEach((imageElement) => {
    imageElement.addEventListener('click', () => {
      openImageModal(
        imageElement.dataset.largeUrl,
        imageElement.dataset.title,
        imageElement.dataset.date,
        imageElement.dataset.description
      );
    });
  });
}

function openImageModal(imageUrl, title, date, description) {
  modalImage.src = imageUrl;
  modalImage.alt = `Larger view of ${title}`;
  modalTitle.textContent = title;
  modalDate.textContent = date;
  modalDescription.textContent = description;
  imageModal.classList.remove('hidden');
}

function closeImageModal() {
  imageModal.classList.add('hidden');
  modalImage.src = '';
}

function escapeHtmlAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}