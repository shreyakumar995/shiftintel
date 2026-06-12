"use client";

import AnomalyBanner from "@/components/AnomalyBanner";
import SeverityBadge from "@/components/SeverityBadge";
import { getEmailByReport, getReport } from "@/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Severity = "Low" | "Medium" | "High" | "Critical";

type StructuredReport = {
  machines_checked: string[];
  issues_found: string[];
  pending_tasks: string[];
  safety_flags: string[];
  severity: Severity;
};

type ReportView = {
  operator: string;
  operatorContact: string;
  zone: string;
  shift: string;
  date: string;
  structured: StructuredReport;
  formal_report: string;
  anomaly: {
    detected: boolean;
    description: string;
    zones: string[];
  };
};

type SummaryCardProps = {
  title: string;
  icon: string;
  accentClass: string;
  items: string[];
};

function SummaryCard({ title, icon, accentClass, items }: SummaryCardProps) {
  return (
    <article className="rounded-xl bg-zinc-900 p-5 shadow-lg ring-1 ring-white/10">
      <h3
        className={`mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide ${accentClass}`}
      >
        <span aria-hidden>{icon}</span>
        {title}
      </h3>
      <ul className="space-y-2.5">
        {items.length > 0 ? (
          items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm text-zinc-100"
            >
              <span
                className={`mt-1.5 h-1.5 w-1.5 rounded-full ${accentClass.replace("text-", "bg-")}`}
              />
              <span className="leading-6">{item}</span>
            </li>
          ))
        ) : (
          <li className="text-sm text-zinc-500">None recorded</li>
        )}
      </ul>
    </article>
  );
}

