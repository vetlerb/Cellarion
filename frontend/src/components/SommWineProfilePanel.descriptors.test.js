import { render, screen } from '@testing-library/react';

// The descriptor line under a sommelier profile shows the stored codes as
// labels, and builds "high tannin" per language rather than in English.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k, a) => (a && typeof a === 'object' ? `${k}:${JSON.stringify(a)}` : k),
    i18n: { language: 'en' },
  }),
}));
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ apiFetch: vi.fn() }) }));
vi.mock('../api/somm', () => ({ updateSommWineProfile: vi.fn() }));

const { default: SommWineProfilePanel } = await import('./SommWineProfilePanel');

test('body, tannin, acidity and sweetness read as translated labels', () => {
  const wine = { _id: 'w1', aiProfile: { body: 'full', tannin: 'high', acidity: 'medium', sweetness: 'off-dry', source: 'ai' } };
  render(<SommWineProfilePanel wine={wine} />);
  expect(screen.getByText([
    'somm.profile.value.full',
    'somm.profile.descriptor.tannin:{"value":"somm.profile.value.high"}',
    'somm.profile.descriptor.acidity:{"value":"somm.profile.value.medium"}',
    'somm.profile.value.offdry',
  ].join(' · '))).toBeInTheDocument();
  expect(screen.queryByText(/high tannin/)).toBeNull();
});
