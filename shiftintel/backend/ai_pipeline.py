import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
GROQ_MODEL = "llama-3.3-70b-versatile"

def extract_structured_report(raw_notes: str) -> dict:
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": """You are an NLP data extractor for a steel plant safety system.
Extract information from operator shift notes.
Return ONLY valid JSON with exactly these keys, no markdown, no explanation:
{
    "machines_checked": [string],
    "issues_found": [string],
    "pending_tasks": [string],
    "safety_flags": [string],
    "severity": "Low or Medium or High or Critical"
}"""
            },
            {
                "role": "user",
                "content": f"Extract from these shift notes:\n{raw_notes}"
            }
        ]
    )
    raw= response.choices[0].message.content.strip()
    raw=raw.replace("```json", "").replace("```", "").strip()
    return json.loads(raw)
def generate_formal_report(structured_report: dict) -> str:
    data_str=json.dumps(structured_report, indent=2)
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                 "content": """You are a Senior Safety Officer at Tata Steel.
Write a formal shift handover report in 3 paragraphs:
1. Operations summary
2. Issues found and actions taken
3. Instructions for the incoming shift
Tone: professional and clear. 150-200 words."""
            },
            {
                "role": "user",
                "content": f"Write the report from this data:\n{data_str}"
            }
        ]
    )
    return response.choices[0].message.content.strip()
def detect_anomaly(current_data: dict, past_data: dict) -> dict:
    if not past_data:
        return{
            "anomaly_detected": False,
            "pattern_description": None,
            "affected_zones": [],
            "recommendations": None,

        }
    context=json.dumps(past_data, indent=2)
    current=json.dumps(current_data, indent=2)
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": """You are a plant safety analyst at Tata Steel.
Analyze shift reports and identify recurring issues or dangerous patterns.
Return ONLY valid JSON, no markdown:
{
  "anomaly_detected": true or false,
  "pattern_description": "description or null",
  "affected_zones": [],
  "recommendation": "recommendation or null"
}"""
            },
            {
                "role": "user",
                "content": f"Current report:\n{current}\n\nPast reports:\n{context}"
            }
        ]
    )
    raw=response.choices[0].message.content.strip()
    raw=raw.replace("```json", "").replace("```", "").strip()
    return json.loads(raw)


