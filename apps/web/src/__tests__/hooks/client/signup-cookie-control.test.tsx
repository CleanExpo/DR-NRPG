/**
 * The "Cookie settings" control on /signup (spec E38).
 *
 * /signup switches between screens inside one page: the form, then the
 * onboarding screens a new account sees. A control placed on one of those
 * screens is missing on the others, so the route's layout renders it around
 * whatever screen the page returns, and the form renders none of its own
 * (two would show on the form screen).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import SignupLayout from '../../../../app/signup/layout';

const FORM_FILE = join(__dirname, '..', '..', '..', '..', 'app', 'signup', 'signup-form.tsx');

describe('the Cookie settings control on /signup', () => {
  it.each([
    ['the sign-up form', <form key="f" aria-label="Create account"><input aria-label="Email" /></form>],
    ['a client onboarding screen', <section key="c">Tell us about your property</section>],
    ['a contractor onboarding screen', <section key="t">Set up your service area</section>],
    ['the account-created screen', <p key="s">Account created!</p>],
  ])('[AC-K2] the layout renders exactly one control around %s', (_label, screenNode) => {
    render(<SignupLayout>{screenNode}</SignupLayout>);
    expect(screen.getAllByRole('button', { name: 'Cookie settings' })).toHaveLength(1);
  });

  it('[AC-K2] the sign-up form renders no control of its own', () => {
    const source = readFileSync(FORM_FILE, 'utf8');
    // Positive control: the file read is the form.
    expect(source).toContain('export function SignupForm');
    expect(source).not.toMatch(/<CookieSettingsButton\b/);
  });
});
