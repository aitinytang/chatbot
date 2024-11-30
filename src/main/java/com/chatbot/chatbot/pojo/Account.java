package com.chatbot.chatbot.pojo;

public class Account {
    private String username;
    private String passwd;

    public Account(String username, String passwd) {
        this.username = username;
        this.passwd = passwd;
    }

    @Override
    public String toString() {
        return "Account{" +
                "username='" + username + '\'' +
                ", passwd='" + passwd + '\'' +
                '}';
    }
}
