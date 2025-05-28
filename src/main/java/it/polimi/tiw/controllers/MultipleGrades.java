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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import it.polimi.tiw.beans.UserBean;
import it.polimi.tiw.daos.StudentTableDAO;

/**
 * Servlet implementation class MultipleGrades
 */
@WebServlet("/MultipleGrades")
@MultipartConfig
public class MultipleGrades extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private Connection connection = null;
    private Gson gson;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public MultipleGrades() {
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

        String courseIdStr = request.getParameter("courseId");
        String date = request.getParameter("date");
        String gradesJson = request.getParameter("grades");

        if (courseIdStr == null || date == null || gradesJson == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Missing parameters");
            return;
        }

        try {
            int courseId = Integer.parseInt(courseIdStr);
            
            // Parse the JSON array of grades using Map instead of inner class
            // TypeToken è necessario per gestire i generics a runtime
            List<Map<String, String>> grades = gson.fromJson(gradesJson, 
                new TypeToken<ArrayList<Map<String, String>>>(){}.getType());
            
            if (grades.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("No grades provided");
                return;
            }

            // Validate all grades before processing
            for (Map<String, String> entry : grades) {
                String grade = entry.get("grade");
                // Validazione diretta del voto
                if (!grade.equals("assente") && !grade.equals("rimandato") && 
                    !grade.equals("riprovato") && !grade.equals("30 e lode")) {
                    try {
                        int gradeValue = Integer.parseInt(grade);
                        if (gradeValue < 18 || gradeValue > 30) {
                            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                            response.getWriter().write("Invalid grade: " + grade);
                            return;
                        }
                    } catch (NumberFormatException e) {
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        response.getWriter().write("Invalid grade: " + grade);
                        return;
                    }
                }
            }

            // Process all grades
            StudentTableDAO stDAO = new StudentTableDAO(connection);
            for (Map<String, String> entry : grades) {
                String studentId = entry.get("studentId");
                int studID = Integer.parseInt(studentId);
                String grade = entry.get("grade");
                stDAO.updateGrade(courseId, date, studID, grade, "inserito", user.getId());
            }

            // Return success response
            response.setContentType("text/plain");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("success");

        } catch (NumberFormatException e) {
            e.printStackTrace();
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
