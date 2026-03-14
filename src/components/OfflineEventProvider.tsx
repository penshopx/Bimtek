'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface OfflineEvent {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  instructorPhone: string;
  location: string;
  city: string;
  province: string;
  date: string;
  time: string;
  duration: number;
  capacity: number;
  registered: number;
  price: number;
  module: string;
  category: string;
  status: 'open' | 'full' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  participants: EventParticipant[];
}

export interface EventParticipant {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'registered' | 'attended' | 'completed';
  registeredAt: string;
}

export interface Certificate {
  id: string;
  eventId: string;
  participantId: string;
  participantName: string;
  eventTitle: string;
  eventDate: string;
  instructorName: string;
  location: string;
  issuedAt: string;
}

interface OfflineEventContextType {
  events: OfflineEvent[];
  certificates: Certificate[];
  createEvent: (event: Omit<OfflineEvent, 'id' | 'createdAt' | 'registered' | 'participants' | 'status'>) => void;
  registerForEvent: (eventId: string, participant: Omit<EventParticipant, 'id' | 'registeredAt' | 'status'>) => Promise<boolean>;
  cancelRegistration: (eventId: string, participantId: string) => Promise<void>;
  markAttendance: (eventId: string, participantId: string) => Promise<void>;
  completeEvent: (eventId: string) => Promise<void>;
  updateEvent: (eventId: string, updates: Partial<OfflineEvent>) => void;
  deleteEvent: (eventId: string) => Promise<void>;
  getMyEvents: (participantId?: string) => OfflineEvent[];
  getMyCertificates: (participantId?: string) => Certificate[];
}

const OfflineEventContext = createContext<OfflineEventContextType | undefined>(undefined);

const sampleEvents: OfflineEvent[] = [
  {
    id: 'evt-001',
    title: 'Bimtek K3 Konstruksi Gedung',
    description: 'Pelatihan keselamatan dan kesehatan kerja di proyek konstruksi gedung bertingkat. Include Sertifikat & PKB.',
    instructorName: 'Ir. Budi Santoso, MT',
    instructorPhone: '0812-3456-7890',
    location: 'Hotel Grand Jakarta',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    date: '2026-04-15',
    time: '08:00',
    duration: 8,
    capacity: 30,
    registered: 22,
    price: 1500000,
    module: 'K3 Konstruksi',
    category: 'K3',
    status: 'open',
    createdAt: '2026-03-01',
    participants: [],
  },
  {
    id: 'evt-002',
    title: 'Bimtek Struktur Beton Bertulang',
    description: 'Pelatihan teknis perencanaan dan pelaksanaan struktur beton bertulang sesuai SNI.',
    instructorName: 'Dr. Ahmad Wijaya, ST, MT',
    instructorPhone: '0813-9876-5432',
    location: 'Gedung PT Wijaya Konstruksi',
    city: 'Surabaya',
    province: 'Jawa Timur',
    date: '2026-04-20',
    time: '09:00',
    duration: 8,
    capacity: 25,
    registered: 18,
    price: 1750000,
    module: 'Struktur Beton',
    category: 'Sipil',
    status: 'open',
    createdAt: '2026-03-05',
    participants: [],
  },
  {
    id: 'evt-003',
    title: 'Bimtek Manajemen Proyek Konstruksi',
    description: 'Pelatihan manajemen proyek dari planning hingga closeout dengan metode modern.',
    instructorName: 'Ir. Hendra Gunawan, MBA',
    instructorPhone: '0811-2233-4455',
    location: 'Aula Disnakertrans',
    city: 'Bandung',
    province: 'Jawa Barat',
    date: '2026-04-25',
    time: '08:30',
    duration: 8,
    capacity: 40,
    registered: 35,
    price: 2000000,
    module: 'Manajemen Proyek',
    category: 'Manajemen',
    status: 'full',
    createdAt: '2026-03-10',
    participants: [],
  },
  {
    id: 'evt-004',
    title: 'Bimtek Instalasi Listrik Gedung',
    description: 'Pelatihan teknis instalasi listrik gedung sesuai PUIL 2021. Includeujkjian praktik.',
    instructorName: 'Ir. Made Surya, ST',
    instructorPhone: '0821-4455-6677',
    location: 'Balai Diklat PU',
    city: 'Denpasar',
    province: 'Bali',
    date: '2026-05-05',
    time: '09:00',
    duration: 8,
    capacity: 20,
    registered: 8,
    price: 1600000,
    module: 'Instalasi Listrik',
    category: 'Elektrikal',
    status: 'open',
    createdAt: '2026-03-12',
    participants: [],
  },
];

