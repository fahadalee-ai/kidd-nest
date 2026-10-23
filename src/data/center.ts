export type Program = {
  id: string;
  name: string;
  nameEs: string;
  ages: string;
  blurb: string;
  blurbEs: string;
  photo: string;
  description: string;
  hours: string;
  tuition: string;
  ratio: string;
  availability: "Open" | "Few spots" | "Waitlist";
  spots: number;
  who: string;
  day: string[];
  meals: string;
  bring: string[];
  faqs: { q: string; a: string }[];
};

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  program: string;
  photo: string;
  bio: string;
  years: number;
  languages: string;
  certs: string;
};

export const PROGRAMS: Program[] = [
  {
    id: "infant",
    name: "Infant Care",
    nameEs: "Cuidado de bebés",
    ages: "6 weeks–12 months",
    blurb: "Calm routines, bottles, and one-to-one holding.",
    blurbEs: "Rutinas tranquilas, biberones y brazos disponibles.",
    photo: "infant",
    description: "A quiet nursery for the youngest children at our Austin center. Teachers follow each baby’s own rhythm for feeding, sleep, and play.",
    hours: "Mon–Fri 7:00 AM–6:00 PM",
    tuition: "$1,650 / month full-time",
    ratio: "1 teacher to 4 infants · 8 children max",
    availability: "Few spots",
    spots: 2,
    who: "Babies from 6 weeks who are ready for a small, licensed classroom.",
    day: ["7:30 Arrival and bottles", "9:00 Tummy time and songs", "10:30 Nap", "12:00 Lunch and outdoor stroller", "2:00 Nap", "4:00 Floor play"],
    meals: "Parent-provided bottles and solids. We warm and log every feeding.",
    bring: ["Diapers", "Two changes of clothes", "Labeled bottles", "Sleep sack"],
    faqs: [{ q: "Can I visit at nap time?", a: "Yes. Call the front desk and we will meet you at the secure door." }],
  },
  {
    id: "toddler",
    name: "Toddler Program",
    nameEs: "Programa de caminantes",
    ages: "1–2 years",
    blurb: "Sensory play, first words, and steady naps.",
    blurbEs: "Juego sensorial, primeras palabras y siestas estables.",
    photo: "daycare",
    description: "Toddlers explore with soft blocks, songs, and outdoor time. Teachers name feelings and keep the day predictable.",
    hours: "Mon–Fri 7:00 AM–6:00 PM",
    tuition: "$1,480 / month full-time",
    ratio: "1 teacher to 6 toddlers · 12 children max",
    availability: "Open",
    spots: 4,
    who: "Walkers who are ready for a classroom of friends.",
    day: ["8:00 Breakfast", "9:15 Circle", "10:00 Outdoor play", "11:30 Lunch", "12:30 Nap", "3:00 Art or music"],
    meals: "Breakfast, lunch, and two snacks. Nut-free kitchen.",
    bring: ["Diapers or extra underwear", "Water bottle", "Family photo"],
    faqs: [{ q: "Do you help with potty learning?", a: "Yes, on the plan you share with the lead teacher." }],
  },
  {
    id: "preschool",
    name: "Preschool",
    nameEs: "Preescolar",
    ages: "3–4 years",
    blurb: "Art, stories, and friends in a small class.",
    blurbEs: "Arte, cuentos y amigos en un grupo pequeño.",
    photo: "art",
    description: "Preschoolers paint, build, and practice taking turns. The week mixes play with early literacy and outdoor time.",
    hours: "Mon–Fri 7:00 AM–6:00 PM",
    tuition: "$1,290 / month full-time · $980 part-time",
    ratio: "1 teacher to 9 children · 16 children max",
    availability: "Open",
    spots: 5,
    who: "Three- and four-year-olds who are toilet learning or trained.",
    day: ["8:15 Breakfast", "9:00 Morning meeting", "9:30 Centers", "11:45 Lunch", "1:00 Rest", "3:15 Playground"],
    meals: "Breakfast, lunch, and an afternoon snack prepared in our kitchen.",
    bring: ["Extra clothes", "Small blanket", "Closed-toe shoes"],
    faqs: [{ q: "Is rest required?", a: "Quiet rest is part of the day. Children who wake early look at books on their cot." }],
  },
  {
    id: "prek",
    name: "Pre-K",
    nameEs: "Pre-K",
    ages: "4–5 years",
    blurb: "Letters, numbers, and kindergarten readiness.",
    blurbEs: "Letras, números y preparación para kínder.",
    photo: "library",
    description: "Pre-K builds confidence with letters, counting, and longer projects. Teachers write a short note home each day.",
    hours: "Mon–Fri 7:00 AM–6:00 PM",
    tuition: "$1,240 / month full-time",
    ratio: "1 teacher to 10 children · 18 children max",
    availability: "Few spots",
    spots: 3,
    who: "Children who turn four by September 1 and are heading to kindergarten next year.",
    day: ["8:30 Greeting", "9:00 Literacy", "10:15 Outdoor play", "11:30 Lunch", "12:30 Rest", "2:00 Math and science"],
    meals: "Same nut-free menu as preschool, with allergy tags on every dish.",
    bring: ["Backpack", "Water bottle", "Change of clothes"],
    faqs: [{ q: "Do you teach letter sounds?", a: "Yes. We use short, playful lessons, not worksheets as the whole day." }],
  },
  {
    id: "schoolage",
    name: "Before & After School",
    nameEs: "Antes y después de clases",
    ages: "5–12 years",
    blurb: "Homework, art, and a calm pickup.",
    blurbEs: "Tareas, arte y una salida tranquila.",
    photo: "afterschool",
    description: "School-age children start or end the day at the center. There is a snack, homework time, and a choice of clubs.",
    hours: "Mon–Fri 7:00–8:30 AM and 3:00–6:00 PM",
    tuition: "$420 / month after school · $180 before school",
    ratio: "1 teacher to 12 children",
    availability: "Open",
    spots: 8,
    who: "Elementary students who need care around the school day.",
    day: ["3:15 Snack", "3:40 Homework", "4:30 Clubs", "5:15 Outdoor play"],
    meals: "Afternoon snack. Breakfast for before-school care.",
    bring: ["Homework folder", "Water bottle"],
    faqs: [{ q: "Do you pick up from school?", a: "Yes, from the three Austin ISD campuses listed in the parent handbook." }],
  },
  {
    id: "camp",
    name: "Summer & Holiday Camp",
    nameEs: "Campamento",
    ages: "5–12 years",
    blurb: "Theme weeks, splash time, and field trips.",
    blurbEs: "Semanas temáticas, agua y paseos.",
    photo: "camp",
    description: "Camp weeks run when school is out. Each week has a theme, a field trip, and optional extended care.",
    hours: "8:00 AM–3:00 PM, extended care until 6:00 PM",
    tuition: "$320 / week · $45 registration",
    ratio: "1 counselor to 10 campers",
    availability: "Open",
    spots: 12,
    who: "School-age children enrolled at KiddoNest or joining for the summer.",
    day: ["8:30 Opening circle", "9:30 Activity", "11:30 Lunch", "1:00 Splash or park", "2:30 Closing project"],
    meals: "Lunch and two snacks, or a packed lunch from home.",
    bring: ["Sunscreen", "Towel", "Closed-toe shoes"],
    faqs: [{ q: "Can I register for one week?", a: "Yes. Weeks are booked separately and show spots left." }],
  },
  {
    id: "dropin",
    name: "Drop-in & Backup Care",
    nameEs: "Cuidado de respaldo",
    ages: "1–5 years",
    blurb: "A safe extra day when plans change.",
    blurbEs: "Un día extra seguro cuando cambian los planes.",
    photo: "backup",
    description: "Enrolled families can book an extra day when a classroom has room. You see spots before you pay.",
    hours: "Mon–Fri 7:00 AM–6:00 PM",
    tuition: "$85 / day",
    ratio: "Same ratios as the child’s age group",
    availability: "Open",
    spots: 3,
    who: "Children already on file, within the age group that has open spots that day.",
    day: ["Follows the classroom schedule for that age"],
    meals: "Included when you book before 8:00 AM.",
    bring: ["The usual cubby supplies"],
    faqs: [{ q: "How late can I book?", a: "Same-day backup is open until 9:00 AM if a spot remains." }],
  },
  {
    id: "nightout",
    name: "Parents' Night Out",
    nameEs: "Noche de padres",
    ages: "3–10 years",
    blurb: "Pizza, a movie, and teachers you already know.",
    blurbEs: "Pizza, película y maestros que ya conocen a tus hijos.",
    photo: "entrance",
    description: "One Friday evening a month the center stays open for a cozy night in. Pajamas welcome.",
    hours: "Fridays 5:30–9:00 PM",
    tuition: "$45 per child",
    ratio: "1 teacher to 8 children",
    availability: "Few spots",
    spots: 6,
    who: "Enrolled children who are comfortable staying for the evening.",
    day: ["5:30 Arrival", "6:00 Pizza", "6:45 Movie or games", "8:30 Wind-down"],
    meals: "Cheese or dairy-free pizza and fruit. Allergy list is checked at the door.",
    bring: ["Pajamas", "Comfort item"],
    faqs: [{ q: "Is this every Friday?", a: "Once a month. Dates are on the center calendar." }],
  },
  {
    id: "support",
    name: "Special Needs Support",
    nameEs: "Apoyo para necesidades especiales",
    ages: "All ages at the center",
    blurb: "Inclusive classrooms with a written plan for each child.",
    blurbEs: "Salones inclusivos con un plan escrito para cada niño.",
    photo: "daycare",
    description: "Children stay in their regular KiddoNest classroom. Teachers follow the accommodations you share, and our health lead coordinates therapies that visit the center.",
    hours: "During the child’s enrolled program",
    tuition: "Included in classroom tuition",
    ratio: "Extra adult added when the plan calls for it",
    availability: "Open",
    spots: 3,
    who: "Children who need sensory, medical, or learning accommodations.",
    day: ["Arrival check of the care plan", "Classroom with peers", "Quiet break when needed", "Notes to parents at pickup"],
    meals: "The kitchen follows the same allergy list as the rest of the center.",
    bring: ["Written care plan", "Any equipment the child uses at home"],
    faqs: [{ q: "Do you have a separate classroom?", a: "No. Support happens inside the child’s regular room." }],
  },
  {
    id: "enrichment",
    name: "Enrichment Classes",
    nameEs: "Clases extra",
    ages: "3–12 years",
    blurb: "Music, STEM, art, yoga, and language after the school day.",
    blurbEs: "Música, STEM, arte, yoga e idiomas después del día escolar.",
    photo: "art",
    description: "Short classes taught by KiddoNest staff in the art room and indoor gym. Enrolled children can add a class without a second pickup.",
    hours: "Mon–Thu 3:30–4:15 PM",
    tuition: "$85 / month per class",
    ratio: "1 teacher to 8 children",
    availability: "Few spots",
    spots: 5,
    who: "Preschool, Pre-K, and school-age children already at the center.",
    day: ["3:30 Transition from classroom", "3:40 Lesson", "4:10 Clean-up and pickup"],
    meals: "Water only. Snack is earlier in the school-age room.",
    bring: ["Water bottle"],
    faqs: [{ q: "Can a child try one week?", a: "Yes. Ask the front office to add a trial week." }],
  },
];

