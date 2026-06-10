"use client";

import { submitReport } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const PROCESSING_STEPS = [
  "Extracting structured data...",
  "Generating formal report...",
  "Scanning for anomalies...",
] as const;

function StepIcon({ status }: { status: "pending" | "active" | "complete" }) {
  if (status === "complete") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
        ✓
      </span>
    );
  }
  if (status === "active") {
    return (
      <svg
        className="h-5 w-5 animate-spin text-sky-400"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    );
  }
  return <span className="h-5 w-5 rounded-full border border-zinc-600" />;
}

export default function SubmitReportPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    operatorName: "",
    operatorContact: "",
    zone: "",
    shift: "",
    date: "",
    rawNotes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    if (!loading) {
      setActiveStep(1);
      return;
    }

    setActiveStep(1);
    const step2Timer = setTimeout(() => setActiveStep(2), 2000);
    const step3Timer = setTimeout(() => setActiveStep(3), 4000);

    return () => {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
    };
  }, [loading]);

  const getStepStatus = (step: number): "pending" | "active" | "complete" => {
    if (activeStep > step) return "complete";
    if (activeStep === step && loading) return "active";
    return "pending";
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await submitReport(formData);
      toast.success("Report submitted successfully");
      router.push(`/report/${result.id}`);
    } catch (err) {
      toast.error("Failed to submit report");
      setError(
        err instanceof Error ? err.message : "Failed to generate report"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-zinc-950 p-6 md:p-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Submit Shift Report
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Capture operator observations, machine conditions, and incident
            notes.
          </p>
        </div>

        <div className="rounded-xl bg-zinc-900/90 p-6 shadow-lg ring-1 ring-zinc-700 md:p-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                htmlFor="operatorName"
                className="mb-2 block text-sm font-medium text-zinc-100"
              >
                Operator Name
              </label>
              <input
                id="operatorName"
                type="text"
                value={formData.operatorName}
                onChange={(e) =>
                  setFormData({ ...formData, operatorName: e.target.value })
                }
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                placeholder="Enter operator name"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="operatorContact"
                className="mb-2 block text-sm font-medium text-zinc-100"
              >
                Operator Contact
              </label>
              <input
                id="operatorContact"
                type="tel"
                value={formData.operatorContact}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    operatorContact: e.target.value,
                  })
                }
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                placeholder="Enter phone number"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="zone"
                className="mb-2 block text-sm font-medium text-zinc-100"
              >
                Zone
              </label>
              <select
                id="zone"
                value={formData.zone}
                onChange={(e) =>
                  setFormData({ ...formData, zone: e.target.value })
                }
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                disabled={loading}
              >
                <option value="">Select zone</option>
                <option value="Zone A">Zone A</option>
                <option value="Zone B">Zone B</option>
                <option value="Zone C">Zone C</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="shift"
                className="mb-2 block text-sm font-medium text-zinc-100"
              >
                Shift
              </label>
              <select
                id="shift"
                value={formData.shift}
                onChange={(e) =>
                  setFormData({ ...formData, shift: e.target.value })
                }
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                disabled={loading}
              >
                <option value="">Select shift</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="date"
                className="mb-2 block text-sm font-medium text-zinc-100"
              >
                Date
              </label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="rawNotes"
                className="mb-2 block text-sm font-medium text-zinc-100"
              >
                Raw Notes
              </label>
              <textarea
                id="rawNotes"
                rows={8}
                value={formData.rawNotes}
                onChange={(e) =>
                  setFormData({ ...formData, rawNotes: e.target.value })
                }
                placeholder="Enter your shift notes here — machines checked, issues found, anything unusual..."
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                disabled={loading}
              />
            </div>
          </div>

          {loading && (
            <div className="mt-6 space-y-3 rounded-lg border border-zinc-700 bg-zinc-950/80 p-4">
              {PROCESSING_STEPS.map((label, index) => {
                const step = index + 1;
                const status = getStepStatus(step);
                return (
                  <div key={label} className="flex items-center gap-3">
                    <StepIcon status={status} />
                    <span
                      className={
                        status === "active"
                          ? "text-sm font-medium text-zinc-100"
                          : status === "complete"
                            ? "text-sm text-emerald-300"
                            : "text-sm text-zinc-500"
                      }
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex min-w-40 items-center justify-center gap-2 rounded-md bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
