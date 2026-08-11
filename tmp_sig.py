from inspect import signature, getsource
from langchain_groq import ChatGroq
print('signature(generate):', signature(ChatGroq.generate))
print('signature(invoke):', signature(ChatGroq.invoke))
print('signature(generate_prompt):', signature(ChatGroq.generate_prompt))
