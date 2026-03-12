import { Guest, Payment, Donation, User, Room, Child, PromptVersion } from '../types';

const GUESTS_KEY = 'hospederia_guests';
const PAYMENTS_KEY = 'sf_payments';
const DONATIONS_KEY = 'sf_donations';
const DONATION_CATEGORIES_KEY = 'sf_donation_categories';
const USERS_KEY = 'sf_users';
const ROOMS_KEY = 'sf_rooms';
const PROMPTS_KEY = 'hospederia_prompts';
const CAUSES_KEY = 'sf_causes';

const DEFAULT_CAUSES = ['Migración', 'Situación de Calle', 'VIF', 'Salud', 'Otro'];
const DEFAULT_DONATION_CATEGORIES = ['Frecuente', 'Spot', 'Fijo', 'Extra', 'Campaña', 'Otro'];

const DEFAULT_PROMPT = `
Actúa como un experto Consultor de Gestión Social y Analista de Datos para la "Hospedería Santa Francisca Romana".
Analiza los siguientes datos estadísticos del último periodo y entrega un informe ejecutivo breve (máximo 3 párrafos) 
con conclusiones y recomendaciones estratégicas.

DATOS DEL PERIODO:
- Ocupación Promedio: {{avgOccupancyCount}} personas ({{occupancyPercentage}}%)
- Nuevos Ingresos: {{newEntries}}
- Altas/Salidas: {{exits}}
- Total de Niños: {{totalChildren}}
- Recaudación Real: \${{actualPayments}}
- Deuda Pendiente: \${{pendingDebt}}
- Distribución de Causas: {{causeData}}
- Diversidad de Nacionalidades: {{countryData}}

POR FAVOR:
1. Identifica la tendencia principal (ej. si la migración de un país específico está subiendo).
2. Da un consejo sobre la sostenibilidad financiera basado en los pagos pendientes.
3. Sugiere una acción para el cuidado de los niños si el número es alto.

Escribe en un tono profesional, empático y estratégico.
`;

