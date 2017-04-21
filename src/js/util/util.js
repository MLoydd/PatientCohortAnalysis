/**
 * Created by Mike on 08-Mar-17.
 */

function trimAllWhiteSpace(string) {
    return string.replace(/\s+/g, '');
}

function isStringEmpty(str) {
    return !str || str.trim() === "";
}

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
        return [query.replace("[<>]=?|!?=", "").trim(), null];
    }

    return [query, null];
}

function parseValueToType(value) {
    if (!value || value === "na" || value === "null") {
        return null;
    }

    let number = Number(value);
    if (Number.isSafeInteger(number)) {
        return number;
    }

    return value;
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

function getIndexOfKeyInMap(map, key) {
    let index = 0;
    for (let k of map.keys()) {
        if (k === key) {
            break;
        }
        index++;
    }
    return index;
}