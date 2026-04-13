/**
 * Intelligent tutoring route (rule-based expert system).
 * No external generative AI — thresholds and copy are fixed in code.
 *
 * Policy (explicit):
 * - If score < 50%  → route to **Foundation Level** (remedial / difficulty-1 pathway).
 * - If score >= 80% → route to **Advanced Level** (stretch / difficulty-3 pathway).
 * - Otherwise (50% ≤ score < 80%) → **Core Level** (balanced / difficulty-2 pathway).
 */

export type TutoringRouteId = "foundation" | "core" | "advanced";

export type TutoringRouteDecision = {
  routeId: TutoringRouteId;
  /** Short label shown in the UI */
  label: string;
  /** Next-step guidance (still rule-based, not model-generated) */
  guidance: string;
};

export function scorePercent(correctCount: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  return Math.round((correctCount / totalQuestions) * 100);
}

export function resolveTutoringRoute(percent: number): TutoringRouteDecision {
  if (percent < 50) {
    return {
      routeId: "foundation",
      label: "Foundation Level",
      guidance:
        "Your result is below 50%. Continue with foundation-style items on this topic: repeat core definitions, work carefully through scaffolded examples, then retry a Foundation quiz before moving on.",
    };
  }

  if (percent >= 80) {
    return {
      routeId: "advanced",
      label: "Advanced Level",
      guidance:
        "Your result is 80% or higher. Move to advanced practice: multi-step problems, exam-style synthesis, and timed sets on the next syllabus node at higher difficulty.",
    };
  }

  return {
    routeId: "core",
    label: "Core Level",
    guidance:
      "Your result is between 50% and 79%. Stay on the core pathway: consolidate standard techniques, fix specific mistakes below, then attempt mixed practice before advancing.",
  };
}
