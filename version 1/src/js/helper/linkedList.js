/**
 * Created by Mike on 05-Apr-17.
 */

class Node {
    constructor(cohort, nodeConfig) {
        this.cohort = cohort;
        this.nodeConfig = nodeConfig;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
        this.length = 0;
    }

    add(cohort, nodeConfig) {
        const nodeToAdd = new Node(cohort, nodeConfig);
        let nodeToCheck = this.head;

        if (!nodeToCheck) {
            this.head = nodeToAdd;
            this.length++;

            return nodeToAdd;
        }

        while (nodeToCheck.next) {
            nodeToCheck = nodeToCheck.next;
        }

        nodeToCheck.next = nodeToAdd;
        this.length++;
        return nodeToAdd;
    }

    remove(node) {
        if(this.head === node){
            this.head = null;
            this.length = 0;
            return;
        }

        this.length = 1;
        let nodeToCheck = this.head;
        while (nodeToCheck) {
            if (nodeToCheck.next === node) {
                nodeToCheck.next = null;
                break;
            }

            this.length++;
            nodeToCheck = nodeToCheck.next;
        }
    }

    get(num) {
        let nodeToCheck = this.head;
        let count = 0;

        if (num > this.length) {
            console.log("There is no node at index : " + num);
            return null;
        }

        while (count < num) {
            nodeToCheck = nodeToCheck.next;
            count++;
        }

        return nodeToCheck;
    }
}
