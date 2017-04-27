/**
 * Created by Mike on 06-Apr-17.
 */

const RECT_Height = 40;
const RANGE = {min: 0, max: 250};
const INTERSPACE = {dx: 100, dy: 50};

const COHORT_GROUP_MAP = new Map();
const QUERYING_SCALE = d3.scaleLinear();

function initDataQueryingService(dataset) {
    QUERYING_SCALE.domain([0, dataset.size]).range([RANGE.min, RANGE.max]);

    populatePropertiesInformationColumn();

    let cohortGroupId = createNewCohortGroup();
    let cohortNode = composeCohortNode("Patients", "*", dataset, cohortGroupId, BASE_COHORT_NODE.text, BASE_COHORT_NODE.id);
    drawBaseNodeGroup(cohortNode);
}

function copyBaseCohortNode() {
    let cohortGroupId = createNewCohortGroup();
    let id = `${cohortGroupId}_${BASE_COHORT_NODE.id}`;
    let cohortNode = composeCohortNode("Patients", "*", getDataset(), cohortGroupId, BASE_COHORT_NODE.text, id);
    drawBaseNodeGroup(cohortNode);
}

//let selectedCohortNode = null;
function setSelectedCohortNode(cohortNode) {
    selectedCohortNode = cohortNode;
}

function queryCohort(cohortNode, property, query) {
    let p = findProperty(property);
    if (!p) {
        throw new PropertyInputError("Property does NOT Exist.\nPlease enter the exact name as it is in the CSV file.");
    }

    let dataset = executeQuery(cohortNode.cohort.dataset, property, query);
    if (dataset.size === 0) {
        throw new QueryInputError("NO Patient found with queried condition");
    }

    let cohortGroupId = findCohortInCohortGroupMap(dataset);
    if (cohortGroupId) {
        let r = getUserConfirmation(`Querying cohort already exists in: ${cohortGroupId} !\nDo you still want to create this cohort?`);
        if (!r) {
            return;
        }
    }

    updateQueryingView(cohortNode.cohort.groupId, property, query, dataset);
}

function findCohortInCohortGroupMap(dataset) {
    for (let l of COHORT_GROUP_MAP.values()) {
        let n = l.head;
        while (n) {
            if (areBothSetsEqual(n.cohort.dataset, dataset)) {
                return n.cohort.groupId;
            }
            n = n.next;
        }
    }

    return null;
}

function updateQueryingView(cohortGroupId, property, query, dataset) {
    let cohortNode = composeCohortNode(property, query, dataset, cohortGroupId);
    drawCohortNodeGroup(cohortNode);
}

function createNewCohortGroup() {
    let cohortGroupId = `cohortGroup-${COHORT_GROUP_MAP.size}`;
    COHORT_GROUP_MAP.set(cohortGroupId, new LinkedList());
    return cohortGroupId;
}

/**
 * copy cohort group functions
 */
function copyCohortGroup(cohortNode) {
    let linkedList = COHORT_GROUP_MAP.get(cohortNode.cohort.groupId);
    return copyCohortNodesToNewCohortGroup(cohortNode, linkedList);
}

function copyCohortNodesToNewCohortGroup(cohortNode, linkedListToCopy) {
    let newCohortGroupId = createNewCohortGroup();
    let nodeToCopy = linkedListToCopy.head;
    while (nodeToCopy !== cohortNode.next) {
        let cohortNode = copyCohortNode(newCohortGroupId, nodeToCopy);
        if (linkedListToCopy.head === nodeToCopy) {
            drawBaseNodeGroup(cohortNode);
        } else {
            removeBottomTriangle(selectedCohortNode.nodeConfig.nodeGroupId);
            drawCohortNodeGroup(cohortNode);
        }
        selectedCohortNode = cohortNode;
        nodeToCopy = nodeToCopy.next;
    }
}

function copyCohortNode(newCohortGroupId, cohortNode) {
    let c = cohortNode.cohort;
    return composeCohortNode(c.property, c.query, c.dataset, newCohortGroupId, cohortNode.nodeConfig.text);
}

/**
 * cohort node compose functions
 */

function composeCohortNode(property, query, dataset, cohortGroupId, text = `${property} : ${query}`, nodeId) {
    let nodeGroupId = `${cohortGroupId}_${COHORT_GROUP_MAP.get(cohortGroupId).length}`;

    let nodeConfig = composeNodeConfig(cohortGroupId, nodeGroupId, text, dataset.size, nodeId);
    let cohort = new Cohort(cohortGroupId, property, query, dataset);
    return COHORT_GROUP_MAP.get(cohortGroupId).add(cohort, nodeConfig);
}

function composeNodeConfig(cohortGroupId, nodeGroupId, text, datasetSize, nodeId = `${nodeGroupId}-${text}`) {
    let clientRect = composeNodeClientRect(cohortGroupId, datasetSize);
    return new NodeConfig(nodeGroupId, nodeId, text, clientRect);
}

function composeNodeClientRect(cohortGroupId, datasetSize) {
    let left = 0;
    let top = calculateCohortNodeClientRectTop(cohortGroupId);
    let width = QUERYING_SCALE(datasetSize);
    return new ClientRect(left, top, width, RECT_Height);
}

function calculateCohortNodeClientRectTop(cohortGroupId) {
    let length = COHORT_GROUP_MAP.get(cohortGroupId).length;
    return length * INTERSPACE.dy;
}

/**
 * cohort remove functions
 */
function removeCohortNodeAndItsDependencies(cohortNode) {
    let node = cohortNode;
    while (node) {
        removeCohortNodeFromQueryingView(node.nodeConfig.nodeGroupId);
        removeCohortFromDataSelection(node.cohort);
        node = node.next;
    }

    let linkedList = COHORT_GROUP_MAP.get(cohortNode.cohort.groupId);
    linkedList.remove(cohortNode);

    if (linkedList.length > 0) {
        addCohortNodeToSelection(linkedList.get(linkedList.length - 1));
        return;
    }

    COHORT_GROUP_MAP.set(cohortNode.cohort.groupId, null);
    clearSelectedCohortMap();
    redrawView();
}

function redrawView() {
    let copy = new Map(COHORT_GROUP_MAP.entries());
    COHORT_GROUP_MAP.clear();

    let l = null;
    for (let [k, v] of copy) {
        copy.delete(k);

        if (v !== null) {
            COHORT_GROUP_MAP.set(k, v);
            addCohortNodeToSelection(v.get(v.length - 1));
            l = v;
            continue;
        }

        if (v === null) {
            removeCohortNodeFromQueryingView(k);
            break;
        }
    }

    for (let [k, v] of copy) {
        removeCohortNodeFromQueryingView(k);
        copyCohortNodesToNewCohortGroup(v.get(v.length - 1), v);

        l = v;
    }

    if (copy.size === 0) {
        addRightTriangle(l.get(0));
    }
}

/**
 * util functions
 */
function populatePropertiesInformationColumn() {
    let map = getPropertiesMap();
    for (let [k, v] of map) {
        addItemToPropertiesInformationColumn(k, v);
    }
}
