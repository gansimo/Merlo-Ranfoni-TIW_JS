(function () {
  const URL_LOGIN = "CheckLogin";

  var form = document.getElementById("login_form");
  var msgBox = document.getElementById("login_message");

  function makeCall(method, url, formElement, cback, reset = false) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
      cback(req);
    };

    req.open(method, url);

    if (formElement == null) {
      req.send();
    } else {
      var formData = new FormData(formElement);
      req.send(formData);
      if (reset) {
        formElement.reset();
      }
    }
  }

  function handleLoginResponse(req) {
    if (req.readyState !== XMLHttpRequest.DONE) return;

    try {
      const response = JSON.parse(req.responseText);

      if (req.status === 200 && response.success) {
        window.location.href = response.redirect;
      } else {
        msgBox.textContent = response.error || "Errore durante il login";
        msgBox.style.visibility = "visible";
      }
    } catch (e) {
      msgBox.textContent = "Errore durante il login";
      msgBox.style.visibility = "visible";
    }
  }

  window.addEventListener("load", () => {
    form = document.getElementById("login_form");
    form.querySelector("input[type='button']").addEventListener('click', (e) => {
      var form2 = e.target.closest("form");
      msgBox.style.visibility = "hidden";

      if (!form2.checkValidity()) {
        form2.reportValidity();
        return;
      }

      makeCall("POST", URL_LOGIN, form2, handleLoginResponse, false);
    });
  }, false);

})();