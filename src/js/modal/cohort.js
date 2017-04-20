/**
 * Created by Mike on 05-Apr-17.
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
    constructor(nodeGroupId, id, text, position, width) {
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