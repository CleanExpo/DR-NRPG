import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedMargotResources, margotResourcePath } from '@/lib/resources/margot';
import { resourceCanonical } from '@/lib/resources/canonical';

// Publication changes must be checked on each request, including an unconfigured CMS.
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

async function getResource(props: Props) {
  const { slug } = await props.params;
  const resource = (await getPublishedMargotResources()).find(item => item.slug === slug);
  if (!resource) notFound();
  return resource;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const resource = await getResource(props);
  const canonical = resourceCanonical(margotResourcePath(resource.slug));
  return {
    title: `${resource.title} | Margot | Resource Hub`,
    description: resource.description,
    alternates: { canonical },
    openGraph: { title: resource.title, description: resource.description, url: canonical, type: 'article' },
  };
}

export default async function MargotResourcePage(props: Props) {
  const resource = await getResource(props);
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-16 text-white">
      <article className="mx-auto max-w-3xl">
        <Link href="/resources" className="text-dr-education hover:underline">Resource Hub</Link>
        <p className="mt-8 text-sm text-white/60">Margot · Practical business lessons</p>
        <h1 className="mt-3 text-4xl font-bold">{resource.title}</h1>
        <p className="mt-5 text-xl text-white/80">{resource.description}</p>
        <div className="mt-10 space-y-5 leading-8 text-white/90">
          {resource.paragraphs.map((paragraph, index) => (
            <p key={index}>
              {typeof paragraph === 'string' ? paragraph : paragraph.map((span, spanIndex) => (
                span.href
                  ? <a key={spanIndex} href={span.href} className="text-dr-education underline">{span.text}</a>
                  : <Fragment key={spanIndex}>{span.text}</Fragment>
              ))}
            </p>
          ))}
        </div>
      </article>
    </main>
  );
}
