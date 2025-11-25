import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="min-w-80 min-h-80 mb-8 relative rounded-2xl overflow-hidden bg-stone-100">
        {/* Placeholder for 404 image */}
        <Image
          src="/404-illustration.png"
          alt="Page not found"
          fill
          className="object-contain"
        />
      </div>

      <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">
        Page not found
      </h1>

      <p className="text-lg text-stone-600 max-w-md mx-auto mb-8 leading-relaxed">
        Sorry, we couldn't find the page you're looking for. It might have been
        moved or doesn't exist.
      </p>

      <div className="flex gap-4">
        <Button
          asChild
          size="lg"
          className="rounded-full bg-stone-900 hover:bg-stone-800"
        >
          <Link href="/">Go Home</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-full border-stone-200 hover:bg-stone-50"
        >
          <Link href="/browse">Browse Resources</Link>
        </Button>
      </div>
    </div>
  );
}
