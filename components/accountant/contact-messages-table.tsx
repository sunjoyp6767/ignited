type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  source_page: string;
  status: string;
  created_at: string;
};

type ContactMessagesTableProps = {
  rows: ContactMessageRow[];
};

export function ContactMessagesTable({ rows }: ContactMessagesTableProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-700">
          Contact messages
        </h2>
        <p className="mt-0.5 text-xs text-stone-500">
          Messages submitted from the public contact form.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
          <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-600">
            <tr>
              <th className="px-4 py-3 sm:px-5">Date</th>
              <th className="px-4 py-3 sm:px-5">Name</th>
              <th className="px-4 py-3 sm:px-5">Email</th>
              <th className="px-4 py-3 sm:px-5">Message</th>
              <th className="px-4 py-3 sm:px-5">Source</th>
              <th className="px-4 py-3 sm:px-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-800">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-stone-500 sm:px-5">
                  No messages yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="align-top hover:bg-stone-50/70">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-stone-600 sm:px-5">
                    {new Date(row.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium sm:px-5">{row.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs sm:px-5">{row.email}</td>
                  <td className="max-w-xl px-4 py-3 text-xs leading-relaxed text-stone-700 sm:px-5">
                    {row.message}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-stone-600 sm:px-5">
                    {row.source_page}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 sm:px-5">
                    <span className="rounded-full border border-stone-300 bg-white px-2 py-0.5 text-xs text-stone-700">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
