/**
 * Created by Mike on 05-Apr-17.
 */

/**
 * cohort related classes
 */
class Cohort {
    constructor(groupId, property, query, dataset) {
        this.groupId = groupId;
        this.property = property;
        this.query = query;
        this.dataset = dataset;
    }
}

class NodeConfig {
    constructor(nodeGroupId, id, text, clientRect) {
        this.nodeGroupId = nodeGroupId;
        this.id = id;
        this.text = text;
        this.clientRect = clientRect;
    }
}

class ClientRect {
    constructor(left = 0, top = 0, width = 0, height = 0) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }

    set(left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }
}

/**
 * patient related classes
 */
class Patient {
    constructor(id) {
        this.data = new Map();
        this.id = id;
    }

    add(key, value) {
        this.data.set(key, value);
    }

}

class Datum {
    constructor(property, value) {
        this.property = property;
        this.value = value;
    }
}