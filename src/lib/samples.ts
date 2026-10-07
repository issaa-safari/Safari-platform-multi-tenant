export const samples = [
  {
    id: "kenyan-plains",
    country: "kenya",
    title: "kenyaTitle",
    description: "kenyaDescription",
    days: 7,
    route: ["Nairobi", "Lake Naivasha", "Masai Mara"],
    image: "/images/kenya.webp",
  },
  {
    id: "tanzania-circuit",
    country: "tanzania",
    title: "tanzaniaTitle",
    description: "tanzaniaDescription",
    days: 8,
    route: ["Arusha", "Tarangire", "Serengeti", "Ngorongoro"],
    image: "/images/tanzania.webp",
  },
  {
    id: "okavango-waterways",
    country: "botswana",
    title: "botswanaTitle",
    description: "botswanaDescription",
    days: 6,
    route: ["Maun", "Okavango Delta", "Chobe"],
    image: "/images/botswana.webp",
  },
] as const;
