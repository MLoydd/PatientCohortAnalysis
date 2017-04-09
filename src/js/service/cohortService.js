/**
 * Created by Mike on 06-Apr-17.
 */

const SCALE = d3.scaleLinear();
const MIN_RANGE = 0;
const MAX_RANGE = 300;

const BASE_COHORT_NODE = {x: 100, y: 50, id: "baseCohortNode", text: "All Patients"};
const INTERSPACE = {dx: 100, dy: 50};
const DIVIDER = {y1: BASE_COHORT_NODE.y, y2: 300};

const BASE_GROUP_MAP = new Map();
const COHORT_QUERY_MAP = new Map();

function initCohortService(dataset) {
    initDrawing();
    SCALE.domain([0, dataset.length]).range([MIN_RANGE, MAX_RANGE]);

    let baseGroupId = addNewBaseGroup();
    addCohortNode("All", "All", dataset, baseGroupId, true, BASE_COHORT_NODE.text, BASE_COHORT_NODE.id);
}

let selectedCohortNode;
function setSelectedCohortNode(cohortNode) {
    selectedCohortNode = cohortNode;
}

function addNewCohortNode(property, query, dataset) {
    let baseGroupId = selectedCohortNode.nodeConfig.baseGroupId;

    if (selectedCohortNode.next) {
        let linkedList = BASE_GROUP_MAP.get(baseGroupId);
        baseGroupId = addNewBaseGroup();
        addAncestorCohortNodesToNewGroup(baseGroupId, selectedCohortNode, linkedList);
    }

/*    if (isQueryingCohortAlreadyExisting(baseGroupId, property, query)) {
        return;
    }*/

    if (isPropertyAlreadyExistingInBaseGroup(baseGroupId, property)) {
        alert("Property is already existing in cohort!");
        return;
    }

    addCohortNode(property, query, dataset, baseGroupId);
}

function addNewBaseGroup() {
    let baseGroupId = `baseGroup-${BASE_GROUP_MAP.size}`;
    BASE_GROUP_MAP.set(baseGroupId, new LinkedList());
    return baseGroupId;
}

function addAncestorCohortNodesToNewGroup(newBaseGroupId, cohortNode, linkedList) {
    let nodeToCheck = linkedList.head;
    while (nodeToCheck !== cohortNode.next) {
        let isHeadNode = linkedList.head === nodeToCheck;
        copyNodeCohortToNewBaseGroup(newBaseGroupId, nodeToCheck, isHeadNode);
        nodeToCheck = nodeToCheck.next;
    }
}

function copyNodeCohortToNewBaseGroup(newBaseGroupId, nodeToCopy, isHeadNode) {
    let cohort = nodeToCopy.cohort;
    let nodeConfig = nodeToCopy.nodeConfig;
    addCohortNode(cohort.property, cohort.query, cohort.dataset, newBaseGroupId, isHeadNode, nodeConfig.text);
}

function addCohortNode(property, query, dataset, baseGroupId, isHeadNode = false, text = `${property} : ${query}`, nodeId) {
    let nodeGroupId = `${baseGroupId}_${BASE_GROUP_MAP.get(baseGroupId).length}`;
    let nodeConfig = composeNodeConfig(baseGroupId, nodeGroupId, text, dataset.length, nodeId);
    let cohort = new Cohort(property, query, dataset);
    let cohortNode = BASE_GROUP_MAP.get(baseGroupId).add(cohort, nodeConfig);

    if (isHeadNode) {
        appendGroup(baseGroupId);
    }

    if (isQueryingCohortAlreadyExisting(baseGroupId, property, query)) {
        BASE_GROUP_MAP.delete(baseGroupId);
        COHORT_QUERY_MAP.delete(baseGroupId);
        clearGroup(baseGroupId);
        return;
    }

    updateCohortQueryMap(baseGroupId, property, query);
    drawCohortNode(cohortNode, isHeadNode)
}

function isPropertyAlreadyExistingInBaseGroup(baseGroupId, property) {
    if (!BASE_GROUP_MAP.has(baseGroupId)) {
        console.log(`BaseGroup is not existing. BaseGroupId : ${baseGroupId}`);
        return;
    }

    let linkedList = BASE_GROUP_MAP.get(baseGroupId);
    let node = linkedList.head;
    while (node) {
        if (node.cohort.property === property) {
            return true;
        }
        node = node.next;
    }
    return false;
}

function isQueryingCohortAlreadyExisting(baseGroupId, property, query) {
    if (!COHORT_QUERY_MAP.has(baseGroupId)) {
        return;
    }

    let b = COHORT_QUERY_MAP.get(baseGroupId);
    let q = `${b}-${property}_${query}`;
    for (let [k, v] of COHORT_QUERY_MAP) {
        if (v === q) {
            alert("Cohort with this query already exists! The existing cohort is : " + k);
            return true;
        }
    }

    return false;
}

