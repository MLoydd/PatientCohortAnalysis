/**
 * Created by Mike on 04-Apr-17.
 */

const DATA_SET = new Set();
const PROPERTIES_SET = new Set();

d3.csv("./csv/data.csv", function (csv) {

    if (csv.length === 0) {
        alert("No Data found in CSV File");
        return;
    }

    for (let [k, v] of Object.entries(csv[0])) {
        PROPERTIES_SET.add(k.toLowerCase());
    }

    csv.forEach(function (row) {
        let patient = new Patient(row.P_ID);
        for (let [k, v] of Object.entries(row)) {
            patient.add(k.toLowerCase(), v);
        }

        DATA_SET.add(patient);
    });

    console.log(`DATA_SET.size : ${DATA_SET.size}`);
    console.log(`PROPERTIES_MAP.size : ${PROPERTIES_SET.size}`);
    initApp(DATA_SET);
});

function executeQuery(dataset, property, operator, query, query2 = "") {
    let subDataset = new Set();
    for (let p of dataset) {
        let value = p.data.get(property.toLowerCase());
        if (performComparisionOperation(operator, value.toLowerCase(), query.toLowerCase(), query2.toLowerCase())) {
            subDataset.add(p);
        }
    }

    console.log(`subDataset.size : ${subDataset.size}`);
    return subDataset;
}

function getProperties() {
    return PROPERTIES_SET;
}

function findProperty(property) {
    if (!property) {
        console.log(`findProperty function passed parameter string value is invalid. string : ${property}`);
        return;
    }

    for (let p of PROPERTIES_SET) {
        if (p.toLowerCase() === property.toLowerCase()) {
            console.log(`property found: ${p} for ${property}`);
            return p;
        }
    }
}