import { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { storage } from "@/server/storage";
import type { PilotWithUser } from "@/shared/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pilot Management | ComplianceDrone",
  description: "Review and manage pilot registrations in development mode without logging in.",
};

const formatCurrency = (value: number | null) => {
  if (!value) return "$0";
  return `$${(value / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

const Section = ({ title, pilots }: { title: string; pilots: PilotWithUser[] }) => {
  if (!pilots.length) {
    return (
      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <span className="text-sm text-gray-400">0 pilots</span>
        </header>
        <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-sm text-gray-300">
          Nothing to show yet.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <span className="text-sm text-gray-400">{pilots.length} pilot{pilots.length === 1 ? "" : "s"}</span>
      </header>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm text-gray-200">
          <thead className="bg-black/40 text-xs uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-4 py-3">Pilot</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Experience</th>
              <th className="px-4 py-3">Coverage</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Lifetime Earnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {pilots.map((pilot) => (
              <tr key={pilot.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">
                    {pilot.user.firstName || pilot.user.name || pilot.user.email || "Unknown"}
                  </div>
                  <div className="text-xs text-gray-400">{pilot.user.email}</div>
                </td>
                <td className="px-4 py-3">{pilot.companyName || "—"}</td>
                <td className="px-4 py-3">
                  <div>{pilot.thermalExperienceYears ?? 0} yrs thermal</div>
                  <div className="text-xs text-gray-400">{pilot.totalFlightHours ?? 0} flight hrs</div>
                </td>
                <td className="px-4 py-3 text-xs">
                  {Array.isArray(pilot.serviceStates) && pilot.serviceStates.length
                    ? pilot.serviceStates.join(", ")
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-xs capitalize text-white">
                    {pilot.status}
                  </span>
                </td>
                <td className="px-4 py-3">{formatCurrency(pilot.totalEarnings ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const AdminPilotsPage = async () => {
  const devBypassEnabled = process.env.DEV_ADMIN_BYPASS === "true";
  const session = await getServerSession(authOptions);

  if (!devBypassEnabled && !session?.user) {
    return (
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-12 text-gray-200">
        <h1 className="text-3xl font-semibold text-white">Pilot Management</h1>
        <p className="rounded-lg border border-amber-400/40 bg-amber-500/10 p-6 text-sm text-amber-100">
          Authentication is required to view this page. Sign in with an admin account or enable the
          <code className="mx-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-amber-200">DEV_ADMIN_BYPASS=true</code>
          flag in your <code className="mx-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-amber-200">.env.local</code>
          while developing locally.
        </p>
        <Link
          href="/auth/signin"
          className="inline-flex w-fit items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/80"
        >
          Go to sign in
        </Link>
      </main>
    );
  }

  const [pendingPilots, approvedPilots] = await Promise.all([
    storage.getPendingPilots(),
    storage.getApprovedPilots(),
  ]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Pilot Management</h1>
          <p className="text-sm text-gray-400">
            {devBypassEnabled
              ? "Development bypass active. Data is loaded without admin authentication."
              : "Authenticated admin view of pilot registrations."}
          </p>
        </div>
        <Link
          href="/pilot-registration"
          className="inline-flex items-center justify-center rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
        >
          Open pilot registration form
        </Link>
      </header>

      <Section title="Pending review" pilots={pendingPilots} />
      <Section title="Approved pilots" pilots={approvedPilots} />
    </main>
  );
};

export default AdminPilotsPage;
