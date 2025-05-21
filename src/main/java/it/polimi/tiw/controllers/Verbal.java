package it.polimi.tiw.controllers;

import jakarta.servlet.RequestDispatcher;
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

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.WebContext;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.WebApplicationTemplateResolver;
import org.thymeleaf.web.servlet.JakartaServletWebApplication;

import it.polimi.tiw.beans.RegisteredStudent;
import it.polimi.tiw.beans.UserBean;
import it.polimi.tiw.beans.VerbalBean;
import it.polimi.tiw.daos.StudentTableDAO;
import it.polimi.tiw.daos.VerbalDAO;

/**
 * Servlet implementation class Verbal
 */
@WebServlet("/Verbal")
public class Verbal extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private TemplateEngine templateEngine;
	private Connection connection = null;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Verbal() {
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
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
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
		
		if(request.getParameter("selectedCourseID") == null || request.getParameter("date") == null) {
			response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "You have not selected a course or a date!");
			return;
		}
		
		int selectedCourseID;
		
		try {
		selectedCourseID =  Integer.parseInt(request.getParameter("selectedCourseID"));
		LocalDate date = LocalDate.parse(request.getParameter("date"), DateTimeFormatter.ISO_LOCAL_DATE);
		}catch (DateTimeParseException | NumberFormatException e) {
			response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "SQL injection is forbidden!");
			return;
		}
		
		String selectedDate = request.getParameter("date");
		StudentTableDAO stDAO = new StudentTableDAO(connection);
		List<RegisteredStudent> students = new ArrayList<>();
		
		try {
			students = stDAO.getNewVerbalizedStudents(selectedCourseID, selectedDate, u.getId());
			System.out.println("ciao");
		} catch (SQLException e) {
			//throw new ServletException(e);
			response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "Failure in database finding student table");
			return;
 		}
		
		if(students.isEmpty()) {		//the last query works only if the current logged user is trying to verbalize HIS students. If he forces wrong parameters, the query returns an empty list.
			response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "Error: you are trying to create an empty verbal");
			return;		//returning i ensure that if this check is passed, the other queries are automatically authorized
		}
		
		VerbalDAO vDAO = new VerbalDAO(connection);
		VerbalBean newVerbal = new VerbalBean();
		
		try {
			newVerbal = vDAO.createVerbal(selectedCourseID, selectedDate);
			System.out.println("ciao");
		} catch (SQLException e) {
			//throw new ServletException(e);
			response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "Failure in database creating a new verbal");
			return;
 		}
		
		try {
			vDAO.insertNewVerbalizedStudents(students, newVerbal);
			System.out.println("ciao");
		} catch (SQLException e) {
			//throw new ServletException(e);
			response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "Failure in database adding students to the new verbal");
			return;
 		}
		
		response.sendRedirect(request.getContextPath() + "/GoToVerbalPage?verbalID=" + newVerbal.getID() + "&isNew=true");
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
