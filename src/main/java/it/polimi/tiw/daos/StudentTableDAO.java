package it.polimi.tiw.daos;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import it.polimi.tiw.beans.RegisteredStudent;

public class StudentTableDAO {
	private Connection con;
	
	public StudentTableDAO(Connection connection) {
		this.con = connection;
	}
	
	public List<RegisteredStudent> getStudentTable(int courseID, String date, int profID) throws SQLException {
		List<RegisteredStudent> students = new ArrayList<>();
		
		String query = "SELECT \n"
				+ "u.id, u.matricola, u.cognome, u.nome, u.mail, u.corso_laurea, i.voto, i.stato \n"
				+ "FROM \n"
				+ "Iscrizioni_Appello AS i JOIN Utente AS u ON i.id_studente = u.id \n"
				+ "WHERE \n"
				+ "i.id_corso = ? AND i.data = ? AND \n"
				+ "EXISTS(\n"
				+ "		SELECT *\n"
				+ "        FROM Corso as c\n"
				+ "        WHERE c.id_prof = ? AND c.id = i.id_corso\n"
				+ "        ) ";
		
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setInt(1, courseID);
			pstatement.setString(2, date);
			pstatement.setInt(3, profID);
			try (ResultSet result = pstatement.executeQuery()) {
                while (result.next()) {
                    RegisteredStudent stud = new RegisteredStudent();
                    stud.setId(result.getInt("id"));
                    stud.setMatr(result.getString("matricola"));
                    stud.setSurname(result.getString("cognome"));
                    stud.setName(result.getString("nome"));
                    stud.setMail(result.getString("mail"));
                    stud.setCourse(result.getString("corso_laurea"));
                    stud.setGrade(result.getString("voto"));
                    stud.setState(result.getString("stato"));
                    
                    students.add(stud);
                }
            }
		return students;
		}
	}
	
	public void updateGrade(int courseID, String date, int studID, String grade, String state, int profID) throws SQLException {
		String query = "UPDATE Iscrizioni_Appello SET voto = ?, stato = ? \n"
				+ "WHERE id_studente = ? AND id_corso = ? AND data = ? AND (stato = ? OR stato = ?) AND \n"
				+ "EXISTS( \n"
				+ "		   SELECT * \n"
				+ "        FROM Corso as c \n"
				+ "        WHERE c.id_prof = ? AND c.id = id_corso \n"
				+ "        ) ";
		
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setString(1, grade);
			pstatement.setString(2, state);
			pstatement.setInt(3, studID);
			pstatement.setInt(4, courseID);
			pstatement.setString(5, date);
			pstatement.setString(6, "inserito");
			pstatement.setString(7, "non inserito");
			pstatement.setInt(8, profID);

			int updated = pstatement.executeUpdate();
		    if (updated == 0) {
		      throw new SQLException("Nessuna riga aggiornata");
		    }
		}
	}
	
	public int publishGrades(int courseID, String date, int profID) throws SQLException {
		int updated;
		String query = "UPDATE Iscrizioni_Appello SET stato = ? \n"
				+ "WHERE id_corso = ? AND data = ? AND stato = 'inserito' AND \n"
				+ "EXISTS( \n"
				+ "		   SELECT * \n"
				+ "        FROM Corso as c \n"
				+ "        WHERE c.id_prof = ? AND c.id = id_corso \n"
				+ "        ) ";
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setString(1, "pubblicato");
			pstatement.setInt(2, courseID);
			pstatement.setString(3, date);
			pstatement.setInt(4, profID);
			updated = pstatement.executeUpdate();
		}
		return updated;
	}
	
	public int verbalizeGrades(int courseID, String date, int profID) throws SQLException {
		String query = "UPDATE Iscrizioni_Appello SET stato = ? \n"
				+ "WHERE id_corso = ? AND data = ? AND (stato = 'pubblicato' OR stato = 'rifiutato') AND \n"
				+ "EXISTS( \n"
				+ "		   SELECT * \n"
				+ "        FROM Corso as c \n"
				+ "        WHERE c.id_prof = ? AND c.id = id_corso \n"
				+ "        ) ";
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setString(1, "verbalizzato");
			pstatement.setInt(2, courseID);
			pstatement.setString(3, date);
			pstatement.setInt(4, profID);
			
			return pstatement.executeUpdate();
		}
	}
	
	public List<RegisteredStudent> getNewVerbalizedStudents(int courseID, String date, int profID) throws SQLException {
		List<RegisteredStudent> students = new ArrayList<>();
		
		String query = "SELECT \n"
				+ "    u.id,\n"
				+ "    u.matricola,\n"
				+ "    u.cognome,\n"
				+ "    u.nome,\n"
				+ "    u.mail,\n"
				+ "    u.corso_laurea,\n"
				+ "    i.voto,\n"
				+ "    i.stato\n"
				+ "FROM Iscrizioni_Appello AS i\n"
				+ "JOIN Utente AS u \n"
				+ "    ON i.id_studente = u.id\n"
				+ "\n"
				+ "WHERE \n"
				+ "    i.id_corso = ? \n"
				+ "    AND i.data = ? \n"
				+ "	   AND i.stato = 'verbalizzato'\n"
				+ "    AND NOT EXISTS (\n"
				+ "        SELECT *\n"
				+ "        FROM Studenti_Verbale AS sv JOIN Verbale AS v\n"
				+ "        WHERE sv.id_verbale  = v.id\n"
				+ "          AND sv.id_studente = u.id\n"
				+ "    ) \n"
				+ "    AND EXISTS( \n"
				+ "		   SELECT * \n"
				+ "        FROM Corso as c \n"
				+ "        WHERE c.id_prof = ? AND c.id = i.id_corso \n"
				+ "        ) ";
		
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setInt(1, courseID);
			pstatement.setString(2, date);
			pstatement.setInt(3, profID);
			try (ResultSet result = pstatement.executeQuery()) {
                while (result.next()) {
                    RegisteredStudent stud = new RegisteredStudent();
                    stud.setId(result.getInt("id"));
                    stud.setMatr(result.getString("matricola"));
                    stud.setSurname(result.getString("cognome"));
                    stud.setName(result.getString("nome"));
                    stud.setMail(result.getString("mail"));
                    stud.setCourse(result.getString("corso_laurea"));
                    stud.setGrade(result.getString("voto"));
                    stud.setState(result.getString("stato"));
                    
                    students.add(stud);
                }
            }
		return students;
		}
	}
	
	public List<RegisteredStudent> getStudentsFromVerbal(int verbalID) throws SQLException {
		List<RegisteredStudent> students = new ArrayList<>();
		String query = "SELECT \n"
				+ "  u.matricola          AS matr,\n"
				+ "  u.nome        AS nome,\n"
				+ "  u.cognome     AS cognome,\n"
				+ "  u.mail       AS email,\n"
				+ "  ia.voto       AS voto\n"
				+ "FROM Verbale v\n"
				+ "  JOIN Studenti_Verbale sv\n"
				+ "    ON v.id = sv.id_verbale\n"
				+ "  JOIN Utente u\n"
				+ "    ON sv.id_studente = u.id\n"
				+ "  JOIN Iscrizioni_Appello ia\n"
				+ "    ON ia.id_corso   = v.id_corso\n"
				+ "   AND ia.data       = v.data\n"
				+ "   AND ia.id_studente= u.id\n"
				+ "WHERE v.id = ?\n"
				+ "ORDER BY\n"
				+ "  u.cognome ASC,\n"
				+ "  u.nome    ASC\n"
				+ ";\n"
				+ "";
		
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setInt(1, verbalID);
			try (ResultSet result = pstatement.executeQuery()) {
                while (result.next()) {
                    RegisteredStudent stud = new RegisteredStudent();
                    stud.setMatr(result.getString("matr"));
                    stud.setSurname(result.getString("cognome"));
                    stud.setName(result.getString("nome"));
                    stud.setMail(result.getString("email"));
                    stud.setGrade(result.getString("voto"));
                    
                    students.add(stud);
                }
            }
		return students;
		}
		
	}	
	
}
