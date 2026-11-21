/**
 * DR-999 point 5 (PR 280 review): /login is served with the closed
 * Content-Security-Policy and /signup with the open one. The policy belongs to
 * the document, so a client-side move from /login to /signup would keep the
 * closed policy and Google requests on that /signup view would be refused.
 * The "Sign up here" link must therefore load /signup as a new document: the
 * click must not be taken over by the client router.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { isPolicyOpenPath } from '@/lib/analytics-gate';

const push = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/login',
}));

jest.mock('next-auth/react', () => ({ signIn: jest.fn() }));

// Outside an app router, next/link renders a plain anchor in jsdom, so its
// client-side takeover is stood in for here: like the real component, it
// stops the browser loading the page and asks the router to move instead.
jest.mock('next/link', () => {
  const React = jest.requireActual('react');
  return {
    __esModule: true,
    default: ({ href, children, ...rest }: { href: string; children: unknown }) =>
      React.createElement(
        'a',
        {
          ...rest,
          href,
          onClick: (event: MouseEvent) => {
            event.preventDefault();
            push(href);
          },
        },
        children,
      ),
  };
});

// eslint-disable-next-line import/first
import LoginPage from '../../../../app/login/page';

describe('the sign-up link on /login', () => {
  it('crosses from a closed-policy document to an open-policy one', () => {
    expect(isPolicyOpenPath('/login')).toBe(false);
    expect(isPolicyOpenPath('/signup')).toBe(true);
  });

  it('loads /signup as a full page, not a client-side move', () => {
    render(<LoginPage />);
    const link = screen.getByRole('link', { name: 'Sign up here' });
    expect(link).toHaveAttribute('href', '/signup');
    // fireEvent returns false when a handler called preventDefault, which is
    // what a client-routed link does to stop the browser loading the page.
    const browserNavigates = fireEvent.click(link);
    expect(browserNavigates).toBe(true);
    expect(push).not.toHaveBeenCalled();
  });
});
