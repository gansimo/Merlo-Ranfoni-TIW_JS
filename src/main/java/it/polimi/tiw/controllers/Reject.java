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
		
		UserBean user = null;
		HttpSession s = request.getSession();
		user = (UserBean) s.getAttribute("user");

		String courseParam = request.getParameter("CourseSelect");
		String dateParam = request.getParameter("DataSelect");

		if(courseParam == null || dateParam == null) {
			response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "Error: you have not selected a course ID or an exam date!");
			return;
		}
		
		int selectedCourseID;
		try {
			selectedCourseID = Integer.parseInt(courseParam);
		} catch (NumberFormatException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().write("Invalid course ID");
			return;
		}
		
		LocalDate selectedExam;
		try {
			selectedExam =  LocalDate.parse(dateParam, DateTimeFormatter.ISO_LOCAL_DATE);
		} catch (DateTimeParseException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().write("Invalid exam date");
			return;
		}

		ExamDAO eDAO = new ExamDAO(connection);
		String data = dateParam;
		
		try {
			eDAO.rejectMark(selectedCourseID, data, user.getId());
			response.setStatus(HttpServletResponse.SC_OK);
		} catch (SQLException e) {
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
