package it.polimi.tiw.beans;

public class RegisteredStudent {
	private int id;
	private String mail;
	private String course;
	private String name;
	private String surname;
	private String matr;
	private String grade;
	private String state;

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
	
	public String getMatr() {
		return matr;
	}
	
	public String getGrade() {
		return grade;
	}
	
	public String getState() {
		return state;
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
	
	public void setMatr(String m) {
		matr = m;
	}
	
	public void setGrade(String g) {
		grade = g;
	}
	
	public void setState(String s) {
		state = s;
	}
}
