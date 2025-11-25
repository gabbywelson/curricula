import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Curricula, our mission to curate the best educational resources, and what's coming next.",
};

const phases = [
  {
    number: "I",
    title: "The Directory",
    status: "current",
    description:
      "A curated collection of the best educational resources on the internet. Books, courses, podcasts, YouTube series, and cohort programs—all handpicked and organized by category. New resources added regularly.",
    features: [
      "Curated resource library",
      "Category filtering",
      "Creator profiles",
      "Editorial descriptions",
    ],
  },
  {
    number: "II",
    title: "Community Curricula",
    status: "upcoming",
    description:
      "Create and share your own learning paths. Combine resources into structured curricula, share them with the community, and discover paths created by others.",
    features: [
      "Build custom curricula",
      "Share with a link",
      "Community submissions",
      "Upvotes & comments",
    ],
  },
  {
    number: "III",
    title: "Learning Companion",
    status: "future",
    description:
      "Track your learning journey. Mark resources as complete, set reminders, follow other learners, and see what your friends are studying.",
    features: [
      "Progress tracking",
      "Smart reminders",
      "Follow other learners",
      "Learning streaks",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-16 sm:gap-24 pb-16 sm:pb-24">
      {/* Hero / Logo */}
      <section className="w-full bg-stone-100">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="aspect-[1200/670] w-full relative">
            <Image
              src="/og-image.png"
              alt="Curricula"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 mb-6 sm:mb-8">
            The Mission
          </h2>
          <div className="space-y-6 text-stone-600 text-lg sm:text-xl leading-relaxed font-light">
            <p>
              There's never been more educational content available online. The
              problem isn't access—it's curation. How do you find the best book
              on productivity? The most practical coding course? The podcast
              that actually changed how someone thinks about business?
            </p>
            <p>
              Curricula is the answer. Every resource here has been personally
              vetted. No affiliate-driven listicles, no sponsored
              placements—just genuinely excellent learning materials organized
              in a way that makes sense.
            </p>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="px-4 sm:px-6" id="roadmap">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 mb-8 sm:mb-12 text-center">
            The Roadmap
          </h2>
          <div className="space-y-6">
            {phases.map((phase) => (
              <div
                key={phase.number}
                className={`flex rounded-xl border overflow-hidden ${
                  phase.status === "current"
                    ? "border-amber-300 shadow-sm"
                    : "border-stone-200"
                }`}
              >
                {/* Phase number stripe */}
                <div
                  className={`w-16 min-w-[4rem] sm:w-24 sm:min-w-[6rem] shrink-0 flex items-center justify-center font-serif text-2xl sm:text-3xl ${
                    phase.status === "current"
                      ? "bg-amber-400 text-amber-950"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {phase.number}
                </div>

                {/* Content */}
                <div
                  className={`flex-1 p-6 sm:p-8 ${
                    phase.status === "current" ? "bg-amber-50/50" : "bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="font-serif text-xl sm:text-2xl text-stone-900">
                      {phase.title}
                    </h3>
                    {phase.status === "current" && (
                      <Badge className="bg-amber-400 text-amber-950 border-transparent hover:bg-amber-400">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-stone-600 mb-6 text-base sm:text-lg leading-relaxed">
                    {phase.description}
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {phase.features.map((feature) => (
                      <li
                        key={feature}
                        className="text-sm text-stone-500 flex items-center gap-2"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            phase.status === "current"
                              ? "bg-amber-400"
                              : "bg-stone-300"
                          }`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Me */}
      <section className="px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 mb-8 sm:mb-12 text-center">
            About the Curator
          </h2>

          <div className="space-y-8">
            {/* Full width portrait */}
            <div className="aspect-[16/9] w-full relative rounded-2xl overflow-hidden bg-stone-100 shadow-lg">
              <Image
                src="/portrait.png"
                alt="Gabby Welson"
                fill
                className="object-cover"
              />
            </div>

            {/* Bio */}
            <div>
              <h3 className="font-serif text-2xl text-stone-900 mb-4">
                Gabby Welson
              </h3>
              <div className="space-y-6 text-stone-600 text-lg leading-relaxed font-light">
                <p>
                  I'm Gabby—a lifelong learner based in San Francisco who
                  believes the right resource at the right time can change
                  everything. I built Curricula because I was tired of wading
                  through mediocre content to find the gems.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <span className="text-2xl">📍</span>
                    <span>Living in San Francisco</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-2xl">🐱</span>
                    <span>Proud cat mom</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-2xl">📚</span>
                    <span>
                      Perpetual student—always reading, watching, or listening
                      to something new
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
