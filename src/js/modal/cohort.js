/**
 * Created by Mike on 05-Apr-17.
 */

class Cohort {
    constructor(property, query, dataset) {
        this.property = property;
        this.query = query;
        this.dataset = dataset;
    }
}

class NodeConfig {
    constructor(baseGroupId, nodeGroupId, id, text, position, width) {
        this.baseGroupId = baseGroupId;
        this.nodeGroupId = nodeGroupId;
        this.id = id;
        this.text = text;
        this.position = position;
        this.width = width;
    }
}

class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Query {
    constructor() {
        this.set = new Set();
    }

    add(property, query) {

    }
}