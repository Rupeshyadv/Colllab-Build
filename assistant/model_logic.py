from langchain_ollama import  ChatOllama
from langchain_core.prompts import ChatPromptTemplate

llm = ChatOllama(model="gemma3:1b", temperature=0.2)

template = """
    You are an AI coding assistant.
    The user has a request:
    
    {query}

    Here is the code you should consider:

    {code}

    Answer clearly and step by step.:
""" 

prompt = ChatPromptTemplate.from_template(template)

def run_model(query: str, code: str) -> str:
    chain = prompt | llm
    response = chain.invoke({"query": query, "code": code})
    
    return response.content