'use client';

import { useRef } from 'react';

interface CertificateData {
  id: string;
  participantName: string;
  eventTitle: string;
  eventDate: string;
  instructorName: string;
  location: string;
  issuedAt: string;
}

export function CertificateGenerator({ certificate, onClose }: { certificate: CertificateData; onClose: () => void }) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = certificateRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sertifikat - ${certificate.eventTitle}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', serif; }
            .certificate {
              width: 1000px;
              height: 700px;
              padding: 40px;
              border: 10px solid #b8860b;
              text-align: center;
              background: linear-gradient(135deg, #fff 0%, #fff8e7 100%);
            }
            .header { margin-bottom: 30px; }
            .logo { font-size: 60px; }
            .title { font-size: 42px; font-weight: bold; color: #b8860b; margin: 20px 0; }
            .subtitle { font-size: 24px; color: #666; margin-bottom: 30px; }
            .recipient { font-size: 36px; font-weight: bold; color: #333; margin: 30px 0; }
            .event { font-size: 22px; color: #555; margin: 15px 0; }
            .details { font-size: 18px; color: #777; margin-top: 30px; }
            .footer { margin-top: 40px; display: flex; justify-content: space-around; }
            .signature { text-align: center; }
            .signature-line { width: 200px; border-top: 2px solid #333; margin-top: 60px; }
            .seal { 
              width: 120px; height: 120px; 
              border: 4px solid #b8860b; 
              border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              font-size: 14px; color: #b8860b;
              margin: 20px auto;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Sertifikat</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-white">✕</button>
        </div>

        <div className="p-6">
          <div ref={certificateRef} className="certificate">
            <div className="header">
              <div className="logo">🏗️</div>
              <div className="title">SERTIFIKAT</div>
              <div className="subtitle">BimtekKita - Platform Pelatihan Konstruksi Indonesia</div>
            </div>
            
            <div className="recipient">
              {certificate.participantName}
            </div>
            
            <div className="event">
              Telah menyelesaikan pelatihan:
            </div>
            
            <div className="recipient" style={{ fontSize: '28px' }}>
              {certificate.eventTitle}
            </div>
            
            <div className="details">
              <p>📅 Tanggal: {new Date(certificate.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p>📍 Lokasi: {certificate.location}</p>
              <p>👨‍🏫 Instruktur: {certificate.instructorName}</p>
              <p>📜 ID Sertifikat: {certificate.id}</p>
            </div>
            
            <div className="footer">
              <div className="signature">
                <div className="signature-line"></div>
                <p>Instruktur</p>
                <p>{certificate.instructorName}</p>
              </div>
              
              <div className="seal">
                <div>
                  <div>VERIFIED</div>
                  <div>BimtekKita</div>
                </div>
              </div>
              
              <div className="signature">
                <div className="signature-line"></div>
                <p>Director</p>
                <p>BimtekKita</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium"
          >
            🖨️ Cetak / Simpan PDF
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
