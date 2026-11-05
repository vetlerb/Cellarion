import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// A bulk edit or take-out names the fields and the reason by their labels,
// not by the codes they are stored as (#1803 follow-up, from #1798).

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k, o) => (o && typeof o === 'object' ? `${k}:${JSON.stringify(o)}` : k) }),
}));

let auth;
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => auth }));

const ok = (body) => ({ ok: true, status: 200, json: async () => body });
const api = vi.fn(async (url) => {
  if (url === '/api/cellars/c1') return ok({ cellar: { _id: 'c1', name: 'Home' } });
  if (url === '/api/cellars/c1/audit') {
    return ok({
      logs: [
        { _id: 'l1', action: 'bottle.bulk_update', detail: { requested: 2, done: 2, fields: ['price', 'purchaseDate'] }, timestamp: '2026-11-05T10:00:00.000Z', actor: { userId: { username: 'anna' } } },
        { _id: 'l2', action: 'bottle.bulk_consume', detail: { requested: 3, done: 3, reason: 'gifted' }, timestamp: '2026-11-05T09:59:00.000Z', actor: { userId: { username: 'anna' } } },
      ],
    });
  }
  return ok({});
});

const { default: CellarAudit } = await import('./CellarAudit');

test('bulk edits name the fields, and bulk take-outs the reason, by their labels', async () => {
  auth = { apiFetch: api, user: { id: 'u1' } };
  render(
    <MemoryRouter initialEntries={['/cellars/c1/audit']}>
      <Routes><Route path="/cellars/:id/audit" element={<CellarAudit />} /></Routes>
    </MemoryRouter>,
  );

  expect(await screen.findByText(
    '— cellarAudit.bulkDoneDetail:{"done":2,"requested":2,"what":"cellarAudit.field.price, cellarAudit.field.purchaseDate"}',
  )).toBeInTheDocument();
  expect(screen.getByText(
    '— cellarAudit.bulkDoneDetail:{"done":3,"requested":3,"what":"history.reasonGifted"}',
  )).toBeInTheDocument();
});
