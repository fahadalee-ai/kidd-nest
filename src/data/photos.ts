import logoColor from "@/img/logo.png";
import logoWhite from "@/img/logo-white.png";
import { asset } from "@/lib/utils";

export const LOGO = {
  color: logoColor,
  white: logoWhite,
};

export const PHOTO: Record<string, string> = {
  onboarding1: asset("/assets/img-01-onboarding.jpg"),
  onboarding2: asset("/assets/img-02-onboarding.jpg"),
  onboarding3: asset("/assets/img-03-onboarding.jpg"),
  login: asset("/assets/img-04-login.jpg"),
  register: asset("/assets/img-05-register.jpg"),
  emptyBookings: asset("/assets/empty-bookings.svg"),
  emptyMessages: asset("/assets/empty-messages.svg"),
  daycare: asset("/assets/img-08-daycare.jpg"),
  nanny: asset("/assets/img-09-nanny.jpg"),
  sitter: asset("/assets/img-10-sitter.jpg"),
  afterschool: asset("/assets/img-11-afterschool.jpg"),
  special: asset("/assets/img-12-special.jpg"),
  infant: asset("/assets/img-13-infant.jpg"),
  backup: asset("/assets/img-14-backup.jpg"),
  camp: asset("/assets/img-15-camp.jpg"),
  overnight: asset("/assets/img-10-sitter.jpg"),
  dropin: asset("/assets/img-08-daycare.jpg"),
  tutoring: asset("/assets/img-11-afterschool.jpg"),
  housekeeping: asset("/assets/img-09-nanny.jpg"),
  nap: asset("/assets/img-16-nap.jpg"),
  playground: asset("/assets/img-17-playground.jpg"),
  art: asset("/assets/img-18-art.jpg"),
  garden: asset("/assets/img-19-garden.jpg"),
  lunch: asset("/assets/img-20-lunch.jpg"),
  library: asset("/assets/img-21-library.jpg"),
  music: asset("/assets/img-22-music.jpg"),
  entrance: asset("/assets/img-23-entrance.jpg"),
  reception: asset("/assets/img-24-reception.jpg"),
  stem: asset("/assets/img-25-stem.jpg"),
  maya: asset("/assets/img-26-maya.jpg"),
  jordan: asset("/assets/img-27-jordan.jpg"),
  priya: asset("/assets/img-28-priya.jpg"),
  chris: asset("/assets/img-29-chris.jpg"),
  elena: asset("/assets/img-26-maya.jpg"),
  marcus: asset("/assets/img-27-jordan.jpg"),
  hannah: asset("/assets/img-28-priya.jpg"),
  andre: asset("/assets/img-29-chris.jpg"),
  emma: asset("/assets/child-emma.svg"),
  liam: asset("/assets/child-liam.svg"),
  noah: asset("/assets/child-noah.svg"),
  baby: asset("/assets/child-baby.svg"),
  toddler: asset("/assets/child-toddler.svg"),
  logo: logoColor,
  logoFull: logoColor,
};

export function photoSrc(id: string) {
  if (id.startsWith("data:") || id.startsWith("blob:") || id.startsWith("http")) return id;
  return PHOTO[id] ?? PHOTO.daycare;
}
