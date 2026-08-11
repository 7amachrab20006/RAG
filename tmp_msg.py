try:
    from langchain.schema import SystemMessage, HumanMessage
    print('OK')
except Exception as e:
    print('ERR', e)
