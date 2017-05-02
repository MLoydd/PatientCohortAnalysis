/**
 * Created by Mike on 05-Apr-17.
 */

const inputProperty = document.getElementById("inputProperty");
const inputQuery = document.getElementById("inputQuery");

function initApp() {
    initDataQueryingService(getDataset());
}

/**
 * validation functions
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
 * query elements functions
 */
const queryContainer = document.getElementById("queryContainer");
function displayQueryContainer(cohortNode) {
    let cohortGroupId = cohortNode.cohort.groupId;
    let clientRect = cohortNode.nodeConfig.clientRect;
    selectedCohortNode = cohortNode;

    displayElement(cohortGroupId, queryContainer, RANGE.max / 2, clientRect.top + clientRect.height, -75, 5, "flex");
    inputProperty.focus();
}

function isQueryContainerVisible() {
    return queryContainer.style.display === "flex";
}

function resetQueryElements() {
    inputProperty.value = "";
    inputQuery.value = "";

    inputProperty.removeAttribute("style");
    inputQuery.removeAttribute("style");
    queryContainer.removeAttribute("style");
}

/**
 * util functions
 */
function displayElement(cohortGroupId, element, x, y, dx = 0, dy = 0, display = "inline") {
    let clientRect = document.getElementById(`svg_${cohortGroupId}`).getBoundingClientRect();
    let left = clientRect.left + x + dx;
    let top = clientRect.top + y + dy;

    element.style.cssText = `display: ${display}; top: ${top}px; left: ${left}px;`;
}

function getUserConfirmation(message) {
    return confirm(message);
}