package it.polimi.tiw.controllers;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.UnavailableException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

import jakarta.servlet.http.HttpSession;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.WebContext;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.WebApplicationTemplateResolver;
import org.thymeleaf.web.servlet.JakartaServletWebApplication;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.beans.Course;
import it.polimi.tiw.beans.Exam;
import it.polimi.tiw.beans.UserBean;
import it.polimi.tiw.daos.CourseDAO;
import it.polimi.tiw.daos.ProfessorDAO;


/**
 * Servlet implementation class HomeProfessor
 */
@WebServlet("/GetProfessorExams")
public class GetProfessorExams extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	public GetProfessorExams() {
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

		String loginpath = getServletContext().getContextPath() + "/index.html";
		UserBean u = null;
		HttpSession s = request.getSession();
		if (s.isNew() || s.getAttribute("user") == null) {
			response.sendRedirect(loginpath);
			return;
		} else {
			u = (UserBean) s.getAttribute("user");
			if (!u.getCourse().equals("Docente")) {
				response.sendRedirect(loginpath);
				return;
			}
		}
		
		int selectedCourseID;
		
		try {
		selectedCourseID = Integer.parseInt(request.getParameter("selectedCourseID"));
		}catch (NumberFormatException e) {
			response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "SQL injection is forbidden!");
			return;
		}

		CourseDAO cDAO = new CourseDAO(connection);
		List<Exam> exams = new ArrayList<>();
		
		try {
			exams = cDAO.findExams(selectedCourseID, u.getId());
			System.out.println("ciao");
		} catch (SQLException e) {
			throw new ServletException(e);
			//response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "Failure in database finding professor courses");
 		}
		
		Gson gson = new GsonBuilder().setDateFormat("yyyy/MM/dd").create();
		String json = gson.toJson(exams);
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
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
