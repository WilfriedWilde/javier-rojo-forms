const CLOUD_NAME = 'dgder16kq';
const UPLOAD_PRESET = 'javier-rojo';

const addFormBtn = document.getElementById('add-form-btn');
const formContainers = Array.from(document.querySelectorAll('.form-container'));
const formSelection = document.getElementById('form-selection');
const selectionBtns = document.getElementById('form-selection-btns');
const forms = Array.from(document.querySelectorAll('form'));
const submitMessage = document.getElementById('submit-message');
const iconsURLS = ['./icons/add.svg', './icons/delete.svg'];


let hoverColors = {}, icons = {};
let isSelectionDisplayed = false, isFormDisplayed = false;

function initPage() {
    loadIcons();
    setHoverColors();
    addListeners();
}

initPage();

async function loadIcons() {
    for (const url of iconsURLS) {
        await fetchIcon(url);
    }
    addFormBtn.innerHTML = icons.add;
}

async function fetchIcon(url) {
    const response = await fetch(url);
    const svg = await response.text();
    const key = url.split('/')[2].split('.')[0];
    icons[key] = svg;
}

function setHoverColors() {
    hoverColors.add = getComputedStyle(document.documentElement).getPropertyValue('--blue-flashy');
    hoverColors.delete = getComputedStyle(document.documentElement).getPropertyValue('--red');
}

function addListeners() {
    addFormBtn.addEventListener('click', handleAddFormButton);
    selectionBtns.addEventListener('click', handleFormSelection);
    forms.forEach(form => form.addEventListener('submit', async (event) => handleFormSubmit(event)));
}

function handleAddFormButton() {
    handleFormSelectionDisplay();
    if (isFormDisplayed) {
        changeIcon('add');
        hideForm();
    }
}

function handleFormSelectionDisplay() {
    if (!isSelectionDisplayed && !isFormDisplayed) {
        showFormSelection();
    } else {
        hideFormSelection();
    }
}

function showFormSelection() {
    formSelection.style.display = 'flex';
    setTimeout(() => {
        formSelection.style.opacity = '1';
    }, 100)
    isSelectionDisplayed = true;
}

function hideFormSelection() {
    formSelection.style.opacity = '0';
    setTimeout(() => {
        formSelection.style.display = 'none';
    }, 300);
    isSelectionDisplayed = false;
}

function changeIcon(name) {
    addFormBtn.innerHTML = icons[name];
    document.documentElement.style.setProperty('--hover-color', `${hoverColors[name]}`);
}

function hideForm() {
    const formContainer = formContainers.filter(container => container.classList.contains('displayed'))[0];

    formContainer.style.opacity = '0';
    setTimeout(() => {
        formContainer.style.display = 'none';
    }, 300);

    formContainer.classList.remove('displayed');
    isFormDisplayed = false;
}

function handleFormSelection(event) {
    const buttonId = event.target.id.split('-')[0];
    for (const container of formContainers) {
        if (container.id.includes(buttonId)) {
            handleFormDisplay(container)
        }
    }
}

function handleFormDisplay(container) {
    changeIcon('delete');
    hideFormSelection();
    resetForm(container.querySelector('form'));
    displayForm(container);
}

function resetForm(form) {
    form.reset();
}

function displayForm(container) {
    container.style.display = 'flex';
    setTimeout(() => {
        container.style.opacity = '1';
    }, 200);
    container.classList.add('displayed');
    isFormDisplayed = true;
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
    const entryName = getEntryNameInSpanish(form.id.split('-')[0]);
    const message = `Y un${entryName === 'novedad' ? 'a' : 'o'} ${entryName} más! Bien hecho Javier :)`;
    displaySubmitMessage(message, 'success');
}

function getEntryNameInSpanish(name) {
    return name === 'news' ? 'novedad' : 'concierto';
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

async function returnToInitialPage() {
    changeIcon('add');
    hideForm();
}