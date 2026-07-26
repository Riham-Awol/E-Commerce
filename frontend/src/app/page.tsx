import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductRow } from "@/components/home/ProductRow";
import { Brands } from "@/components/home/Brands";
import { OffersBanner } from "@/components/home/OffersBanner";
import { Suppliers } from "@/components/home/Suppliers";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Reviews } from "@/components/home/Reviews";
import { Coverage } from "@/components/home/Coverage";
import { featuredProducts, bestSellers, offers, products } from "@/data/products";

export default function HomePage() {
  const wholesale = products.filter((p) => p.tags.includes("wholesale"));
  return (
    <>
      <Hero />
      <CategoryGrid />
      <ProductRow eyebrow="Handpicked" title="Featured drinks" href="/products" products={featuredProducts} />
      <Brands />
      <OffersBanner />
      <ProductRow eyebrow="Limited time" title="Today's offers" href="/products?tag=offer" products={offers} />
      <ProductRow eyebrow="Crowd favourites" title="Best sellers" href="/products?tag=bestseller" products={bestSellers} />
      <Suppliers />
      <ProductRow eyebrow="Trade pricing" title="Wholesale deals" href="/products?tag=wholesale" products={wholesale} />
      <HowItWorks />
      <Reviews />
      <Coverage />
    </>
  );
}
