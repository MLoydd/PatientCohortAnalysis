/**
 * Created by Mike on 22-Apr-17.
 */

class PropertyInputError extends Error {
    constructor(message) {
        super(message);
        this.name = "PropertyInputError";
    }
}

class QueryInputError extends Error {
    constructor(message) {
        super(message);
        this.name = "QueryInputError";
    }
}

class ChartDataError extends Error {
    constructor(message) {
        super(message);
        this.name = "ChartDataError";
    }
}