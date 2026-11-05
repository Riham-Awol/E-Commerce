import { Suspense } from "react";
import { PaymentSuccess } from "./PaymentSuccess";

export const metadata = { title: "Payment received — BevSupply" };

export default function Page() {
  return (
    <div className="container-page py-12">
      <Suspense>
        <PaymentSuccess />
      </Suspense>
    </div>
  );
}
