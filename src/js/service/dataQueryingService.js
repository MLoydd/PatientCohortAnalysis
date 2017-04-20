/**
 * Created by Mike on 06-Apr-17.
 */

const QUERYING_SCALE = d3.scaleLinear();
const RANGE = {min: 0, max: 300};

const BASE_COHORT_NODE = {x: 50, y: 70, id: "baseCohortNode", text: "All Patients"};
const INTERSPACE = {dx: 100, dy: 50};
const DIVIDER = {y1: BASE_COHORT_NODE.y, y2: 300};

const COHORT_GROUP_MAP = new Map();

function initDataQueryingService(dataset) {
    initDrawing();
    QUERYING_SCALE.domain([0, dataset.size]).range([RANGE.min, RANGE.max]);

    let cohortGroupId = setNewCohortGroupToCohortGroupMap();
    addCohortNode("Patients", "*", dataset, cohortGroupId, true, BASE_COHORT_NODE.text, BASE_COHORT_NODE.id);
}

let selectedCohortNode = null;
function setSelectedCohortNode(cohortNode) {
    selectedCohortNode = cohortNode;
}

function addNewCohortNode(property, query, dataset) {
    let cohortGroupId = selectedCohortNode.cohort.groupId;

    if (!COHORT_GROUP_MAP.has(cohortGroupId)) {
        console.log(`Cohort Group is not existing for CohortGroupId : ${cohortGroupId}`);
        return;
    }

/*
    if (isPropertyExistingInCohortGroup(selectedCohortNode, property)) {
        alert("Property is already existing in cohort!");
        return;
    }
*/

    if (isQueryingCohortGroupExisting(cohortGroupId, property, query)) {
        alert("Cohort with this query already exists! The existing cohort is : " + cohortGroupId);
        return;
    }

    if (selectedCohortNode.next) {
        let linkedList = COHORT_GROUP_MAP.get(cohortGroupId);
        cohortGroupId = setNewCohortGroupToCohortGroupMap();
        addAncestorCohortNodesToNewGroup(cohortGroupId, selectedCohortNode, linkedList);
    }

    addCohortNode(property, query, dataset, cohortGroupId);
}

function setNewCohortGroupToCohortGroupMap() {
    let cohortGroupId = `cohortGroup-${COHORT_GROUP_MAP.size}`;
    COHORT_GROUP_MAP.set(cohortGroupId, new LinkedList());
    return cohortGroupId;
}

function addAncestorCohortNodesToNewGroup(newcohortGroupId, cohortNode, linkedList) {
    let nodeToCheck = linkedList.head;
    while (nodeToCheck !== cohortNode.next) {
        let isHeadNode = linkedList.head === nodeToCheck;
        copyNodeCohortToNewBaseGroup(newcohortGroupId, nodeToCheck, isHeadNode);
        nodeToCheck = nodeToCheck.next;
    }
}

function copyNodeCohortToNewBaseGroup(newcohortGroupId, nodeToCopy, isHeadNode) {
    let cohort = nodeToCopy.cohort;
    let nodeConfig = nodeToCopy.nodeConfig;
    addCohortNode(cohort.property, cohort.query, cohort.dataset, newcohortGroupId, isHeadNode, nodeConfig.text);
}

function addCohortNode(property, query, dataset, cohortGroupId, isHeadNode = false, text = `${property} : ${query}`, nodeId) {
    let nodeGroupId = `${cohortGroupId}_${COHORT_GROUP_MAP.get(cohortGroupId).length}`;
    let nodeConfig = composeNodeConfig(cohortGroupId, nodeGroupId, text, dataset.size, nodeId);
    let cohort = new Cohort(cohortGroupId, property, query, dataset);
    let cohortNode = COHORT_GROUP_MAP.get(cohortGroupId).add(cohort, nodeConfig);

    if (isHeadNode) {
        appendGroup(cohortGroupId);
        let pos = nodeConfig.position;
        let text = cohortGroupId.replace(/cohort/i, '').replace(/-/i, ' ');
        appendInput(cohortGroupId, pos.x, pos.y - 40, text);
    }

    drawCohortNode(cohortNode, isHeadNode)
}

function isPropertyExistingInCohortGroup(cohortNode, property) {
    let cohortGroupId = cohortNode.cohort.groupId;
    let linkedList = COHORT_GROUP_MAP.get(cohortGroupId);
    let node = linkedList.head;
    while (node) {
        if (node === cohortNode) {
            break;
        }

        if (node.cohort.property === property) {
            return true;
        }

        node = node.next;
    }
    return false;
}

