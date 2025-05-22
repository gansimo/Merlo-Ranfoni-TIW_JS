(function () {
    const URL_GET_STUDENT_TABLE = "GoToStudentTable";
    const URL_EDIT_GRADE = "EditGrade";
    const URL_PUBLISH_GRADES = "PublishGrades";
    const URL_VERBALIZE_GRADES = "VerbalizeGrades";
    const URL_GET_VERBAL = "GoToVerbalPage";
    const URL_GET_VERBALS = "GetVerbals"

    //table container: used for the student table, verbal table, single verbal students table
    const tableContainer = document.getElementById("studentTableContainer");
    const tableTitle = document.getElementById("studentTableTitle");

    function makeCall(method, url, formData, cback) {
        var req = new XMLHttpRequest();
        req.onreadystatechange = function () {
            cback(req);
        };

        req.open(method, url);

        if (formData === null) {
            req.send();
        } else {
            req.send(formData);
        }
    }

    //general student table header generator
    function createTableHeader() {
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        const headers = [
            "Matricola", "Cognome", "Nome", "Email",
            "Corso di laurea", "Voto", "Stato valutazione", "Azioni"
        ];

        headers.forEach(headerText => {
            const th = document.createElement("th");
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        return thead;
    }

    //dropdown generator to edit grade
    function createGradeDropdown(student) {
        const select = document.createElement("select");
        select.className = "grade-select";

        const options = [
            "assente", "rimandato", "riprovato",
            "18", "19", "20", "21", "22", "23", "24", "25",
            "26", "27", "28", "29", "30", "30 e lode"
        ];

        options.forEach(option => {
            const opt = document.createElement("option");
            opt.value = option;
            opt.textContent = option;
            if (option === student.grade) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });

        return select;
    }

    //server call to update grade, triggered by clicking the modifica button
    function updateGrade(studentId, courseId, date, newGrade) {
        const formData = new FormData();
        formData.append("selectedStudentID", studentId);
        formData.append("selectedCourseID", courseId);
        formData.append("date", date);
        formData.append("newGrade", newGrade);

        makeCall("POST", URL_EDIT_GRADE, formData, function (req) {
            if (req.readyState === XMLHttpRequest.DONE) {
                if (req.status === 200 && req.responseText === "success") {
                    handleViewButtonClick(courseId, date);
                } else if (req.status === 401) {
                    window.location.href = "index.html";
                } else {
                    alert("Errore nell'aggiornamento del voto: " + req.responseText);
                }
            }
        });
    }

    //general student table row generator
    function createStudentRow(student, courseId, date) {
        const tr = document.createElement("tr");

        const cells = [
            student.matr,
            student.surname,
            student.name,
            student.mail,
            student.course,
            student.grade || "<vuoto>",
            student.state
        ];

        cells.forEach(cellData => {
            const td = document.createElement("td");
            td.textContent = cellData;
            if (cellData === student.state) {
                td.className = `state-${student.state.replaceAll(' ', '-')}`;
            }
            tr.appendChild(td);
        });

        //button to edit grade
        const actionCell = document.createElement("td");
        if (student.state === "inserito" || student.state === "non inserito") {
            const gradeSelect = createGradeDropdown(student);
            actionCell.appendChild(gradeSelect);

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "btn btn-sm";
            editButton.textContent = "Modifica";
            editButton.addEventListener("click", function () {		//register server call to the button
                updateGrade(student.id, courseId, date, gradeSelect.value);
            });
            actionCell.appendChild(editButton);
        }
        tr.appendChild(actionCell);

        return tr;
    }

    //server call to publish new edited grades
    function publishGrades(courseId, date) {
        const formData = new FormData();
        formData.append("selectedCourseID", courseId);
        formData.append("date", date);

        makeCall("POST", URL_PUBLISH_GRADES, formData, function (req) {
            if (req.readyState === XMLHttpRequest.DONE) {
                if (req.status === 200) {
                    if (req.responseText === "success") {
                        alert("Voti pubblicati con successo");
                        handleViewButtonClick(courseId, date);
                    } else {
                        alert("Nessun voto da pubblicare");
                    }
                } else if (req.status === 401) {
                    window.location.href = "index.html";
                } else {
                    alert("Errore nella pubblicazione dei voti: " + req.responseText);
                }
            }
        });
    }

    //returns the new verbal created after verbalizing
    function createVerbalInfo(verbal) {
        const verbalInfo = document.createElement("div");
        verbalInfo.className = "verbal-info";

        const infoRows = [
            { label: "Codice identificativo del verbale:", value: verbal.id },
            { label: "Data e ora di creazione del verbale:", value: verbal.hour },
            { label: "Nome del corso:", value: verbal.courseName },
            { label: "Data d'appello del corso:", value: verbal.examDate }
        ];

        infoRows.forEach(row => {
            const infoRow = document.createElement("div");
            infoRow.className = "info-row";

            const label = document.createElement("div");
            label.className = "info-label";
            label.textContent = row.label;

            const value = document.createElement("div");
            value.className = "info-value";
            value.textContent = row.value;

            infoRow.appendChild(label);
            infoRow.appendChild(value);
            verbalInfo.appendChild(infoRow);
        });

        return verbalInfo;
    }

    //shows a verbal. "fromVerbalsTable" == true => need to show the verbal is new 
    function displayVerbalData(verbal, students, fromVerbalsTable = false) {
        tableContainer.style.display = "block";
        //re-using HTML table container, so we need to clean it (but not the tableTitle)
        while (tableContainer.children.length > 1) {
            tableContainer.removeChild(tableContainer.lastChild);
        }

        if (!fromVerbalsTable) {
            tableTitle.textContent = "Nuovo verbale creato con successo";
            tableTitle.className = "success-title";
        }

        //we add the verbal infos into the table container
        tableContainer.appendChild(createVerbalInfo(verbal));

        //little title for the students included in the verbal
        const sectionHeader = document.createElement("div");
        sectionHeader.className = "section-header";
        const header = document.createElement("h2");
        header.textContent = "Elenco studenti inclusi nel corrente verbale:";
        sectionHeader.appendChild(header);
        tableContainer.appendChild(sectionHeader);

        //now we can create the student table for those included in the last verbal
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        const headers = ["Matricola", "Cognome", "Nome", "Email", "Voto"];
        headers.forEach(headerText => {
            const th = document.createElement("th");
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        students.forEach(student => {
            const tr = document.createElement("tr");
            const cells = [
                student.matr,
                student.surname,
                student.name,
                student.mail,
                student.grade
            ];

            cells.forEach(cellData => {
                const td = document.createElement("td");
                td.textContent = cellData;
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        //adding the table in the container
        tableContainer.appendChild(table);

        //making the table sortable
        window.tableSorter.makeSortable(table);
    }

    //server call to get verbal data
    function getVerbalData(verbalId, fromVerbalsTable = false) {
        const url = `${URL_GET_VERBAL}?verbalID=${verbalId}`;

        //same parameter to know if the verbal is new
        if (fromVerbalsTable) {
            tableTitle.textContent = "Informazioni verbale:";
            tableTitle.classList.remove("success-title");
        }

        makeCall("GET", url, null, function (req) {
            if (req.readyState === XMLHttpRequest.DONE) {
                if (req.status === 200) {
                    const response = req.responseText;
                    const [verbalJson, studentsJson] = response.split("|||");		//separator set in server
                    const verbal = JSON.parse(verbalJson);
                    const students = JSON.parse(studentsJson);
                    displayVerbalData(verbal, students, fromVerbalsTable);
                } else if (req.status === 401) {
                    window.location.href = "index.html";
                } else {
                    alert("Errore nel recupero dei dati del verbale: " + req.responseText);
                }
            }
        });
    }

    //server call to verbalize published grades
    function verbalizeGrades(courseId, date) {
        const formData = new FormData();
        formData.append("selectedCourseID", courseId);
        formData.append("date", date);

        makeCall("POST", URL_VERBALIZE_GRADES, formData, function (req) {
            if (req.readyState === XMLHttpRequest.DONE) {
                if (req.status === 200) {
                    const response = req.responseText;
                    if (response.startsWith("success:")) {
                        const verbalId = response.split(":")[1];
                        getVerbalData(verbalId);
                    } else {
                        alert("Nessun voto da verbalizzare");
                    }
                } else if (req.status === 401) {
                    window.location.href = "index.html";
                } else {
                    alert("Errore nella verbalizzazione dei voti: " + req.responseText);
                }
            }
        });
    }

    //general student table generator
    function createStudentTable(students, courseId, courseName, date) {
        tableContainer.style.display = "block";
        tableTitle.classList.remove("success-title");
        //cleaning the table container, except the title
        while (tableContainer.children.length > 1) {
            tableContainer.removeChild(tableContainer.lastChild);
        }

        //no students => custom empty table title
        if (students.length === 0) {
            tableTitle.textContent = `Non ci sono studenti iscritti all'appello del ${date} del corso ${courseName}`;
            return;
        }

        //students => basic title
        tableTitle.textContent = `Elenco Studenti Iscritti all'appello del ${date} del corso ${courseName}`;
        tableTitle.classList.remove("success-title");

        //creating header
        const table = document.createElement("table");
        table.appendChild(createTableHeader());

        //creating rows and appending them in the body
        const tbody = document.createElement("tbody");
        students.forEach(student => {
            tbody.appendChild(createStudentRow(student, courseId, date));
        });
        table.appendChild(tbody);

        tableContainer.appendChild(table);

        //making table sortable
        window.tableSorter.makeSortable(table);

        //buttons to publish/verbalize
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "center";

        const publishButton = document.createElement("button");
        publishButton.className = "btn btn-primary center";
        publishButton.textContent = "Pubblica i voti inseriti";
        publishButton.addEventListener("click", function () {
            publishGrades(courseId, date);
        });
        buttonContainer.appendChild(publishButton);

        const verbalizeButton = document.createElement("button");
        verbalizeButton.className = "btn btn-primary center";
        verbalizeButton.textContent = "Verbalizza i voti pubblicati";
        verbalizeButton.addEventListener("click", function () {
            verbalizeGrades(courseId, date);
        });
        buttonContainer.appendChild(verbalizeButton);

        tableContainer.appendChild(buttonContainer);
    }

    //function used in professorForms.js when the user wants to see students of a specific exam by clicking the button
    function handleViewButtonClick(courseId, date) {
        makeCall("GET", `${URL_GET_STUDENT_TABLE}?selectedCourseID=${courseId}&date=${date}`, null, function (req) {
            if (req.readyState === XMLHttpRequest.DONE) {
                if (req.status === 200) {
                    const response = JSON.parse(req.responseText);
                    createStudentTable(response.students, response.courseId, response.courseName, response.date);
                } else if (req.status === 401) {
                    window.location.href = "index.html";
                } else {
                    alert("Errore nel recupero dei dati degli studenti");
                }
            }
        });
    }

    //verbal table generator
    function createVerbalTable(verbals) {
        tableContainer.style.display = "block";
        //cleaning the table container except the title
        while (tableContainer.children.length > 1) {
            tableContainer.removeChild(tableContainer.lastChild);
        }

        //custom title
        tableTitle.textContent = "I tuoi verbali:";
        tableTitle.classList.remove("success-title");

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        const headers = [
            "Nome del corso",
            "Data dell'appello",
            "ID del verbale",
            "Data di creazione del verbale",
            "Ora di creazione del verbale",
            "Azioni"
        ];

        headers.forEach(headerText => {
            const th = document.createElement("th");
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        verbals.forEach(verbal => {
            const tr = document.createElement("tr");
            const cells = [
                verbal.courseName,
                verbal.examDate,
                verbal.id,
                verbal.date,
                verbal.hour
            ];

            cells.forEach(cellData => {
                const td = document.createElement("td");
                td.textContent = cellData;
                tr.appendChild(td);
            });

            //buttons to see the students of the selected verbal
            const actionCell = document.createElement("td");
            const viewButton = document.createElement("button");
            viewButton.type = "button";
            viewButton.className = "btn btn-sm";
            viewButton.textContent = "Visualizza studenti";
            viewButton.addEventListener("click", function () {
                getVerbalData(verbal.id, true);
            });
            actionCell.appendChild(viewButton);
            tr.appendChild(actionCell);

            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        tableContainer.appendChild(table);

        window.tableSorter.makeSortable(table);
    }

    //server call to get all verbals of the logged user
    function getVerbals() {
        makeCall("GET", URL_GET_VERBALS, null, function (req) {
            if (req.readyState === XMLHttpRequest.DONE) {
                if (req.status === 200) {
                    const verbals = JSON.parse(req.responseText);
                    createVerbalTable(verbals);
                } else if (req.status === 401) {
                    window.location.href = "index.html";
                } else {
                    alert("Errore nel recupero dei verbali: " + req.responseText);
                }
            }
        });
    }

    //listener to get the all verbals table
    window.addEventListener("load", () => {
        document.getElementById("viewVerbalsButton").addEventListener("click", getVerbals);
    });

    //exporting function from the .js
    window.studentTable = {
        handleViewButtonClick: handleViewButtonClick
    };
})(); 