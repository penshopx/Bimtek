import { NextResponse } from 'next/server';

let db: any;
let schema: any;

async function getDb() {
  if (!db) {
    try {
      const dbModule = await import('@/db');
      db = dbModule.db;
      schema = await import('@/db/schema');
    } catch (e) {
      throw new Error('Database not available');
    }
  }
  return { db, schema };
}

export async function GET(request: Request) {
  try {
    const { db: database, schema: sch } = await getDb();
    const { searchParams } = new URL(request.url);
    if (searchParams.get('action') === 'certificates') {
      const certs = await database.select().from(sch.certificates);
      return NextResponse.json(certs);
    }
    const events = await database.select().from(sch.offlineEvents);
    return NextResponse.json(events);
  } catch (e) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const { db: database, schema: sch } = await getDb();
    const { eq } = await import('drizzle-orm');
    
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'register': {
        const event = await database.select().from(sch.offlineEvents).where(eq(sch.offlineEvents.id, data.eventId));
        if (!event[0] || (event[0].registered ?? 0) >= event[0].capacity) {
          return NextResponse.json({ success: false, message: 'Event full or not found' }, { status: 400 });
        }
        
        const { and } = await import('drizzle-orm');
        const existing = await database.select().from(sch.eventParticipants).where(
          and(
            eq(sch.eventParticipants.email, data.participant.email.trim().toLowerCase()),
            eq(sch.eventParticipants.eventId, data.eventId)
          )
        );
        if (existing.length > 0) {
          return NextResponse.json({ success: false, message: 'Email ini sudah terdaftar untuk event ini' }, { status: 400 });
        }

        await database.insert(sch.eventParticipants).values({
          ...data.participant,
          email: data.participant.email.trim().toLowerCase(),
          eventId: data.eventId,
          status: 'registered',
          registeredAt: new Date().toISOString(),
        });

        const newRegistered = (event[0].registered ?? 0) + 1;
        const newStatus = newRegistered >= event[0].capacity ? 'full' : 'open';
        await database.update(sch.offlineEvents).set({ registered: newRegistered, status: newStatus }).where(eq(sch.offlineEvents.id, data.eventId));

        return NextResponse.json({ success: true });
      }

      case 'create': {
        await database.insert(sch.offlineEvents).values(data.event);
        return NextResponse.json({ success: true });
      }

      case 'delete': {
        await database.delete(sch.offlineEvents).where(eq(sch.offlineEvents.id, data.eventId));
        return NextResponse.json({ success: true });
      }

      case 'markAttendance': {
        await database.update(sch.eventParticipants).set({ status: 'attended' }).where(eq(sch.eventParticipants.id, data.participantId));
        return NextResponse.json({ success: true });
      }

      case 'cancelRegistration': {
        await database.delete(sch.eventParticipants).where(eq(sch.eventParticipants.id, data.participantId));
        const event = await database.select().from(sch.offlineEvents).where(eq(sch.offlineEvents.id, data.eventId));
        if (event[0]) {
          const newRegistered = Math.max(0, (event[0].registered ?? 0) - 1);
          await database.update(sch.offlineEvents).set({ registered: newRegistered, status: 'open' }).where(eq(sch.offlineEvents.id, data.eventId));
        }
        return NextResponse.json({ success: true });
      }

      case 'complete': {
        const event = await database.select().from(sch.offlineEvents).where(eq(sch.offlineEvents.id, data.eventId));
        if (!event[0]) return NextResponse.json({ success: false }, { status: 400 });

        const participants = await database.select().from(sch.eventParticipants).where(eq(sch.eventParticipants.eventId, data.eventId));
        const attended = participants.filter((p: any) => p.status === 'attended');

        const newCerts = attended.map((p: any) => ({
          id: `cert-${Date.now()}-${p.id}`,
          eventId: data.eventId,
          participantId: p.id,
          participantName: p.name,
          eventTitle: event[0].title,
          eventDate: event[0].date,
          instructorName: event[0].instructorName,
          location: event[0].location,
          issuedAt: new Date().toISOString(),
        }));

        if (newCerts.length > 0) {
          await database.insert(sch.certificates).values(newCerts);
        }
        await database.update(sch.offlineEvents).set({ status: 'completed' }).where(eq(sch.offlineEvents.id, data.eventId));

        return NextResponse.json({ success: true, certificatesIssued: newCerts.length });
      }

      case 'seed': {
        // Insert demo events if the table is empty
        const existing = await database.select().from(sch.offlineEvents);
        if (existing.length > 0) {
          return NextResponse.json({ success: true, message: 'Already seeded' });
        }
        const demoEvents = [
          { id: 'evt-001', title: 'BIMTEK K3 Konstruksi Gedung Bertingkat', description: 'Pelatihan intensif mengenai keselamatan dan kesehatan kerja (K3) pada proyek konstruksi gedung bertingkat.', instructorName: 'Ir. Hendra Gunawan, M.T.', instructorPhone: '081311122233', location: 'Hotel Aston Priority, Jl. Sudirman No. 10', city: 'Jakarta', province: 'DKI Jakarta', date: '2026-08-15', time: '08:00', duration: 8, capacity: 30, registered: 12, price: 500000, module: 'K3 Konstruksi', category: 'K3', status: 'open', createdAt: new Date().toISOString() },
          { id: 'evt-002', title: 'BIMTEK Manajemen Proyek Konstruksi', description: 'Workshop manajemen proyek untuk tenaga ahli konstruksi. Materi meliputi perencanaan jadwal, cost control, dan manajemen risiko.', instructorName: 'Dr. Ahmad Wijaya, S.T., M.T.', instructorPhone: '081322233344', location: 'Gedung LPJK Jawa Barat, Jl. Soekarno Hatta No. 458', city: 'Bandung', province: 'Jawa Barat', date: '2026-08-22', time: '08:30', duration: 8, capacity: 25, registered: 8, price: 750000, module: 'Manajemen Proyek', category: 'Manajemen', status: 'open', createdAt: new Date().toISOString() },
          { id: 'evt-003', title: 'BIMTEK Struktur Beton Bertulang', description: 'Pelatihan teknis struktur beton bertulang sesuai SNI 2847. Mencakup perhitungan tulangan dan quality control mutu beton.', instructorName: 'Prof. Ir. Bambang Susilo, Ph.D.', instructorPhone: '081333344455', location: 'LPJK Provinsi Jawa Tengah, Jl. Pemuda No. 150', city: 'Semarang', province: 'Jawa Tengah', date: '2026-09-05', time: '08:00', duration: 8, capacity: 35, registered: 20, price: 600000, module: 'Struktur Beton', category: 'Sipil Gedung', status: 'open', createdAt: new Date().toISOString() },
          { id: 'evt-004', title: 'BIMTEK Instalasi Listrik Gedung', description: 'Pelatihan instalasi sistem kelistrikan gedung bertingkat sesuai PUIL 2011.', instructorName: 'Ir. Dewi Lestari, M.T.', instructorPhone: '081344455566', location: 'Hotel Santika, Jl. Gubernur Suryo No. 1', city: 'Surabaya', province: 'Jawa Timur', date: '2026-09-12', time: '09:00', duration: 8, capacity: 30, registered: 30, price: 650000, module: 'Instalasi Listrik', category: 'Elektrikal', status: 'full', createdAt: new Date().toISOString() },
          { id: 'evt-005', title: 'BIMTEK Penyusunan RAB Proyek', description: 'Workshop penyusunan Rencana Anggaran Biaya proyek konstruksi dengan analisa harga satuan dan software estimasi.', instructorName: 'Ir. Rini Susilowati, M.M.', instructorPhone: '081355566677', location: 'Graha Pena, Jl. Urip Sumoharjo No. 20', city: 'Makassar', province: 'Sulawesi Selatan', date: '2026-09-20', time: '08:00', duration: 8, capacity: 40, registered: 15, price: 550000, module: 'RAB', category: 'RAB', status: 'open', createdAt: new Date().toISOString() },
          { id: 'evt-006', title: 'BIMTEK Desain Jembatan Beton', description: 'Pelatihan perencanaan dan desain jembatan beton sesuai standar Bina Marga.', instructorName: 'Dr. Ir. Michael Tanoto, M.T.', instructorPhone: '081366677788', location: 'BPSDM Provinsi Kalimantan Timur, Jl. Basuki Rahmat', city: 'Balikpapan', province: 'Kalimantan Timur', date: '2026-07-10', time: '08:00', duration: 8, capacity: 25, registered: 25, price: 700000, module: 'Jembatan Beton', category: 'Jalan', status: 'completed', createdAt: new Date().toISOString() },
          { id: 'evt-007', title: 'BIMTEK Plumbing dan Sanitasi Gedung', description: 'Pelatihan sistem plumbing dan sanitasi pada gedung bertingkat sesuai standar instalasi perpipaan.', instructorName: 'Ir. Lisa Permata, M.T.', instructorPhone: '081377788899', location: 'Hotel Grand Mercure, Jl. Gajah Mada No. 100', city: 'Medan', province: 'Sumatera Utara', date: '2026-10-03', time: '08:30', duration: 8, capacity: 30, registered: 5, price: 600000, module: 'Plumbing', category: 'Mekanikal', status: 'open', createdAt: new Date().toISOString() },
          { id: 'evt-008', title: 'BIMTEK Metode Pelaksanaan Konstruksi Jalan', description: 'Pelatihan metode pelaksanaan konstruksi jalan dan perkerasan aspal sesuai spesifikasi teknis.', instructorName: 'Ir. Joko Pramono, M.T.', instructorPhone: '081388899900', location: 'Balai Besar Pelaksanaan Jalan Nasional, Jl. Pelajar Pejuang', city: 'Bandung', province: 'Jawa Barat', date: '2026-10-17', time: '08:00', duration: 8, capacity: 35, registered: 10, price: 500000, module: 'Konstruksi Jalan', category: 'Jalan', status: 'open', createdAt: new Date().toISOString() },
        ];
        await database.insert(sch.offlineEvents).values(demoEvents);
        return NextResponse.json({ success: true, inserted: demoEvents.length });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }
}
