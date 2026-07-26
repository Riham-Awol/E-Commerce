import { CheckoutView } from "@/components/CheckoutView";

export const metadata = { title: "Checkout — BevSupply" };

export default function CheckoutPage() {
  return (
    <div className="container-page py-8">
      <CheckoutView />
    </div>
  );
}
