import { Suspense } from "react";
import { ProductsBrowser } from "@/components/ProductsBrowser";

export const metadata = { title: "Products — BevSupply" };

export default function ProductsPage() {
  return (
    <div className="container-page py-8">
      <Suspense fallback={<div className="py-20 text-center text-secondary/50">Loading catalogue…</div>}>
        <ProductsBrowser />
      </Suspense>
    </div>
  );
}
