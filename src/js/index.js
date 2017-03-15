/**
 * Created by Mike on 13-Mar-17.
 */

//import {dataset} from './data';
//import {initialise, addNewProperty, addNewNode} from './querying';


var dataset = [];

d3.csv("./csv/data.csv", function (csv) {
    csv.forEach(function (row) {
        var obj = {};
        obj.key = parseInt(row.JournalTableForm_Key);
        obj.unit = row.Enhet;
        obj.unitID = parseInt(row.Enhet_ID);
        obj.journal = row.JournalTableForm;
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
        obj.headDiagnosis = row.Huvuddiagnos;
        obj.diagnosisList = row.Diagnosstrang;
        obj.contactStatus = row.Kontaktstatus;
        obj.inContact = Boolean(parseInt(row.InomKontakt));
        obj.sex = row.Kon;
        obj.patientAge = parseInt(row.PatientAlder);
        obj.patientCounty = row.PatientLan;
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
    initControlElements();
    initDrawing();
    addNewProperty("All Patients");
    addNewNode("All Patients", "All Patients");
    console.log("index: " + dataset.length);
}

function initControlElements() {
    var divQuery = d3.select("#controller").append("div").attr("id", "divQuery").attr("class", "query").style("opacity", 0);
    divQuery.append("input").attr("id", "inputPropertyName").style("width", "97.5%").attr("autofocus", "true");
    divQuery.append("input").attr("id", "inputNodeQuery").style("width", "97.5%");
    divQuery.append("button").text("Cancel").style("width", "50%").on("click", hideQueryFieldset);
    divQuery.append("button").text("Create").style("width", "50%").on("click", createNewQueryNode);

    d3.select("#controller").append("div").attr("id", "divTriangle").attr("class", "hover-triangle").style("opacity", 0)
        .on("mouseover", displayTriangleElement)
        .on("mouseout", hideTriangleElement)
        .on("click", displayQueryFieldset);
}

function createNewQueryNode() {
    var inputPropertyName = d3.select("#inputPropertyName");
    var propertyName = inputPropertyName.property("value");

    var inputNodeQuery = d3.select("#inputNodeQuery");
    var nodeQuery = inputNodeQuery.property("value");

    if (isInputStringEmpty(inputPropertyName) || isInputStringEmpty(inputNodeQuery)) {
        return;
    }

    if (!isPropertyExisting(propertyName)) {
        addNewProperty(propertyName);
    }

    var query = nodeQuery.trim();
    var op = query.charAt(0);
    query = query.substring(1).trim();
    console.log(query);

    var key = findProperty(propertyName);
    var cohort = executeQuery(key, 40);

    hideQueryFieldset();
}

function executeQuery(property, query) {
    var cohort = dataset.filter(function (currentValue) {
        if (currentValue.patientAge > 40) {
            return currentValue;
        }
    });

    console.log(cohort.length);
    return cohort;
}

function findProperty(property) {
    var regex = new RegExp(property, "i");

    var obj = dataset[0];
    for (var k in obj) {
        if (regex.exec(k)) {
            return k;
        }
    }
}

function stringContainsOperator(query) {
    var regex = new RegExp("[<>]=?|!?=");
    if(regex.test(query)){
        return true;
    }
    return false;
}

function findAnyOperator(query) {
    if(!stringContainsOperator(query)){
        return null;
    }


}

function displayQueryFieldset() {
    hideTriangleElement();

    var divQuery = d3.select("#divQuery");
    displayElementOnMouseOverEvent(divQuery, 200);
}

function hideQueryFieldset() {
    var divQuery = d3.select("#divQuery");
    transactionOnMouseOutEvent(divQuery, 200);
}

function displayTriangleElement() {
    var divQuery = d3.select("#divQuery");
    if (divQuery.style("opacity") != 0) {
        return;
    }

    var divTriangle = d3.select("#divTriangle");
    displayElementOnMouseOverEvent(divTriangle, 200);
}

function hideTriangleElement() {
    var divTriangle = d3.select("#divTriangle");
    transactionOnMouseOutEvent(divTriangle, 200);
}