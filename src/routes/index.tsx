import { createFileRoute } from "@tanstack/react-router";
import { KiddoApp } from "@/app/KiddoApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KiddoNest" },
      {
        name: "description",
        content: "Trusted Care. Happy Kids. Peace of Mind. Find daycares, nannies, and babysitters, then follow your child’s day.",
      },
    ],
  }),
  component: KiddoApp,
});
