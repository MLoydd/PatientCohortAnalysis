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

function findHyphenInString(string) {
    //var regex = new RegExp("^(?=.*-)[a-zA-Z0-9-]+$");
}

function findAnyOperatorInString(query) {
    var regex = new RegExp("[<>]=?|!?=");
    return regex.exec(query);
}

var operators = {
    "<" : function (a, b) {return a < b;},
    ">" : function (a, b) {return a > b;},
    "<=" : function (a, b) {return a <= b;},
    ">=" : function (a, b) {return a >= b;}
};



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