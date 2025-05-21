package it.polimi.tiw.controllers;

import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import it.polimi.tiw.beans.UserBean;
import com.google.gson.Gson;

@WebServlet("/GetUserData")
public class GetUserData extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private Gson gson = new Gson();

    public GetUserData() {
        super();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"No user in session\"}");
            return;
        }

        UserBean user = (UserBean) session.getAttribute("user");
        response.setContentType("application/json");
        response.getWriter().write(gson.toJson(user));
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        doGet(request, response);
    }
} 