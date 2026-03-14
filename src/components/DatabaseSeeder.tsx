'use client';

import { useEffect, useState } from 'react';

export function DatabaseSeeder() {
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!seeded) {
      fetch('/api/events', { method: 'POST', body: JSON.stringify({ action: 'seed' })})
        .then(() => setSeeded(true))
        .catch(() => setSeeded(true));
    }
  }, [seeded]);

  return null;
}
