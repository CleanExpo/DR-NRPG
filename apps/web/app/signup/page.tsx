import { SignupForm } from './signup-form';

type SignupSearchParams = Promise<{ type?: string | string[] }>;

/**
 * /signup — server component (Wave 1). The value proposition below is static
 * server-rendered markup so crawlers and slow connections see what the account
 * is for before any client JavaScript runs. Pricing copy is deliberately absent.
 *
 * The account type comes from `?type=contractor` here, on the server, so the first
 * render already shows it (DR-1004). The key remounts the form if the type changes.
 */
export default async function SignupPage({ searchParams }: { searchParams: SignupSearchParams }) {
  const raw = (await searchParams)?.type;
  const type = (Array.isArray(raw) ? raw[0] : raw)?.toLowerCase();
  const initialUserType = type === 'contractor' ? 'CONTRACTOR' : 'CLIENT';
  return (
    <SignupForm key={initialUserType} initialUserType={initialUserType}>
      <section aria-labelledby="signup-value-heading" className="mt-8 space-y-4 text-sm text-gray-300">
        <h2 id="signup-value-heading" className="text-lg font-semibold text-white">
          How NRPG works
        </h2>
        <div>
          <h3 className="font-medium text-white">Property owners</h3>
          <p>
            Lodge a restoration request online for water, fire and smoke, storm, mould or biohazard damage. NRPG
            matches the request with an independent, IICRC-certified restoration contractor.
          </p>
        </div>
        <div>
          <h3 className="font-medium text-white">Restoration contractors</h3>
          <p>
            Create an account, complete onboarding and the NRPG certification training, then become eligible to
            receive jobs in your service area. Eligibility requires current IICRC certification, current public
            liability insurance and Stripe payouts set up.
          </p>
        </div>
        <p className="text-xs text-gray-400">
          Contractors are independent businesses. NRPG facilitates matching only and does not employ contractors.
        </p>
      </section>
    </SignupForm>
  );
}
