package it.polimi.tiw.controllers;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.UnavailableException;
import jakarta.servlet.annotation.MultipartConfig;
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

import it.polimi.tiw.beans.UserBean;
import it.polimi.tiw.daos.StudentTableDAO;

/**
 * Servlet implementation class EditGrade
 */
@WebServlet("/EditGrade")
@MultipartConfig
public class EditGrade extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public EditGrade() {
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
    	UserBean user = null;
		HttpSession s = request.getSession();
		user = (UserBean) s.getAttribute("user");

        String selectedCourseID = request.getParameter("selectedCourseID");
        String selectedStudentID = request.getParameter("selectedStudentID");
        String date = request.getParameter("date");
        String newGrade = request.getParameter("newGrade");

        if (selectedCourseID == null || selectedStudentID == null || date == null || newGrade == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Missing parameters");
            return;
        }

        try {
            int courseId = Integer.parseInt(selectedCourseID);
            int studentId = Integer.parseInt(selectedStudentID);
            LocalDate locDate = LocalDate.parse(request.getParameter("date"), DateTimeFormatter.ISO_LOCAL_DATE);

            if (!newGrade.equals("assente") && !newGrade.equals("rimandato") && !newGrade.equals("riprovato") && !newGrade.equals("30 e lode")) {
                int gradeValue = Integer.parseInt(newGrade);
                if (gradeValue < 18 || gradeValue > 30) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().write("Invalid grade");
                    return;
                }
            }

            StudentTableDAO stDAO = new StudentTableDAO(connection);
            stDAO.updateGrade(courseId, date, studentId, newGrade, "inserito", user.getId());

            // Return success response
            response.setContentType("text/plain");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("success");

        } catch (DateTimeParseException | NumberFormatException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Invalid parameters");
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error: cannot find any of your students with this parameters!");
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
