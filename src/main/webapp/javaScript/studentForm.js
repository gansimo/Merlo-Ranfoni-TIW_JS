(function () {

	const URL_GET_COURSES = "GoToHomeStudent";
	const URL_LOGOUT = "Logout";
	const URL_GET_USER = "GetUserData";

	var coursesList = new CoursesList(document.getElementById("courseSelect"));
	var dateList = new DatesList(document.getElementById("dateSelect"));

	window.addEventListener("load", () => {
			//hiding mex at reload
			document.getElementById("noCoursesMessage").style.display = "none";
			document.getElementById("noDatesMessage").style.display = "none";
			document.getElementById("markTableContainer").style.display = "none";

			//get user infos
			loadUserData();

			//get student courses AT PAGE RELOAD, in order to see them without clicking
			coursesList.show();

			//trigger showing dates when the user changes the selected course
			document.getElementById("courseSelect").addEventListener('change', function (e) {
				e.preventDefault();
				const tableContainer = document.getElementById("markTableContainer");
				const tableTitle = document.getElementById("markTableTitle");
				tableTitle.textContent = "";
				while (tableContainer.children.length > 1) {
					tableContainer.removeChild(tableContainer.lastChild);
				}
				tableContainer.style.display = "none";

				if (this.value) {
					loadDatesForCourse(this.value);
				}
			});

			document.getElementById("logoutButton").addEventListener('click', function (e) {
				e.preventDefault();
				makeCall("POST", URL_LOGOUT, null, function (req) {
					if (req.readyState === XMLHttpRequest.DONE) {
						if (req.status === 200) {
							window.location.href = "index.html";
						} else {
							alert("Errore durante il logout");
						}
					}
				});
			});

			document.getElementById("viewButton").addEventListener('click', function (e) {
				e.preventDefault();
				const courseId = document.getElementById("courseSelect").value;
				const date = document.getElementById("dateSelect").value;
				if (courseId && date) {
					searchRound(courseId, date);
				}
			});
		});

	function loadUserData() {
		makeCall("GET", URL_GET_USER, null, function (req) {
			if (req.readyState === XMLHttpRequest.DONE) {
				if (req.status === 200) {
					var userData = JSON.parse(req.responseText);
					document.getElementById("userName").textContent = userData.name;
					document.getElementById("userSurname").textContent = userData.surname;
				} else if (req.status === 401) {
					window.location.href = "index.html";
				}
			}
		});
	}

	function loadDatesForCourse(courseId) {
		var formData = new FormData();
	    formData.append("courseSelect", courseId);
		console.log(courseId);
        
		makeCall("POST", URL_GET_COURSES, formData, function (req) {
			if (req.readyState === XMLHttpRequest.DONE) {
				if (req.status === 200) {
					var datesToShow = JSON.parse(req.responseText);
					console.log("JSON ricevuto:", datesToShow);
					dateList.show(datesToShow);
				} else {
					alert("Errore nel recupero delle date");
				}
			}
		});
	}

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

	function CoursesList(_listcontainer) {
		this.listcontainer = _listcontainer;
		this.container = document.getElementById("courseSelectionContainer");
		this.form = document.getElementById("courseForm");
		this.message = document.getElementById("noCoursesMessage");

		this.show = function () {
			var self = this;

			makeCall("GET", URL_GET_COURSES, null,
				function (req) {
					if (req.readyState == XMLHttpRequest.DONE) {
						if (req.status == 200) {
							var coursesToShow = JSON.parse(req.responseText);

							if (coursesToShow.length == 0) {
								self.form.style.display = "none";
								self.message.style.display = "block";
								dateList.container.style.display = "none";
								return;
							}
							self.update(coursesToShow);

							//only if there is at least 1 course, show the relative dates
							if (coursesToShow.length > 0) {
								loadDatesForCourse(coursesToShow[0].id);
							}
						} else {
							self.form.style.display = "none";
							self.message.style.display = "block";
						}
					}
				}
			);
		}

		this.update = function (coursesArray) {
			var option;
			this.listcontainer.innerHTML = "";
			
			var self = this;
			coursesArray.forEach(function (course) {
				option = document.createElement("option");
				option.textContent = course.courseName;
				option.value = course.id;
				self.listcontainer.appendChild(option);
			});

			this.form.style.display = "block";
			this.message.style.display = "none";
		}
	}

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

			var option;
			this.listcontainer.innerHTML = "";

			var self = this;
			datesToShow.forEach(function (date) {
				option = document.createElement("option");
				option.textContent = date.stringDate;
				option.value = date.stringDate;
				self.listcontainer.appendChild(option);
			});

			this.form.style.display = "block";
			this.message.style.display = "none";
		}
	}

})();