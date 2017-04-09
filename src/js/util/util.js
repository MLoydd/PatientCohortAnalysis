/**
 * Created by Mike on 08-Mar-17.
 */

function trimAllWhiteSpace(string) {
    return string.replace(/\s+/g, '');
}

function isStringEmpty(str) {
    return !str || str.trim() === "";
}

function findAnyOperatorInString(query) {
    let regex = new RegExp("[<>]=?|!?=");
    return regex.exec(query);
}

function performComparisionOperation(operator, leftOperand, rightOperand, rightOperand2) {
    switch (operator) {
        case ">":
            return leftOperand > rightOperand;
        case "<":
            return leftOperand < rightOperand;
        case ">=":
            return leftOperand >= rightOperand;
        case "<=":
            return leftOperand <= rightOperand;
        case "-":
            if (!rightOperand2) {
                return leftOperand >= rightOperand;
            }
            return leftOperand >= rightOperand && leftOperand < rightOperand2;
        case "=":
            return leftOperand === rightOperand;
        case null:
            return leftOperand === rightOperand;
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