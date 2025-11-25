import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Hero() {
  return (
    <section className="py-20 md:py-28 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="font-serif text-4xl md:text-6xl text-stone-900 leading-tight tracking-tight">
          Learn from the best.
          <br />
          <span className="text-stone-400">Curated for you.</span>
        </h1>

        <p className="mt-6 text-lg text-stone-600 max-w-xl mx-auto leading-relaxed">
          A handpicked collection of courses, books, podcasts, and educational
          resources to accelerate your learning journey.
        </p>

        {/* Email signup - coming soon */}
        <div className="mt-10 max-w-md mx-auto relative">
          <div className="flex flex-col sm:flex-row gap-3 opacity-50 pointer-events-none select-none">
            <Input
              type="email"
              placeholder="Enter your email"
              disabled
              className="flex-1 h-12 px-5 rounded-full border-stone-300 bg-white"
            />
            <Button disabled className="h-12 px-6 rounded-full bg-stone-900">
              Get Updates →
            </Button>
          </div>

          {/* Coming soon overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="font-serif text-lg text-stone-600 italic tracking-wide bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full shadow-sm border border-stone-100">
              coming soon
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs text-stone-400">
          Weekly discoveries. No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
