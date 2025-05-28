package it.polimi.tiw.daos;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import it.polimi.tiw.beans.Course;

public class StudentDAO {
    private Connection con;
    private int studentID;

    public StudentDAO(Connection connection) {
        this.con = connection;
    }

    public List<Course> findStudentCourses(int studID) throws SQLException {
        List<Course> courses = new ArrayList<>();
        String query = "SELECT c.id, c.nome, u.nome AS prof_nome, u.cognome AS prof_cognome \n" +
                       "FROM Corso AS c \n" +
                       "JOIN Iscrizioni_corsi AS ic ON ic.id_corso = c.id \n" +
                       "JOIN Utente AS u ON c.id_prof = u.id \n" +
                       "WHERE ic.id_studente = ? \n" +
                       "ORDER BY c.nome DESC;";

        try (PreparedStatement pstatement = con.prepareStatement(query)) {
            pstatement.setInt(1, studID);
            try (ResultSet result = pstatement.executeQuery()) {
                while (result.next()) {
                    Course course = new Course();
                    course.setId(result.getInt("id"));
                    course.setCourseName(result.getString("nome"));
                    course.setProfName(result.getString("prof_nome"));
                    course.setProfSurname(result.getString("prof_cognome"));
                    courses.add(course);
                }
            }
        }
        return courses;
    }
}