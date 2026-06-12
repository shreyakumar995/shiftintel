def build_subject(severity: str,anomaly: bool) -> str:
    if severity=="critical" and anomaly:
         return "🚨 CRITICAL ALERT + Anomaly Detected — Immediate Action Required"
    elif severity=="critical":
         return "🚨 CRITICAL ALERT — Immediate Action Required"
    elif anomaly:
          return "⚠️ WARNING — Anomaly Pattern Detected"
    else:
        return f"📋 New Shift Report Submitted — Severity: {severity}"
def build_email_body(report_data:dict,anomaly_data:dict) -> str:
    operator=report_data.get("operator_name", "Umknown")
    zone=report_data.get("zone", "Unknown")
    shift=report_data.get("shift", "Unknown")
    date=report_data.get("date", "Unknown")
    severity=report_data.get("severity", "Unknown")
    anomaly=anomaly_data.get("anomaly_detected", False)
    formal_report=report_data.get("formal_report", "")
    pattern=anomaly_data.get("pattern_description") or "No pattern detected"
    affected_zones=anomaly_data.get("affected_zones", [])
    recommendations=anomaly_data.get("recommendation") or "Continue monitoring"

    anomaly_section=""
    if anomaly:
        anomaly_section=f"""
ANOMALY DETECTED:
  Pattern: {pattern}
  Affected Zones: {", ".join(affected_zones)}
  Recommendations: {recommendations}
  """
    body=f"""
   ===================================
  SHIFTINTEL — SHIFT REPORT ALERT
  Tata Steel Internal Notification
===================================

REPORT DETAILS:
  Operator   : {operator}
  Zone       : {zone}
  Shift      : {shift}
  Date       : {date}
  Severity   : {severity}
{anomaly_section}
AI GENERATED REPORT:
{formal_report}

===================================
This is a dummy notification from ShiftIntel.
In production this would be emailed to the supervisor.
===================================
"""
    return body
def simulate_send_email(report_data: dict, anomaly_data: dict) -> dict:
    """
    Dummy email sender — simulates sending without real SMTP.
    Logs to terminal and returns email data to save in DB.
    """
    subject = build_subject(
        report_data.get("severity", ""),
        anomaly_data.get("anomaly_detected", False)
    )
    body = build_email_body(report_data, anomaly_data)
    to_email = "supervisor@tatasteel.com"
    print("\n" + "="*50)
    print("📧 DUMMY EMAIL TRIGGERED")
    print("="*50)
    print(f"TO      : {to_email}")
    print(f"SUBJECT : {subject}")
    print(body)
    print("="*50 + "\n")

    return {
        "to_email": to_email,
        "subject": subject,
        "body": body
    }