function updateCohortQueryMap(baseGroupId, property, query) {
    if (!COHORT_QUERY_MAP.has(baseGroupId)) {
        COHORT_QUERY_MAP.set(baseGroupId, "");
    }

    let b = COHORT_QUERY_MAP.get(baseGroupId);
    let q = `${b}-${property}_${query}`;
    COHORT_QUERY_MAP.set(baseGroupId, q);
}

function composeNodeConfig(baseGroupId, nodeGroupId, text, quantityOfDataset, nodeId = `${nodeGroupId}-${text}`) {
    let position = calculateNodePosition(baseGroupId);
    let width = SCALE(quantityOfDataset);
    return new NodeConfig(baseGroupId, nodeGroupId, nodeId, text, position, width);
}

function drawCohortNode(cohortNode, isHeadNode) {
    let nodeConfig = cohortNode.nodeConfig;
    let id = nodeConfig.id;
    let g = nodeConfig.nodeGroupId;
    let x = nodeConfig.position.x;
    let y = nodeConfig.position.y;
    let w = nodeConfig.width;
    let t = nodeConfig.text;

    appendGroup(g, nodeConfig.baseGroupId);

    if (isHeadNode && id !== BASE_COHORT_NODE.id) {
        addGroupDivider(g);
    }

    if (!isHeadNode) {
        drawPath(g, x, y, w);
    }

    let nodeElement = drawRect(g, id, x, y, w);
    addMouseListenerToCohortNode(nodeElement, cohortNode);

    let textElement = drawText(g, x + w / 2, y + rectHeight / 2, t);
    addMouseListenerToCohortNode(textElement, cohortNode);
}

function addGroupDivider(groupId) {
    let x = BASE_COHORT_NODE.x + (BASE_GROUP_MAP.size - 1) * (MAX_RANGE + INTERSPACE.dx) - INTERSPACE.dx / 2;
    drawDivider(groupId, x, DIVIDER.y1, x, DIVIDER.y2);
}

function calculateNodePosition(baseGroupName) {
    if (!BASE_GROUP_MAP.has(baseGroupName)) {
        return;
    }

    let count = getIndexOfKeyInMap(BASE_GROUP_MAP, baseGroupName);
    let length = BASE_GROUP_MAP.get(baseGroupName).length;

    let x = BASE_COHORT_NODE.x + count * (MAX_RANGE + INTERSPACE.dx);
    let y = BASE_COHORT_NODE.y + length * INTERSPACE.dy;
    return new Position(x, y);
}

function queryCohort(property, query) {
    let dataset = selectedCohortNode.cohort.dataset;
    let hyphenSplit = query.split("-");
    if (hyphenSplit.length > 1) {
        return executeQuery(dataset, property, "-", hyphenSplit[0].trim().toLowerCase(), hyphenSplit[1].trim().toLowerCase());
    }

    let op = findAnyOperatorInString(query.trim());
    console.log("op: " + op);
    if (op) {
        op = op[0];
        query = query.replace(op, "").trim();
    }

    return executeQuery(dataset, property, op, query.toLowerCase());
}

function markAllChildCohortNodes(cssText) {
    let nodeCohort = selectedCohortNode.next;
    while (nodeCohort) {
        markElement(nodeCohort.nodeConfig.id, cssText);
        nodeCohort = nodeCohort.next;
    }
}

function removeCohortNodeAndChildes() {
    let nodeCohort = selectedCohortNode;
    let baseGroupId = nodeCohort.nodeConfig.baseGroupId;
    let linkedList = BASE_GROUP_MAP.get(baseGroupId);

    linkedList.remove(nodeCohort);
    if (!linkedList.head) {
        BASE_GROUP_MAP.set(baseGroupId, null);
        updateDrawing();
        return;
    }

    while (nodeCohort) {
        clearGroup(nodeCohort.nodeConfig.nodeGroupId);
        nodeCohort = nodeCohort.next;
    }
}

function updateDrawing() {
    let map = new Map(BASE_GROUP_MAP.entries());
    BASE_GROUP_MAP.clear();

    for (let [k, v] of map) {
        map.delete(k);

        if (v !== null) {
            BASE_GROUP_MAP.set(k, v);
            continue;
        }

        if (v === null) {
            clearGroup(k);
            break;
        }
    }

    for (let [k, v] of map) {
        clearGroup(k);

        let baseGroupId = addNewBaseGroup();
        let node = v.get(v.length - 1);
        addAncestorCohortNodesToNewGroup(baseGroupId, node, v);
    }
}
