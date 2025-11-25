"use client";

import { useState } from "react";

export function Hero() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For Phase I, this is decorative
    if (email) {
      alert("Thanks for subscribing! (This is a demo)");
      setEmail("");
    }
  };

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

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-5 py-3 rounded-full border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-shadow"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors whitespace-nowrap"
          >
            Get Updates →
          </button>
        </form>

        <p className="mt-4 text-xs text-stone-400">
          Weekly discoveries. No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}

