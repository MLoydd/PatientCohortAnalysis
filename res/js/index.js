/**
 * Created by Mike on 14-Feb-17.
 */

document.addEventListener("DOMContentLoaded", function (event) {

    var dataset = [];
    d3.csv("./res/csv/data.csv", function (csv) {
        csv.forEach(function (row) {
            var obj = {};
            obj.key = parseInt(row.JournalTableForm_Key);
            obj.unit = row.Enhet;
            obj.unitID = parseInt(row.Enhet_ID);
            obj.journal = row.JournalTableForm;
            obj.patientID = parseInt(row.P_ID);
            obj.column = parseInt(row.Kolumn);
            obj.dateTime = row.Journal_Datetime; //TODO add proper parsing
            obj.date = row.DatumText; //TODO add proper parsing
            obj.year = parseInt(row.Ar); //TODO add proper parsing
            obj.dayOfWeek = row.Veckodag; //TODO add proper parsing
            obj.journalID = parseInt(row.JournalTableColumn_ID);
            obj.contactID = parseInt(row.KontaktId);
            obj.contactStartDateTime = row.Kontaktstart; //TODO add proper parsing for Date
            obj.contactDate = row.KontaktstartText; //TODO add proper parsing for Date
            obj.headDiagnosis = row.Huvuddiagnos;
            obj.diagnosisList = row.Diagnosstrang;
            obj.contactStatus = row.Kontaktstatus;
            obj.inContact = Boolean(parseInt(row.InomKontakt));
            obj.sex = row.Kon;
            obj.patientAge = parseInt(row.PatientAlder);
            obj.patientCounty = row.PatientLan;
            obj.arom = parseInt(row.AROM);
            obj.bk = parseInt(row.BK);
            obj.muscleStrength = parseInt(row.Muskelstyrka);
            obj.stamina = parseInt(row.Uthallighet);
            obj.subtotal = parseInt(row.Deltotalpoang);
            obj.functionH = parseInt(row.FunktionH);
            obj.functionV = parseInt(row.FunktionV);
            obj.functionTotal = parseInt(row.FunktionTotal);
            obj.eqvas = parseInt(row.eqvas);

            dataset.push(obj);
        });
        console.log(dataset.length);

        // create table
        var table = d3.select("#simpleTable").append("table");
        var thead = table.append("thead");
        var tbody = table.append("tbody");

        thead.append("th").text("Key");
        thead.append("th").text("Unit");
        thead.append("th").text("Unit ID");
        thead.append("th").text("Journal");
        thead.append("th").text("Patient ID");
        thead.append("th").text("Column");
        thead.append("th").text("Date Time");
        thead.append("th").text("Year");
        thead.append("th").text("In Contact");

        var tr = tbody.selectAll("tr")
            .data(dataset)
            .enter().append("tr");

        var td = tr.selectAll("td")
            .data(function (d) {
                return [d.key, d.unit, d.unitID, d.journal, d.patientID, d.column, d.dateTime, d.year, d.inContact];
            })
            .enter().append("td")
            .text(function (d) {
                return d;
            });
    });

});