const seedData = () => {
  const guests: Guest[] = [
    // ... existing seed data ...
    // --- NOVIEMBRE 2025 ---
    {
      id: 'g-1', internalId: 'REF-674225-2', nombre: 'Elisa Maria California Caceres', rut: '16.903.977-1',
      nacimiento: '1988-05-15', pais: 'Chile', ciudad: 'Santiago', causa: 'Situación habitacional',
      institucionDerivadora: 'Independencia', esRecurrente: false, tieneHijos: true, cantidadHijos: 2,
      hijosDetalles: [
        { id: 'c-1-1', internalId: 'REF-674225-2-1', nombre: 'Hijo 1', apellido: 'California', nacimiento: '', nacionalidad: 'Chile', seAloja: true, roomId: 'room-h1', bedId: 'H1-2' },
        { id: 'c-1-2', internalId: 'REF-674225-2-2', nombre: 'Hijo 2', apellido: 'California', nacimiento: '', nacionalidad: 'Chile', seAloja: true, roomId: 'room-h1', bedId: 'H1-3' }
      ], fechaIngreso: '2025-11-24', roomId: 'room-h1', bedId: 'H1-1',
      comentarios: '2 hijos de 5 y 7 años.'
    },
    {
      id: 'g-2', internalId: 'REF-674235-3', nombre: 'Geidy Lorena Ceballos García', rut: 'be132308',
      nacimiento: '', pais: 'Colombia', ciudad: 'Bogotá', causa: 'VIF / Migratorio',
      institucionDerivadora: 'La Florida', esRecurrente: false, tieneHijos: true, cantidadHijos: 1,
      hijosDetalles: [
        { id: 'c-2-1', internalId: 'REF-674235-3-1', nombre: 'Hija', apellido: 'Ceballos', nacimiento: '', nacionalidad: 'Colombia', seAloja: true, roomId: 'room-h2', bedId: 'H2-2' }
      ],
      fechaIngreso: '2025-11-24', roomId: 'room-h2', bedId: 'H2-1',
      comentarios: 'Hija de 2 años 10 meses.'
    },
    {
      id: 'g-3', internalId: 'REF-674238-4', nombre: 'Yenny del Carmen Gonzalez', rut: '19646070',
      nacimiento: '', pais: 'Venezuela', ciudad: 'Caracas', causa: 'VIF',
      institucionDerivadora: 'OLN', esRecurrente: false, tieneHijos: true, cantidadHijos: 3,
      hijosDetalles: [
        { id: 'c-3-1', internalId: 'REF-674238-4-1', nombre: 'Erickmar', apellido: 'Gonzalez', nacimiento: '', nacionalidad: 'Venezuela', seAloja: true, roomId: 'room-h3', bedId: 'H3-2' },
        { id: 'c-3-2', internalId: 'REF-674238-4-2', nombre: 'Iramar', apellido: 'Gonzalez', nacimiento: '', nacionalidad: 'Venezuela', seAloja: true, roomId: 'room-h3', bedId: 'H3-3' },
        { id: 'c-3-3', internalId: 'REF-674238-4-3', nombre: 'Marlos', apellido: 'Gonzalez', nacimiento: '', nacionalidad: 'Venezuela', seAloja: true, roomId: 'room-h4', bedId: 'H4-2' }
      ],
      fechaIngreso: '2025-11-25', roomId: 'room-h3', bedId: 'H3-1',
      comentarios: '7 años, 5 años y 4 meses.'
    },
    {
      id: 'g-4', internalId: 'REF-674239-5', nombre: 'Sarai Rebeca Castro Bermudez', rut: 'V-256',
      nacimiento: '', pais: 'Venezuela', ciudad: 'Valencia', causa: 'VIF / Calle',
      institucionDerivadora: 'CDM', esRecurrente: false, tieneHijos: true, cantidadHijos: 2,
      hijosDetalles: [
        { id: 'c-4-1', internalId: 'REF-674239-5-1', nombre: 'Hijo 1', apellido: 'Castro', nacimiento: '', nacionalidad: 'Venezuela', seAloja: true, roomId: 'room-h4', bedId: 'H4-3' },
        { id: 'c-4-2', internalId: 'REF-674239-5-2', nombre: 'Hijo 2', apellido: 'Castro', nacimiento: '', nacionalidad: 'Venezuela', seAloja: true, roomId: 'room-h5', bedId: 'H5-1' }
      ],
      fechaIngreso: '2025-11-25', roomId: 'room-h4', bedId: 'H4-1',
      comentarios: 'Hijos de 3 y 6 años.'
    },

    // --- DICIEMBRE 2025 ---
    {
      id: 'g-5', internalId: 'REF-674244-9', nombre: 'Myriam Loncón Vásquez', rut: '19881713-1',
      nacimiento: '', pais: 'Chile', ciudad: 'Santiago', causa: 'Calle / VIF',
      institucionDerivadora: 'OLN', esRecurrente: false, tieneHijos: true, cantidadHijos: 1,
      hijosDetalles: [
        { id: 'c-5-1', internalId: 'REF-674244-9-1', nombre: 'Natacha', apellido: 'Loncon', nacimiento: '', nacionalidad: 'Chile', seAloja: true, roomId: 'room-h5', bedId: 'H5-3' }
      ],
      fechaIngreso: '2025-11-26', roomId: 'room-h5', bedId: 'H5-2',
      comentarios: 'Hija de 11 años.'
    },
    {
      id: 'g-12', internalId: 'REF-674247-12', nombre: 'Alda Rosa Morelli Vengas', rut: '10.178.517-3',
      nacimiento: '', pais: 'Chile', ciudad: 'Santiago', causa: 'Situación calle',
      institucionDerivadora: 'I.M. Santiago', esRecurrente: false, tieneHijos: true, cantidadHijos: 1,
      hijosDetalles: [
        { id: 'c-12-1', internalId: 'REF-674247-12-1', nombre: 'Hijo', apellido: 'Morelli', nacimiento: '', nacionalidad: 'Chile', seAloja: true, roomId: 'room-h6', bedId: 'H6-1' }
      ],
      fechaIngreso: '2025-12-01', roomId: 'room-h5', bedId: 'H5-4',
      comentarios: 'Hijo edad no especificada.'
    },
    {
      id: 'g-20', internalId: 'REF-674255-20', nombre: 'Mariuxi Espinoza Salvatierra', rut: '25.059.741-k',
      nacimiento: '', pais: 'Ecuador', ciudad: 'Quito', causa: 'VIF',
      institucionDerivadora: 'CESFAM Recoleta', esRecurrente: false, tieneHijos: true, cantidadHijos: 1,
      hijosDetalles: [
        { id: 'c-20-1', internalId: 'REF-674255-20-1', nombre: 'Gohan', apellido: 'Trujillo', nacimiento: '', nacionalidad: 'Ecuador', seAloja: true, roomId: 'room-h2', bedId: 'H2-3' }
      ],
      fechaIngreso: '2025-12-12', roomId: 'room-h2', bedId: 'H2-3',
      comentarios: 'Usuaria de Ecuador, ingresó el 12.12.2025.'
    },
    {
      id: 'g-21', internalId: 'REF-674256-21', nombre: 'Lifaite Dorcelus', rut: 'S/R',
      nacimiento: '', pais: 'Haití', ciudad: 'Puerto Príncipe', causa: 'Calle',
      institucionDerivadora: 'Hospital', esRecurrente: false, tieneHijos: false, cantidadHijos: 0,
      hijosDetalles: [], fechaIngreso: '2025-12-15', roomId: 'room-h1', bedId: 'H1-4', // Se añade cama extra virtualmente si es necesario
      comentarios: 'Usuaria de Haití.'
    },

    // --- ENERO 2026 ---
    {
      id: 'g-23', internalId: 'REF-441866-23', nombre: 'SOLANGE MACARENA IBAÑEZ PAZ', rut: '16.321.981-0',
      nacimiento: '', pais: 'Chile', ciudad: 'Maipú', causa: 'Salud / Calle',
      institucionDerivadora: 'Hospital San José', esRecurrente: false, tieneHijos: false, cantidadHijos: 0,
      hijosDetalles: [], fechaIngreso: '2026-01-02', roomId: 'room-h6', bedId: 'H6-2',
      comentarios: 'Hijos de 17 y 21 años NO ingresaron.'
    },
    {
      id: 'g-27', internalId: 'REF-278396-27', nombre: 'Karen Mabel Guerra Reina', rut: '15.484.282-9',
      nacimiento: '', pais: 'Chile', ciudad: 'Quilicura', causa: 'VIF / Calle',
      institucionDerivadora: 'DIDESO', esRecurrente: false, tieneHijos: false, cantidadHijos: 0,
      hijosDetalles: [], fechaIngreso: '2026-01-12', roomId: 'room-h6', bedId: 'H6-3',
      comentarios: 'Hija no vive con ella, no ingresó.'
    },
    {
      id: 'g-30', internalId: 'REF-098211-30', nombre: 'Abigail Alejandra Valdebenito', rut: '20.103.177-0',
      nacimiento: '', pais: 'Chile', ciudad: 'Santiago', causa: 'Incendio / Calle',
      institucionDerivadora: 'OLN', esRecurrente: false, tieneHijos: true, cantidadHijos: 2,
      hijosDetalles: [
        { id: 'c-30-1', internalId: 'REF-098211-30-1', nombre: 'Hijo 1', apellido: 'Valdebenito', nacimiento: '', nacionalidad: 'Chile', seAloja: true, roomId: 'room-h6', bedId: 'H6-4' },
      ],
      fechaIngreso: '2026-01-13', roomId: 'room-h6', bedId: 'H6-4',
      comentarios: 'Hijos de 7 y 3 años.'
    }
  ];

  const rooms: Room[] = [
    { id: 'room-h1', nombre: 'Habitación 1', camas: [{ id: 'H1-1', nombre: 'H1-1' }, { id: 'H1-2', nombre: 'H1-2' }, { id: 'H1-3', nombre: 'H1-3' }] },
    { id: 'room-h2', nombre: 'Habitación 2', camas: [{ id: 'H2-1', nombre: 'H2-1' }, { id: 'H2-2', nombre: 'H2-2' }, { id: 'H2-3', nombre: 'H2-3' }] },
    { id: 'room-h3', nombre: 'Habitación 3', camas: [{ id: 'H3-1', nombre: 'H3-1' }, { id: 'H3-2', nombre: 'H3-2' }, { id: 'H3-3', nombre: 'H3-3' }] },
    { id: 'room-h4', nombre: 'Habitación 4', camas: [{ id: 'H4-1', nombre: 'H4-1' }, { id: 'H4-2', nombre: 'H4-2' }, { id: 'H4-3', nombre: 'H4-3' }] },
    { id: 'room-h5', nombre: 'Habitación 5', camas: [{ id: 'H5-1', nombre: 'H5-1' }, { id: 'H5-2', nombre: 'H5-2' }, { id: 'H5-3', nombre: 'H5-3' }, { id: 'H5-4', nombre: 'H5-4' }] },
    { id: 'room-h6', nombre: 'Habitación 6', camas: [{ id: 'H6-1', nombre: 'H6-1' }, { id: 'H6-2', nombre: 'H6-2' }, { id: 'H6-3', nombre: 'H6-3' }, { id: 'H6-4', nombre: 'H6-4' }] }
  ];

  const users: User[] = [
    {
      id: 'admin-1',
      nombre: 'Administrador Master',
      email: '2020fbustos@gmail.com',
      // Hash de 'testeoapli#1999' para demostración segura. 
      // En una implementación real, esto vendría de un proceso de registro seguro.
      password: '984b648316df080753086eb01e6a256976a47012678822f36070622416805164',
      role: 'Admin',
      activo: true
    }
  ];

  localStorage.setItem(GUESTS_KEY, JSON.stringify(guests));
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify([]));
  localStorage.setItem(DONATIONS_KEY, JSON.stringify([]));
  localStorage.setItem(CAUSES_KEY, JSON.stringify(DEFAULT_CAUSES));

  const initialPrompts: PromptVersion[] = [
    {
      id: 'p-1',
      timestamp: new Date().toISOString(),
      descripcion: 'Versión Inicial (Default)',
      prompt: DEFAULT_PROMPT,
      isActive: true
    }
  ];
  localStorage.setItem(PROMPTS_KEY, JSON.stringify(initialPrompts));
};

