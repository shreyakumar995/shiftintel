from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()
class Report(db.Model):
    id=db.Column(db.Integer, primary_key=True)
    operator_name=db.Column(db.String(100))
    operator_contact=db.Column(db.String(20))
    zone=db.Column(db.String(20))
    shift=db.Column(db.String(20))
    date=db.Column(db.String(20))
    raw_notes=db.Column(db.Text)
    structured_report=db.Column(db.Text)
    formal_report=db.Column(db.Text)
    anomaly_data=db.Column(db.Text)
    severity=db.Column(db.String(20))
    created_at=db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    def to_dict(self):
        return {
            "id": self.id,
            "operator_name": self.operator_name,
            "operator_contact": self.operator_contact,
            "zone": self.zone,
            "shift": self.shift,
            "date": self.date,
            "raw_notes": self.raw_notes,
            "structured_report": self.structured_report,
            "formal_report": self.formal_report,
            "anomaly_data": self.anomaly_data,
            "severity": self.severity,
            "created_at": self.created_at.isoformat()
        }
