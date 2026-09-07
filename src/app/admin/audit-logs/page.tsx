import { requireAdmin } from "@/lib/supabase/auth";

export default async function AdminAuditLogsPage() {
  const { supabase } = await requireAdmin();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, action, target_type, target_id, details, created_at, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-medium">Audit Logs</h2>

      <div className="overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Admin</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Target</th>
              <th className="px-4 py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log) => (
              <tr key={log.id} className="border-t border-gray-100 align-top">
                <td className="px-4 py-2 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  {(log.profiles as unknown as { full_name: string | null })
                    ?.full_name ?? "—"}
                </td>
                <td className="px-4 py-2">{log.action}</td>
                <td className="px-4 py-2 font-mono text-xs">
                  {log.target_type ? `${log.target_type}:${log.target_id}` : "—"}
                </td>
                <td className="px-4 py-2 font-mono text-xs text-gray-500">
                  {log.details ? JSON.stringify(log.details) : ""}
                </td>
              </tr>
            ))}
            {logs?.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-gray-500" colSpan={5}>
                  No activity logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
