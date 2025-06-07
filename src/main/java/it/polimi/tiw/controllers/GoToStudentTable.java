package it.polimi.tiw.controllers;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.UnavailableException;
import jakarta.servlet.annotation.WebServlet;
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

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import it.polimi.tiw.beans.RegisteredStudent;
import it.polimi.tiw.beans.UserBean;
import it.polimi.tiw.daos.ExamDAO;
import it.polimi.tiw.daos.StudentTableDAO;


@WebServlet("/GoToStudentTable")
public class GoToStudentTable extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	private Gson gson;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public GoToStudentTable() {
        super();
        // TODO Auto-generated constructor stub
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
			gson = new Gson();

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
		UserBean user = null;
		HttpSession s = request.getSession();
		user = (UserBean) s.getAttribute("user");
		
		if (request.getParameter("selectedCourseID") == null || request.getParameter("date") == null) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().write("Missing parameters");
			return;
		}
		
		int selectedCourseID;
		String stringDate;
		
		try {
			selectedCourseID = Integer.parseInt(request.getParameter("selectedCourseID"));
			LocalDate date = LocalDate.parse(request.getParameter("date"), DateTimeFormatter.ISO_LOCAL_DATE);
			stringDate = request.getParameter("date");
		} catch (DateTimeParseException | NumberFormatException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().write("Error: wrong parameters!");
			return;
		}
		
		StudentTableDAO stDAO = new StudentTableDAO(connection);
		List<RegisteredStudent> students = new ArrayList<>();
		
		try {
			students = stDAO.getStudentTable(selectedCourseID, stringDate, user.getId());
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			return;
		}
		
		ExamDAO eDAO = new ExamDAO(connection);
		String courseName;
		
		try {
			courseName = eDAO.findExamName(selectedCourseID);
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			return;
		}
		
		JsonObject responseObject = new JsonObject();
		responseObject.add("students", gson.toJsonTree(students));
		responseObject.addProperty("courseName", courseName);
		responseObject.addProperty("date", stringDate);
		responseObject.addProperty("courseId", selectedCourseID);
		
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write(gson.toJson(responseObject));
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}
	
	public void destroy() {
		try {
			if (connection != null) {
				connection.close();
			}
		} catch (SQLException sqle) {
		}
	}

}