function isQueryingCohortGroupExisting(cohortGroupId, property, query) {
    if (!COHORT_GROUP_MAP.get(cohortGroupId)) {
        return;
    }

    let cohortGroupQuery = composeCohortGroupQuery(cohortGroupId, property, query);

    for (let id of COHORT_GROUP_MAP.keys()) {
        let q = composeCohortGroupQuery(id);
        if (q === cohortGroupQuery) {
            return true;
        }
    }

    return false;
}

function composeCohortGroupQuery(cohortGroupId, property, query) {
    let linkedList = COHORT_GROUP_MAP.get(cohortGroupId);
    let node = linkedList.head;

    let q = "";
    while (node) {
        q = q.concat(`${q}>>>${node.cohort.property}-${node.cohort.query}`);
        node = node.next;
    }

    if (property && query) {
        q = q.concat(`${q}>>>${property}-${query}`);
    }

    return q;
}

function composeNodeConfig(cohortGroupId, nodeGroupId, text, quantityOfDataset, nodeId = `${nodeGroupId}-${text}`) {
    let position = calculateNodePosition(cohortGroupId);
    let width = QUERYING_SCALE(quantityOfDataset);
    return new NodeConfig(nodeGroupId, nodeId, text, position, width);
}

function drawCohortNode(cohortNode, isHeadNode) {
    let nodeConfig = cohortNode.nodeConfig;
    let id = nodeConfig.id;
    let g = nodeConfig.nodeGroupId;
    let x = nodeConfig.position.x;
    let y = nodeConfig.position.y;
    let w = nodeConfig.width;
    let t = nodeConfig.text;

    appendGroup(g, cohortNode.cohort.groupId);

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
    let x = BASE_COHORT_NODE.x + (COHORT_GROUP_MAP.size - 1) * (RANGE.max + INTERSPACE.dx) - INTERSPACE.dx / 2;
    drawDivider(groupId, x, DIVIDER.y1, x, DIVIDER.y2);
}

function calculateNodePosition(cohortGroupId) {
    if (!COHORT_GROUP_MAP.has(cohortGroupId)) {
        return;
    }

    let count = getIndexOfKeyInMap(COHORT_GROUP_MAP, cohortGroupId);
    let length = COHORT_GROUP_MAP.get(cohortGroupId).length;

    let x = BASE_COHORT_NODE.x + count * (RANGE.max + INTERSPACE.dx);
    let y = BASE_COHORT_NODE.y + length * INTERSPACE.dy;
    return new Position(x, y);
}

function getProperty(property) {
    return findProperty(property);
}

function queryCohort(property, query) {
    let dataset = selectedCohortNode.cohort.dataset;

    let q = findComparisionOperatorInString(query.toLowerCase());
    return executeQuery(dataset, property.toLowerCase(), q[0], q[1], q[2]);
}

function markAllChildCohortNodes(cssText) {
    let nodeCohort = selectedCohortNode.next;
    while (nodeCohort) {
        markElement(nodeCohort.nodeConfig.id, cssText);
        nodeCohort = nodeCohort.next;
    }
}

function removeCohortNodeAndChildes() {
    let cohortNode = selectedCohortNode;
    let cohortGroupId = cohortNode.cohort.groupId;
    let linkedList = COHORT_GROUP_MAP.get(cohortGroupId);

    while (cohortNode) {
        clearGroup(cohortNode.nodeConfig.nodeGroupId);
        removeCohortFromSelectionView(cohortNode.cohort);
        cohortNode = cohortNode.next;
    }

    linkedList.remove(cohortNode);
    if (!linkedList.head) {
        COHORT_GROUP_MAP.set(cohortGroupId, null);
        updateDrawing();
    }
}

function updateDrawing() {
    let copy = new Map(COHORT_GROUP_MAP.entries());
    COHORT_GROUP_MAP.clear();

    for (let [k, v] of copy) {
        copy.delete(k);

        if (v !== null) {
            COHORT_GROUP_MAP.set(k, v);
            continue;
        }

        if (v === null) {
            clearGroup(k);
            break;
        }
    }

    for (let [k, v] of copy) {
        clearGroup(k);

        let cohortGroupId = setNewCohortGroupToCohortGroupMap();
        let node = v.get(v.length - 1);
        addAncestorCohortNodesToNewGroup(cohortGroupId, node, v);
    }
}
