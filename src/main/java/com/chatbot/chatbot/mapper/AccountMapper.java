package com.chatbot.chatbot.mapper;

import org.apache.ibatis.annotations.Mapper;
import com.chatbot.chatbot.pojo.Account;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface AccountMapper {
    @Select("SELECT * FROM account WHERE username = #{username}")
    Account getUser(String username);
}
