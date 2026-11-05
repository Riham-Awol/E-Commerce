import { Suspense } from "react";
import { PaymentCancelled } from "./PaymentCancelled";

export const metadata = { title: "Payment cancelled — BevSupply" };

export default function Page() {
  return (
    <div className="container-page py-12">
      <Suspense>
        <PaymentCancelled />
      </Suspense>
    </div>
  );
}
