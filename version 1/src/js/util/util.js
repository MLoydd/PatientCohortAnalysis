/**
 * Created by Mike on 08-Mar-17.
 */

function trimAllWhiteSpace(string) {
    return string.replace(/\s+/g, '');
}

function isStringEmpty(str) {
    return !str || str.trim() === "";
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

function areBothSetsEqual(set1, set2) {
    if (set1.size !== set2.size) {
        return false;
    }

    for (let d of set1) {
        if (!set2.has(d)) {
            return false;
        }
    }

    return true;
}

function getCohortGroupName(cohortGroupId) {
    return cohortGroupId.replace(/cohort/i, '').replace(/-/i, ' ');
}
