# step 1
git clone 

# step 2
cd chatbot

# step 3
mvn spring-boot:run

# step 4
open your brower and type: http://localhost:8080/hello?name=introduce%20Machine%20learning
then you can see the answer from azure openai

> tips
if 8080 has corrupied by other app
netstat -ano | findstr :8080

