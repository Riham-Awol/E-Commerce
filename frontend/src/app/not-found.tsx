import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <p className="font-display text-7xl font-extrabold text-primary">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-secondary">Page not found</h1>
        <p className="mt-2 text-secondary/60">The page you're looking for doesn't exist or has moved.</p>
        <Link href="/" className="btn-primary mt-6">Back to home</Link>
      </div>
    </div>
  );
}
