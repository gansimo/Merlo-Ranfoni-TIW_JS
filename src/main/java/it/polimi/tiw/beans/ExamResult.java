package it.polimi.tiw.beans;

import java.time.LocalDate;

public class ExamResult {
	private int courseId;
	private String date;
	private int studentId;
	private String mark;
	private String state;
	private String courseName;
	
	public void setCourseId(int cid){
		courseId = cid;
	}
	
	public void setDate(String d) {
		date = d;
	}
	
	public void setStudentId(int si) {
		studentId = si;
	}
	
	public void setMark(String m) {
		mark = m;
	}
	
	public void setState(String s) {
		state = s;
	}
	
	public int getCourseId() {
		return courseId;
	}
	
	public String getDate() {
		return date;
	}
	
	public int getStudId() {
		return studentId;
	}
	
	public String getMark() {
		return mark;
	}
	
	public String getState() {
		return state;
	}
	
	public String getCourseName() {
		return this.courseName;
	}
	
	public void setCourseName(String cn) {
		this.courseName = cn;
	}
}
