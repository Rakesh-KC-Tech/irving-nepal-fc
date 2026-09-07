import { requireAdmin } from "@/lib/supabase/auth";
import { createPlan, setPlanActive } from "./actions";

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function AdminPlansPage() {
  const { supabase } = await requireAdmin();

  const { data: plans } = await supabase
    .from("membership_plans")
    .select("id, name, description, price_cents, active")
    .order("price_cents");

  return (
    <div className="min-w-0 flex flex-col gap-6">
      <h2 className="text-lg font-medium">Membership Plans</h2>

      <form className="flex flex-col gap-3 rounded-md border border-gray-200 p-4">
        <h3 className="text-sm font-medium">Create a plan</h3>
        <input
          name="name"
          type="text"
          placeholder="Name (e.g. Annual Membership)"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          name="description"
          type="text"
          placeholder="Description (optional)"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          placeholder="Price in dollars (e.g. 150.00)"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          formAction={createPlan}
          className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
        >
          Create
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {plans?.map((plan) => (
          <div
            key={plan.id}
            className="flex items-center justify-between rounded-md border border-gray-200 p-3 text-sm"
          >
            <div>
              <p className="font-medium">
                {plan.name}{" "}
                <span className="font-mono text-gray-500">
                  {formatCents(plan.price_cents)}
                </span>
              </p>
              {plan.description && (
                <p className="text-gray-500">{plan.description}</p>
              )}
            </div>
            <form>
              <button
                formAction={setPlanActive.bind(null, plan.id, !plan.active)}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs"
              >
                {plan.active ? "Deactivate" : "Activate"}
              </button>
            </form>
          </div>
        ))}
        {plans?.length === 0 && (
          <p className="text-sm text-gray-500">No plans yet.</p>
        )}
      </div>
    </div>
  );
}
