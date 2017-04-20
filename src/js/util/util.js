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
        return ["-", hyphenSplit[0].trim(), hyphenSplit[1].trim()];
    }

    let regex = new RegExp("[<>]=?|!?=");
    let result = regex.exec(query);
    if (result) {
        let op = result[0];
        let q = query.replace(op, "").trim();
        return [op, q, null];
    }

    return ["=", query, null];
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