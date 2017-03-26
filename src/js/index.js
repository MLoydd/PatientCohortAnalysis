/**
 * Created by Mike on 13-Mar-17.
 */

let inputDataset = [];

d3.csv("./csv/data.csv", function (csv) {
    csv.forEach(function (row) {
        let obj = {};
        obj.key = parseInt(row.JournalTableForm_Key);
        obj.unit = row.Enhet.toLowerCase();
        obj.unitID = parseInt(row.Enhet_ID);
        obj.journal = row.JournalTableForm.toLowerCase();
        obj.patientID = parseInt(row.P_ID);
        obj.column = parseInt(row.Kolumn);
        obj.dateTime = row.Journal_Datetime; //TODO add proper parsing
        obj.date = row.DatumText; //TODO add proper parsing
        obj.year = parseInt(row.Ar); //TODO add proper parsing
        obj.dayOfWeek = row.Veckodag; //TODO add proper parsing
        obj.journalID = parseInt(row.JournalTableColumn_ID);
        obj.contactID = parseInt(row.KontaktId);
        obj.contactStartDateTime = row.Kontaktstart; //TODO add proper parsing for Date
        obj.contactDate = row.KontaktstartText; //TODO add proper parsing for Date
        obj.headDiagnosis = row.Huvuddiagnos.toLowerCase();
        obj.diagnosisList = row.Diagnosstrang.toLowerCase().split(",");
        obj.contactStatus = row.Kontaktstatus.toLowerCase();
        obj.inContact = Boolean(parseInt(row.InomKontakt));
        obj.sex = row.Kon.toLowerCase();
        obj.patientAge = parseInt(row.PatientAlder);
        obj.patientCounty = row.PatientLan.toLowerCase();
        obj.arom = parseInt(row.AROM);
        obj.bk = parseInt(row.BK);
        obj.muscleStrength = parseInt(row.Muskelstyrka);
        obj.stamina = parseInt(row.Uthallighet);
        obj.subtotal = parseInt(row.Deltotalpoang);
        obj.functionH = parseInt(row.FunktionH);
        obj.functionV = parseInt(row.FunktionV);
        obj.functionTotal = parseInt(row.FunktionTotal);
        obj.eqvas = parseInt(row.EQVAS);

        inputDataset.push(obj);
    });
    initApp();
});

function initApp() {
    console.log("index: " + inputDataset.length);
    initControlElements();
    initDrawing(2500, 1000);
    setCustomScale([0, inputDataset.length], [0, 1000]);
    addNewProperty("All Patients");
    addNewCohortNode("All Patients", "All Patients", inputDataset);
}

function initControlElements() {
    let ctrl = d3.select("#controller");
    let divQuery = ctrl.append("div").attr("id", "divQuery").attr("class", "query").style("opacity", 0);
    divQuery.append("input").attr("id", "inputPropertyName").on("keydown", performOnKeyPress);
    divQuery.append("input").attr("id", "inputNodeQuery").on("keydown", performOnKeyPress);
    divQuery.append("button").text("Create").on("click", createNewQueryNode);

    ctrl.append("div").attr("id", "divTriangle").attr("class", "hover-triangle").style("opacity", 0)
        .on("mouseover", displayCohortNodeElements).on("mouseout", hideCohortNodeElements).on("click", displayQueryFieldset);

    ctrl.append("div").attr("id", "closingIcon").attr("class", "close").style("opacity", 0)
        .on("mouseover", onClosingIconMouseOverHandler).on("mouseout", onClosingIconMouseOutHandler).on("click", removeCohort);
}

function performOnKeyPress() {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    switch (event.key) {
        case "Enter":
            if (event.currentTarget.id == "inputPropertyName") {
                document.getElementById("inputNodeQuery").focus();
            }
            if (event.currentTarget.id == "inputNodeQuery") {
                createNewQueryNode();
            }
            break;
        case "Escape":
            hideQueryFieldset();
            break;
        default:
            return; // Quit when this doesn't handle the key event.
    }

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}

