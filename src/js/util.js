/**
 * Created by Mike on 08-Mar-17.
 */

function trimAllWhiteSpace(string) {
    return string.replace(/\s+/g, '');
}

function isInputStringEmpty(str) {
    return !str || str.trim() == "";
}

function highlightElementBorder(element) {
    element.style("border-color", "#ff0000");
}

/*function findHyphenInString(string) {
 var regex = new RegExp("^(?=.*-)[a-zA-Z0-9-]+$");
 }*/

function findAnyOperatorInString(query) {
    var regex = new RegExp("[<>]=?|!?=");
    return regex.exec(query);
}

function performComparisionOperation(operator, leftOperand, rightOperand, addOperand) {
    switch (operator) {
        case ">":
            return leftOperand > rightOperand;
        case "<":
            return leftOperand < rightOperand;
        case ">=":
            return leftOperand >= rightOperand;
        case "<=":
            return leftOperand <= rightOperand;
        case "=":
            return leftOperand == rightOperand;
        case "-":
            if (!addOperand) {
                return leftOperand >= rightOperand;
            }
            return leftOperand >= rightOperand && leftOperand < addOperand;
        case null:
            return leftOperand == rightOperand;
        default:
            console.log("Unknown operator: " + operator);
    }
}

/*var operators = {
 "<" : function (a, b) {return a < b;},
 ">" : function (a, b) {return a > b;},
 "<=" : function (a, b) {return a <= b;},
 ">=" : function (a, b) {return a >= b;}
 };*/

function getAllElementOfTypeInContainer(containerElement, typeName) {
    var r = containerElement.selectAll(typeName);
    if (r.empty()) {
        return null;
    }

    return r.nodes();
    //return nodes[nodes.length - 1];
}


/*function displayElementOnMouseOverEventBasedOnMousePosition(element, transitionDuration) {
 transactionOnMouseOverEvent(element, transitionDuration);
 element.style("left", (event.pageX - 50) + "px").style("top", (event.pageY) + "px");
 }*/

function displayElementOnMouseOverHandler(elementId, displayingPos, opacity) {
    var element = document.getElementById(elementId);
    element.style.left = displayingPos[0] + "px";
    element.style.top = displayingPos[1] + "px";

    var o = 0.9;
    if (opacity) {
        o = opacity
    }

    element.style.opacity = o;
}

function hideElementOnMouseOutHandler(elementId) {
    var element = document.getElementById(elementId);
    element.style.opacity = 0;
}