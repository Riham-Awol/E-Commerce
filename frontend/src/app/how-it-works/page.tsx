import { HowItWorks } from "@/components/home/HowItWorks";
import { Coverage } from "@/components/home/Coverage";

export const metadata = { title: "How It Works — BevSupply" };

const roles = [
  { title: "Retailers & supermarkets", text: "Wholesale pricing, bulk tiers and reliable restocking." },
  { title: "Restaurants, hotels & bars", text: "One supplier for every drink, one consolidated invoice." },
  { title: "Cafés", text: "Fresh coffee, juice and dairy with clear expiry batches." },
  { title: "Individual customers", text: "Buy singles or cases with fast doorstep delivery." },
];

export default function Page() {
  return (
    <div>
      <section className="bg-secondary py-16 text-white">
        <div className="container-page">
          <h1 className="font-display text-4xl font-extrabold">How BevSupply works</h1>
          <p className="mt-3 max-w-2xl text-white/70">
            A wholesale beverage marketplace connecting vetted suppliers with
            businesses and individual customers — with live inventory,
            transparent pricing and tracked delivery.
          </p>
        </div>
      </section>
      <HowItWorks />
      <section className="container-page py-14">
        <h2 className="mb-6 font-display text-2xl font-bold text-secondary">Who we serve</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((r) => (
            <div key={r.title} className="card p-6">
              <p className="font-semibold text-secondary">{r.title}</p>
              <p className="mt-1 text-sm text-secondary/60">{r.text}</p>
            </div>
          ))}
        </div>
      </section>
      <Coverage />
    </div>
  );
}
