/**
 * Created by Mike on 12-Apr-17.
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