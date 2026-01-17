const CLOUD_NAME = 'dgder16kq';
const UPLOAD_PRESET = 'javier-rojo';

const form = document.getElementById('form');
const submitMessage = document.getElementById('submit-message');

let hoverColors = {};

function initPage() {
    setHoverColors();
    addListeners();
}

initPage();

function setHoverColors() {
    hoverColors.add = getComputedStyle(document.documentElement).getPropertyValue('--blue-flashy');
    hoverColors.delete = getComputedStyle(document.documentElement).getPropertyValue('--red');
}

function addListeners() {
    form.addEventListener('submit', async (event) => handleFormSubmit(event));
}

function resetForm(form) {
    form.reset();
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;

    await trySubmit(form);
    await returnToInitialPage();
}

async function trySubmit(form) {
    try {
        handleSuccessSubmit(form);
    } catch (error) {
        handleErrorSubmit(error);
    }
}

async function handleSuccessSubmit(form) {
    const serverResponse = await getServerResponse(form);
    if (serverResponse === 202) {
        showSuccessSubmitMessage(form);
    } else {
        showErrorSubmitMessage();
    }
}

async function getServerResponse(form) {
    const formData = new FormData(form);
    const fileInput = form.querySelector('.image-input');
    const file = fileInput?.files?.[0];
    const imageUrl = await uploadImageToCloudinary(file);
console.log('image url:', imageUrl)
    const payload = {};
    formData.forEach((value, key) => {
        payload[key] = value;
    });
    payload.image = imageUrl;

    const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    return response.status;
}

async function uploadImageToCloudinary(file) {
    if (!file) return '';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        return data.secure_url || '';
    } catch (err) {
        console.error('Cloudinary upload failed', err);
        return '';
    }
}

function showSuccessSubmitMessage(form) {
    const message = `Y una imagen más! Bien hecho Javier :)`;
    displaySubmitMessage(message, 'success');
}

function displaySubmitMessage(message, type) {
    updateSubmitMessageCSS(type);
    submitMessage.textContent = message;
    setTimeout(() => {
        resetSubmitMessageCSS();
    }, 3000)
}

function updateSubmitMessageCSS(type) {
    const root = document.documentElement;
    const color = type === 'success' ? getComputedStyle(root).getPropertyValue('--green-transparent') : getComputedStyle(root).getPropertyValue('--red-transparent')
    submitMessage.style.backgroundColor = color;
    submitMessage.style.display = 'block';
    submitMessage.style.zIndex = '5';
    submitMessage.style.opacity = '1';
}

function handleErrorSubmit(error) {
    console.error(error);
    showErrorSubmitMessage();
}

function showErrorSubmitMessage() {
    const message = '¡Repámpanos! Algo ha fallado... habla con el maldito francés ese que te hizo la web :(';
    displaySubmitMessage(message, 'error');
}

function resetSubmitMessageCSS() {
    submitMessage.style.opacity = '0';
    setTimeout(() => {
        submitMessage.style.display = 'none';
        submitMessage.style.zIndex = '-1';
    }, 500)
}