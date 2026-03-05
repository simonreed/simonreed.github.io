export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <h1 className="text-xl font-semibold text-zinc-900 mb-2">Spec not found</h1>
        <p className="text-sm text-zinc-500">
          This spec doesn&apos;t exist or the link may have changed. If you were sent a link, please contact Simon.
        </p>
      </div>
    </div>
  )
}
