import { CartView } from "@/components/CartView";

export const metadata = { title: "Cart — BevSupply" };

export default function CartPage() {
  return (
    <div className="container-page py-8">
      <CartView />
    </div>
  );
}
