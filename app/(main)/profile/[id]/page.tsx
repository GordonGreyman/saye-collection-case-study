interface Props {
  params: Promise<{ id: string }>
}

export default async function ProfilePage({ params }: Props) {
  const { id } = await params
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">Profile</h1>
      <p className="text-text-muted text-sm">Profile {id} — coming soon.</p>
    </div>
  )
}
