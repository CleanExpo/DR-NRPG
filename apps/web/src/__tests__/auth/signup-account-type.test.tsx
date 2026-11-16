/**
 * DR-1004: a contractor arriving at /signup?type=contractor must be able to create an
 * account without touching the account-type dropdown, and the page must say what is
 * wrong instead of a bare "Validation failed".
 *
 * The form runs inside the real AuthProvider, so the request body and the error text
 * are the ones a visitor gets. Only next-auth and the post-signup screens are stubbed.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import SignupPage from '@/app/signup/page';
import { SignupForm } from '@/app/signup/signup-form';
import { AuthProvider } from '@/contexts/AuthContext';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/signup',
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signIn: jest.fn(async () => ({ ok: true, error: null })),
  signOut: jest.fn(),
}));

jest.mock('@/components/onboarding/contractor-onboarding', () => () => null);
jest.mock('@/components/client-onboarding', () => () => null);
jest.mock('@/components/onboarding/preference-selector', () => () => null);

const fetchMock = jest.fn();

function jsonResponse(status: number, body: unknown) {
  return Promise.resolve({ ok: status < 400, status, json: async () => body } as Response);
}

const created = {
  success: true,
  data: { user: { id: 'u1', email: 'pat@example.test', name: 'Pat Example', userType: 'CONTRACTOR' } },
};

function registerBodies() {
  return fetchMock.mock.calls
    .filter(([url]) => String(url).endsWith('/api/auth/register'))
    .map(([, init]) => JSON.parse((init as RequestInit).body as string));
}

function renderForm(initialUserType?: 'CLIENT' | 'CONTRACTOR') {
  return render(
    <AuthProvider>
      <SignupForm initialUserType={initialUserType} />
    </AuthProvider>,
  );
}

function fill({ name = 'Pat Example', password = 'restore123' } = {}) {
  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: name } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'pat@example.test' } });
  fireEvent.change(document.getElementById('password')!, { target: { value: password } });
  fireEvent.change(document.getElementById('confirmPassword')!, { target: { value: password } });
  fireEvent.click(document.getElementById('terms')!);
}

function submit() {
  fireEvent.submit(document.querySelector('form')!);
}

beforeEach(() => {
  fetchMock.mockReset();
  (global as unknown as { fetch: jest.Mock }).fetch = fetchMock;
  window.history.replaceState({}, '', '/signup?type=contractor');
});

describe('contractor arriving at /signup?type=contractor', () => {
  it('starts as Contractor when the link says type=contractor', async () => {
    // The server render is what the visitor sees first; it must already say Contractor.
    const page = await (SignupPage as unknown as (p: unknown) => Promise<JSX.Element> | JSX.Element)({
      searchParams: Promise.resolve({ type: 'contractor' }),
    });
    const html = renderToString(<AuthProvider>{page}</AuthProvider>);
    const trigger = html.match(/<button[^>]*role="combobox"[^>]*>([\s\S]*?)<\/button>/);
    expect(trigger?.[1]).toContain('Contractor');
    expect(trigger?.[1]).not.toContain('Client (Property Owner)');
  });

  it('keeps Contractor when the hidden select reports an empty value', async () => {
    // Radix keeps a hidden native <select> for forms and reports its value through
    // onValueChange. In the browser it reported "" on load, which wiped the choice.
    fetchMock.mockImplementation(() => jsonResponse(201, created));
    renderForm('CONTRACTOR');
    const hidden = document.querySelector('form select') as HTMLSelectElement;
    expect(hidden).not.toBeNull();
    fireEvent.change(hidden, { target: { value: '' } });
    fill();
    submit();
    await waitFor(() => expect(registerBodies()).toHaveLength(1));
    expect(registerBodies()[0].userType).toBe('CONTRACTOR');
    expect(screen.getByRole('combobox')).toHaveTextContent('Contractor');
  });

  it('refuses a password the server would refuse, before sending', async () => {
    renderForm('CONTRACTOR');
    fill({ password: 'restorepw' });
    submit();
    expect(await screen.findByText(/at least one letter and one number/i)).toBeInTheDocument();
    expect(registerBodies()).toHaveLength(0);
  });

  it('refuses a one-letter name the server would refuse, before sending', async () => {
    renderForm('CONTRACTOR');
    fill({ name: 'P' });
    submit();
    expect(await screen.findByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    expect(registerBodies()).toHaveLength(0);
  });

  it('shows the server field message instead of Validation failed', async () => {
    fetchMock.mockImplementation(() =>
      jsonResponse(400, {
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: { fields: [{ field: 'email', message: 'Invalid email format' }] },
      }),
    );
    renderForm('CONTRACTOR');
    fill();
    submit();
    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
    expect(screen.queryByText(/^validation failed$/i)).toBeNull();
  });

  it('sends a valid contractor form as CONTRACTOR without touching the dropdown', async () => {
    fetchMock.mockImplementation(() => jsonResponse(201, created));
    renderForm('CONTRACTOR');
    fill();
    submit();
    await waitFor(() => expect(registerBodies()).toHaveLength(1));
    expect(registerBodies()[0]).toMatchObject({ userType: 'CONTRACTOR', consentAccepted: true, name: 'Pat Example' });
  });
});

describe('plain /signup', () => {
  it('still starts as Client', async () => {
    window.history.replaceState({}, '', '/signup');
    fetchMock.mockImplementation(() => jsonResponse(201, { ...created, data: { user: { ...created.data.user, userType: 'CLIENT' } } }));
    renderForm();
    fill();
    submit();
    await waitFor(() => expect(registerBodies()).toHaveLength(1));
    expect(registerBodies()[0].userType).toBe('CLIENT');
  });
});