export const getPrompts = (): PromptVersion[] => {
  const data = localStorage.getItem(PROMPTS_KEY);
  if (!data) {
    const initialPrompts: PromptVersion[] = [
      {
        id: 'p-1',
        timestamp: new Date().toISOString(),
        descripcion: 'Versión Inicial (Default)',
        prompt: DEFAULT_PROMPT,
        isActive: true
      }
    ];
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(initialPrompts));
    return initialPrompts;
  }
  return JSON.parse(data);
};

export const savePrompts = (prompts: PromptVersion[]) => {
  localStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
};

export const getActivePrompt = (): string => {
  const prompts = getPrompts();
  const active = prompts.find(p => p.isActive);
  return active ? active.prompt : DEFAULT_PROMPT;
};

export const getGuests = (): Guest[] => {
  const data = localStorage.getItem(GUESTS_KEY);
  if (!data) { seedData(); return getGuests(); }
  return JSON.parse(data);
};

export const saveGuests = (guests: Guest[]) => {
  localStorage.setItem(GUESTS_KEY, JSON.stringify(guests));
};

export const getRooms = (): Room[] => {
  const data = localStorage.getItem(ROOMS_KEY);
  if (!data) { seedData(); return getRooms(); }
  return JSON.parse(data);
};

export const saveRooms = (rooms: Room[]) => {
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
};

export const getPayments = (): Payment[] => {
  const data = localStorage.getItem(PAYMENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const savePayments = (payments: Payment[]) => {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
};

export const getDonations = (): Donation[] => {
  const data = localStorage.getItem(DONATIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveDonations = (donations: Donation[]) => {
  localStorage.setItem(DONATIONS_KEY, JSON.stringify(donations));
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) { seedData(); return getUsers(); }
  return JSON.parse(data);
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getCauses = (): string[] => {
  const data = localStorage.getItem(CAUSES_KEY);
  return data ? JSON.parse(data) : DEFAULT_CAUSES;
};

export const saveCauses = (causes: string[]) => {
  localStorage.setItem(CAUSES_KEY, JSON.stringify(causes));
};

export const getDonationCategories = (): string[] => {
  const data = localStorage.getItem(DONATION_CATEGORIES_KEY);
  return data ? JSON.parse(data) : DEFAULT_DONATION_CATEGORIES;
};

export const saveDonationCategories = (categories: string[]) => {
  localStorage.setItem(DONATION_CATEGORIES_KEY, JSON.stringify(categories));
};
