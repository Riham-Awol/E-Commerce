import { Suppliers } from "@/components/home/Suppliers";

export const metadata = { title: "Suppliers — BevSupply" };

const benefits = [
  ["Reach thousands of buyers", "List your catalogue to retailers, HORECA and individual customers."],
  ["Manage purchase orders", "Accept POs, update prices and track deliveries to our warehouses."],
  ["Transparent payments", "View your payment history and settlement schedule in real time."],
  ["Ratings & contracts", "Build a verified reputation with buyer ratings and digital contracts."],
];

export default function Page() {
  return (
    <div>
      <section className="bg-secondary py-16 text-white">
        <div className="container-page flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h1 className="font-display text-4xl font-extrabold">Become a BevSupply supplier</h1>
            <p className="mt-3 max-w-xl text-white/70">
              Supply your beverages to a growing network of businesses. Support
              for multiple suppliers per product with different purchase prices.
            </p>
          </div>
          <a href="/register" className="btn-primary px-6 py-3">Apply to supply</a>
        </div>
      </section>
      <section className="container-page py-14">
        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map(([t, d]) => (
            <div key={t} className="card p-6">
              <p className="font-semibold text-secondary">{t}</p>
              <p className="mt-1 text-sm text-secondary/60">{d}</p>
            </div>
          ))}
        </div>
      </section>
      <Suppliers />
    </div>
  );
}
