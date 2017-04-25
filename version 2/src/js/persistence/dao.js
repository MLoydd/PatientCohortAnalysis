/**
 * Created by Mike on 22-Apr-17.
 */

const DATA_SET = new Set();
const PROPERTIES_MAP = new Map();

d3.csv("./csv/data.csv", function (csv) {

    if (csv.length === 0) {
        alert("No Data found in CSV File");
        return;
    }

    for (let [k, v] of Object.entries(csv[0])) {
        let type = getTypeOfValue(v);
        PROPERTIES_MAP.set(k.trim().toLowerCase(), type);
    }

    csv.forEach(function (row) {
        let patient = new Patient(row.P_ID);
        for (let [k, v] of Object.entries(row)) {
            let value = parseValueToType(v.trim().toLowerCase());
            patient.add(k.trim().toLowerCase(), value);
        }

        DATA_SET.add(patient);
    });

    console.log(`DATA_SET.size : ${DATA_SET.size}`);
    console.log(`PROPERTIES_MAP.size : ${PROPERTIES_MAP.size}`);
});

function getDataset() {
    return DATA_SET;
}

function getTypeOfValue(value) {
    let v = parseValueToType(value);
    if (typeof v === "number") {
        return "number";
    }

    if (typeof v === "string") {
        return "string";
    }

    return null;
}

function parseValueToType(value) {
    if (value === "na" || value === "null" || value === "") {
        return null;
    }

    let number = Number(value);
    if (Number.isSafeInteger(number)) {
        return number;
    }

    return value;
}

function executeQuery(dataset, property, query) {
    let operator = findComparisionOperatorInString(query);
    let operands = getComparisionOperandsFromQuery(query, operator);
    let operand1 = parseValueToType(operands[0]);
    let operand2 = parseValueToType(operands[1]);

    let subDataset = new Set();
    for (let p of dataset) {
        let value = p.data.get(property);
        if (performComparisionOperation(operator, value, operand1, operand2)) {
            subDataset.add(p);
        }
    }

    return subDataset;
}

function getAnalysableProperties() {
    let set = new Set();
    for (let [k, v] of PROPERTIES_MAP) {
        if (v === "number") {
            set.add(k);
        }
    }
    return set;
}

function findProperty(property) {
    for (let p of PROPERTIES_MAP.keys()) {
        if (p === property) {
            console.log(`property found: ${p} for ${property}`);
            return p;
        }
    }

    console.log(`No property found for value : ${property}`);
    return null;
}

/**
 * util functions
 */
function findComparisionOperatorInString(query) {
    let hyphenSplit = query.split("-");
    if (hyphenSplit.length > 1) {
        return "-";
    }

    let result = new RegExp("[<>]=?|!?=").exec(query);
    if (result) {
        return result[0];
    }

    return "=";
}

function getComparisionOperandsFromQuery(query, operator) {
    if (operator === "-") {
        let querySplit = query.split(operator);
        return [querySplit[0].trim(), querySplit[1].trim()];
    }

    if (new RegExp("[<>]=?|!?=").test(query)) {
        let q = query.replace(/[<>]=?|!?=/, "");
        return [q.trim(), null];
    }

    return [query, null];
}

function performComparisionOperation(operator, leftOperand, rightOperand1, rightOperand2) {
    switch (operator) {
        case ">":
            return leftOperand > rightOperand1;
        case "<":
            return leftOperand < rightOperand1;
        case ">=":
            return leftOperand >= rightOperand1;
        case "<=":
            return leftOperand <= rightOperand1;
        case "-":
            if (!rightOperand2) {
                return leftOperand >= rightOperand1;
            }
            return leftOperand >= rightOperand1 && leftOperand < rightOperand2;
        case "=":
            return leftOperand === rightOperand1;
        case null:
            return leftOperand === rightOperand1;
        default:
            console.log("Unknown operator: " + operator);
    }
}