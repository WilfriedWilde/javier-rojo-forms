// icons
const addFormBtn = document.getElementById('add-form-btn');
const iconsURLS = ['./icons/add.svg', './icons/delete.svg'];
let hoverColors = {};
let icons = {};

async function fetchIcon(url) {
    const response = await fetch(url);
    const svg = await response.text();
    const key = url.split('/')[2].split('.')[0];
    icons[key] = svg;
}

async function loadIcons() {
    for (const url of iconsURLS) {
        await fetchIcon(url);
    }
    addFormBtn.innerHTML = icons.add;
}

loadIcons();

hoverColors.add = getComputedStyle(document.documentElement).getPropertyValue('--blue-flashy');
hoverColors.delete = getComputedStyle(document.documentElement).getPropertyValue('--red');

// display form selection
const forms = Array.from(document.querySelectorAll('.form-container'));
const formSelection = document.getElementById('form-selection');
let isSelectionDisplayed = false;

function showFormSelection() {
    if (!isSelectionDisplayed && !isFormDisplayed) {
        formSelection.style.display = 'flex';
        setTimeout(() => {
            formSelection.style.opacity = '1';
        }, 100)
        isSelectionDisplayed = true;
    } else {
        formSelection.style.opacity = '0';
        setTimeout(() => {
            formSelection.style.display = 'none';
        }, 300)
        isSelectionDisplayed = false;
    }

    if (isFormDisplayed) {
        // change icon
        addFormBtn.innerHTML = icons.add;
        document.documentElement.style.setProperty('--hover-color', `${hoverColors.add}`);

        // hide form
        const form = forms.filter(form => form.classList.contains('displayed'))[0];

        form.style.opacity = '0';
        setTimeout(() => {
            form.style.display = 'none';
        }, 300);

        form.classList.remove('displayed');
        isFormDisplayed = false;
    }
}

addFormBtn.addEventListener('click', showFormSelection);

// display form
const selectionBtns = document.getElementById('form-selection-btns');
let isFormDisplayed = false;

function handleFormSelection(event) {
    const buttonId = event.target.id.split('-')[0];

    for (const form of forms) {
        if (form.id.includes(buttonId)) {
            handleFormDisplay(form)
        }
    }
}

function handleFormDisplay(form) {
    changeIcon();
    hideFormSelection();
    displayForm(form);
    resetFormInputValues(form);
}

function changeIcon() {
    addFormBtn.innerHTML = icons.delete;
    document.documentElement.style.setProperty('--hover-color', `${hoverColors.delete}`);
}

function hideFormSelection() {
    formSelection.style.opacity = '0';
    setTimeout(() => {
        formSelection.style.display = 'none';
    }, 200);
    isSelectionDisplayed = false;
}

function displayForm(form) {
    form.style.display = 'flex';
    setTimeout(() => {
        form.style.opacity = '1';
    }, 200);
    form.classList.add('displayed');
    isFormDisplayed = true;
}

function resetFormInputValues(form) {
    const inputValues = Array.from(form.querySelectorAll('input'));
    console.log(inputValues)
}

selectionBtns.addEventListener('click', handleFormSelection);