let selectedCohortNode;
function createNewQueryNode() {
    let inputPropertyName = d3.select("#inputPropertyName");
    let inputNodeQuery = d3.select("#inputNodeQuery");
    if (!isInputValid(inputPropertyName) || !isInputValid(inputNodeQuery)) {
        return;
    }

    let propertyName = inputPropertyName.property("value");
    let query = inputNodeQuery.property("value").trim();

    let property = findProperty(propertyName);
    if (property == null) {
        alert("Property is NOT Existing");
        highlightElementBorder(inputPropertyName);
        return;
    }

    let cohort = createCohortBasedOnQuery(query, property);
    if (cohort.length == 0) {
        alert("NO Patient found with this condition");
        highlightElementBorder(inputNodeQuery);
        return;
    }

    let overlapDataMap = findOverlapWithSiblingNodes(cohort, selectedCohortNode.id /*, property*/);

    addNewProperty(property);
    addNewCohortNode(property, query, cohort, selectedCohortNode.id, overlapDataMap);

    hideQueryFieldset();
}

function removeCohort() {
    console.log("remove cohort has been clicked");

    hideCohortNodeElements();
    hideCohortNodeElements();

    let childCohorts = getAllChildNodes(selectedCohortNode.id);
    if (childCohorts.length > 0) {
        let reply = window.confirm("The deleting cohort has depending sub-cohorts. " +
            "All sub-cohorts will also be deleted!\n" +
            "Do you still want to delete the cohort with all the depending sub-cohorts?");
        if (!reply) {
            return;
        }

        for (let cohort of childCohorts) {
            removeCohortNode(cohort.id, cohort.property);
        }
    }

    removeCohortNode(selectedCohortNode.id, selectedCohortNode.property);
}

function isInputValid(element) {
    if (isInputStringEmpty(element.property("value"))) {
        highlightElementBorder(element);
        return false;
    }
    return true;
}

function createCohortBasedOnQuery(query, key) {

    let hyphenSplit = query.split("-");
    if (hyphenSplit.length > 1) {
        return executeQuery2(key, "-", hyphenSplit[0].trim().toLowerCase(), hyphenSplit[1].trim().toLowerCase());
    }

    let op = findAnyOperatorInString(query);
    console.log("op: " + op);
    if (op) {
        op = op[0];
        let val = query.replace(op, "").trim();
        return executeQuery(key, op, val.toLowerCase());
    }

    return executeQuery(key, null, query.toLowerCase());
}

function executeQuery(property, operator, query) {
    let cohort = selectedCohortNode.dataset.filter(function (currentValue) {
        if (performComparisionOperation(operator, currentValue[property], query)) {
            return currentValue;
        }
    });

    console.log("executeQuery : " + cohort.length);
    return cohort;
}

function executeQuery2(property, operator, query, addQuery) {
    let cohort = selectedCohortNode.dataset.filter(function (currentValue) {
        if (performComparisionOperation(operator, currentValue[property], query, addQuery)) {
            return currentValue;
        }
    });

    console.log("executed query 2 : " + cohort.length);
    return cohort;
}

function findProperty(string) {
    let regex = new RegExp(string, "i");

    let obj = inputDataset[0];
    for (let key in obj) {
        if (obj.hasOwnProperty(key) && regex.exec(key)) {
            return key;
        }
    }

    return null;
}

function findOverlapWithSiblingNodes(dataset, parentId, property) {
    if (!parentId) {
        return;
    }

    let childNodes = getAllChildNodes(parentId, property);

    let map = new Map();
    for (let i = 0; i < dataset.length; i++) {
        let data = dataset[i];
        for (let j = 0; j < childNodes.length; j++) {
            let d = childNodes[j].dataset;
            for (let k = 0; k < d.length; k++) {
                let c = d[k];
                if (!map.has(data.patientID) && data.patientID == c.patientID) {
                    map.set(data.patientID, data);
                }
            }
        }
    }

    console.log("findOverlapWithSiblingNodes: " + map.size);
    return map;
}

