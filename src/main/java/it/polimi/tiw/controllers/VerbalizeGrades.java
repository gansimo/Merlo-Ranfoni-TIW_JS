package it.polimi.tiw.controllers;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.UnavailableException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

import it.polimi.tiw.beans.RegisteredStudent;
import it.polimi.tiw.beans.UserBean;
import it.polimi.tiw.beans.VerbalBean;
import it.polimi.tiw.daos.StudentTableDAO;
import it.polimi.tiw.daos.VerbalDAO;

/**
 * Servlet implementation class VerbalizeGrades
 */
@WebServlet("/VerbalizeGrades")
@MultipartConfig
public class VerbalizeGrades extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public VerbalizeGrades() {
        super();
    }
    
    public void init() throws ServletException {
		try {
			ServletContext context = getServletContext();
			String driver = context.getInitParameter("dbDriver");
			String url = context.getInitParameter("dbUrl");
			String user = context.getInitParameter("dbUser");
			String password = context.getInitParameter("dbPassword");
			Class.forName(driver);
			connection = DriverManager.getConnection(url, user, password);
		} catch (ClassNotFoundException e) {
			throw new UnavailableException("Can't load database driver");
		} catch (SQLException e) {
			throw new UnavailableException("Couldn't get db connection");
		}
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED, "GET method not supported");
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		HttpSession session = request.getSession(false);
		if (session == null || session.getAttribute("user") == null) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.getWriter().write("Unauthorized");
			return;
		}

		UserBean user = (UserBean) session.getAttribute("user");
		if (!user.getCourse().equals("Docente")) {
			response.setStatus(HttpServletResponse.SC_FORBIDDEN);
			response.getWriter().write("Forbidden");
			return;
		}

		String selectedCourseID = request.getParameter("selectedCourseID");
		String date = request.getParameter("date");

		if (selectedCourseID == null || date == null) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().write("Missing parameters");
			return;
		}

		try {
			int courseId = Integer.parseInt(selectedCourseID);
			LocalDate.parse(date, DateTimeFormatter.ISO_LOCAL_DATE);

			StudentTableDAO stDAO = new StudentTableDAO(connection);
			int updated = stDAO.verbalizeGrades(courseId, date, user.getId());

			response.setContentType("text/plain");
			response.setCharacterEncoding("UTF-8");

			if (updated > 0) {
				// Get students to be verbalized
				List<RegisteredStudent> students = stDAO.getNewVerbalizedStudents(courseId, date, user.getId());
				
				if (students.isEmpty()) {
					response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
					response.getWriter().write("No students to verbalize");
					return;
				}

				// Create new verbal
				VerbalDAO vDAO = new VerbalDAO(connection);
				VerbalBean newVerbal = vDAO.createVerbal(courseId, date);
				
				// Insert students into verbal
				vDAO.insertNewVerbalizedStudents(students, newVerbal);

				// Return success with verbal ID
				response.getWriter().write("success:" + newVerbal.getID());
			} else {
				response.getWriter().write("no_grades_to_verbalize");
			}

		} catch (DateTimeParseException | NumberFormatException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().write("Invalid parameters");
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().write("Database error");
		}
	}
	
	public void destroy() {
		try {
			if (connection != null) {
				connection.close();
			}
		} catch (SQLException sqle) {
			// Log error
		}
	}

}
