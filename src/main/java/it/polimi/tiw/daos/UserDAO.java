package it.polimi.tiw.daos;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import it.polimi.tiw.beans.UserBean;

public class UserDAO {
	private Connection con;

	public UserDAO(Connection connection) {
		this.con = connection;
	}

	public UserBean checkCredentials(String mail, String psw) throws SQLException {
		String query = "SELECT  id, mail, corso_laurea, nome, cognome FROM Utente  WHERE mail = ? AND psw = ?";
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setString(1, mail);
			pstatement.setString(2, psw);
			try (ResultSet result = pstatement.executeQuery();) {
				if (!result.isBeforeFirst()) // no results, credential check failed
					return null;
				else {
					result.next();
					UserBean user = new UserBean();
					user.setId(result.getInt("id"));
					user.setMail(result.getString("mail"));
					user.setCourse(result.getString("corso_laurea"));
					user.setName(result.getString("nome"));
					user.setSurname(result.getString("cognome"));
					
					return user;
				}
			}
		}
	}
}
