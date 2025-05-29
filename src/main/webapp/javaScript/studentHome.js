(function () {
    const URL_GET_COURSES = "GoToHomeStudent";
    const URL_GET_MARK = "SearchRound";
    const URL_REJECT = "Reject";
    const URL_LOGOUT = "Logout";
    const URL_GET_USER = "GetUserData";

    //page orchestrator pattern
    function PageOrchestrator() {
        this.coursesList = new CoursesList(document.getElementById("courseSelect"));
        this.dateList = new DatesList(document.getElementById("dateSelect"));
        this.markTable = new MarkTable(
            document.getElementById("alert"),
            document.getElementById("markTableContainer"),
            document.getElementById("markTableTitle")
        );
        this.rejectDialog = new RejectDialog(document.getElementById("alert"));
        this.alertContainer = document.getElementById("alert");

        this.start = function () {
            //hinding all at reload in order to show only the 2 forms
            document.getElementById("noCoursesMessage").style.display = "none";
            document.getElementById("noDatesMessage").style.display = "none";
            document.getElementById("markTableContainer").style.display = "none";
            document.getElementById("markRejectButton").style.display = "none";

            //getting user info for welcome message
            this.loadUserData();

            //getting student courses by default, so he sees them already
            this.coursesList.show();

            //adding event listeners
            this.registerEvents();
        };

        this.registerEvents = function () {
            //listening the change of selected course, that triggers dates to be shown
            document.getElementById("courseSelect").addEventListener('change', (e) => {
                e.preventDefault();
                this.handleCourseChange(e.target.value);
            });

            //logout
            document.getElementById("logoutButton").addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });

            //view grade for the selected course
            document.getElementById("viewButton").addEventListener('click', (e) => {
                e.preventDefault();
                this.handleViewButton();
            });

            //drag and drop events
            const markTableContainer = document.getElementById("markTableContainer");
            markTableContainer.addEventListener("dragstart", (ev) => {
                ev.dataTransfer.setData("text", ev.target.id);
            });

            const markRejectButton = document.getElementById("markRejectButton");
            markRejectButton.addEventListener("dragover", (ev) => {
                ev.preventDefault();
            });

            markRejectButton.addEventListener("drop", (ev) => {
                ev.preventDefault();
                if (ev.target.id === "markRejectButton" || ev.target.closest("#markRejectButton")) {
                    this.hideAllContainers();
                    this.rejectDialog.show();
                }
            });
        };

		
        this.handleCourseChange = function (courseId) {
            //cleaning all the containers
            this.cleanAllContainers();

			//showing dates for the selected course
            if (courseId) {
                this.loadDatesForCourse(parseInt(courseId));
            }
        };

        this.handleLogout = function () {
            makeCall("POST", URL_LOGOUT, null, (req) => {
                if (req.readyState === XMLHttpRequest.DONE) {
                    if (req.status === 200) {
                        window.location.href = "index.html";
                    } else {
                        alert("Errore durante il logout");
                    }
                }
            });
        };

		
        this.handleViewButton = function () {
            const courseId = document.getElementById("courseSelect").value;
            const date = document.getElementById("dateSelect").value;
            if (courseId && date) {
                this.searchRound(courseId, date);
            }
        };

		//welcome message
        this.loadUserData = function () {
            makeCall("GET", URL_GET_USER, null, (req) => {
                if (req.readyState === XMLHttpRequest.DONE) {
                    if (req.status === 200) {
                        const userData = JSON.parse(req.responseText);
                        document.getElementById("userName").textContent = userData.name;
                        document.getElementById("userSurname").textContent = userData.surname;
                    } else if (req.status === 401) {
                        window.location.href = "index.html";
                    }
                }
            });
        };

		//calls servlet to get dates from a course id
        this.loadDatesForCourse = function (courseId) {
            if (!courseId) {
                return;
            }

            const formData = new FormData();
            formData.append("courseSelect", courseId.toString());

            makeCall("POST", URL_GET_COURSES, formData, (req) => {
                if (req.readyState === XMLHttpRequest.DONE) {
                    if (req.status === 200) {
                        try {
                            const datesToShow = JSON.parse(req.responseText);
                            if (!Array.isArray(datesToShow)) {
                                alert("Errore nel formato della risposta");
                                return;
                            }
                            this.dateList.show(datesToShow);
                            //selecting by default the first date given in the result
                            if (datesToShow.length > 0) {
                                const dateSelect = document.getElementById("dateSelect");
                                dateSelect.value = datesToShow[0].stringDate;
                            }
                        } catch (e) {
                            alert("Errore nel parsing della risposta");
                        }
                    } else if (req.status === 401) {
                        window.location.href = "index.html";
                    } else {
                        alert("Errore nel recupero delle date");
                    }
                }
            });
        };

		//calls searchRound servlet to find a grade
        this.searchRound = function (courseId, date) {
            const formData = new FormData();
            formData.append("CourseSelect", courseId);
            formData.append("DataSelect", date);

            makeCall("POST", URL_GET_MARK, formData, (req) => {
                if (req.readyState === XMLHttpRequest.DONE) {
                    if (req.status === 200) {
                        const response = JSON.parse(req.responseText);
                        const message = document.getElementById("Empty");
						//show grade only if published/verbalized/rejected
                        if (response.state === "pubblicato" ||
                            response.state === "rifiutato" ||
                            response.state === "verbalizzato") {
                            message.style.display = "none";
                            message.style.borderTop = "none";
                            this.markTable.show(response);
                        } else {
                            message.style.display = "block";
                            message.style.borderTop = "block";
                            message.innerHTML = "<h3>L'esito dell'appello non è stato ancora pubblicato</h3>";
                        }
                    } else if (req.status === 401) {
                        window.location.href = "index.html";
                    } else {
                        alert("Errore nel recupero dei dati dell'appello");
                    }
                }
            });
        };

        this.hideAllContainers = function () {
            document.getElementById("courseSelectionContainer").style.display = "none";
            document.getElementById("courseSelectionContainer").style.borderTop = "none";
            document.getElementById("dateSelectionContainer").style.display = "none";
            document.getElementById("dateSelectionContainer").style.borderTop = "none";
            document.getElementById("markTableContainer").style.display = "none";
            document.getElementById("markTableContainer").style.borderTop = "none";
            document.getElementById("markRejectButton").style.display = "none";
            document.getElementById("markRejectButton").style.borderTop = "none";
        };

        this.showAllContainers = function () {
            document.getElementById("courseSelectionContainer").style.display = "block";
            document.getElementById("courseSelectionContainer").style.borderTop = "block";
            document.getElementById("dateSelectionContainer").style.display = "block";
            document.getElementById("dateSelectionContainer").style.borderTop = "block";
            document.getElementById("markTableContainer").style.display = "block";
            document.getElementById("markTableContainer").style.borderTop = "block";
            document.getElementById("markRejectButton").style.display = "block";
            document.getElementById("markRejectButton").style.borderTop = "block";
        };

        this.cleanAllContainers = function () {
			
            this.hideMarkTable();

            //cleaning the content of the second form
            const dateSelect = document.getElementById("dateSelect");
            dateSelect.innerHTML = "";

            const dateContainer = document.getElementById("dateSelectionContainer");
            dateContainer.style.display = "block";

            //hiding markreject button
            const markRejectButton = document.getElementById("markRejectButton");
            markRejectButton.style.display = "none";

            //hiding message
            const emptyMessage = document.getElementById("Empty");
            if (emptyMessage) {
                emptyMessage.style.display = "none";
                emptyMessage.innerHTML = "";
            }

            //cleaning alert if exists
            const alertContainer = document.getElementById("alert");
            if (alertContainer) {
                alertContainer.textContent = "";
            }

            //keeping visible course form
            const courseForm = document.getElementById("courseForm");
            if (courseForm) {
                courseForm.style.display = "block";
            }

            //keeping visible dates form
            const dateForm = document.getElementById("dateForm");
            if (dateForm) {
                dateForm.style.display = "block";
            }
        };
		
		//cleans and hides the table
        this.hideMarkTable = function () {
            const tableContainer = document.getElementById("markTableContainer");
            const tableTitle = document.getElementById("markTableTitle");
            tableTitle.textContent = "";
            while (tableContainer.children.length > 1) {
                tableContainer.removeChild(tableContainer.lastChild);
            }
            tableContainer.style.display = "none";
        };
    }

    //CoursesList component
    function CoursesList(_listcontainer) {
        this.listcontainer = _listcontainer;
        this.container = document.getElementById("courseSelectionContainer");
        this.form = document.getElementById("courseForm");
        this.message = document.getElementById("noCoursesMessage");

        this.show = function () {
            makeCall("GET", URL_GET_COURSES, null, (req) => {
                if (req.readyState === XMLHttpRequest.DONE) {
                    if (req.status === 200) {
                        const coursesToShow = JSON.parse(req.responseText);

                        if (coursesToShow.length === 0) {
                            this.form.style.display = "none";
                            this.message.style.display = "block";
                            document.getElementById("dateSelectionContainer").style.display = "none";
                            return;
                        }
                        this.update(coursesToShow);

                        if (coursesToShow.length > 0) {
                            window.pageOrchestrator.loadDatesForCourse(coursesToShow[0].id);	//auto select of the first course's dates
                        }
                    } else if (req.status === 401) {
                        window.location.href = "index.html";
                    } else {
                        this.form.style.display = "none";
                        this.message.style.display = "block";
                    }
                }
            });
        };

        this.update = function (coursesArray) {
            this.listcontainer.innerHTML = "";

            coursesArray.forEach((course) => {
                const option = document.createElement("option");
                option.textContent = course.courseName;
                option.value = course.id;
                this.listcontainer.appendChild(option);
            });

            this.form.style.display = "block";
            this.message.style.display = "none";
        };
    }

    //DatesList component
    function DatesList(listContainer) {
        this.listcontainer = listContainer;
        this.container = document.getElementById("dateSelectionContainer");
        this.form = document.getElementById("dateForm");
        this.message = document.getElementById("noDatesMessage");

        this.show = function (datesToShow) {
            if (datesToShow.length === 0) {
                this.form.style.display = "none";
                this.message.style.display = "block";
                return;
            }

            this.listcontainer.innerHTML = "";

            datesToShow.forEach((date) => {
                const option = document.createElement("option");
                option.textContent = date.stringDate;
                option.value = date.stringDate;
                this.listcontainer.appendChild(option);
            });

            this.form.style.display = "block";
            this.message.style.display = "none";
        };
    }

    //MarkTable component
    function MarkTable(_alert, _tableContainer, _tableTitle) {
        this.alert = _alert;
        this.tableContainer = _tableContainer;
        this.tableTitle = _tableTitle;
        this.buttonContainer = document.getElementById("markRejectButton");

        this.show = function (exam) {
            this.tableContainer.style.display = "block";
            while (this.tableContainer.children.length > 1) {
                this.tableContainer.removeChild(this.tableContainer.lastChild);
            }

            this.tableTitle.textContent = "Esito Appello:";
            this.tableTitle.classList.remove("success-title");

            const table = document.createElement("table");
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");

            const headers = ["Nome del corso", "Data dell'appello", "Voto", "Stato"];
            headers.forEach(headerText => {
                const th = document.createElement("th");
                th.textContent = headerText;
                headerRow.appendChild(th);
            });

            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement("tbody");
            const tr = document.createElement("tr");
            const cells = [exam.courseName, exam.date, exam.mark, exam.state];

            cells.forEach(cellData => {
                const td = document.createElement("td");
                td.textContent = cellData;
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
            table.appendChild(tbody);
            this.tableContainer.appendChild(table);

            //make the table draggable only if the grade is 'pubblicato'
            if (exam.state && exam.state.trim().toLowerCase() === "pubblicato") {
                this.tableContainer.setAttribute("draggable", "true");
            } else {
                this.tableContainer.removeAttribute("draggable");
            }

            //trim removes the spaces at beginning and end of str
            if (exam.state && exam.state.trim().toLowerCase() === "pubblicato")	{
                this.createRejectButton();
            } else {
                //cleaning the reject button if not allowed
                this.buttonContainer.innerHTML = "";
                this.buttonContainer.style.display = "none";
            }
        };

        this.createRejectButton = function () {
            const button = document.createElement("button");
            button.className = "btn-reject";
            button.type = "button";
            button.setAttribute("ondragover", "dragoverHandler(event)");
            button.setAttribute("ondrop", "dropHandler(event)");

            this.buttonContainer.innerHTML = "";

            const icon = document.createElement("img");
            icon.src = "icona.jpg";
            icon.alt = "Rifiuta voto";
            icon.draggable = false;

            button.appendChild(icon);

            this.buttonContainer.appendChild(button);
            this.buttonContainer.style.display = "block";
        };
    }

    //RejectDialog component
    function RejectDialog(_alert) {
        this.alert = _alert;
        this.cancelTitle = document.getElementById("CancelTitle");
        this.buttons = document.getElementById("Buttons");

        this.show = function () {
            this.cancelTitle.style.display = "block";
            this.cancelTitle.innerHTML = "<h3>Sei sicuro di voler rifiutare il voto?</h3>";
            this.buttons.style.display = "block";
            this.buttons.innerHTML = "";

            const rejectButton = document.createElement("button");
            rejectButton.textContent = "Rifiuta voto";
            rejectButton.className = "btn btn-danger";
            rejectButton.type = "button";
            this.buttons.appendChild(rejectButton);

            const cancelButton = document.createElement("button");
            cancelButton.textContent = "Annulla";
            cancelButton.className = "btn btn-primary";
            cancelButton.type = "button";
            this.buttons.appendChild(cancelButton);

            rejectButton.addEventListener("click", () => this.handleReject());
            cancelButton.addEventListener("click", () => this.handleCancel());
        };

        this.handleCancel = function () {
            this.cancelTitle.style.display = "none";
            this.buttons.style.display = "none";
            window.pageOrchestrator.showAllContainers();
        };

        this.handleReject = function () {
            const formData = new FormData();
            formData.append("CourseSelect", document.getElementById("courseSelect").value);
            formData.append("DataSelect", document.getElementById("dateSelect").value);

            makeCall("POST", URL_REJECT, formData, (req) => {
                if (req.readyState === XMLHttpRequest.DONE) {
                    if (req.status === 200) {
                        this.cancelTitle.style.display = "none";
                        this.buttons.style.display = "none";
                        window.pageOrchestrator.showAllContainers();
                        //refresh the mark table for the current course and date
                        const courseId = document.getElementById("courseSelect").value;
                        const date = document.getElementById("dateSelect").value;
                        if (courseId && date) {
                            window.pageOrchestrator.searchRound(courseId, date);
                        }
                    } else {
                        if (this.alert) {
                            this.alert.textContent = "Errore durante il rifiuto";
                        } else {
                            alert("Errore durante il rifiuto");
                        }
                    }
                }
            });
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
        window.pageOrchestrator = new PageOrchestrator();
        window.pageOrchestrator.start();
    });
})(); 