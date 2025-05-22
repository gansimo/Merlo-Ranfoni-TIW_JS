package it.polimi.tiw.controllers;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.UnavailableException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;

import jakarta.servlet.http.HttpSession;
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
@WebServlet("/GoToHomeProfessor")
@MultipartConfig
public class GoToHomeProfessor extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	private Gson gson;

	public GoToHomeProfessor() {
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
			gson = new GsonBuilder().setDateFormat("yyyy/MM/dd").create();
		} catch (ClassNotFoundException e) {
			throw new UnavailableException("Can't load database driver");
		} catch (SQLException e) {
			throw new UnavailableException("Couldn't get db connection");
		}
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
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
		
		ProfessorDAO pDAO = new ProfessorDAO(connection);
		List<Course> courses;
		try {
			courses = pDAO.findProfessorCourses(user.getId());
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			response.getWriter().write(gson.toJson(courses));
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().write("Database error");
		}
	}

	
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

		int selectedCourseID;
		try {
			selectedCourseID = Integer.parseInt(request.getParameter("courseSelect"));
		} catch (NumberFormatException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().write("Invalid course ID");
			return;
		}

		CourseDAO cDAO = new CourseDAO(connection);
		List<Exam> exams;
		try {
			exams = cDAO.findExams(selectedCourseID, user.getId());
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			response.getWriter().write(gson.toJson(exams));
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
		}
	}

}