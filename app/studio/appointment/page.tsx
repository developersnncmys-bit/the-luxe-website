import type { Metadata } from "next";
import { fetchHeroFor } from "@/lib/banners-api";
import { AppointmentHero } from "@/components/studio/appointment-hero";
import { AppointmentVisit } from "@/components/studio/appointment-visit";
import { AppointmentStudio } from "@/components/studio/appointment-studio";
import { AppointmentForm } from "@/components/studio/appointment-form";

export const metadata: Metadata = {
  title: "Book an Appointment — The Luxe Version",
  description:
    "An unhurried hour at the studio. Pieces seen in person, under the light they were made for."
};

export default async function AppointmentPage() {
  // Admin override — Banners tab, page: 'appointment', type: 'hero'.
  // Each field falls back to the component's hardcoded default when the
  // banner is missing or that field is blank.
  const hero = await fetchHeroFor("appointment");

  return (
    <>
      <AppointmentHero
        image={hero?.image || undefined}
        eyebrow={hero?.eyebrow || undefined}
        title={hero?.title || undefined}
        body={hero?.body || undefined}
      />
      <AppointmentVisit />
      <AppointmentStudio />
      <AppointmentForm />
    </>
  );
}