function findOverlapWithSiblingNodes2(dataset, parentNode, property) {
    if (!parentNode) {
        return;
    }

    let childNodes = getAllChildNodes(parentNode.id, property);
    let overlapMap = new Map();
    for (let i = 0; i < dataset.length; i++) {
        let data = dataset[i];
        for (let j = 0; j < childNodes.length; j++) {
            let d = childNodes[j].dataset;
            let map = new Map();
            for (let k = 0; k < d.length; k++) {
                let c = d[k];
                if (!map.has(data.patientID) && data.patientID == c.patientID) {
                    map.set(data.patientID, data);
                    overlapMap.set(childNodes[j].property, data);
                }
            }
        }
    }

    console.log("findOverlapWithSiblingNodes: " + overlapMap.size);
    return overlapMap;
}

function displayQueryFieldset() {
    hideCohortNodeElements();

    document.getElementById("inputPropertyName").focus();
    displayElement("divQuery", selectedCohortNode);
}

function hideQueryFieldset() {
    hideElementOnMouseOutHandler("divQuery");
    resetControllerElements();
}

function resetControllerElements() {
    d3.select("#inputPropertyName").property("value", "").style("border-color", "#ffffff");
    d3.select("#inputNodeQuery").property("value", "").style("border-color", "#ffffff");
    d3.select("#divTriangle").style("left", 0).style("top", 0);
    d3.select("#closingIcon").style("left", 0).style("top", 0);
    d3.select("#divQuery").style("left", 0).style("top", 0);
}

function displayCohortNodeElements(cohort) {

    if (document.getElementById("divQuery").style.opacity != 0) {
        return;
    }

    if (cohort) {
        selectedCohortNode = cohort;
    }

    displayElement("divTriangle", selectedCohortNode);
    displayClosingIcon(selectedCohortNode);
}

function displayElement(elementId, cohortNode) {
    let xPos = cohortNode.xPos + cohortNode.width / 2;
    let yPos = cohortNode.yPos + drawingSpecs.nodeHeight;
    let absolutePositionCoordinate = calculateNodeMiddlePositionAbsolute(xPos, yPos);
    displayElementOnMouseOverHandler(elementId, absolutePositionCoordinate);
}

function displayClosingIcon(cohortNode) {
    if (!cohortNode.parentId) {
        return;
    }

    let absolutePositionCoordinate = calculateCloseIconPosition(cohortNode.xPos, cohortNode.yPos, cohortNode.width);
    displayElementOnMouseOverHandler("closingIcon", absolutePositionCoordinate, 0.3);
}

function onClosingIconMouseOverHandler() {
    let nodes = getAllChildNodes(selectedCohortNode.id);
    nodes.forEach(function (obj) {
        document.getElementById(obj.id).style.fill = "#FF0000";
    });

    document.getElementById("closingIcon").style.opacity = 1;
}

function onClosingIconMouseOutHandler() {
    let nodes = getAllChildNodes(selectedCohortNode.id);
    nodes.forEach(function (obj) {
        document.getElementById(obj.id).style.removeProperty("fill");
    });
}

function hideCohortNodeElements() {
    hideElementOnMouseOutHandler("closingIcon");
    hideElementOnMouseOutHandler("divTriangle");
}

function calculateNodeMiddlePositionAbsolute(xPos, yPos) {
    let coordinates = getSVGCoordinates();
    let left = coordinates.left + xPos - 60;
    let top = coordinates.top + yPos;
    return [left, top];
}

function calculateCloseIconPosition(xPos, yPos, width) {
    let coordinates = getSVGCoordinates();
    let left = coordinates.left + xPos + width - 35;
    let top = coordinates.top + yPos + 5;
    return [left, top];
}