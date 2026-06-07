import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {
            "role": "system",
            "content": (
                "Return JSON only with this exact shape: "
                "{\"machines\": [string], \"issues\": [string]}. "
                "Do not include markdown or extra text."
            ),
        },
        {
            "role": "user",
            "content": (
                "Extract machines and issues from this text: "
                "Roller 3 overheating, conveyor belt slipping in Zone B"
            ),
        },
    ],
)
print(response.choices[0].message.content)