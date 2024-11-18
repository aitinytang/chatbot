# step 1
git clone git@github.com:aitinytang/chatbot.git

# step 2
cd chatbot

# step 3
mvn spring-boot:run
> tips: if 8080 has corrupied by other app:
> netstat -ano | findstr :8080

# step 4
open your brower and type: http://localhost:8080/hello?name=introduce%20Machine%20learning
then you can see the answer from azure openai



# Reference
[1. langchain4j azure open ai](https://docs.langchain4j.dev/integrations/language-models/azure-open-ai/) <br>
[2. langchan4j](https://github.com/langchain4j/langchain4j) <br>
[3. springboot](https://spring.io/quickstart) <br>
[4. azure open ai](https://learn.microsoft.com/en-us/azure/ai-services/openai/) <br>
