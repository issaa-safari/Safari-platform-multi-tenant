export const locales = ["en", "fr", "es"] as const;
export type Locale = (typeof locales)[number];
export function localeOf(value: unknown): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : "en";
}
export const languageNames = { en: "English", fr: "Français", es: "Español" };
export function directionOf(locale: string): "ltr" | "rtl" {
  return /^(ar|he|fa|ur)(-|$)/i.test(locale) ? "rtl" : "ltr";
}
export const currencies = [
  "USD",
  "EUR",
  "GBP",
  "KES",
  "TZS",
  "ZAR",
  "CAD",
  "AUD",
  "JPY",
  "CHF",
];
export const countries = [
  "KE",
  "TZ",
  "UG",
  "RW",
  "ZA",
  "BW",
  "NA",
  "ZM",
  "ZW",
  "GB",
  "US",
  "FR",
  "ES",
  "DE",
  "CA",
  "AU",
  "IN",
  "AE",
];
export const timeZones = [
  "Africa/Nairobi",
  "Africa/Dar_es_Salaam",
  "Africa/Johannesburg",
  "Africa/Kigali",
  "Europe/London",
  "Europe/Paris",
  "Europe/Madrid",
  "Europe/Berlin",
  "America/New_York",
  "America/Toronto",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Australia/Sydney",
  "UTC",
];
const en = {
  skip: "Skip to content",
  explore: "Explore safaris",
  companies: "For tour companies",
  workspace: "Workspace",
  login: "Sign in",
  logout: "Sign out",
  language: "Language",
  currency: "Currency",
  eyebrow: "EXTRAORDINARY PLACES. YOUR KIND OF JOURNEY.",
  hero: "A world of adventure.\nA safari that's yours.",
  intro:
    "Discover remarkable routes and shape a journey around the way you love to travel.",
  start: "Explore the collection",
  companyCta: "Create a company workspace",
  destination: "Destination",
  all: "All destinations",
  days: "days",
  collection: "Find your next horizon",
  collectionIntro:
    "Explore sample routes as we prepare the first operator collection.",
  sample: "Preview collection · illustrative itineraries, not bookable offers",
  kenya: "Kenya",
  tanzania: "Tanzania",
  botswana: "Botswana",
  kenyaTitle: "Across the Kenyan plains",
  tanzaniaTitle: "The northern Tanzania circuit",
  botswanaTitle: "Waterways of the Okavango",
  kenyaDescription:
    "From the lakes of the Rift Valley to the open landscapes of the Masai Mara.",
  tanzaniaDescription:
    "Tarangire, the Serengeti and the Ngorongoro highlands, at an unhurried pace.",
  botswanaDescription:
    "A slower journey through the delta's channels and the wildlife of Chobe.",
  route: "Route",
  viewRoute: "Explore route",
  back: "Back to the collection",
  previewNote:
    "This is a sample itinerary. Operator offers, prices and availability will be published after review.",
  companyEyebrow: "ONE WORKSPACE. YOUR ENTIRE COMPANY.",
  companyTitle: "Bring your safari business together.",
  companyIntro:
    "Start with a private company workspace and client records. Quotes, bookings and supplier collaboration are the next build milestones.",
  feature1: "Your own company space",
  feature1body:
    "Keep your client records separate and switch between the companies you belong to.",
  feature2: "Built for international business",
  feature2body:
    "Choose your company's currency, country, language and local time zone.",
  feature3: "A foundation for your workflow",
  feature3body:
    "Set up your company now as we build the proposal-to-booking journey.",
  footer:
    "Safari Platform · An international safari marketplace in development",
  firstRelease: "Foundation release",
  authTitle: "Welcome to your next chapter",
  authIntro:
    "Sign in or create an account to set up your private company workspace.",
  email: "Email address",
  password: "Password",
  signup: "Create account",
  passwordHint: "Use at least 12 characters.",
  confirmEmail: "Check your email to confirm your account, then sign in.",
  invalidCredentials:
    "Unable to sign in. Check your details and email confirmation.",
  authFailed:
    "Account creation could not be completed. Please try again later.",
  invalidForm: "Please check the entered details.",
  unavailable:
    "Company accounts are not available yet. Please try again later.",
  failed: "We couldn't complete that request. Please try again.",
  yourCompanies: "Your company workspaces",
  companyListIntro:
    "Choose a workspace or create a new one. Access is based on your active company membership.",
  noCompanies: "Your first workspace starts here.",
  createCompany: "Create a company",
  companyName: "Company name",
  slug: "Workspace address",
  slugHint:
    "3–63 lowercase letters, numbers or hyphens. Start and end with a letter or number.",
  country: "Company country",
  baseCurrency: "Company base currency",
  defaultLocale: "Company language",
  timeZone: "Company time zone",
  create: "Create workspace",
  open: "Open workspace",
  clients: "Clients",
  clientIntro: "Your company's private client directory.",
  noClients: "No client records yet. Add your first client to get started.",
  addClient: "Add a client",
  name: "Full name",
  phone: "Phone (international format)",
  notes: "Private notes",
  saveClient: "Save client",
  settings: "Company settings",
  saveSettings: "Save settings",
  saved: "Changes saved.",
  duplicate: "That workspace address or client email is already in use here.",
  denied: "You don't have permission to make this change.",
  role: "Role",
  dashboard: "Company overview",
  clientCount: "Client records",
  members: "Active team members",
  settingsIntro:
    "Regional preferences for your company. Contract and traveler display currencies will be handled separately as pricing is added.",
  manageIntro:
    "Client management is available. Quote and booking workflows are coming in the next milestones.",
  account: "Account",
  loading: "Loading…",
  sampleDay: "Travel and wildlife experiences arranged around this route.",
  notFound: "This page could not be found.",
  home: "Return home",
  workspaceId: "Company workspace",
  newCompany: "New company",
  required: "Required",
  edit: "Edit",
  editClient: "Edit client",
  cancel: "Cancel",
  updated: "Last updated",
  memberReadOnly: "Your role does not allow changes to client records.",
};
type Messages = typeof en;
const fr: Messages = {
  skip: "Aller au contenu",
  explore: "Explorer les safaris",
  companies: "Pour les agences",
  workspace: "Espace de travail",
  login: "Se connecter",
  logout: "Se déconnecter",
  language: "Langue",
  currency: "Devise",
  eyebrow: "DES LIEUX EXTRAORDINAIRES. VOTRE FAÇON DE VOYAGER.",
  hero: "Un monde d'aventure.\nUn safari à votre image.",
  intro:
    "Découvrez des itinéraires remarquables et créez un voyage adapté à vos envies.",
  start: "Explorer la collection",
  companyCta: "Créer un espace entreprise",
  destination: "Destination",
  all: "Toutes les destinations",
  days: "jours",
  collection: "Trouvez votre prochain horizon",
  collectionIntro:
    "Découvrez des exemples de circuits pendant la préparation de notre première collection.",
  sample: "Collection en aperçu · exemples d'itinéraires non réservables",
  kenya: "Kenya",
  tanzania: "Tanzanie",
  botswana: "Botswana",
  kenyaTitle: "À travers les plaines du Kenya",
  tanzaniaTitle: "Le circuit du nord de la Tanzanie",
  botswanaTitle: "Les voies d'eau de l'Okavango",
  kenyaDescription:
    "Des lacs de la vallée du Rift aux grands espaces du Masai Mara.",
  tanzaniaDescription:
    "Tarangire, le Serengeti et les hauts plateaux du Ngorongoro, à votre rythme.",
  botswanaDescription:
    "Un voyage paisible entre les canaux du delta et la faune de Chobe.",
  route: "Itinéraire",
  viewRoute: "Voir le circuit",
  back: "Retour à la collection",
  previewNote:
    "Cet itinéraire est un exemple. Les offres, tarifs et disponibilités seront publiés après validation.",
  companyEyebrow: "UN ESPACE POUR TOUTE VOTRE ENTREPRISE.",
  companyTitle: "Réunissez votre activité safari.",
  companyIntro:
    "Commencez par un espace privé et un fichier clients. Devis, réservations et fournisseurs suivront.",
  feature1: "Votre espace entreprise",
  feature1body:
    "Séparez vos fichiers clients et passez d'une entreprise à l'autre.",
  feature2: "Pensé pour l'international",
  feature2body:
    "Choisissez la devise, le pays, la langue et le fuseau horaire de votre entreprise.",
  feature3: "Les bases de votre organisation",
  feature3body:
    "Créez votre entreprise pendant le développement du parcours de réservation.",
  footer:
    "Safari Platform · Une plateforme internationale de safaris en développement",
  firstRelease: "Version initiale",
  authTitle: "Bienvenue dans votre prochaine aventure",
  authIntro:
    "Connectez-vous ou créez un compte pour configurer votre espace privé.",
  email: "Adresse e-mail",
  password: "Mot de passe",
  signup: "Créer un compte",
  passwordHint: "Utilisez au moins 12 caractères.",
  confirmEmail: "Confirmez votre compte par e-mail, puis connectez-vous.",
  invalidCredentials:
    "Connexion impossible. Vérifiez vos informations et la confirmation de votre e-mail.",
  authFailed: "La création du compte a échoué. Réessayez plus tard.",
  invalidForm: "Vérifiez les informations saisies.",
  unavailable:
    "Les comptes entreprise sont indisponibles. Réessayez plus tard.",
  failed: "Cette demande a échoué. Veuillez réessayer.",
  yourCompanies: "Vos espaces entreprise",
  companyListIntro:
    "Choisissez un espace ou créez-en un. L'accès dépend de votre adhésion active.",
  noCompanies: "Votre premier espace commence ici.",
  createCompany: "Créer une entreprise",
  companyName: "Nom de l'entreprise",
  slug: "Adresse de l'espace",
  slugHint:
    "3 à 63 lettres minuscules, chiffres ou tirets. Début et fin alphanumériques.",
  country: "Pays de l'entreprise",
  baseCurrency: "Devise de base",
  defaultLocale: "Langue de l'entreprise",
  timeZone: "Fuseau horaire",
  create: "Créer l'espace",
  open: "Ouvrir l'espace",
  clients: "Clients",
  clientIntro: "Le fichier clients privé de votre entreprise.",
  noClients: "Aucun client. Ajoutez votre premier contact.",
  addClient: "Ajouter un client",
  name: "Nom complet",
  phone: "Téléphone (format international)",
  notes: "Notes privées",
  saveClient: "Enregistrer le client",
  settings: "Paramètres de l'entreprise",
  saveSettings: "Enregistrer",
  saved: "Modifications enregistrées.",
  duplicate: "Cette adresse ou cet e-mail est déjà utilisé dans cet espace.",
  denied: "Vous n'avez pas les droits nécessaires.",
  role: "Rôle",
  dashboard: "Vue d'ensemble",
  clientCount: "Fiches clients",
  members: "Membres actifs",
  settingsIntro:
    "Préférences régionales. Les devises contractuelles et d'affichage seront gérées séparément.",
  manageIntro:
    "La gestion des clients est disponible. Devis et réservations suivront.",
  account: "Compte",
  loading: "Chargement…",
  sampleDay: "Voyage et découverte de la faune autour de cet itinéraire.",
  notFound: "Cette page est introuvable.",
  home: "Retour à l'accueil",
  workspaceId: "Espace entreprise",
  newCompany: "Nouvelle entreprise",
  required: "Obligatoire",
  edit: "Modifier",
  editClient: "Modifier le client",
  cancel: "Annuler",
  updated: "Dernière modification",
  memberReadOnly: "Votre rôle ne permet pas de modifier les clients.",
};
const es: Messages = {
  skip: "Saltar al contenido",
  explore: "Explorar safaris",
  companies: "Para operadores",
  workspace: "Espacio de trabajo",
  login: "Iniciar sesión",
  logout: "Cerrar sesión",
  language: "Idioma",
  currency: "Moneda",
  eyebrow: "LUGARES EXTRAORDINARIOS. TU FORMA DE VIAJAR.",
  hero: "Un mundo de aventura.\nUn safari a tu medida.",
  intro:
    "Descubre rutas extraordinarias y diseña un viaje según tu forma de viajar.",
  start: "Explorar la colección",
  companyCta: "Crear espacio de empresa",
  destination: "Destino",
  all: "Todos los destinos",
  days: "días",
  collection: "Encuentra tu próximo horizonte",
  collectionIntro:
    "Explora rutas de ejemplo mientras preparamos la primera colección de operadores.",
  sample: "Colección de muestra · itinerarios ilustrativos no reservables",
  kenya: "Kenia",
  tanzania: "Tanzania",
  botswana: "Botsuana",
  kenyaTitle: "Por las llanuras de Kenia",
  tanzaniaTitle: "El circuito del norte de Tanzania",
  botswanaTitle: "Los canales del Okavango",
  kenyaDescription:
    "De los lagos del valle del Rift a los paisajes abiertos del Masai Mara.",
  tanzaniaDescription:
    "Tarangire, Serengeti y las tierras altas de Ngorongoro, sin prisas.",
  botswanaDescription:
    "Un viaje tranquilo por los canales del delta y la fauna de Chobe.",
  route: "Ruta",
  viewRoute: "Ver ruta",
  back: "Volver a la colección",
  previewNote:
    "Este es un itinerario de ejemplo. Las ofertas, precios y disponibilidad se publicarán tras su revisión.",
  companyEyebrow: "UN ESPACIO PARA TODA TU EMPRESA.",
  companyTitle: "Reúne tu negocio de safaris.",
  companyIntro:
    "Empieza con un espacio privado y registros de clientes. Presupuestos, reservas y proveedores son las próximas etapas.",
  feature1: "Tu propio espacio",
  feature1body:
    "Mantén tus clientes separados y cambia entre las empresas a las que perteneces.",
  feature2: "Para empresas internacionales",
  feature2body: "Elige la moneda, país, idioma y zona horaria de tu empresa.",
  feature3: "La base de tu trabajo",
  feature3body:
    "Configura tu empresa mientras desarrollamos el proceso de reserva.",
  footer:
    "Safari Platform · Una plataforma internacional de safaris en desarrollo",
  firstRelease: "Versión inicial",
  authTitle: "Bienvenido a tu próxima aventura",
  authIntro:
    "Inicia sesión o crea una cuenta para configurar tu espacio privado.",
  email: "Correo electrónico",
  password: "Contraseña",
  signup: "Crear cuenta",
  passwordHint: "Usa al menos 12 caracteres.",
  confirmEmail:
    "Confirma tu cuenta por correo electrónico y luego inicia sesión.",
  invalidCredentials:
    "No se pudo iniciar sesión. Comprueba tus datos y la confirmación del correo.",
  authFailed: "No se pudo crear la cuenta. Inténtalo más tarde.",
  invalidForm: "Comprueba los datos introducidos.",
  unavailable:
    "Las cuentas de empresa no están disponibles. Inténtalo más tarde.",
  failed: "No pudimos completar la solicitud. Inténtalo de nuevo.",
  yourCompanies: "Tus espacios de empresa",
  companyListIntro:
    "Elige un espacio o crea uno nuevo. El acceso depende de tu pertenencia activa.",
  noCompanies: "Tu primer espacio empieza aquí.",
  createCompany: "Crear empresa",
  companyName: "Nombre de empresa",
  slug: "Dirección del espacio",
  slugHint:
    "De 3 a 63 letras minúsculas, números o guiones. Inicio y final alfanuméricos.",
  country: "País de la empresa",
  baseCurrency: "Moneda base",
  defaultLocale: "Idioma de empresa",
  timeZone: "Zona horaria",
  create: "Crear espacio",
  open: "Abrir espacio",
  clients: "Clientes",
  clientIntro: "El directorio privado de clientes de tu empresa.",
  noClients: "Sin clientes todavía. Añade tu primer contacto.",
  addClient: "Añadir cliente",
  name: "Nombre completo",
  phone: "Teléfono (formato internacional)",
  notes: "Notas privadas",
  saveClient: "Guardar cliente",
  settings: "Configuración de empresa",
  saveSettings: "Guardar cambios",
  saved: "Cambios guardados.",
  duplicate: "Esa dirección o correo ya está en uso aquí.",
  denied: "No tienes permiso para realizar este cambio.",
  role: "Rol",
  dashboard: "Resumen de empresa",
  clientCount: "Registros de clientes",
  members: "Miembros activos",
  settingsIntro:
    "Preferencias regionales. Las monedas contractuales y de visualización se gestionarán por separado.",
  manageIntro:
    "La gestión de clientes está disponible. Presupuestos y reservas son las próximas etapas.",
  account: "Cuenta",
  loading: "Cargando…",
  sampleDay: "Viaje y experiencias de fauna en torno a esta ruta.",
  notFound: "No se encontró esta página.",
  home: "Volver al inicio",
  workspaceId: "Espacio de empresa",
  newCompany: "Nueva empresa",
  required: "Obligatorio",
  edit: "Editar",
  editClient: "Editar cliente",
  cancel: "Cancelar",
  updated: "Última actualización",
  memberReadOnly: "Tu rol no permite modificar clientes.",
};
export type MessageKey = keyof Messages;
export function messages(locale: Locale): Messages {
  return { en, fr, es }[locale];
}
export function money(value: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    value,
  );
}
export function dateTime(value: string, locale: string, timeZone: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(value));
}
