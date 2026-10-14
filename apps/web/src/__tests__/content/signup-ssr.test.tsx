/**
 * Wave 1: /signup must serve its heading and value proposition in the initial
 * HTML. Before this change the page bailed out to a client-only spinner, so the
 * served HTML carried only the <title>.
 */
import { renderToString } from 'react-dom/server';
import SignupPage from '@/app/signup/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/signup',
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ register: jest.fn() }),
}));

describe('/signup server render', () => {
  const html = renderToString(<SignupPage />);

  it('includes the page heading and the signup form', () => {
    expect(html).toMatch(/<h1[^>]*>Join the NRPG marketplace<\/h1>/);
    expect(html).toContain('id="email"');
  });

  it('includes the value proposition for both audiences', () => {
    expect(html).toContain('How NRPG works');
    expect(html).toContain('Property owners');
    expect(html).toContain('Restoration contractors');
    expect(html).toContain('does not employ contractors');
  });

  it('adds no pricing copy', () => {
    const valueProp = html.slice(html.indexOf('How NRPG works'));
    expect(valueProp).not.toMatch(/\$\s?\d|per month|\/mo\b|fee/i);
  });
});
