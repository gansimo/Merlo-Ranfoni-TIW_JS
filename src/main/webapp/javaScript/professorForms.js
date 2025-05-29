(function () {
	const URL_GET_COURSES = "GoToHomeProfessor";
	const URL_LOGOUT = "Logout";
	const URL_GET_USER = "GetUserData";

	//page orchestrator pattern
	function PageOrchestrator() {
		this.coursesList = new CoursesList(document.getElementById("courseSelect"));
		this.dateList = new DatesList(document.getElementById("dateSelect"));
		this.alertContainer = document.getElementById("noCoursesMessage");

		this.start = function () {
			//cleans containers' content
			document.getElementById("noCoursesMessage").style.display = "none";
			document.getElementById("noDatesMessage").style.display = "none";
			document.getElementById("studentTableContainer").style.display = "none";

			this.loadUserData();

			//get prof courses
			this.coursesList.show();

			//register event listeners
			this.registerEvents();
		};

		this.registerEvents = function () {
			//listener of selected option in the first form
			document.getElementById("courseSelect").addEventListener('change', (e) => {
				e.preventDefault();
				this.handleCourseChange(e.target.value);
			});

			//logout
			document.getElementById("logoutButton").addEventListener('click', (e) => {
				e.preventDefault();
				this.handleLogout();
			});

			//listener of clicking button to see student table
			document.getElementById("viewButton").addEventListener('click', (e) => {
				e.preventDefault();
				this.handleViewButton();
			});
		};

		this.handleCourseChange = function (courseId) {
			//clear previous content of the table shown for other interactions
			const tableContainer = document.getElementById("studentTableContainer");
			const tableTitle = document.getElementById("studentTableTitle");
			tableTitle.textContent = "";
			while (tableContainer.children.length > 1) {
				tableContainer.removeChild(tableContainer.lastChild);	//cleaning the old table
			}
			tableContainer.style.display = "none";						//hiding it

			if (courseId) {
				this.loadDatesForCourse(courseId);						//auto-update of the dates 
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
				window.studentTable.handleViewButtonClick(courseId, date);		//code in studentTable.js
			}
		};

		this.loadUserData = function () {
			makeCall("GET", URL_GET_USER, null, (req) => {
				if (req.readyState === XMLHttpRequest.DONE) {
					if (req.status === 200) {
						const userData = JSON.parse(req.responseText);
						document.getElementById("userName").textContent = userData.name;
						document.getElementById("userSurname").textContent = userData.surname;		//setting welcome name and surname
					} else if (req.status === 401) {
						window.location.href = "index.html";			//auto logout if user check fails
					}
				}
			});
		};

		//sends async request to the server to show dates
		this.loadDatesForCourse = function (courseId) {
			const formData = new FormData();
			formData.append("courseSelect", courseId);

			makeCall("POST", URL_GET_COURSES, formData, (req) => {
				if (req.readyState === XMLHttpRequest.DONE) {
					if (req.status === 200) {
						const datesToShow = JSON.parse(req.responseText);
						this.dateList.show(datesToShow);
					} else {
						alert("Errore nel recupero delle date");
					}
				}
			});
		};
	}

	//CoursesList component
	function CoursesList(_listcontainer) {
		this.listcontainer = _listcontainer;
		this.container = document.getElementById("courseSelectionContainer");
		this.form = document.getElementById("courseForm");
		this.message = document.getElementById("noCoursesMessage");

		//
		this.show = function () {
			makeCall("GET", URL_GET_COURSES, null, (req) => {
				if (req.readyState === XMLHttpRequest.DONE) {
					if (req.status === 200) {
						const coursesToShow = JSON.parse(req.responseText);

						if (coursesToShow.length === 0) {		//no courses => do not show both forms
							this.form.style.display = "none";
							this.message.style.display = "block";
							document.getElementById("dateSelectionContainer").style.display = "none";
							return;
						}
						this.update(coursesToShow);				//else, show them

						if (coursesToShow.length > 0) {
							//simulate the auto-select for the first default course
							window.pageOrchestrator.loadDatesForCourse(coursesToShow[0].id);
						}
					} else {
						this.form.style.display = "none";
						this.message.style.display = "block";
					}
				}
			});
		};

		this.update = function (coursesArray) {
			//clear prev content
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
			if (datesToShow.length === 0) {				//no dates => do not show the dates form
				this.form.style.display = "none";
				this.message.style.display = "block";
				return;
			}

			this.listcontainer.innerHTML = "";
			
			//else, show them
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