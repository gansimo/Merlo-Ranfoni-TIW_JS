(function () {
    const URL_GET_STUDENT_TABLE = "GoToStudentTable";
    const URL_EDIT_GRADE = "EditGrade";
    const URL_PUBLISH_GRADES = "PublishGrades";
    const URL_VERBALIZE_GRADES = "VerbalizeGrades";
    const URL_GET_VERBAL = "GoToVerbalPage";
    const URL_GET_VERBALS = "GetVerbals";
    const URL_MULTIPLE_GRADES = "MultipleGrades";

    //page orchestrator pattern
    function PageOrchestrator() {
        this.tableContainer = document.getElementById("studentTableContainer");
        this.tableTitle = document.getElementById("studentTableTitle");
        this.modal = document.getElementById("multipleGradesModal");
        this.closeBtn = document.querySelector(".close");
        this.currentCourseId = null;
        this.currentDate = null;

		//at start, register all the events associated with the buttons
        this.start = function () {
            this.registerEvents();
        };

        this.registerEvents = function () {
            //view verbals button
            document.getElementById("viewVerbalsButton").addEventListener("click", () => this.getVerbals());

            //modal page close button
            this.closeBtn.addEventListener("click", () => this.hideModal());

            //close modal when clicking outside
            window.addEventListener("click", (event) => {
                if (event.target === this.modal) {
                    this.hideModal();
                }
            });

            //submit multiple grades button
            document.getElementById("submitMultipleGrades").addEventListener("click", () => this.submitMultipleGrades());
        };

		//called from professorForms.js
        this.handleViewButtonClick = function (courseId, date) {
            this.currentCourseId = courseId;
            this.currentDate = date;

            makeCall("GET", `${URL_GET_STUDENT_TABLE}?selectedCourseID=${courseId}&date=${date}`, null, (req) => {
                if (req.readyState === XMLHttpRequest.DONE) {
                    if (req.status === 200) {
                        const response = JSON.parse(req.responseText);
                        this.createStudentTable(response.students, response.courseId, response.courseName, response.date);
                    } else if (req.status === 401) {
                        window.location.href = "index.html";
                    } else {
                        alert("Errore nel recupero dei dati degli studenti");
                    }
                }
            });
        };

		//handles the creation of the table
        this.createStudentTable = function (students, courseId, courseName, date) {
            this.tableContainer.style.display = "block";
            this.tableTitle.classList.remove("success-title");		//if present, removes the verbal's creation title

            //cleaning table container except title
            while (this.tableContainer.children.length > 1) {
                this.tableContainer.removeChild(this.tableContainer.lastChild);
            }

			//dynamic message if no students included
            if (students.length === 0) {
                this.tableTitle.textContent = `Non ci sono studenti iscritti all'appello del ${date} del corso ${courseName}`;
                return;
            }

			//dynamic message if at least 1 stud
            this.tableTitle.textContent = `Elenco Studenti Iscritti all'appello del ${date} del corso ${courseName}`;
            this.tableTitle.classList.remove("success-title");

            const table = document.createElement("table");
            table.appendChild(this.createTableHeader());

            const tbody = document.createElement("tbody");
            students.forEach(student => {
                tbody.appendChild(this.createStudentRow(student, courseId, date));
            });
            table.appendChild(tbody);

            this.tableContainer.appendChild(table);
            window.tableSorter.makeSortable(table);		//making the table sortable

            this.addActionButtons(courseId, date, students);		//adding buttons to edit
        };

        this.createTableHeader = function () {
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
        };

        this.createStudentRow = function (student, courseId, date) {
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
                    td.className = `state-${student.state.replaceAll(' ', '-')}`;		//dynamic css clas to colour the text
                }
                tr.appendChild(td);
            });

            const actionCell = document.createElement("td");
            if (student.state === "inserito" || student.state === "non inserito") {		//only if the state is correct
                const gradeSelect = this.createGradeDropdown(student);
                actionCell.appendChild(gradeSelect);

                const editButton = document.createElement("button");
                editButton.type = "button";
                editButton.className = "btn btn-sm";
                editButton.textContent = "Modifica";
                editButton.addEventListener("click", () => {
					if (gradeSelect) {
					    const value = gradeSelect.value;
					    const numericValue = Number(value);
					    const stringValues = ["assente", "rimandato", "riprovato", "30 e lode"];
					    const isNumericOK = !isNaN(numericValue) && numericValue >= 18 && numericValue <= 30;
					    const isStringOK = stringValues.includes(value);
						
					    if (isNumericOK || isStringOK) {
					        this.updateGrade(student.id, courseId, date, value); //dynamic assigning the stud id and grade to the button event
					    }
						else{
							alert("Errore: il voto che stai cercando di inserire non è consentito.");
						}
					}	
                });
                actionCell.appendChild(editButton);
            }
            tr.appendChild(actionCell);

            return tr;
        };

		//option for updating a student grade
        this.createGradeDropdown = function (student) {
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
        };

        this.addActionButtons = function (courseId, date, students) {
            const buttonContainer = document.createElement("div");
            buttonContainer.className = "center";

			//check if there is at least 1 stud with non inserito, to enable the modal page
            const hasNonInserito = students.some(student => student.state === "non inserito");
            if (hasNonInserito) {
                const multipleGradesButton = document.createElement("button");
                multipleGradesButton.className = "btn btn-primary center";
                multipleGradesButton.textContent = "Inserimento Multiplo";
                multipleGradesButton.addEventListener("click", () => this.showMultipleGradesModal(students));
                buttonContainer.appendChild(multipleGradesButton);
            }

            const publishButton = document.createElement("button");
            publishButton.className = "btn btn-primary center";
            publishButton.textContent = "Pubblica i voti inseriti";
            publishButton.addEventListener("click", () => this.publishGrades(courseId, date));
            buttonContainer.appendChild(publishButton);

            const verbalizeButton = document.createElement("button");
            verbalizeButton.className = "btn btn-primary center";
            verbalizeButton.textContent = "Verbalizza i voti pubblicati";
            verbalizeButton.addEventListener("click", () => this.verbalizeGrades(courseId, date));
            buttonContainer.appendChild(verbalizeButton);

            this.tableContainer.appendChild(buttonContainer);
        };

        this.updateGrade = function (studentId, courseId, date, newGrade) {
            const formData = new FormData();
            formData.append("selectedStudentID", studentId);
            formData.append("selectedCourseID", courseId);
            formData.append("date", date);
            formData.append("newGrade", newGrade);

			//call to server to update a grade
            makeCall("POST", URL_EDIT_GRADE, formData, (req) => {
                if (req.readyState === XMLHttpRequest.DONE) {
                    if (req.status === 200 && req.responseText === "success") {
                        this.handleViewButtonClick(courseId, date);		//refresh the table!
                    } else if (req.status === 401) {
                        window.location.href = "index.html";
                    } else {
                        alert("Errore nell'aggiornamento del voto: " + req.responseText);
                    }
                }
            });
        };

        this.publishGrades = function (courseId, date) {
            const formData = new FormData();
            formData.append("selectedCourseID", courseId);
            formData.append("date", date);

            makeCall("POST", URL_PUBLISH_GRADES, formData, (req) => {
                if (req.readyState === XMLHttpRequest.DONE) {
                    if (req.status === 200) {
                        if (req.responseText === "success") {
                            alert("Voti pubblicati con successo");
                            this.handleViewButtonClick(courseId, date);	//refresh the table!
                        } else if (req.responseText === "no_grades_to_publish") {
                            alert("Nessun voto da pubblicare");		//response from the server
                        } else {
                            alert("Risposta inattesa dal server durante la pubblicazione: " + req.responseText);
                        }
                    } else if (req.status === 401) {
                        window.location.href = "index.html";
                    } else {
                        alert("Errore nella pubblicazione dei voti: " + req.responseText);
                    }
                }
            });
        };

        this.verbalizeGrades = function (courseId, date) {
            const formData = new FormData();
            formData.append("selectedCourseID", courseId);
            formData.append("date", date);

            makeCall("POST", URL_VERBALIZE_GRADES, formData, (req) => {
                if (req.readyState === XMLHttpRequest.DONE) {
                    if (req.status === 200) {
                        const response = req.responseText;
                        if (response.startsWith("success:")) {
                            const verbalId = response.substring(8);		//because of servlet response format
                            alert("Voti verbalizzati con successo. ID Verbale: " + verbalId);
                            this.getVerbalData(verbalId);
                        } else if (response === "no_grades_to_verbalize") {
                            alert("Nessun voto da verbalizzare");
                            this.handleViewButtonClick(courseId, date);
                        } else if (response === "no_students_to_verbalize_unexpected") {
                            alert("Errore inatteso: Nessuno studente da includere nel verbale.");
                            this.handleViewButtonClick(courseId, date);
                        } else {
                            alert("Risposta inattesa dal server durante la verbalizzazione: " + response);
                            this.handleViewButtonClick(courseId, date);
                        }
                    } else if (req.status === 401) {
                        window.location.href = "index.html";
                    } else if (req.status === 400) {
                        alert("Errore nella richiesta di verbalizzazione: " + req.responseText);
                        this.handleViewButtonClick(courseId, date);
                    } else {
                        alert("Errore nella verbalizzazione dei voti: " + req.responseText);
                        this.handleViewButtonClick(courseId, date);
                    }
                }
            });
        };
		
		//shows the modal page for multiple grades insertion
        this.showMultipleGradesModal = function (students) {
            const modalContainer = document.getElementById("multipleGradesTableContainer");
            modalContainer.innerHTML = "";

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
                if (student.state === "non inserito") {
                    const tr = document.createElement("tr");
                    tr.dataset.studentId = student.id;
                    const cells = [
                        student.matr,
                        student.surname,
                        student.name,
                        student.mail
                    ];

                    cells.forEach(cellData => {
                        const td = document.createElement("td");
                        td.textContent = cellData;
                        tr.appendChild(td);
                    });

                    const gradeCell = document.createElement("td");
                    const gradeSelect = this.createGradeDropdown(student);
                    gradeCell.appendChild(gradeSelect);
                    tr.appendChild(gradeCell);

                    tbody.appendChild(tr);
                }
            });
            table.appendChild(tbody);
            modalContainer.appendChild(table);

            window.tableSorter.makeSortable(table);

            this.modal.style.display = "block";
            document.body.style.overflow = "hidden";
        };

        this.hideModal = function () {
            this.modal.style.display = "none";
            document.body.style.overflow = "auto";
        };

		//calls multiple grades servlet
        this.submitMultipleGrades = function () {
            const grades = [];
            const rows = document.querySelectorAll("#multipleGradesTableContainer tbody tr");
			let KO = false;

            rows.forEach(row => {
                const studentId = row.dataset.studentId;
                const grade = row.querySelector("select").value;
			    const numericValue = Number(grade);
			    const stringValues = ["assente", "rimandato", "riprovato", "30 e lode"];
			    const isNumericOK = !isNaN(numericValue) && numericValue >= 18 && numericValue <= 30;
			    const isStringOK = stringValues.includes(grade);
				
			    if (!(isNumericOK || isStringOK)) {
					KO = true;
			        alert("Errore: il voto che stai cercando di inserire non è consentito.");
					return;
			    }
				
                grades.push({ studentId, grade });		//appending the couple into the array
            });
			
			if(KO === true)
				return;

            const formData = new FormData();
            formData.append("courseId", this.currentCourseId);
            formData.append("date", this.currentDate);
            formData.append("grades", JSON.stringify(grades));		//need to serialize the array in Json, in order to read it back in the servlet

            makeCall("POST", URL_MULTIPLE_GRADES, formData, (req) => {
                if (req.readyState === XMLHttpRequest.DONE) {
                    if (req.status === 200) {
                        this.hideModal();
                        this.handleViewButtonClick(this.currentCourseId, this.currentDate);
                    } else if (req.status === 401) {
                        window.location.href = "index.html";
                    } else {
                        alert("Errore nell'inserimento dei voti: " + req.responseText);
                    }
                }
            });
        };

		//single verbal info
        this.getVerbalData = function (verbalId, fromVerbalsTable = false) {
            const url = `${URL_GET_VERBAL}?verbalID=${verbalId}`;
            const self = this;

			//flag to understand whether it's a new verbal or an old one
            if (fromVerbalsTable) {
                this.tableTitle.textContent = "Informazioni verbale:";
                this.tableTitle.classList.remove("success-title");
            }

            makeCall("GET", url, null, function (req) {
                if (req.readyState === XMLHttpRequest.DONE) {
                    if (req.status === 200) {
                        try {
                            const response = req.responseText;
                            const [verbalJson, studentsJson] = response.split("|||");		//separator inserted in the response by servlet
                            const verbal = JSON.parse(verbalJson);
                            const students = JSON.parse(studentsJson);
                            self.displayVerbalData(verbal, students, fromVerbalsTable);
                        } catch (e) {
                            alert("Errore nel parsing dei dati del verbale: " + e.message);
                        }
                    } else if (req.status === 401) {
                        window.location.href = "index.html";
                    } else {
                        alert("Errore nel recupero dei dati del verbale: " + req.responseText);
                    }
                }
            });
        };

		//like a student table, but without the buttons and with verbal infos
        this.displayVerbalData = function (verbal, students, fromVerbalsTable = false) {
            this.tableContainer.style.display = "block";
            while (this.tableContainer.children.length > 1) {
                this.tableContainer.removeChild(this.tableContainer.lastChild);
            }

            if (!fromVerbalsTable) {
                this.tableTitle.textContent = "Nuovo verbale creato con successo";
                this.tableTitle.className = "success-title";
            } else {
                this.tableTitle.textContent = "Informazioni verbale:";
                this.tableTitle.classList.remove("success-title");
            }

            this.tableContainer.appendChild(this.createVerbalInfo(verbal));

            const sectionHeader = document.createElement("div");
            sectionHeader.className = "section-header";
            const header = document.createElement("h2");
            header.textContent = "Elenco studenti inclusi nel corrente verbale:";
            sectionHeader.appendChild(header);
            this.tableContainer.appendChild(sectionHeader);

            const table = document.createElement("table");
            table.appendChild(this.createSimpleStudentTableHeader());

            const tbody = document.createElement("tbody");
            students.forEach(student => {
                tbody.appendChild(this.createSimpleStudentRow(student));
            });
            table.appendChild(tbody);

            this.tableContainer.appendChild(table);
            window.tableSorter.makeSortable(table);
        };

		//reduced header (no buttons)
        this.createSimpleStudentTableHeader = function () {
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            const headers = ["Matricola", "Cognome", "Nome", "Email", "Voto"];
            headers.forEach(headerText => {
                const th = document.createElement("th");
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            return thead;
        };

        this.createSimpleStudentRow = function (student) {
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
            return tr;
        };

        this.createVerbalInfo = function (verbal) {
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
        };

		//call to servlet to get all verbals
        this.getVerbals = function () {
            makeCall("GET", URL_GET_VERBALS, null, (req) => {
                if (req.readyState === XMLHttpRequest.DONE) {
                    if (req.status === 200) {
                        const verbals = JSON.parse(req.responseText);
                        this.createVerbalTable(verbals);
                    } else if (req.status === 401) {
                        window.location.href = "index.html";
                    } else {
                        alert("Errore nel recupero dei verbali: " + req.responseText);
                    }
                }
            });
        };

		//displays the verbals table
        this.createVerbalTable = function (verbals) {
            this.tableContainer.style.display = "block";
            while (this.tableContainer.children.length > 1) {
                this.tableContainer.removeChild(this.tableContainer.lastChild);
            }

            this.tableTitle.textContent = "I tuoi verbali:";
            this.tableTitle.classList.remove("success-title");

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

                const actionCell = document.createElement("td");
                const viewButton = document.createElement("button");
                viewButton.type = "button";
                viewButton.className = "btn btn-sm";
                viewButton.textContent = "Visualizza studenti";
                viewButton.addEventListener("click", () => this.getVerbalData(verbal.id, true));
                actionCell.appendChild(viewButton);
                tr.appendChild(actionCell);

                tbody.appendChild(tr);
            });
            table.appendChild(tbody);

            this.tableContainer.appendChild(table);
            window.tableSorter.makeSortable(table);
        };
    }

    //makeCall for AJAX calls
    function makeCall(method, url, formData, cback) {
        const req = new XMLHttpRequest();
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

    //initialize page orchestrator on load
    window.addEventListener("load", () => {
        window.studentTable = new PageOrchestrator();
        window.studentTable.start();
    });
})(); 