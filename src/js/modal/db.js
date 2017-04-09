/**
 * Created by Mike on 04-Apr-17.
 */

let db = [];

d3.csv("./csv/data.csv", function (csv) {
    csv.forEach(function (row) {
        let obj = {};
        obj.key = row.JournalTableForm_Key;
        obj.unit = row.Enhet.toLowerCase();
        obj.unitID = row.Enhet_ID;
        obj.journal = row.JournalTableForm.toLowerCase();
        obj.patientID = row.P_ID;
        obj.column = row.Kolumn;
        obj.dateTime = row.Journal_Datetime;
        obj.date = row.DatumText;
        obj.year = row.Ar;
        obj.dayOfWeek = row.Veckodag;
        obj.journalID = row.JournalTableColumn_ID;
        obj.contactID = row.KontaktId;
        obj.contactStartDateTime = row.Kontaktstart;
        obj.contactDate = row.KontaktstartText;
        obj.headDiagnosis = row.Huvuddiagnos.toLowerCase();
        obj.diagnosisList = row.Diagnosstrang.toLowerCase().split(",");
        obj.contactStatus = row.Kontaktstatus.toLowerCase();
        obj.inContact = Boolean(row.InomKontakt);
        obj.sex = row.Kon.toLowerCase();
        obj.age = row.PatientAlder;
        obj.patientCounty = row.PatientLan.toLowerCase();
        obj.arom = row.AROM;
        obj.bk = row.BK;
        obj.muscleStrength = row.Muskelstyrka;
        obj.stamina = row.Uthallighet;
        obj.subtotal = row.Deltotalpoang;
        obj.functionH = row.FunktionH;
        obj.functionV = row.FunktionV;
        obj.functionTotal = row.FunktionTotal;
        obj.eqvas = row.EQVAS;

        db.push(obj);
    });
    initApp(db);
});

function executeQuery(dataset, property, operator, query, query2) {
    let cohortDataset = dataset.filter(function (currentValue) {
        let value = currentValue[property];
        if (performComparisionOperation(operator, value, query, query2)) {
            return currentValue;
        }
    });

    console.log("executeQuery : " + cohortDataset.length);
    return cohortDataset;
}

function findProperty(string) {
    let regex = new RegExp(string, "i");

    let obj = db[0];
    for (let [key, value] of Object.entries(obj)) {
        if (regex.exec(key)) {
            console.log(`property found: ${key} for ${string}`);
            return key;
        }
    }

    return null;
}