const CLOUD_NAME = 'dgder16kq';
const UPLOAD_PRESET = 'javier-rojo';

const submitMessage = document.getElementById('submit-message');
const form = document.getElementById('form');
const urlContainer = document.getElementById('image-url');
const copyBtn = document.getElementById('copy-btn');
const copyMessage = document.getElementById('copy-message');

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
    form.addEventListener('submit', async (event) => handleImageUpload(event));
    copyBtn.addEventListener('click', handleUrlCopy);
}

function resetForm(form) {
    form.reset();
}

async function handleImageUpload(event) {
    event.preventDefault();

    const form = event.target;
    const fileInput = form.querySelector('input[type="file"]');
    const file = fileInput.files[0];

    const imageUrl = await getImageUrl(file);
    urlContainer.value = imageUrl;
}

async function getImageUrl(file) {
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

function handleUrlCopy() {
    navigator.clipboard.writeText(urlContainer.value);
    displayCopyMessage();
}

function displayCopyMessage() {
    copyMessage.style.opacity = 1;

    setTimeout(() => {
        copyMessage.style.opacity = 0;
    }, 1500)
}