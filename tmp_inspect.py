try:
    from langchain_groq import ChatGroq
    print('ChatGroq imported')
    attrs = [m for m in dir(ChatGroq) if not m.startswith('_')]
    print(attrs)
except Exception as e:
    print('IMPORT_ERROR', e)
