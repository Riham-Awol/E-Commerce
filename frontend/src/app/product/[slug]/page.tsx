import { notFound } from "next/navigation";
import { getProduct, products } from "@/data/products";
import { ProductDetail } from "@/components/ProductDetail";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  return { title: product ? `${product.name} — BevSupply` : "Product — BevSupply" };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  const frequentlyBought = products
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  return <ProductDetail product={product} related={related} frequentlyBought={frequentlyBought} />;
}
