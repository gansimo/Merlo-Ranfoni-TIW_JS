function dragstartHandler(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function dragoverHandler(ev) {
  ev.preventDefault();
}

function dropHandler(ev) {
  ev.preventDefault();
  
  if (ev.target.id === "markRejectButton" ||         
        ev.target.closest("#markRejectButton")) {     
		document.getElementById("courseSelectionContainer").style.display = "none";
		document.getElementById("courseSelectionContainer").style.borderTop = "none";
		document.getElementById("dateSelectionContainer").style.display = "none";
		document.getElementById("dateSelectionContainer").style.borderTop = "none";      
		document.getElementById("markTableContainer").style.display = "none";
		document.getElementById("markTableContainer").style.borderTop = "none";
		document.getElementById("markRejectButton").style.display = "none";
		document.getElementById("markRejectButton").style.borderTop = "none";
		createtButtons();
    }
}

function createtButtons(){
	const CancelTitleContainer = document.getElementById("CancelTitle");
	CancelTitleContainer.style.display = "block"; 
	CancelTitleContainer.innerHTML = "<h3>Sei sicuro di voler rifiutare il voto?</h3>";
	const ButtonContainer = document.getElementById("Buttons");
	ButtonContainer.style.display = "block";
	ButtonContainer.innerHTML = "";    
	const button1 = document.createElement("button");
	button1.textContent = "Rifiuta voto";
    button1.className = "btn btn-danger ";
    button1.type = "button";
    ButtonContainer.appendChild(button1);
	const button2 = document.createElement("button");
	button2.textContent = "annulla";
	button2.className = "btn btn-primary ";
	button2.type = "button";  
	ButtonContainer.appendChild(button2);
	
	button1.addEventListener("click", handleReject);
	button2.addEventListener("click", handleCancel);
}

function handleCancel(){
	console.log("CLICK su Annulla");
	document.getElementById("CancelTitle").style.display = "none";
	document.getElementById("CancelTitle").style.borderTop = "none";
	document.getElementById("Buttons").style.display = "none";
	document.getElementById("courseSelectionContainer").style.display = "block";
	document.getElementById("courseSelectionContainer").style.borderTop = "block";
	document.getElementById("dateSelectionContainer").style.display = "block"; 
	document.getElementById("dateSelectionContainer").style.borderTop = "block";  
	document.getElementById("markTableContainer").style.display = "block";
	document.getElementById("markTableContainer").style.borderTop = "block";
	document.getElementById("markRejectButton").style.display = "block";
	document.getElementById("markRejectButton").style.borderTop = "block";

}

function handleReject(){
	const URL_REJECT = "Reject";
	const formData = new FormData();
	const courseId = document.getElementById("courseSelect").value;
	const date = document.getElementById("dateSelect").value;
	formData.append("CourseSelect", courseId);
	formData.append("DataSelect", date);
	makeCall("POST", URL_REJECT, formData,
		function (req) {
			if (req.readyState == XMLHttpRequest.DONE) {
				if (req.status == 200) {
					document.getElementById("CancelTitle").style.display = "none";
					document.getElementById("CancelTitle").style.borderTop = "none";
					document.getElementById("Buttons").style.display = "none";
					document.getElementById("courseSelectionContainer").style.display = "block";
					document.getElementById("courseSelectionContainer").style.borderTop = "block";
					document.getElementById("dateSelectionContainer").style.display = "block";
					document.getElementById("dateSelectionContainer").style.borderTop = "block"; 
			    } else {
					alert("Errore durante il rifiuto");
				}
			}
		}
	); 
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
	