package it.polimi.tiw.beans;

public class Course {
	private int id;
	private String courseName;
	private String profName;
	private String profSurname;

	public int getId() {
		return id;
	}

	public String getCourseName() {
		return courseName;
	}
	
	public String getProfName() {
		return profName;
	}
	
	public String getProfSurname() {
		return profSurname;
	}
	
	public void setId(int i) {
		id = i;
	}

	public void setCourseName(String nc) {
		courseName = nc;
	}
	
	public void setProfName(String np) {
		profName = np;
	}
	
	public void setProfSurname(String cp) {
		profSurname =  cp;
	}
	

}