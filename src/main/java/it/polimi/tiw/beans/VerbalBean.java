package it.polimi.tiw.beans;

public class VerbalBean {
	private int id;
	private String date;
	private String hour;
	private int courseID;
	private String examDate;
	private String courseName;
	
	public void setID(int i) {
		this.id = i;
	}
	
	public void setDate(String d) {
		this.date = d;
	}
	
	public void setHour(String h) {
		this.hour = h;
	}
	
	public void setCourseID(int i) {
		this.courseID = i;
	}
	
	public void setExamDate(String d) {
		this.examDate = d;
	}
	
	public void setCourseName(String n) {
		this.courseName = n;
	}
	
	
	public int getID() {
		return this.id;
	}
	
	public int getCourseID() {
		return courseID;
	}
	
	public String getDate() {
		return date;
	}
	
	public String getHour() {
		return hour;
	}
	
	public String getExamDate() {
		return examDate;
	}
	
	public String getCourseName() {
		return courseName;
	}
}
