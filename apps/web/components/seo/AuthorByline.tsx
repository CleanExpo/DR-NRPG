// @ts-nocheck

/**
 * Author Byline Component
 * Displays author credentials and E-E-A-T signals
 * Prominently features Phil McGurk's industry credentials
 */

import Link from 'next/link';
import { Person, Organization } from 'schema-dts';

interface AuthorBylineProps {
  name: string;
  role?: string;
  credentials?: string[];
  bio?: string;
  image?: string;
  publishedAt?: Date;
  linkedinUrl?: string;
  experience?: {
    years: number;
    jobs: number;
    rating: number;
  };
}

/**
 * Generate JSON-LD schema for author
 */
function generateAuthorSchema(props: AuthorBylineProps): Person {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: props.name,
    jobTitle: props.role,
    description: props.bio,
    url: props.linkedinUrl,
    knowsAbout: props.credentials || [],
    image: props.image
  };
}

/**
 * Author Byline Component
 */
export function AuthorByline({
  name,
  role,
  credentials,
  bio,
  image,
  publishedAt,
  linkedinUrl,
  experience
}: AuthorBylineProps) {
  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateAuthorSchema({
            name,
            role,
            credentials,
            bio,
            image,
            linkedinUrl,
            experience
          }))
        }}
      />

      {/* Author Byline */}
      <article className="author-byline my-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 rounded-lg">
        {/* Header */}
        <div className="flex items-start gap-4">
          {/* Author Image */}
          {image && (
            <div className="flex-shrink-0">
              <img
                src={image}
                alt={name}
                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200"
                loading="lazy"
              />
            </div>
          )}

          {/* Author Info */}
          <div className="flex-grow">
            <div className="flex items-baseline gap-2">
              <h3 className="text-lg font-bold text-gray-900">
                {linkedinUrl ? (
                  <a href={linkedinUrl} className="hover:text-indigo-600 transition">
                    {name}
                  </a>
                ) : (
                  name
                )}
              </h3>
              <span className="text-sm text-indigo-600 font-semibold">Author</span>
            </div>

            {role && (
              <p className="text-sm text-gray-700 font-medium mt-1">
                {role}
              </p>
            )}

            {/* Experience Metrics */}
            {experience && (
              <div className="flex gap-4 mt-2 text-xs text-gray-400">
                <span>
                  <strong>{experience.years}+</strong> years experience
                </span>
                <span>
                  <strong>{experience.jobs.toLocaleString()}+</strong> jobs managed
                </span>
                <span>
                  <strong>{experience.rating.toFixed(1)}</strong> ⭐ rating
                </span>
              </div>
            )}
          </div>

          {/* Publication Date */}
          {publishedAt && (
            <div className="text-right text-xs text-gray-400">
              <p>Published</p>
              <time dateTime={publishedAt.toISOString()}>
                {publishedAt.toLocaleDateString('en-AU', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </time>
            </div>
          )}
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-sm text-gray-700 mt-4 leading-relaxed">
            {bio}
          </p>
        )}

        {/* Credentials */}
        {credentials && credentials.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Certifications & Credentials
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {credentials.map((credential, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1 flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-sm text-gray-700">
                    {credential}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Trust Signals */}
        <div className="mt-4 pt-4 border-t border-indigo-200 flex items-center justify-between text-xs text-gray-400">
          <div className="flex gap-4">
            <span>🏢 Founder of NRPG Network</span>
          </div>
        </div>
      </article>
    </>
  );
}

/**
 * Compact Author Byline (inline version)
 */
export function AuthorBylineCompact({
  name,
  role,
  linkedinUrl,
  image
}: Omit<AuthorBylineProps, 'bio' | 'credentials' | 'experience'>) {
  return (
    <div className="flex items-center gap-3 py-4 px-4 bg-gray-50 rounded border border-gray-200">
      {image && (
        <img
          src={image}
          alt={name}
          className="w-10 h-10 rounded-full"
          loading="lazy"
        />
      )}
      <div className="flex-grow">
        <p className="text-sm font-semibold text-gray-900">
          {linkedinUrl ? (
            <a href={linkedinUrl} className="hover:text-indigo-600">
              {name}
            </a>
          ) : (
            name
          )}
        </p>
        {role && (
          <p className="text-xs text-gray-400">{role}</p>
        )}
      </div>
      <span className="text-xs text-indigo-600 font-semibold">VERIFIED</span>
    </div>
  );
}
