/**
 * Created by Mike on 05-Apr-17.
 */

let chartContainer = document.getElementById("chart");

const queryContainer = document.getElementById("queryContainer");
const inputProperty = document.getElementById("inputProperty");
const inputQuery = document.getElementById("inputQuery");

const triangleIcon = document.getElementById("triangleIcon");
const closingIcon = document.getElementById("closingIcon");

function initApp(dataset) {
    console.log("index: " + dataset.length);
    initCohortService(dataset);
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
            if (event.currentTarget.id === "inputProperty") {
                inputQuery.focus();
            }
            if (event.currentTarget.id === "inputQuery") {
                applyFilterButtonClickedHandler();
            }
            break;
        case "Escape":
            resetControlElements();
            break;
        default:
            return; // Quit when this doesn't handle the key event.
    }

    event.preventDefault(); // Cancel the default action to avoid it being handled twice
}

function applyFilterButtonClickedHandler() {
    if (!validateQueryInputFields()) {
        return;
    }

    let property = inputProperty.value.trim();
    property = findProperty(property);
    if (property === null) {
        alert("Property does NOT Exist");
        inputProperty.style.cssText = "border-color:#ff0000";
        return;
    }

    let query = inputQuery.value.trim();
    let dataset = queryCohort(property, query);
    if (dataset.length === 0) {
        alert("NO Patient found with queried condition");
        inputQuery.style.cssText = "border-color:#ff0000";
        return;
    }

    resetControlElements();
    addNewCohortNode(property, query, dataset);
}

function triangleIconOnClickHandler() {
    displayElement(queryContainer, x + w / 2, y + h, -75, 5, "flex");
    inputProperty.focus();

    hideCohortNodeIcons();
}

function triangleIconMouseOverHandler() {
    displayElement(triangleIcon, x + w / 2, y + h, -30);
}

function triangleIconMouseOutHandler() {
    hideCohortNodeIcons();
}

function closingIconOnClickHandler() {
    closingIcon.style.opacity = 0;
    closingIcon.style.removeProperty("style");
    removeCohortNodeAndChildes();
}

function closingIconMouseOverHandler() {
    displayElement(closingIcon, x, y, w - 25, 5);
    markAllChildCohortNodes("fill:#ff0000");

    triangleIcon.style.removeProperty("style");
}

function closingIconMouseOutHandler() {
    markAllChildCohortNodes(null);
}


/**
 * Validation
 */

function validateQueryInputFields() {
    let cssText = "border-color:#ff0000";
    return !(isInputFieldEmpty(inputProperty, cssText) || isInputFieldEmpty(inputQuery, cssText));
}

function isInputFieldEmpty(inputElement, cssText) {
    if (isStringEmpty(inputElement.value)) {
        inputElement.style.cssText = cssText;
        return true;
    }
    return false;
}

/**
 * Logic
 */

let x = 0;
let y = 0;
let w = 0;
let h = rectHeight;
function addMouseListenerToCohortNode(element, cohortNode) {
    element.on("mouseout", hideCohortNodeIcons).on("mouseover", function () {

        if (queryContainer.style.display === "flex") {
            return;
        }

        setSelectedCohortNode(cohortNode);

        let nodeConfig = cohortNode.nodeConfig;
        x = nodeConfig.position.x;
        y = nodeConfig.position.y;
        w = nodeConfig.width;

        displayElement(triangleIcon, x + w / 2, y + h, -30);

        if (nodeConfig.id !== BASE_COHORT_NODE.id) {
            displayElement(closingIcon, x, y, w - 25, 5);
        }
    });
}

function hideCohortNodeIcons() {
    triangleIcon.removeAttribute("style");
    closingIcon.removeAttribute("style");
}

function displayElement(element, x, y, dx = 0, dy = 0, display = "inline") {
    let coordinates = chartContainer.getBoundingClientRect();
    let left = coordinates.left + x + dx;
    let top = coordinates.top + y + dy;

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
    element.style.display = display;
}

function resetControlElements() {
    inputProperty.value = "";
    inputQuery.value = "";

    inputProperty.removeAttribute("style");
    inputQuery.removeAttribute("style");
    triangleIcon.removeAttribute("style");
    closingIcon.removeAttribute("style");
    queryContainer.removeAttribute("style");
}