export const STAFF: StaffMember[] = [
  { id: "elena", name: "Elena Vasquez", role: "Director", program: "Center", photo: "elena", bio: "Elena opened the Barton Springs classrooms and still greets families at the door most mornings.", years: 14, languages: "English, Spanish", certs: "M.Ed. ECE · CPR · First Aid" },
  { id: "hannah", name: "Hannah Brooks", role: "Assistant Director", program: "Center", photo: "hannah", bio: "Hannah leads enrollment, tours, and the daily staffing plan.", years: 9, languages: "English", certs: "B.S. Child Development · CPR" },
  { id: "maya", name: "Maya Chen", role: "Lead Teacher", program: "Preschool", photo: "maya", bio: "Maya runs the Sunshine preschool room and writes the afternoon notes.", years: 7, languages: "English, Mandarin", certs: "CDA · CPR · First Aid" },
  { id: "jordan", name: "Jordan Blake", role: "Lead Teacher", program: "Pre-K", photo: "jordan", bio: "Jordan teaches letters through stories, blocks, and a very patient reading rug.", years: 6, languages: "English", certs: "B.A. Education · CPR" },
  { id: "priya", name: "Priya Shah", role: "Infant Lead", program: "Infant Care", photo: "priya", bio: "Priya keeps the nursery quiet and the feeding logs exact.", years: 8, languages: "English, Hindi", certs: "CDA Infant · CPR" },
  { id: "marcus", name: "Marcus Hale", role: "School-age Lead", program: "Before & After School", photo: "marcus", bio: "Marcus runs homework club and the Friday soccer game.", years: 5, languages: "English", certs: "CPR · First Aid" },
  { id: "andre", name: "Andre Lewis", role: "Health Lead", program: "Center", photo: "andre", bio: "Andre manages medications, incident reports, and the first-aid room.", years: 11, languages: "English", certs: "RN · CPR instructor" },
  { id: "chris", name: "Chris Nguyen", role: "Office Admin", program: "Front Office", photo: "chris", bio: "Chris handles billing questions, tours on the calendar, and the front desk.", years: 4, languages: "English, Vietnamese", certs: "Notary" },
];

