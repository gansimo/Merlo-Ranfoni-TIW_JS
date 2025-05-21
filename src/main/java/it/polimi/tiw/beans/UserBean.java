package it.polimi.tiw.beans;

public class UserBean {
	private int id;
	private String mail;
	private String course;
	private String name;
	private String surname;

	public int getId() {
		return id;
	}

	public String getMail() {
		return mail;
	}
	
	public String getCourse() {
		return course;
	}
	
	public String getName() {
		return name;
	}
	
	public String getSurname() {
		return surname;
	}
	
	public void setId(int i) {
		id = i;
	}

	public void setMail(String m) {
		mail = m;
	}
	
	public void setCourse(String c) {
		course = c;
	}
	
	public void setName(String n) {
		name = n;
	}
	
	public void setSurname(String s) {
		surname = s;
	}

}
