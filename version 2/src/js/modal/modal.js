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

/**
 * Parameter related classes
 */
class Parameter {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.values = new Set();
    }

    addValue(value) {
        this.values.add(value);
    }

    getValues() {
        return this.values;
    }

    setType(type) {
        this.type = type;
    }

    getType() {
        return this.type;
    }
}