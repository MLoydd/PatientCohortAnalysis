/**
 * Created by Mike on 13-Mar-17.
 */

var dataset = [];

d3.csv("./csv/data.csv", function (csv) {
    csv.forEach(function (row) {
        var obj = {};
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
        obj.eqvas = parseInt(row.eqvas);

        dataset.push(obj);
    });
    initApp();
});

function initApp() {
    console.log("index: " + dataset.length);
    initControlElements();
    initDrawing(screen.width, screen.height);
    setCustomScale([0, dataset.length], [0, 1000]);
    addNewProperty("All Patients");
    addNewNode("All Patients", "All Patients", dataset);
}

function initControlElements() {
    var divQuery = d3.select("#controller").append("div").attr("id", "divQuery").attr("class", "query").style("opacity", 0);
    divQuery.append("input").attr("id", "inputPropertyName").style("width", "97.5%");
    divQuery.append("input").attr("id", "inputNodeQuery").style("width", "97.5%").on("keypress", performOnKeyPress);
    divQuery.append("button").text("Cancel").style("width", "50%").on("click", hideQueryFieldset);
    divQuery.append("button").text("Create").style("width", "50%").on("click", createNewQueryNode);

    d3.select("#controller").append("div").attr("id", "divTriangle").attr("class", "hover-triangle").style("opacity", 0)
        .on("mouseover", displayTriangleElement).on("mouseout", hideTriangleElement).on("click", displayQueryFieldset);
}

// TODO : extend for other target elements
function performOnKeyPress() {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    switch (event.key) {
        case "Enter":
            createNewQueryNode();
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

var selectedNode;
function createNewQueryNode() {
    var inputPropertyName = d3.select("#inputPropertyName");
    var inputNodeQuery = d3.select("#inputNodeQuery");
    if (!isInputValid(inputPropertyName) || !isInputValid(inputNodeQuery)) {
        return;
    }

    var propertyName = inputPropertyName.property("value");
    var query = inputNodeQuery.property("value").trim();

    var key = findProperty(propertyName);
    if (key == null) {
        alert("Property is NOT Existing");
        highlightElementBorder(inputPropertyName);
        return;
    }

    var cohort;

    var op = findAnyOperatorInString(query);
    console.log("op: " + op);
    var hyphenSplit = query.split("-");
    if (hyphenSplit.length > 1) {
        cohort = executeQuery2(key, "-", hyphenSplit[0].trim().toLowerCase(), hyphenSplit[1].trim().toLowerCase());
    } else if (op) {
        op = op[0];
        var val = query.replace(op, "").trim();
        cohort = executeQuery(key, op, val.toLowerCase());
    } else {
        cohort = executeQuery(key, null, query.toLowerCase());
    }

    if (cohort.length == 0) {
        alert("NO Patient found with this condition");
        highlightElementBorder(inputNodeQuery);
        return;
    }

    addNewProperty(propertyName);
    addNewNode(propertyName, query, cohort, selectedNode);

    hideQueryFieldset();
}

function isInputValid(element) {
    if (isInputStringEmpty(element.property("value"))) {
        highlightElementBorder(element);
        return false;
    }
    return true;
}

var selectedCohort;
function executeQuery(property, operator, query) {
    var cohort = selectedCohort.filter(function (currentValue) {
        if (performComparisionOperation(operator, currentValue[property], query)) {
            return currentValue;
        }
    });

    console.log("executeQuery : " + cohort.length);
    return cohort;
}

function executeQuery2(property, operator, query, addQuery) {
    var cohort = selectedCohort.filter(function (currentValue) {
        if (performComparisionOperation(operator, currentValue[property], query, addQuery)) {
            return currentValue;
        }
    });

    console.log(cohort.length);
    return cohort;
}

function findProperty(property) {
    var regex = new RegExp(property, "i");

    var obj = dataset[0];
    for (var key in obj) {
        if (obj.hasOwnProperty(key) && regex.exec(key)) {
            return key;
        }
    }

    return null;
}

function displayQueryFieldset() {
    hideTriangleElement();

    var divQuery = d3.select("#divQuery");
    document.getElementById("inputPropertyName").focus();
    displayElementOnMouseOverEvent(divQuery, 200, displayingPos);
}

function hideQueryFieldset() {
    transactionOnMouseOutEvent(d3.select("#divQuery"), 200);
    d3.select("#inputPropertyName").property("value", "").style("border-color", "#ffffff");
    d3.select("#inputNodeQuery").property("value", "").style("border-color", "#ffffff");
    d3.select("#divTriangle").style("left", 0).style("top", 0);
    d3.select("#divQuery").style("left", 0).style("top", 0);
}

var displayingPos;
function displayTriangleElement(cohort, displayPosX, displayPosY) {

    if (d3.select("#divQuery").style("opacity") != 0) {
        return;
    }

    if (event.currentTarget.id != "divTriangle") {
        displayingPos = calculateTrianglePosition(displayPosX, displayPosY);
        selectedCohort = cohort;
        selectedNode = event.target;
    }

    var divTriangle = d3.select("#divTriangle");
    displayElementOnMouseOverEvent(divTriangle, 200, displayingPos);
}

function hideTriangleElement() {
    var divTriangle = d3.select("#divTriangle");
    transactionOnMouseOutEvent(divTriangle, 200);
}

function calculateTrianglePosition(displayPosX, displayPosY) {
    var coordinates = getSVGCoordinates();
    var left = coordinates.left + displayPosX - 60;
    var top = coordinates.top + displayPosY;
    return [left, top];
}