export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-heading text-text-primary">Privacy Policy</h1>
      <p className="text-text-muted mt-4">
        Saye collects only the information needed to operate artist profiles and archives.
      </p>
      <div className="mt-6 space-y-4 text-sm text-text-muted leading-6">
        <p>
          We process account data for authentication, profile discovery, and archive publishing.
          Uploaded archive assets are stored in our configured storage provider and are visible
          according to your profile visibility.
        </p>
        <p>
          You can request account deletion anytime from Account Settings. Deletion removes your
          profile and associated archive records, with storage cleanup performed during the account
          lifecycle process.
        </p>
        <p>
          For privacy questions, contact <a className="text-accent" href="mailto:privacy@saye.art">privacy@saye.art</a>.
        </p>
      </div>
    </div>
  )
}
