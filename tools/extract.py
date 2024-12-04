import re
import os

from bs4 import BeautifulSoup
from langchain_community.document_loaders import BSHTMLLoader
from typing import Optional
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage
from langchain_openai import AzureChatOpenAI

with open("campaign-referral.html", "r", encoding="utf-8") as f:
    document_content = f.read()

class CountHtml(BaseModel):
    src: list[str] = Field(default_factory=list, description="List of src attributes from img tags.")

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
            "You are an expert extract algorithm. "
            "Given HTML content, "
            "extract all src attributes from img tags and return them as a list."
        ),
        # Please see the how-to about improving performance with
        # reference examples.
        MessagesPlaceholder('examples'),
        ("human", "{text}"),
    ]
)

structured_llm = llm.with_structured_output(schema=CountHtml)

text = document_content

prompt = prompt_template.invoke({"text": text, "examples": [HumanMessage(content='<img class="u-Adjust_Mt-24" src="/assets/img/campaign/referral/step-4-p.png" alt="STEP 4" width="72">, output:/assets/img/campaign/referral/step-4-p.png')]})

print(structured_llm.invoke(prompt))