(function () {
	const URL_GET_MARK_TABLE = "SearchRound";

    //table container: used for the student table, verbal table, single verbal students table
    const tableContainer = document.getElementById("markTableContainer");
    const tableTitle = document.getElementById("markTableTitle");
	const buttonContainer = document.getElementById("markRejectButton");

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



    function createMarkTable(exam) {
        tableContainer.style.display = "block";
        //cleaning the table container except the title
        while (tableContainer.children.length > 1) {
            tableContainer.removeChild(tableContainer.lastChild);
        }

        //custom title
        tableTitle.textContent = "Esito Appello:";
        tableTitle.classList.remove("success-title");

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        const headers = [
            "Nome del corso",
            "Data dell'appello",
            "Voto",
            "Stato"
        ];

        headers.forEach(headerText => {
            const th = document.createElement("th");
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
            const tr = document.createElement("tr");
            const cells = [
                exam.courseName,
                exam.date,
                exam.mark,
                exam.state];
           
            cells.forEach(cellData => {
                const td = document.createElement("td");
                td.textContent = cellData;
                tr.appendChild(td);
            });
			
		tbody.appendChild(tr);    
        table.appendChild(tbody);
		    
        tableContainer.appendChild(table);
		
		if(exam.state == "pubblicato"){
			if(exam.mark != "<vuoto>" && exam.mark != "assente" && exam.mark != "rimandato" && exam.mark != "riprovato"){
				createMarkRejectButton();   
			}
		}
    }
	
	
	
	function searchRound(courseId, date){
		const formData = new FormData();
		formData.append("CourseSelect", courseId);
		formData.append("DataSelect", date);

		makeCall("POST", URL_GET_MARK_TABLE, formData,
			function (req) {
				if (req.readyState == XMLHttpRequest.DONE) {
					if (req.status == 200) {
						const response = JSON.parse(req.responseText);
						const message = document.getElementById("Empty");
						if(response.state == "pubblicato" || response.state == "rifiutato" || response.state == "verbalizzato"){
							message.style.display = "none";
							message.style.borderTop = "none";
							createMarkTable(response);
						}else{
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
				
			}
		);
	}
	
	window.searchRound = searchRound;

	
	function createMarkRejectButton(){
		const button = document.createElement("button");
	    button.className = "btn-reject";
	    button.type = "button";
	    buttonContainer.innerHTML = "";  
		const icon = document.createElement("img");
		  icon.src = "icona.jpg";
		  icon.alt = "Rifiuta voto";
		  icon.style.width  = "100px";
		  icon.style.height = "100px";  
	    buttonContainer.appendChild(button);
		button.appendChild(icon);
		const caption = document.createElement("span");
		  caption.textContent = "Rifiuta voto";
		  caption.style.color = "White";
		button.appendChild(caption);
	}
	
})();