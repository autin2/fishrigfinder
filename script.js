const waterType = document.getElementById('waterType');
const poleType = document.getElementById('poleType');
const fishType = document.getElementById('fishType');
const submitBtn = document.getElementById('submitBtn');
const resultsDiv = document.getElementById('results');
const loadingOverlay = document.getElementById('loading-overlay');
const dotsSpan = document.getElementById('dots');

const poleOptions = {
  "Fresh water": [
    "Spinning Rod",
    "Baitcasting Rod",
    "Fly Rod",
    "Telescopic Rod",
  ],
  "Salt water": [
    "Surf Rod",
    "Boat Rod",
    "Heavy Casting Rod",
    "Spin Casting Rod",
  ],
};

const UNSPLASH_ACCESS_KEY = 'RRF7zYa2wb9kNsUiuy-SPeDSMVkGI2aQ7AwaxW0jBjo';
const AMAZON_AFFILIATE_TAG = 'clamtour-20';

let dotsCount = 0;
let dotsInterval;

function startLoadingDots() {
  dotsCount = 0;
  dotsSpan.textContent = '';
  dotsInterval = setInterval(() => {
    dotsCount = (dotsCount + 1) % 4; // cycles 0,1,2,3
    dotsSpan.textContent = '.'.repeat(dotsCount);
  }, 500);
}

function stopLoadingDots() {
  clearInterval(dotsInterval);
  dotsSpan.textContent = '';
}

function showLoading() {
  loadingOverlay.classList.add('active');
  startLoadingDots();
}

function hideLoading() {
  loadingOverlay.classList.remove('active'); //wdawd
  stopLoadingDots();
}

function setDisabledState(elem, disabled) {
  elem.disabled = disabled;
  const label = document.querySelector(`label[for="${elem.id}"]`);
  if (disabled) label.classList.add('disabled-label');
  else label.classList.remove('disabled-label');
}

function populatePoleOptions(type) {
  poleType.innerHTML = '<option value="" disabled selected>Select pole type</option>';
  if (!poleOptions[type]) return;
  poleOptions[type].forEach(pole => {
    const option = document.createElement('option');
    option.value = pole;
    option.textContent = pole;
    poleType.appendChild(option);
  });
}

waterType.addEventListener('change', () => {
  if (waterType.value) {
    populatePoleOptions(waterType.value);
    setDisabledState(poleType, false);
    setDisabledState(fishType, true);
    fishType.value = '';
    submitBtn.disabled = true;
  } else {
    setDisabledState(poleType, true);
    poleType.innerHTML = '<option value="" disabled selected>Select pole type</option>';
    setDisabledState(fishType, true);
    fishType.value = '';
    submitBtn.disabled = true;
  }
});

poleType.addEventListener('change', () => {
  if (poleType.value) {
    setDisabledState(fishType, false);
    submitBtn.disabled = true;
  } else {
    setDisabledState(fishType, true);
    fishType.value = '';
    submitBtn.disabled = true;
  }
});

fishType.addEventListener('input', () => {
  submitBtn.disabled = fishType.value.trim().length === 0;
});

async function fetchUnsplashImage(query) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('Unsplash API error status:', response.status);
      return 'https://via.placeholder.com/250x150?text=No+Image';
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.small;
    } else {
      return 'https://via.placeholder.com/250x150?text=No+Image';
    }
  } catch (e) {
    console.error('Unsplash fetch error:', e);
    return 'https://via.placeholder.com/250x150?text=No+Image';
  }
}

function amazonSearchLink(query) {
  const base = 'https://www.amazon.com/s';
  const params = new URLSearchParams({
    k: query,
    tag: AMAZON_AFFILIATE_TAG,
  });
  return `${base}?${params.toString()}`;
}

document.getElementById('fishForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  showLoading();
  resultsDiv.textContent = '';

  try {
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        waterType: waterType.value,
        poleType: poleType.value,
        fishType: fishType.value.trim(),
      }),
    });

    const data = await response.json();

    // Remove original container
    const oldContainer = document.querySelector('.container');
    if (oldContainer) oldContainer.remove();

    // Parse recommendations from API response message text
   const items = data.recommendations
  .filter(line => !line.toLowerCase().startsWith('recommendations:') && !line.toLowerCase().startsWith('tip:'))
  .map(line => line.trim())
  .filter(line => line !== '');


    // Create a parent container for horizontal layout
    const parentContainer = document.createElement('div');
    parentContainer.style.display = 'flex';
    parentContainer.style.gap = '20px';
    parentContainer.style.flexWrap = 'wrap';
    parentContainer.style.justifyContent = 'center';
    parentContainer.style.padding = '20px';

    for (const item of items) {
      const trimmedItem = item.trim();

      // Create individual container
      const itemContainer = document.createElement('div');
      itemContainer.className = 'container recommendation-item';
      itemContainer.style.width = '250px';
      itemContainer.style.display = 'flex';
      itemContainer.style.flexDirection = 'column';
      itemContainer.style.justifyContent = 'space-between';
      itemContainer.style.backgroundColor = '#e0f2f1';
      itemContainer.style.border = '1px solid #004d40';
      itemContainer.style.borderRadius = '8px';
      itemContainer.style.padding = '15px';
      itemContainer.style.boxSizing = 'border-box';

      // Image from Unsplash API
     

      // Amazon button
      const button = document.createElement('button');
      button.textContent = 'View on Amazon';
      button.style.marginTop = '15px';
      button.style.padding = '10px';
      button.style.backgroundColor = '#00796b';
      button.style.color = 'white';
      button.style.border = 'none';
      button.style.borderRadius = '4px';
      button.style.cursor = 'pointer';
      button.style.fontWeight = 'bold';
      button.addEventListener('click', () => {
        const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(trimmedItem)}&tag=clamtour-20`;
        window.open(amazonUrl, '_blank');
      });

      itemContainer.appendChild(itemText);
      itemContainer.appendChild(button);

      parentContainer.appendChild(itemContainer);
    }

    // Add Back button
    const backBtn = document.createElement('button');
    backBtn.textContent = 'Back';
    backBtn.style.margin = '20px auto 0';
    backBtn.style.display = 'block';
    backBtn.style.padding = '10px 20px';
    backBtn.style.backgroundColor = '#00796b';
    backBtn.style.color = 'white';
    backBtn.style.border = 'none';
    backBtn.style.borderRadius = '4px';
    backBtn.style.cursor = 'pointer';
    backBtn.style.fontWeight = 'bold';

    backBtn.addEventListener('click', () => {
      window.location.reload();
    });

    parentContainer.appendChild(backBtn);

    document.body.appendChild(parentContainer);

  } catch (error) {
    resultsDiv.textContent = 'Error fetching recommendations.';
    console.error(error);
  } finally {
    hideLoading();
  }
});
