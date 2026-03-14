'use server';

import { db } from "@/db";
import { offlineEvents, certificates, eventParticipants } from "@/db/schema";
import { eq } from "drizzle-orm";

const sampleEvents = [
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
    status: 'open' as const,
    createdAt: '2026-03-01',
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
    status: 'open' as const,
    createdAt: '2026-03-05',
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
    status: 'full' as const,
    createdAt: '2026-03-10',
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
    status: 'open' as const,
    createdAt: '2026-03-12',
  },
];

export async function seedOfflineEvents() {
  const existing = await db.select().from(offlineEvents).limit(1);
  
  if (existing.length === 0) {
    await db.insert(offlineEvents).values(sampleEvents);
    return { success: true, message: 'Seeded 4 sample events' };
  }
  
  return { success: false, message: 'Events already exist' };
}

export async function getOfflineEventsFromDb() {
  return await db.select().from(offlineEvents);
}

export async function getOfflineEventById(id: string) {
  const result = await db.select().from(offlineEvents).where(eq(offlineEvents.id, id));
  return result[0] || null;
}

export async function createOfflineEvent(event: typeof sampleEvents[0]) {
  await db.insert(offlineEvents).values(event);
  return { success: true };
}

export async function updateOfflineEvent(id: string, updates: Partial<typeof sampleEvents[0]>) {
  await db.update(offlineEvents).set(updates).where(eq(offlineEvents.id, id));
  return { success: true };
}

export async function deleteOfflineEvent(id: string) {
  await db.delete(offlineEvents).where(eq(offlineEvents.id, id));
  await db.delete(eventParticipants).where(eq(eventParticipants.eventId, id));
  return { success: true };
}

export async function registerParticipant(eventId: string, participant: {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}) {
  const eventResult = await db.select().from(offlineEvents).where(eq(offlineEvents.id, eventId));
  const event = eventResult[0];
  
  if (!event || (event.registered ?? 0) >= event.capacity) {
    return { success: false, message: 'Event full or not found' };
  }

  const existingParticipant = await db.select()
    .from(eventParticipants)
    .where(eq(eventParticipants.email, participant.email));
  
  if (existingParticipant.length > 0) {
    return { success: false, message: 'Already registered' };
  }

  await db.insert(eventParticipants).values({
    ...participant,
    eventId,
    status: 'registered',
    registeredAt: new Date().toISOString(),
  });

  const newRegistered = (event.registered ?? 0) + 1;
  const newStatus = newRegistered >= event.capacity ? 'full' : 'open';
  
  await db.update(offlineEvents)
    .set({ registered: newRegistered, status: newStatus })
    .where(eq(offlineEvents.id, eventId));

  return { success: true };
}

export async function getEventParticipants(eventId: string) {
  return await db.select().from(eventParticipants).where(eq(eventParticipants.eventId, eventId));
}

export async function markAttendance(eventId: string, participantId: string) {
  await db.update(eventParticipants)
    .set({ status: 'attended' })
    .where(eq(eventParticipants.id, participantId));
  return { success: true };
}

export async function cancelRegistration(eventId: string, participantId: string) {
  await db.delete(eventParticipants).where(eq(eventParticipants.id, participantId));
  
  const eventResult = await db.select().from(offlineEvents).where(eq(offlineEvents.id, eventId));
  const event = eventResult[0];
  if (event) {
    const newRegistered = Math.max(0, (event.registered ?? 0) - 1);
    await db.update(offlineEvents)
      .set({ registered: newRegistered, status: 'open' })
      .where(eq(offlineEvents.id, eventId));
  }
  return { success: true };
}

export async function completeEventAndIssueCertificates(eventId: string) {
  const eventResult = await db.select().from(offlineEvents).where(eq(offlineEvents.id, eventId));
  const event = eventResult[0];
  if (!event) return { success: false };

  const participants = await db.select()
    .from(eventParticipants)
    .where(eq(eventParticipants.eventId, eventId));

  const attendedParticipants = participants.filter(p => p.status === 'attended');

  const newCerts = attendedParticipants.map(p => ({
    id: `cert-${Date.now()}-${p.id}`,
    eventId,
    participantId: p.id,
    participantName: p.name,
    eventTitle: event.title,
    eventDate: event.date,
    instructorName: event.instructorName,
    location: event.location,
    issuedAt: new Date().toISOString(),
  }));

  if (newCerts.length > 0) {
    await db.insert(certificates).values(newCerts);
  }

  await db.update(offlineEvents)
    .set({ status: 'completed' })
    .where(eq(offlineEvents.id, eventId));

  return { success: true, certificatesIssued: newCerts.length };
}

export async function getCertificates() {
  return await db.select().from(certificates);
}
