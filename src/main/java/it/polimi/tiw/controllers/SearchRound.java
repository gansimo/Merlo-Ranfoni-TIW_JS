package it.polimi.tiw.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.UnavailableException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;


import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.WebContext;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.WebApplicationTemplateResolver;
import org.thymeleaf.web.servlet.JakartaServletWebApplication;

import it.polimi.tiw.beans.UserBean;
import it.polimi.tiw.beans.*;
import it.polimi.tiw.daos.*;



@WebServlet("/SearchRound")
@MultipartConfig
public class SearchRound extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	private TemplateEngine templateEngine;
	private Gson gson;

	public SearchRound() {
		super();
		// TODO Auto-generated constructor stub
	}

	public void init() throws ServletException {
		ServletContext servletContext = getServletContext();
		JakartaServletWebApplication webApplication = JakartaServletWebApplication.buildApplication(servletContext);
		WebApplicationTemplateResolver templateResolver = new WebApplicationTemplateResolver(webApplication);
		templateResolver.setTemplateMode(TemplateMode.HTML);
		this.templateEngine = new TemplateEngine();
		this.templateEngine.setTemplateResolver(templateResolver);
		templateResolver.setSuffix(".html");
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
		gson = new Gson();
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
		
		if(request.getParameter("CourseSelect") == null || request.getParameter("DataSelect") == null) {
			response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "Error: you have not selected a course ID or an exam date!");
			return;
		}
		
		int selectedCourseID;
		try {
			selectedCourseID = Integer.parseInt(request.getParameter("CourseSelect"));
		} catch (NumberFormatException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().write("Invalid course ID");
			return;
		}
		
		LocalDate selectedExam;
		try {
			selectedExam =  LocalDate.parse(request.getParameter("DataSelect"), DateTimeFormatter.ISO_LOCAL_DATE);
		} catch (DateTimeParseException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().write("Invalid exam date");
			return;
		}
				
		ExamDAO eDAO = new ExamDAO(connection);
		ExamResult examResult = null;
		String data = request.getParameter("DataSelect");
		
		try {
			examResult = eDAO.findExamData(selectedCourseID, data, user.getId());
			if(examResult.getMark() == null) {
				response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "Error: you are not subscribed to that exam!");
				return;
			}
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			response.getWriter().write(gson.toJson(examResult));
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "Failure in database finding exam result");
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

