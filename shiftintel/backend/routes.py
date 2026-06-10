import json
from ai_pipeline import client

from flask import Blueprint, jsonify, request

from ai_pipeline import (
    detect_anomaly,
    extract_structured_report as extract_structured_data,
    generate_formal_report,
)
from models import Report, db

api = Blueprint("api", __name__)


@api.route("/generate-report", methods=["POST"])
def generate_report():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be JSON"}), 400

        raw_notes = data.get("rawNotes", "")
        structured = extract_structured_data(raw_notes)
        formal_report = generate_formal_report(structured)

        past = (
            Report.query.order_by(Report.created_at.desc()).limit(5).all()
        )
        past_reports = []
        for report in past:
            if report.structured_report:
                past_reports.append(json.loads(report.structured_report))

        anomaly = detect_anomaly(structured, past_reports)

        report = Report(
            operator_name=data.get("operatorName"),
            operator_contact=data.get("operatorContact"),
            zone=data.get("zone"),
            shift=data.get("shift"),
            date=data.get("date"),
            raw_notes=raw_notes,
            structured_report=json.dumps(structured),
            formal_report=formal_report,
            anomaly_data=json.dumps(anomaly),
            severity=structured.get("severity"),
        )
        db.session.add(report)
        db.session.commit()

        return jsonify(
            {
                "id": report.id,
                "operatorName": report.operator_name,
                "operatorContact": report.operator_contact,
                "zone": report.zone,
                "shift": report.shift,
                "date": report.date,
                "rawNotes": report.raw_notes,
                "structured": structured,
                "formal_report": formal_report,
                "anomaly": anomaly,
                "severity": report.severity,
                "created_at": report.created_at.isoformat(),
            }
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route("/reports", methods=["GET"])
def get_reports():
    try:
        reports = Report.query.order_by(Report.created_at.desc()).all()
        return jsonify([report.to_dict() for report in reports])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route("/reports/<int:id>", methods=["GET"])
def get_report(id):
    try:
        report = Report.query.get(id)
        if not report:
            return jsonify({"error": "Report not found"}), 404
        return jsonify(report.to_dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route("/reports/<int:id>", methods=["DELETE"])
def delete_report(id):
    try:
        report = Report.query.get(id)
        if not report:
            return jsonify({"error": "Report not found"}), 404
        db.session.delete(report)
        db.session.commit()
        return jsonify({"message": "Report deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
@api.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        history=data.get('history', [])
        #fetch real data from db
        reports=Report.query.order_by(Report.created_at.desc()).limit(20).all()
        reports_context=[]
        for r in reports:
            reports_context.append({
                "id": r.id,
                "date": r.date,
                "operator": r.operator_name,
                "zone": r.zone,
                "shift": r.shift,
                "severity": r.severity,
                "issues": r.structured_report,
                "formal_report": r.formal_report
            })
        context_str=json.dumps(reports_context, indent=2)
        messages = [
            {
                "role": "system",
                "content": f"""You are ShiftIntel Assistant, an AI helper 
for a steel plant shift management tool called ShiftIntel at Tata Steel.
You have access to the following shift reports data:
 
{context_str}
 
Answer questions based only on this data.
Be concise, helpful, and professional.
If the answer isn't in the data, say 'I don't have enough data to answer that.'
Never make up information."""
            }
        ]
        for msg in history:
            messages.append({
                "role": msg['role'],
                "content": msg['content']
            })
 
        # Add current message last
        messages.append({"role": "user", "content": user_message})
 

        #pass data + question to groq model
        response=client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages
        )

        reply = response.choices[0].message.content.strip()
        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500