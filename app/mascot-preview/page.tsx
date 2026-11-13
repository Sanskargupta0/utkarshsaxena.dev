import { notFound } from "next/navigation";
import Link from "next/link";
import MascotComparison from "@/components/mascot-comparison";

export const metadata = { title: "Mascot comparison", robots: { index: false, follow: false } };

export default function MascotPreview() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <Link href="/" className="text-sm underline underline-offset-4">Back home</Link>
      <h1 className="text-2xl font-medium">Compare mascot tracking</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Compare the original nine poses, smoothed nine poses, and 25 poses. Move slowly across directions,
        reverse quickly, then bring the cursor close to each face. Click either mascot to
        compare reactions. Both smoothed versions stay still with reduced motion enabled.
      </p>
      <MascotComparison />
    </main>
  );
}
