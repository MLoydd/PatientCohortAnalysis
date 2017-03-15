/**
 * Created by Mike on 08-Mar-17.
 */

function trimAllWhiteSpace(string) {
    return string.replace(/\s+/g, '');
}

function isInputStringEmpty(element) {
    var value = element.property("value");
    if(!value || value.trim() == "") {
        element.style("border-color", "#ff0000");
        return true;
    }
    return false;
}

function displayElementOnMouseOverEvent(element, transitionDuration) {
    transactionOnMouseOverEvent(element, transitionDuration);
    element.style("left", (event.pageX - 50) + "px").style("top", (event.pageY) + "px");
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