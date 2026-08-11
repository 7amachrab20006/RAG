try:
    from langchain.chains.question_answering import load_qa_chain
    print("import1 OK")
except Exception as e:
    print("import1 ERR", e)
try:
    from langchain.chains import load_qa_chain
    print("import2 OK")
except Exception as e:
    print("import2 ERR", e)
try:
    import langchain
    print('langchain module attrs sample:', [a for a in dir(langchain) if 'chain' in a.lower()][:20])
except Exception as e:
    print('langchain import ERR', e)