export function OfflineEventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<OfflineEvent[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    async function fetchFromDb() {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const dbEvents = await res.json();
          if (dbEvents.length > 0) {
            setEvents(dbEvents.map((e: any) => ({ ...e, participants: [] })));
            const savedCerts = localStorage.getItem('offlineCertificates');
            if (savedCerts) setCertificates(JSON.parse(savedCerts));
            setIsHydrated(true);
            return;
          }
        }
      } catch (e) {
        console.log('DB not available, using localStorage');
      }
      
      const savedEvents = localStorage.getItem('offlineEvents');
      const savedCerts = localStorage.getItem('offlineCertificates');
      
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      } else {
        setEvents(sampleEvents);
        localStorage.setItem('offlineEvents', JSON.stringify(sampleEvents));
      }
      
      if (savedCerts) {
        setCertificates(JSON.parse(savedCerts));
      }
      setIsHydrated(true);
    }
    
    fetchFromDb();
  }, []);

  useEffect(() => {
    if (isHydrated && events.length > 0) {
      localStorage.setItem('offlineEvents', JSON.stringify(events));
    }
  }, [events, isHydrated]);

  useEffect(() => {
    if (isHydrated && certificates.length > 0) {
      localStorage.setItem('offlineCertificates', JSON.stringify(certificates));
    }
  }, [certificates, isHydrated]);

  const createEvent = async (eventData: Omit<OfflineEvent, 'id' | 'createdAt' | 'registered' | 'participants' | 'status'>) => {
    const newEvent: OfflineEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      registered: 0,
      participants: [],
      status: 'open',
    };
    
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', event: newEvent }),
      });
    } catch (e) {
      console.log('DB not available, using localStorage');
    }
    
    setEvents([newEvent, ...events]);
  };

  const registerForEvent = async (eventId: string, participant: Omit<EventParticipant, 'id' | 'registeredAt' | 'status'>): Promise<boolean> => {
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return false;
    
    const event = events[eventIndex];
    if (event.registered >= event.capacity) return false;
    if (event.participants.some(p => p.email === participant.email)) return false;

    const newParticipant: EventParticipant = {
      ...participant,
      id: `part-${Date.now()}`,
      registeredAt: new Date().toISOString(),
      status: 'registered',
    };

    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', eventId, participant: newParticipant }),
      });
    } catch (e) {
      console.log('DB not available, using localStorage');
    }

    const updatedEvent = {
      ...event,
      participants: [...event.participants, newParticipant],
      registered: event.registered + 1,
      status: event.registered + 1 >= event.capacity ? 'full' as const : 'open' as const,
    };

    const newEvents = [...events];
    newEvents[eventIndex] = updatedEvent;
    setEvents(newEvents);
    return true;
  };

  const cancelRegistration = async (eventId: string, participantId: string) => {
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;

    const event = events[eventIndex];
    const updatedParticipants = event.participants.filter(p => p.id !== participantId);

    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancelRegistration', eventId, participantId }),
      });
    } catch (e) {
      console.log('DB not available');
    }

    const updatedEvent = {
      ...event,
      participants: updatedParticipants,
      registered: updatedParticipants.length,
      status: updatedParticipants.length >= event.capacity ? 'full' as const : 'open' as const,
    };

    const newEvents = [...events];
    newEvents[eventIndex] = updatedEvent;
    setEvents(newEvents);
  };

  const markAttendance = async (eventId: string, participantId: string) => {
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;

    const event = events[eventIndex];
    const updatedParticipants = event.participants.map(p =>
      p.id === participantId ? { ...p, status: 'attended' as const } : p
    );

    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAttendance', participantId }),
      });
    } catch (e) {
      console.log('DB not available');
    }

    const updatedEvent = { ...event, participants: updatedParticipants };
    const newEvents = [...events];
    newEvents[eventIndex] = updatedEvent;
    setEvents(newEvents);
  };

  const completeEvent = async (eventId: string) => {
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;

    const event = events[eventIndex];
    
    const newCertificates: Certificate[] = event.participants
      .filter(p => p.status === 'attended')
      .map(p => ({
        id: `cert-${Date.now()}-${p.id}`,
        eventId: event.id,
        participantId: p.id,
        participantName: p.name,
        eventTitle: event.title,
        eventDate: event.date,
        instructorName: event.instructorName,
        location: event.location,
        issuedAt: new Date().toISOString(),
      }));

    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', eventId }),
      });
    } catch (e) {
      console.log('DB not available');
    }

    const updatedParticipants = event.participants.map(p => ({
      ...p,
      status: 'completed' as const,
    }));

    const updatedEvent = {
      ...event,
      participants: updatedParticipants,
      status: 'completed' as const,
    };

    const newEvents = [...events];
    newEvents[eventIndex] = updatedEvent;
    setEvents(newEvents);
    setCertificates([...certificates, ...newCertificates]);
  };

  const updateEvent = (eventId: string, updates: Partial<OfflineEvent>) => {
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;

    const updatedEvent = { ...events[eventIndex], ...updates };
    const newEvents = [...events];
    newEvents[eventIndex] = updatedEvent;
    setEvents(newEvents);
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', eventId }),
      });
    } catch (e) {
      console.log('DB not available');
    }
    setEvents(events.filter(e => e.id !== eventId));
  };

  const getMyEvents = (participantId?: string) => {
    return events.filter(e => 
      e.participants.some(p => p.id === participantId || p.email === participantId)
    );
  };

  const getMyCertificates = (participantId?: string) => {
    return certificates.filter(c => 
      c.participantId === participantId || c.participantName === participantId
    );
  };

  return (
    <OfflineEventContext.Provider value={{
      events,
      certificates,
      createEvent,
      registerForEvent,
      cancelRegistration,
      markAttendance,
      completeEvent,
      updateEvent,
      deleteEvent,
      getMyEvents,
      getMyCertificates,
    }}>
      {children}
    </OfflineEventContext.Provider>
  );
}

export function useOfflineEvents() {
  const context = useContext(OfflineEventContext);
  if (!context) {
    throw new Error('useOfflineEvents must be used within OfflineEventProvider');
  }
  return context;
}
