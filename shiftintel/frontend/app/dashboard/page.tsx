"use client";

import { deleteReport, getReports } from "@/lib/api";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SkeletonRow from '@/components/SkeletonRow'
import toast from 'react-hot-toast'


type Severity = "Low" | "Medium" | "High" | "Critical";

type ReportRow = {
  id: number;
  date: string;
  zone: string;
  operator: string;
  severity: Severity;
  anomaly: boolean;
};

const severityClasses: Record<Severity, string> = {
  Low: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  Medium: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  High: "bg-orange-500/15 text-orange-300 ring-orange-400/30",
  Critical: "bg-red-500/15 text-red-300 ring-red-400/30",
};

function mapApiToRow(apiReport: Record<string, unknown>): ReportRow {
  let anomaly = false;
  try {
    const anomalyData = JSON.parse(
      (apiReport.anomaly_data as string) || "{}"
    ) as Record<string, unknown>;
    anomaly = Boolean(anomalyData.anomaly_detected);
  } catch {
    anomaly = false;
  }

  const severity = (apiReport.severity as Severity) || "Low";

  return {
    id: apiReport.id as number,
    date: (apiReport.date as string) || "",
    zone: (apiReport.zone as string) || "",
    operator: (apiReport.operator_name as string) || "",
    severity,
    anomaly,
  };
}

export default function DashboardPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [zoneFilter, setZoneFilter] = useState<"All" | string>("All");
  const [severityFilter, setSeverityFilter] = useState<"All" | Severity>("All");

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      setError(null);
      try {
        const data = await getReports();
        const rows = (data as Record<string, unknown>[]).map(mapApiToRow);
        setReports(rows);
      } catch (err) {
        toast.error("Failed to load reports");
        setError(
          err instanceof Error ? err.message : "Failed to load reports"
        );
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const zoneMatch = zoneFilter === "All" || report.zone === zoneFilter;
      const severityMatch =
        severityFilter === "All" || report.severity === severityFilter;
      return zoneMatch && severityMatch;
    });
  }, [reports, zoneFilter, severityFilter]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this report? This cannot be undone.")) return;

    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((report) => report.id !== id));
      toast.success("Report deleted successfully");
    } catch (err) {
      toast.error("Failed to delete report");
      setError(
        err instanceof Error ? err.message : "Failed to delete report"
      );
    }
  };

  const totalReports = reports.length;
  const criticalCount = reports.filter((r) => r.severity === "Critical").length;
  const anomalyCount = reports.filter((r) => r.anomaly).length;

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-zinc-100">Operations Dashboard</h1>
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
        <p className="text-sm text-zinc-500">
          Make sure the Flask backend is running on http://localhost:5000
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          Operations Dashboard
        </h1>
        <p className="text-sm text-zinc-400">
          Shift reports, anomaly flags, and severity tracking by zone.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-400 uppercase tracking-wide">
            Total Reports
          </p>
          <p className="text-3xl font-bold text-zinc-100 mt-1">{totalReports}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-400 uppercase tracking-wide">
            Critical
          </p>
          <p className="text-3xl font-bold text-red-400 mt-1">{criticalCount}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-400 uppercase tracking-wide">
            Anomalies
          </p>
          <p className="text-3xl font-bold text-amber-400 mt-1">{anomalyCount}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-zinc-900 p-4 shadow-lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="w-full md:w-64">
            <label
              htmlFor="zone-filter"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400"
            >
              Filter by Zone
            </label>
            <select
              id="zone-filter"
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            >
              <option value="All">All Zones</option>
              <option value="Zone A">Zone A</option>
              <option value="Zone B">Zone B</option>
              <option value="Zone C">Zone C</option>
            </select>
          </div>

          <div className="w-full md:w-64">
            <label
              htmlFor="severity-filter"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400"
            >
              Filter by Severity
            </label>
            <select
              id="severity-filter"
              value={severityFilter}
              onChange={(e) =>
                setSeverityFilter(e.target.value as "All" | Severity)
              }
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            >
              <option value="All">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-zinc-950/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Zone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Operator
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Severity
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Alert
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading &&(
                Array.from({length: 5}).map((_, i) => (
                  <SkeletonRow key={i} />
                ))
              )}
              {!loading && filteredReports.map((report) => (
                <tr
                  key={report.id}
                  className="transition-colors hover:bg-white/5"
                >
                  <td className="px-4 py-3 text-sm text-zinc-200">
                    {report.date}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-200">
                    {report.zone}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-200">
                    {report.operator}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${severityClasses[report.severity] ?? severityClasses.Low}`}
                    >
                      {report.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {report.anomaly ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-300">
                        <span aria-hidden>⚠</span>
                        Anomaly
                      </span>
                    ) : (
                      <span className="text-zinc-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/report/${report.id}`}
                        className="inline-flex items-center rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-500"
                      >
                        View Report
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(report.id)}
                        className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && reports.length === 0 && (
          <div className="border-t border-white/10 px-4 py-8 text-center text-sm text-zinc-400">
            No reports yet. Submit your first shift report.
          </div>
        )}

        {!loading && reports.length > 0 && filteredReports.length === 0 && (
          <div className="border-t border-white/10 px-4 py-8 text-center text-sm text-zinc-400">
            No reports match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
