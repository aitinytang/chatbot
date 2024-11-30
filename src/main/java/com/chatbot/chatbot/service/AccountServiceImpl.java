package com.chatbot.chatbot.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.chatbot.chatbot.pojo.Account;
import com.chatbot.chatbot.mapper.AccountMapper;

@Service
public class AccountServiceImpl implements AccountService {
    private final AccountMapper accountMapper;

    @Autowired
    public AccountServiceImpl(AccountMapper accountMapper) {
        this.accountMapper = accountMapper;
    }

    @Override
    public Account createAccount() {
        return accountMapper.getUser("tangjia");
    }   
}
