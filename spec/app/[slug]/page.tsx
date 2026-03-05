import { notFound } from 'next/navigation'
import { getAllSlugs, getSpec } from '@/lib/parseSpec'
import SpecClient from './SpecClient'

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const spec = getSpec(slug)
  if (!spec) return { title: 'Spec not found' }
  return { title: `${spec.title} — Sign-Off` }
}

export default async function SpecPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const spec = getSpec(slug)
  if (!spec) notFound()
  return <SpecClient spec={spec} />
}
