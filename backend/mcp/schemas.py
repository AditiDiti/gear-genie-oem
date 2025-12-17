from pydantic import BaseModel

class MCPQuery(BaseModel):
    question: str
    brand: str
