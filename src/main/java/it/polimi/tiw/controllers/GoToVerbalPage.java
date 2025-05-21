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
import java.util.ArrayList;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.beans.RegisteredStudent;
import it.polimi.tiw.beans.UserBean;
import it.polimi.tiw.beans.VerbalBean;
import it.polimi.tiw.daos.StudentTableDAO;
import it.polimi.tiw.daos.VerbalDAO;

/**
 * Servlet implementation class GoToVerbalPage
 */
@WebServlet("/GoToVerbalPage")
public class GoToVerbalPage extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	private Gson gson;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public GoToVerbalPage() {
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
			
			gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
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
		System.out.println("GoToVerbalPage: Received request");
		
		HttpSession session = request.getSession(false);
		if (session == null || session.getAttribute("user") == null) {
			System.out.println("GoToVerbalPage: Unauthorized - No session");
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.getWriter().write("Unauthorized");
			return;
		}

		UserBean user = (UserBean) session.getAttribute("user");
		if (!user.getCourse().equals("Docente")) {
			System.out.println("GoToVerbalPage: Forbidden - Not a professor");
			response.setStatus(HttpServletResponse.SC_FORBIDDEN);
			response.getWriter().write("Forbidden");
			return;
		}
		
		String verbalIdParam = request.getParameter("verbalID");
		if(verbalIdParam == null) {
			System.out.println("GoToVerbalPage: Bad request - Missing verbal ID");
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().write("Missing verbal ID");
			return;
		}
		
		try {
			int verbID = Integer.parseInt(verbalIdParam);
			System.out.println("GoToVerbalPage: Processing verbal ID: " + verbID);
			
			VerbalDAO vDAO = new VerbalDAO(connection);
			VerbalBean verb = vDAO.getVerbal(verbID, user.getId());
			
			if(verb.getExamDate() == null) {
				System.out.println("GoToVerbalPage: Forbidden - Verbal not found or not authorized");
				response.setStatus(HttpServletResponse.SC_FORBIDDEN);
				response.getWriter().write("Not authorized to view this verbal");
				return;
			}
			
			StudentTableDAO stDAO = new StudentTableDAO(connection);
			List<RegisteredStudent> students = stDAO.getStudentsFromVerbal(verbID);
			
			System.out.println("GoToVerbalPage: Found verbal and " + students.size() + " students");
			
			// Send response as text with verbal and students data
			response.setContentType("text/plain");
			response.setCharacterEncoding("UTF-8");
			String verbalJson = gson.toJson(verb);
			String studentsJson = gson.toJson(students);
			String responseText = verbalJson + "|||" + studentsJson;
			System.out.println("GoToVerbalPage: Sending response: " + responseText);
			response.getWriter().write(responseText);
			
		} catch (NumberFormatException e) {
			System.out.println("GoToVerbalPage: Bad request - Invalid verbal ID");
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().write("Invalid verbal ID");
		} catch (SQLException e) {
			System.out.println("GoToVerbalPage: Database error: " + e.getMessage());
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().write("Database error");
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED, "POST method not supported");
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