export const MENU = [
  { day: "Mon", meal: "Pasta, cucumber, melon" },
  { day: "Tue", meal: "Rice, black beans, fruit" },
  { day: "Wed", meal: "Turkey sandwich, carrots" },
  { day: "Thu", meal: "Veggie chili, cornbread" },
  { day: "Fri", meal: "Cheese quesadilla, apples" },
];

export const TRUST = ["State Licensed", "CPR / First Aid", "Background-Checked", "Secure Entry", "Low Ratios"];

const CARE: Record<string, { program: string; photo: string; staff: string }> = {
  "little-nest": { program: "Preschool", photo: "art", staff: "maya" },
  "maya-alvarez": { program: "Pre-K", photo: "library", staff: "jordan" },
  "priya-shah": { program: "Infant Care", photo: "infant", staff: "priya" },
  "riverside": { program: "Before & After School", photo: "afterschool", staff: "marcus" },
  "tiny-sprouts": { program: "Toddler Program", photo: "daycare", staff: "hannah" },
  "hill-country": { program: "Summer Camp", photo: "camp", staff: "marcus" },
  "calm-harbor": { program: "Drop-in Care", photo: "backup", staff: "elena" },
  "readycare": { program: "Backup Care", photo: "backup", staff: "chris" },
  "chris-nguyen": { program: "Parents' Night Out", photo: "entrance", staff: "chris" },
};

export function carePlace(providerId: string) {
  const row = CARE[providerId] ?? { program: "Preschool", photo: "daycare", staff: "maya" };
  const person = staffById(row.staff);
  return { program: row.program, photo: row.photo, teacher: person.name, role: person.role };
}

export function programById(id: string) {
  return PROGRAMS.find((item) => item.id === id) ?? PROGRAMS[0];
}

export function staffById(id: string) {
  return STAFF.find((item) => item.id === id) ?? STAFF[0];
}
