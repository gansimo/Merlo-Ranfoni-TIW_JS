package it.polimi.tiw.daos;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalUnit;
import java.util.ArrayList;
import java.util.List;

import it.polimi.tiw.beans.RegisteredStudent;
import it.polimi.tiw.beans.VerbalBean;

public class VerbalDAO {
private Connection con;
	
	public VerbalDAO(Connection connection) {
		this.con = connection;
	}

	public VerbalBean createVerbal(int courseID, String examDate) throws SQLException {
		
		String query = "INSERT INTO Verbale (data_verbale, ora_verbale, id_corso, data) VALUES (?, ?, ?, ?)" ;
		VerbalBean verb = new VerbalBean();
		
		try (PreparedStatement pstatement = con.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);) {
			String actualDate = Date.valueOf(LocalDate.now()).toString();
			String actualHour = Timestamp.valueOf(LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS)).toString();
			pstatement.setDate(1, Date.valueOf(LocalDate.now()));
			pstatement.setTimestamp(2, Timestamp.valueOf(LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS)));
			pstatement.setInt(3, courseID);
			pstatement.setString(4, examDate);
			pstatement.executeUpdate();
			
			
			verb.setCourseID(courseID);
			verb.setExamDate(examDate);
			verb.setHour(actualHour);
			
			try (ResultSet rs = pstatement.getGeneratedKeys()) {
		        if (rs.next()) {
		            verb.setID(rs.getInt(1));
		        } else {
		            throw new SQLException("No row inserted");
		        }
			}
			
			verb.setDate(actualDate);
			
			return verb;
		}
	}
	
	public void insertNewVerbalizedStudents(List<RegisteredStudent> students, VerbalBean v) throws SQLException {
		int verbID = v.getID();
		for(RegisteredStudent stud : students) {
			String query = "INSERT INTO Studenti_Verbale (id_verbale, id_studente) VALUES (?, ?)";
			try (PreparedStatement pstatement = con.prepareStatement(query);) {
				pstatement.setInt(1, verbID);
				pstatement.setInt(2, stud.getId());

				pstatement.executeUpdate();
			}
		}
	}
	
	public List<VerbalBean> getVerbals(int profID) throws SQLException{
		List<VerbalBean> verbals = new ArrayList<VerbalBean>();
		
		String query = "SELECT \r\n"
				+ "    v.id,\r\n"
				+ "    v.data_verbale,\r\n"
				+ "    v.ora_verbale,\r\n"
				+ "    v.id_corso,\r\n"
				+ "    v.data,\r\n"
				+ "    c.nome\r\n"
				+ "FROM Verbale v\r\n"
				+ "JOIN Corso c \r\n"
				+ "  ON v.id_corso = c.id\r\n"
				+ "WHERE c.id_prof = ?\r\n"
				+ "ORDER BY \r\n"
				+ "  c.nome      ASC,\r\n"
				+ "  v.data      ASC;\r\n"
				+ "";
		
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setInt(1, profID);
			try (ResultSet result = pstatement.executeQuery()) {
                while (result.next()) {
                	VerbalBean verb = new VerbalBean();
                	verb.setCourseID(result.getInt("id_corso"));
                	verb.setDate(result.getDate("data_verbale").toString());
                	verb.setExamDate(result.getDate("data").toString());
                	verb.setHour(result.getTimestamp("ora_verbale").toString());
                	verb.setID(result.getInt("id"));
                	verb.setCourseName(result.getString("nome"));
                	
                	verbals.add(verb);
                }
			}
		}
		return verbals;
	}
	
	public VerbalBean getVerbal(int verbalID, int profID) throws SQLException {
		VerbalBean verb = new VerbalBean();
		String query = "SELECT\r\n"
				+ "    v.id,\r\n"
				+ "    v.data_verbale,\r\n"
				+ "    v.ora_verbale,\r\n"
				+ "    v.id_corso,\r\n"
				+ "    v.data,\r\n"
				+ "	   co.nome \r\n"
				+ "FROM Verbale AS v JOIN Corso AS co on v.id_corso = co.id \r\n"
				+ "WHERE v.id = ? AND co.id_prof = ? \r\n";

				
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setInt(1, verbalID);
			pstatement.setInt(2, profID);
			try (ResultSet result = pstatement.executeQuery()) {
                while (result.next()) {
                	verb.setCourseID(result.getInt("v.id_corso"));
                	verb.setDate(result.getDate("v.data_verbale").toString());
                	verb.setExamDate(result.getDate("v.data").toString());
                	verb.setHour(result.getTimestamp("v.ora_verbale").toString());
                	verb.setID(result.getInt("v.id"));
                	verb.setCourseName(result.getString("co.nome"));
                }
			}
		}
		return verb;
		
	}
	
}
