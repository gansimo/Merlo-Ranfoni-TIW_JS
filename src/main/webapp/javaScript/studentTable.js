(function () {
    const URL_GET_STUDENT_TABLE = "GoToStudentTable";
    const URL_EDIT_GRADE = "EditGrade";
    const URL_PUBLISH_GRADES = "PublishGrades";
    const URL_VERBALIZE_GRADES = "VerbalizeGrades";
    const URL_GET_VERBAL = "GoToVerbalPage";

    // Container for the table
    const tableContainer = document.getElementById("studentTableContainer");
    const tableTitle = document.getElementById("studentTableTitle");

    // Function to create the table header
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

    // Function to create grade dropdown
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

    // Function to update grade
    function updateGrade(studentId, courseId, date, newGrade) {
        const formData = new FormData();
        formData.append("selectedStudentID", studentId);
        formData.append("selectedCourseID", courseId);
        formData.append("date", date);
        formData.append("newGrade", newGrade);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", URL_EDIT_GRADE);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200 && xhr.responseText === "success") {
                    // If successful, refresh the table
                    handleViewButtonClick(courseId, date);
                } else if (xhr.status === 401) {
                    window.location.href = "index.html";
                } else {
                    alert("Errore nell'aggiornamento del voto: " + xhr.responseText);
                }
            }
        };

        xhr.send(formData);
    }

    // Function to create a table row for a student
    function createStudentRow(student, courseId, date) {
        const tr = document.createElement("tr");

        // Add student data cells
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

        // Add action button cell
        const actionCell = document.createElement("td");
        if (student.state === "inserito" || student.state === "non inserito") {
            const gradeSelect = createGradeDropdown(student);
            actionCell.appendChild(gradeSelect);

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "btn btn-sm";
            editButton.textContent = "Modifica";
            editButton.addEventListener("click", function () {
                updateGrade(student.id, courseId, date, gradeSelect.value);
            });
            actionCell.appendChild(editButton);
        }
        tr.appendChild(actionCell);

        return tr;
    }

    // Function to publish grades
    function publishGrades(courseId, date) {
        const formData = new FormData();
        formData.append("selectedCourseID", courseId);
        formData.append("date", date);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", URL_PUBLISH_GRADES);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    if (xhr.responseText === "success") {
                        alert("Voti pubblicati con successo");
                        handleViewButtonClick(courseId, date);
                    } else {
                        alert("Nessun voto da pubblicare");
                    }
                } else if (xhr.status === 401) {
                    window.location.href = "index.html";
                } else {
                    alert("Errore nella pubblicazione dei voti: " + xhr.responseText);
                }
            }
        };

        xhr.send(formData);
    }

    // Function to create verbal info section
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

    // Function to display verbal data
    function displayVerbalData(verbal, students, fromVerbalsTable = false) {
        console.log("Displaying verbal data");
        tableContainer.style.display = "block";
        // Clear existing content except the title
        while (tableContainer.children.length > 1) {
            tableContainer.removeChild(tableContainer.lastChild);
        }

        // Update title only if not called from verbals table
        if (!fromVerbalsTable) {
            tableTitle.textContent = "Nuovo verbale creato con successo";
            tableTitle.className = "success-title";
        }

        // Add verbal info
        tableContainer.appendChild(createVerbalInfo(verbal));

        // Add section header
        const sectionHeader = document.createElement("div");
        sectionHeader.className = "section-header";
        const header = document.createElement("h2");
        header.textContent = "Elenco studenti inclusi nel corrente verbale:";
        sectionHeader.appendChild(header);
        tableContainer.appendChild(sectionHeader);

        // Create table
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

        // Add table to container
        tableContainer.appendChild(table);
        console.log("Verbal data displayed");

        // Make the table sortable
        window.tableSorter.makeSortable(table);
    }

    // Function to get verbal data
    function getVerbalData(verbalId, fromVerbalsTable = false) {
        console.log("Getting verbal data for ID:", verbalId);
        const url = `${URL_GET_VERBAL}?verbalID=${verbalId}`;
        console.log("Request URL:", url);

        // Update title only if called from verbals table
        if (fromVerbalsTable) {
            tableTitle.textContent = "Informazioni verbale:";
            tableTitle.classList.remove("success-title");
        }

        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        console.log("XHR request opened");

        xhr.onreadystatechange = function () {
            console.log("XHR state changed:", xhr.readyState);
            if (xhr.readyState === XMLHttpRequest.DONE) {
                console.log("GetVerbalData response:", xhr.status, xhr.responseText);
                if (xhr.status === 200) {
                    const response = xhr.responseText;
                    console.log("Raw response:", response);
                    const [verbalJson, studentsJson] = response.split("|||");
                    console.log("Split response - Verbal:", verbalJson);
                    console.log("Split response - Students:", studentsJson);
                    const verbal = JSON.parse(verbalJson);
                    const students = JSON.parse(studentsJson);
                    console.log("Parsed verbal:", verbal);
                    console.log("Parsed students:", students);
                    displayVerbalData(verbal, students, fromVerbalsTable);
                } else if (xhr.status === 401) {
                    window.location.href = "index.html";
                } else {
                    alert("Errore nel recupero dei dati del verbale: " + xhr.responseText);
                }
            }
        };

        xhr.send();
        console.log("XHR request sent");
    }

    // Function to verbalize grades
    function verbalizeGrades(courseId, date) {
        console.log("Starting verbalization for course:", courseId, "date:", date);
        const formData = new FormData();
        formData.append("selectedCourseID", courseId);
        formData.append("date", date);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", URL_VERBALIZE_GRADES);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                console.log("VerbalizeGrades response:", xhr.status, xhr.responseText);
                if (xhr.status === 200) {
                    const response = xhr.responseText;
                    if (response.startsWith("success:")) {
                        const verbalId = response.split(":")[1];
                        console.log("Verbal created with ID:", verbalId);
                        getVerbalData(verbalId);
                    } else {
                        alert("Nessun voto da verbalizzare");
                    }
                } else if (xhr.status === 401) {
                    window.location.href = "index.html";
                } else {
                    alert("Errore nella verbalizzazione dei voti: " + xhr.responseText);
                }
            }
        };

        xhr.send(formData);
    }

    // Function to create the complete table
    function createStudentTable(students, courseId, courseName, date) {
        tableContainer.style.display = "block";
        tableTitle.classList.remove("success-title");
        // Clear existing content except the title
        while (tableContainer.children.length > 1) {
            tableContainer.removeChild(tableContainer.lastChild);
        }

        // Update title based on whether there are students
        if (students.length === 0) {
            tableTitle.textContent = `Non ci sono studenti iscritti all'appello del ${date} del corso ${courseName}`;
            return;
        }

        tableTitle.textContent = `Elenco Studenti Iscritti all'appello del ${date} del corso ${courseName}`;
        tableTitle.classList.remove("success-title");

        // Create table
        const table = document.createElement("table");
        table.appendChild(createTableHeader());

        const tbody = document.createElement("tbody");
        students.forEach(student => {
            tbody.appendChild(createStudentRow(student, courseId, date));
        });
        table.appendChild(tbody);

        // Add table to container
        tableContainer.appendChild(table);

        // Make the table sortable
        window.tableSorter.makeSortable(table);

        // Add action buttons
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

    // Function to handle the view button click
    function handleViewButtonClick(courseId, date) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", `${URL_GET_STUDENT_TABLE}?selectedCourseID=${courseId}&date=${date}`);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    createStudentTable(response.students, response.courseId, response.courseName, response.date);
                } else if (xhr.status === 401) {
                    window.location.href = "index.html";
                } else {
                    alert("Errore nel recupero dei dati degli studenti");
                }
            }
        };

        xhr.send();
    }

    // Function to create verbal table
    function createVerbalTable(verbals) {
        tableContainer.style.display = "block";
        // Clear existing content except the title
        while (tableContainer.children.length > 1) {
            tableContainer.removeChild(tableContainer.lastChild);
        }

        // Update title
        tableTitle.textContent = "I tuoi verbali:";
        tableTitle.classList.remove("success-title");

        // Create table
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

            // Add action button cell
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

        // Add table to container
        tableContainer.appendChild(table);

        // Make the table sortable
        window.tableSorter.makeSortable(table);
    }

    // Function to get verbals
    function getVerbals() {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "GetVerbals");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    const verbals = JSON.parse(xhr.responseText);
                    createVerbalTable(verbals);
                } else if (xhr.status === 401) {
                    window.location.href = "index.html";
                } else {
                    alert("Errore nel recupero dei verbali: " + xhr.responseText);
                }
            }
        };

        xhr.send();
    }

    // Add event listener for verbals button
    document.getElementById("viewVerbalsButton").addEventListener("click", getVerbals);

    // Export the function to be used by other scripts
    window.studentTable = {
        handleViewButtonClick: handleViewButtonClick
    };
})(); 