package com.chatbot.chatbot.mapper;

import org.apache.ibatis.annotations.Mapper;
import com.chatbot.chatbot.pojo.Account;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface AccountMapper {
    @Select("SELECT * FROM account limit 1")
    Account getUser(String username);
}
