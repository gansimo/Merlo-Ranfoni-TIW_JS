package it.polimi.tiw.controllers;

import java.io.IOException;
import java.net.URLEncoder;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.UnavailableException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import it.polimi.tiw.beans.UserBean;
import it.polimi.tiw.beans.*;
import it.polimi.tiw.daos.*;

@WebServlet("/Reject")
@MultipartConfig
public class Reject extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	public Reject() {
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
		} catch (ClassNotFoundException e) {
			throw new UnavailableException("Can't load database driver");
		} catch (SQLException e) {
			throw new UnavailableException("Couldn't get db connection");
		}
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		HttpSession session = request.getSession(false);
		if (session == null || session.getAttribute("user") == null) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.getWriter().write("Unauthorized");
			return;
		}
		
		UserBean user = (UserBean) session.getAttribute("user");
		if (user.getCourse().equals("Docente")) {
			System.out.println("prova1");
			response.setStatus(HttpServletResponse.SC_FORBIDDEN);
			response.getWriter().write("Forbidden");
			return;
		}

		// Debug: print all parameters
		System.out.println("[DEBUG] Received parameters:");
		request.getParameterMap().forEach((k, v) -> System.out.println("  " + k + " = " + java.util.Arrays.toString(v)));

		String courseParam = request.getParameter("CourseSelect");
		String dateParam = request.getParameter("DataSelect");
		System.out.println("[DEBUG] CourseSelect: " + courseParam);
		System.out.println("[DEBUG] DataSelect: " + dateParam);

		if(courseParam == null || dateParam == null) {
			System.out.println("[DEBUG] Missing CourseSelect or DataSelect parameter");
			response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "Error: you have not selected a course ID or an exam date!");
			return;
		}
		
		int selectedCourseID;
		try {
			selectedCourseID = Integer.parseInt(courseParam);
		} catch (NumberFormatException e) {
			System.out.println("[DEBUG] Invalid course ID: " + courseParam);
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().write("Invalid course ID");
			return;
		}
		
		LocalDate selectedExam;
		try {
			selectedExam =  LocalDate.parse(dateParam, DateTimeFormatter.ISO_LOCAL_DATE);
		} catch (DateTimeParseException e) {
			System.out.println("[DEBUG] Invalid exam date: " + dateParam);
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().write("Invalid exam date");
			return;
		}

		ExamDAO eDAO = new ExamDAO(connection);
		String data = dateParam;
		
		try {
			eDAO.rejectMark(selectedCourseID, data, user.getId());
			System.out.println("[DEBUG] Mark rejected successfully for course " + selectedCourseID + " and date " + data);
			response.setStatus(HttpServletResponse.SC_OK);
		} catch (SQLException e) {
			System.out.println("[DEBUG] SQL Exception: " + e.getMessage());
			response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "Failure in database rejecting the mark");
		}
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
