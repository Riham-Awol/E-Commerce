import { ZoneChecker } from "./ZoneChecker";

export const metadata = { title: "Delivery Coverage — BevSupply" };

export default function Page() {
  return (
    <div>
      <section className="bg-secondary py-16 text-white">
        <div className="container-page">
          <h1 className="font-display text-4xl font-extrabold">Delivery coverage</h1>
          <p className="mt-3 max-w-2xl text-white/70">
            We deliver across three zones. Enter your postcode or city to see
            your delivery zone, estimated arrival and delivery fee.
          </p>
        </div>
      </section>
      <section className="container-page py-14">
        <ZoneChecker />
      </section>
    </div>
  );
}
