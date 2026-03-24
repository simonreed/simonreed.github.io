import { notFound } from 'next/navigation'
import { getAllSlugs, getSpec } from '@/lib/parseSpec'
import SpecClient from './SpecClient'
import VerificationClient from './VerificationClient'
import SignedOffHoldingScreen from '@/components/SignedOffHoldingScreen'
import VerifiedHoldingScreen from '@/components/VerifiedHoldingScreen'

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const spec = getSpec(slug)
  if (!spec) return { title: 'Spec not found' }
  if (spec.status === 'delivered') return { title: `${spec.title} — Verification` }
  if (spec.status === 'verified') return { title: `${spec.title} — Verified` }
  return { title: `${spec.title} — Sign-Off` }
}

export default async function SpecPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const spec = getSpec(slug)
  if (!spec) notFound()

  switch (spec.status) {
    case 'draft':
    case 'awaiting-sign-off':
      return <SpecClient spec={spec} />
    case 'signed-off':
      return <SignedOffHoldingScreen spec={spec} />
    case 'delivered':
      return <VerificationClient spec={spec} />
    case 'verified':
      return <VerifiedHoldingScreen spec={spec} />
  }
}
