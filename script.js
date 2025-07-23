const waterType = document.getElementById('waterType');
const rodType = document.getElementById('rodType');
const lineStrength = document.getElementById('lineStrength');
const stateInput = document.getElementById('state');
const submitBtn = document.getElementById('submitBtn');


const rodOptions = {
  fresh: ['Ultra Light Spinning Rod', 'Medium Action Rod', 'Telescopic Rod'],
  salt: ['Surf Rod', 'Inshore Rod', 'Boat Rod', 'Saltwater Spinning Rod']
};

function updateRods() {
  rodType.innerHTML = '<option value="" disabled selected>Select Rod</option>';
  const water = waterType.value;

  if (water && rodOptions[water]) {
    rodOptions[water].forEach(rod => {
      const option = document.createElement('option');
      option.value = rod;
      option.textContent = rod;
      rodType.appendChild(option);
    });
  }
}

// Unlock rodType when waterType is selected
waterType.addEventListener('change', () => {
  updateRods();
  rodType.disabled = !waterType.value;
  lineStrength.disabled = true;
  stateInput.disabled = true;
});

// Unlock lineStrength when rodType is selected
rodType.addEventListener('change', () => {
  lineStrength.disabled = !rodType.value;
  stateInput.disabled = true;
});

// Unlock state when lineStrength has value
lineStrength.addEventListener('input', () => {
  stateInput.disabled = !lineStrength.value.trim();
});


submitBtn.addEventListener('click', () => {
  // existing validation code...

  console.log('User selections before redirect:', {
    waterType: waterType.value,
    rodType: rodType.value,
    lineStrength: lineStrength.value.trim(),
    state: stateInput.value.trim()
  });

  // Save to localStorage and redirect
  localStorage.setItem('waterType', waterType.value);
  localStorage.setItem('rodType', rodType.value);
  localStorage.setItem('lineStrength', lineStrength.value.trim());
  localStorage.setItem('state', stateInput.value.trim());

  window.location.href = 'fish.html';
});
