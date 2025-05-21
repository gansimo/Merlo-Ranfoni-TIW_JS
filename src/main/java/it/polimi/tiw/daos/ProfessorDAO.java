package it.polimi.tiw.daos;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import it.polimi.tiw.beans.Course;

public class ProfessorDAO {
	private Connection con;
	
	public ProfessorDAO(Connection connection) {
		this.con = connection;
	}
	
	public List<Course> findProfessorCourses(int profID) throws SQLException {
		List<Course> courses = new ArrayList<>();
		
		String query = "SELECT id, nome FROM Corso Where id_prof = ?";
		
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setInt(1, profID);
			try (ResultSet result = pstatement.executeQuery()) {
                while (result.next()) {
                    Course course = new Course();
                    course.setId(result.getInt("id"));
                    course.setCourseName(result.getString("nome"));
                    courses.add(course);
                }
            }
		return courses;
		}
	}
}
