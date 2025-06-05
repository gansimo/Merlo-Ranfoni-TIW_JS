package it.polimi.tiw.filters;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

import it.polimi.tiw.beans.UserBean;

/**
 * Servlet Filter implementation class StudentAuthFilter
 */
public class StudentAuthFilter extends HttpFilter implements Filter {
private static final long serialVersionUID = 1L;   
	
    /**
     * @see HttpFilter#HttpFilter()
     */
    public StudentAuthFilter() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see Filter#destroy()
	 */
	public void destroy() {
		// TODO Auto-generated method stub
	}

	/**
	 * @see Filter#doFilter(ServletRequest, ServletResponse, FilterChain)
	 */
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        HttpSession s = req.getSession(false); //false per non creare una nuova sessione se non esiste

        String loginpath = req.getServletContext().getContextPath() + "/index.html";

        if (s == null || s.getAttribute("user") == null) {
        	res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.getWriter().write("Unauthorized");
            return;
        } else {
            UserBean user = (UserBean) s.getAttribute("user");
            if (user.getCourse().equals("Docente")) {
            	res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                res.getWriter().write("Forbidden");
                s.invalidate();
                return;
            }
        }
        chain.doFilter(request, response);
	}

	/**
	 * @see Filter#init(FilterConfig)
	 */
	public void init(FilterConfig fConfig) throws ServletException {
		// TODO Auto-generated method stub
	}

}
