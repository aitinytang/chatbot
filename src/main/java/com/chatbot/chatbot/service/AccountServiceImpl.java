package com.chatbot.chatbot.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.chatbot.chatbot.pojo.Account;
import com.chatbot.chatbot.mapper.AccountMapper;

@Service
public class AccountServiceImpl implements AccountService {
    private final AccountMapper accountDao;

    @Autowired
    public AccountServiceImpl(AccountMapper accountDao) {
        this.accountDao = accountDao;
    }

    @Override
    public Account createAccount() {
        return accountDao.getUser("admin");
    }   
}
