/**
 * Created by Mike on 05-Apr-17.
 */


const inputProperty = document.getElementById("inputProperty");
const inputQuery = document.getElementById("inputQuery");

function initApp(dataset) {
    initDataQueryingService(dataset);
}

/**
 * Event Handlers
 */
function queryInputFieldKeyDownHandler() {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    switch (event.key) {
        case "Enter":
            if (event.currentTarget === inputProperty) {
                inputQuery.focus();
                break;
            }
            if (event.currentTarget === inputQuery) {
                applyFilterOnClickHandler();
            }
            break;
        case "Escape":
            resetQueryElements();
            break;
        default:
            return; // Quit when this doesn't handle the key event.
    }

    event.preventDefault(); // Cancel the default action to avoid it being handled twice
}

function applyFilterOnClickHandler() {
    if (!validateQueryInputFields()) {
        return;
    }

    let property = inputProperty.value.trim().toLowerCase();
    let query = inputQuery.value.trim().toLowerCase();
    try {
        queryCohort(property, query);
        resetQueryElements();
    } catch (e) {
        if (e instanceof PropertyInputError) {
            alert(e.message);
            inputProperty.style.cssText = "border-color: #ff0000";
        }

        if (e instanceof QueryInputError) {
            alert(e.message);
            inputQuery.style.cssText = "border-color: #ff0000";
        }
    }
}

function triangleIconOnClickHandler() {
    hideNavIcons();
    displayQueryContainer();
}

function triangleIconMouseOverHandler() {
    displayTriangleIcon();
}

function triangleIconMouseOutHandler() {
    hideNavIcons();
}

function closingIconOnClickHandler() {
    hideNavIcons();
    removeCohortNodeAndItsDependencies();
}

function closingIconMouseOverHandler() {
    hideNavIcons();
    displayClosingIcon();
    highlightChildrenOfSelectedCohortNode("fill:#ff0000");
}

function closingIconMouseOutHandler() {
    highlightChildrenOfSelectedCohortNode(null);
}

function isQueryContainerVisible() {
    return queryContainer.style.display === "flex";
}

/**
 * Validation
 */
function validateQueryInputFields() {
    let cssText = "border-bottom-color: #ff0000;";
    return (validateInputField(inputProperty, cssText) && validateInputField(inputQuery, cssText));
}

function validateInputField(inputElement, cssText) {
    if (isStringEmpty(inputElement.value)) {
        inputElement.style.cssText = cssText;
        return false;
    }
    return true;
}

/**
 * util functions
 */
const queryContainer = document.getElementById("queryContainer");
const triangleIcon = document.getElementById("triangleIcon");
const closingIcon = document.getElementById("closingIcon");

const NAV_RECT = new ClientRect();
function updateNavRect(clientRect) {
    NAV_RECT.set(clientRect.left, clientRect.top, clientRect.width, clientRect.height);
}

function displayTriangleIcon() {
    displayElement(triangleIcon, NAV_RECT.left + NAV_RECT.width / 2, NAV_RECT.top + NAV_RECT.height, -30);
}

function displayClosingIcon() {
    displayElement(closingIcon, NAV_RECT.left, NAV_RECT.top, NAV_RECT.width - 25, 5);
}

function displayQueryContainer() {
    displayElement(queryContainer, NAV_RECT.left + NAV_RECT.width / 2, NAV_RECT.top + NAV_RECT.height, -75, 5, "flex");
    inputProperty.focus();
}

function displayElement(element, x, y, dx = 0, dy = 0, display = "inline") {
    let clientRect = document.getElementById("dataQueryingView").getBoundingClientRect();
    let left = clientRect.left + x + dx;
    let top = clientRect.top + y + dy;

    element.style.cssText = `display: ${display}; top: ${top}px; left: ${left}px;`;
}

function hideNavIcons() {
    triangleIcon.removeAttribute("style");
    closingIcon.removeAttribute("style");
}

function resetQueryElements() {
    inputProperty.value = "";
    inputQuery.value = "";

    inputProperty.removeAttribute("style");
    inputQuery.removeAttribute("style");
    queryContainer.removeAttribute("style");
}

function getUserConfirmation(message) {
    return confirm(message);
}