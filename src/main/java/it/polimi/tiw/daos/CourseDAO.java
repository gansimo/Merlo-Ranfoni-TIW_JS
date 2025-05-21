package it.polimi.tiw.daos;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import it.polimi.tiw.beans.Exam;

public class CourseDAO{
	private Connection con;

	public CourseDAO(Connection connection) {
		this.con = connection;
	}
	
	
	public List<Exam> findStudentExams(int courseID, int studID) throws SQLException {
		List<Exam> exams = new ArrayList<Exam>();
		String query = "SELECT data \n"
				+ "FROM Iscrizioni_Appello \n"
				+ "WHERE id_corso = ? AND id_studente = ?; \n";
		try (PreparedStatement pstatement = con.prepareStatement(query)) {
	        pstatement.setInt(1, courseID);
	        pstatement.setInt(2, studID);
	        
	        try (ResultSet result = pstatement.executeQuery()) {
	            while (result.next()) {
	                Exam exam = new Exam();
	                exams.add(exam);
	            }
	        }
	    }
		return exams;
	}
	
}