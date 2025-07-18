# Tecnologie Informatiche per il Web - TIW Project (RIA Version) - Final evaluation: 28/30

This repository contains the client-side rendered version of the Exam Management System, developed for the "Tecnologie Informatiche per il Web" (TIW) university course.

This version reimagines the application as a modern **Single-Page Application (SPA)**, where all user interactions are handled dynamically on the client-side without full page reloads.

---

## ✨ Key Features & Enhancements

This version includes all the core functionalities of the [Thymeleaf version](https://github.com/gansimo/Merlo-Ranfoni-TIW) but enhances the user experience with modern web technologies.

-   **Single-Page Application (SPA)**: After login, the entire application runs on a single HTML page for both professors and students, with content being dynamically updated.
-   **Asynchronous Operations**: All communication with the server is done asynchronously using `XMLHttpRequest (AJAX)`. This means data is fetched and submitted in the background, providing a fast and fluid user experience.
-   **Client-Side Sorting**: The table of enrolled students can be sorted instantly by any column, as the logic is executed directly in the browser with JavaScript.
-   **Enhanced User Experience (UX)**:
    -   **Drag-and-Drop Rejection**: Students can reject a grade by dragging the result text and dropping it onto a "trash can" icon, followed by a confirmation prompt.
    -   **Multiple Grade Entry**: Professors can use a modal window (`finestra modale`) to input grades for multiple students at once, submitting them all in a single asynchronous request.

---

## 🛠️ Technology Stack

This project separates client-side and server-side concerns.

-   **Frontend**:
    -   `HTML5`: For the initial page structure.
    -   `CSS3`: For styling and layout.
    -   `JavaScript`: To handle all client-side logic, user interactions, DOM manipulation, and asynchronous communication.
-   **Backend (as a JSON API)**:
    -   `Java Servlets`: Now act as an API endpoint, responding with `JSON` data instead of HTML pages.
    -   `JavaBeans`: To model the application's data.
    -   `DAO (Data Access Object)`: To handle all database operations.
-   **Database**:
    -   `MySQL`: As the relational database management system.

---

## ⚙️ How It Works

The application is built on a **Single-Page Application (SPA)** architecture.

1.  The server initially sends a single, minimal HTML page along with the necessary CSS and JavaScript files.
2.  Once loaded, the **JavaScript** code takes over. It sends an `XMLHttpRequest` to a **Java Servlet** to fetch the initial data (e.g., list of courses).
3.  The Servlet retrieves data from the database and sends it back in **JSON format**.
4.  The client-side JavaScript parses this JSON and dynamically generates/updates the HTML of the page (the DOM) to display the content.
5.  All subsequent user actions (e.g., sorting, entering a grade) trigger JavaScript functions that either update the UI directly or make further asynchronous calls to the backend API.
