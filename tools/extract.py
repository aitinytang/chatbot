import re
import os

from bs4 import BeautifulSoup
from langchain_community.document_loaders import BSHTMLLoader
from typing import Optional
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage
from langchain_openai import AzureChatOpenAI
from langchain_core.utils.function_calling import tool_example_to_messages

with open("campaign-referral.html", "r", encoding="utf-8") as f:
    document_content = f.read()

with open("prompt.md", "r", encoding="utf-8") as f:
    prompt_content = f.read()

with open("example1_input.html", "r", encoding="utf-8") as f:
    example1_input = f.read()

with open("example1_output.md", "r", encoding="utf-8") as f:
    example1_output = f.read()

with open("example2_input.html", "r", encoding="utf-8") as f:
    example2_input = f.read()

with open("example2_output.md", "r", encoding="utf-8") as f:
    example2_output = f.read()

llm = AzureChatOpenAI(
    api_key=os.environ["AZURE_OPENAI_KEY"],
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    azure_deployment=os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"],
    openai_api_version='2024-07-01-preview',
)

prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            prompt_content.split("{examples}")[0]  # First part of system message
        ),
        MessagesPlaceholder('examples'),
        (
            "system",
            prompt_content.split("{examples}")[1]  # Second part of system message
        ),
        ("human", "{text}"),
    ]
)

class ExtractedContent(BaseModel):
    content: str = Field(description="Markdown content extracted from the HTML document.")

examples = [
    (
        example1_input,
        ExtractedContent(content=example1_output)
    ),
    (   example2_input,
        ExtractedContent(content=example2_output)
    )
    ]

messages = []

for txt, tool_call in examples:
    messages.extend(tool_example_to_messages(txt, [tool_call]))

text = document_content
prompt = prompt_template.invoke({"text": text, "examples": messages})

with open('extracted.md', 'w') as file:
    file.write(llm.invoke(prompt).content)