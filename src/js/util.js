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

function displayElementOnMouseOverEvent(element, transitionDuration, displayingPos) {
    transactionOnMouseOverEvent(element, transitionDuration);
    element.style("left", displayingPos[0] + "px").style("top", displayingPos[1] + "px");
}

function transactionOnMouseOutEvent(element, transitionDuration) {
    opacityHandler(element, transitionDuration, 0);
}

function transactionOnMouseOverEvent(element, transitionDuration) {
    opacityHandler(element, transitionDuration, .9);
}

function opacityHandler(element, transitionDuration, opacity) {
    element.transition().duration(transitionDuration).style("opacity", opacity);
}