function parseReport(apiReport: Record<string, unknown>): ReportView {
  const structured = JSON.parse(
    (apiReport.structured_report as string) || "{}"
  ) as StructuredReport;

  const anomalyRaw = JSON.parse(
    (apiReport.anomaly_data as string) || "{}"
  ) as Record<string, unknown>;

  const severity =
    (structured.severity as Severity) ||
    (apiReport.severity as Severity) ||
    "Low";

  return {
    operator: (apiReport.operator_name as string) || "",
    operatorContact: (apiReport.operator_contact as string) || "",
    zone: (apiReport.zone as string) || "",
    shift: (apiReport.shift as string) || "",
    date: (apiReport.date as string) || "",
    structured: {
      machines_checked: structured.machines_checked || [],
      issues_found: structured.issues_found || [],
      pending_tasks: structured.pending_tasks || [],
      safety_flags: structured.safety_flags || [],
      severity,
    },
    formal_report: (apiReport.formal_report as string) || "",
    anomaly: {
      detected: Boolean(anomalyRaw.anomaly_detected),
      description:
        (anomalyRaw.pattern_description as string) ||
        (anomalyRaw.description as string) ||
        "",
      zones:
        (anomalyRaw.affected_zones as string[]) ||
        (anomalyRaw.zones as string[]) ||
        [],
    },
  };
}

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;

  const [report, setReport] = useState<ReportView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailLog, setEmailLog] = useState<{
    subject: string;
    to_email: string;
    body: string;
    sent_at: string;
  } | null>(null);
  const [showEmailBody, setShowEmailBody] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadReport() {
      setLoading(true);
      setError(null);
      try {
        const data = await getReport(id);
        if (!cancelled) {
          setReport(parseReport(data));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load report"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    async function loadEmail() {
      try {
        const email = await getEmailByReport(id);
        if (!cancelled) {
          setEmailLog(email);
        }
      } catch {
        // no email found — that's fine
      }
    }

    loadReport();
    loadEmail();
    return () => {
      cancelled = true;
    };
  }, [id]);


  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-zinc-950 p-8">
        <p className="text-sm text-zinc-400">Loading report...</p>
      </div>
    );
  }
  if (error || !report) {
    return (
      <div className="min-h-full bg-zinc-950 p-6 md:p-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white"
        >
          ← Back to Dashboard
        </Link>
        <p className="mt-6 text-sm text-red-400" role="alert">
          {error || "Report not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-zinc-950 p-6 md:p-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <Link
          href="/dashboard"
          className="no-print inline-flex items-center gap-2 rounded-md border border-white/15 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:border-white/30 hover:text-white"
        >
          <span aria-hidden>←</span>
          Back to Dashboard
        </Link>
        {/* PDF only header — hidden on screen, shows in PDF */}
<div className="pdf-header mb-6">
  <h1 className="text-2xl font-bold text-black">
    ShiftIntel — Shift Handover Report #{id}
  </h1>
  <p className="text-sm text-gray-500">
    Tata Steel Internal Tool | Confidential
  </p>
  <hr className="mt-2" />
</div>


<button
  onClick={() => window.print()}
  className="no-print inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition"
>
  ⬇ Download PDF
</button>

        <section className="rounded-2xl bg-zinc-900 p-6 text-zinc-100 shadow-xl ring-1 ring-zinc-800 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                ShiftIntel Report #{id}
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                Shift Incident and Operations Brief
              </h1>
            </div>
            <SeverityBadge severity={report.structured.severity} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="rounded-lg bg-zinc-950/70 p-4 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-wide text-zinc-400">
                Operator
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-100">
                {report.operator}
              </p>
            </div>
            <div className="rounded-lg bg-zinc-950/70 p-4 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-wide text-zinc-400">
                Operator Contact
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-100">
                {report.operatorContact}
              </p>
            </div>
            <div className="rounded-lg bg-zinc-950/70 p-4 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-wide text-zinc-400">
                Zone
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-100">
                {report.zone}
              </p>
            </div>
            <div className="rounded-lg bg-zinc-950/70 p-4 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-wide text-zinc-400">
                Shift
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-100">
                {report.shift}
              </p>
            </div>
            <div className="rounded-lg bg-zinc-950/70 p-4 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-wide text-zinc-400">
                Date
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-100">
                {report.date}
              </p>
            </div>
          </div>
        </section>

        {report.anomaly.detected && (
          <AnomalyBanner
            description={report.anomaly.description}
            zones={report.anomaly.zones}
          />
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Machines Checked"
            icon="⚙"
            accentClass="text-sky-300"
            items={report.structured.machines_checked}
          />
          <SummaryCard
            title="Issues Found"
            icon="⚠"
            accentClass="text-red-300"
            items={report.structured.issues_found}
          />
          <SummaryCard
            title="Pending Tasks"
            icon="🛠"
            accentClass="text-amber-300"
            items={report.structured.pending_tasks}
          />
          <SummaryCard
            title="Safety Flags"
            icon="🛡"
            accentClass="text-orange-300"
            items={report.structured.safety_flags}
          />
        </section>

        <section className="rounded-2xl bg-zinc-900 p-6 shadow-xl ring-1 ring-white/10 md:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-200">
            <span aria-hidden>🤖</span>
            FINAL REPORT
          </div>
          <p className="text-sm leading-7 text-zinc-200 md:text-base">
            {report.formal_report}
          </p>
        </section>

        {emailLog && (
          <section className="no-print rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-xl ring-1 ring-white/10 md:p-8">
            <div className="mb-5 flex items-center gap-2 border-b border-white/10 pb-4">
              <span className="text-sm font-semibold text-emerald-400">
                📧 Email Notification Sent
              </span>
            </div>

            <dl className="space-y-3 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                <dt className="shrink-0 font-medium text-zinc-500 sm:w-16">To:</dt>
                <dd className="text-zinc-400">{emailLog.to_email}</dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                <dt className="shrink-0 font-medium text-zinc-500 sm:w-16">Subject:</dt>
                <dd className="text-zinc-200">{emailLog.subject}</dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                <dt className="shrink-0 font-medium text-zinc-500 sm:w-16">Sent at:</dt>
                <dd className="text-zinc-300">
                  {new Date(emailLog.sent_at).toLocaleString()}
                </dd>
              </div>
            </dl>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowEmailBody((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:text-white"
              >
                <span aria-hidden>{showEmailBody ? "▾" : "▸"}</span>
                View Email Body
              </button>

              {showEmailBody && (
                <pre className="mt-3 max-h-48 overflow-y-auto rounded-lg bg-zinc-950 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-zinc-300">
                  {emailLog.body}
                </pre>
              )}
            </div>
          </section>
        )}

        {/* PDF footer — hidden on screen */}
<div className="pdf-header mt-8 border-t border-gray-200 pt-4">
  <p className="text-xs text-gray-500">
    Report generated on {new Date().toLocaleDateString()} | 
    Confidential — Tata Steel Internal Use Only
  </p>
</div>
      </div>
    </div>
  );
}
