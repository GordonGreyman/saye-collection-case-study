export default function ReportAbusePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-heading text-text-primary">Report Abuse</h1>
      <p className="text-text-muted mt-4">
        To report abusive content or behavior, email{' '}
        <a className="text-accent" href="mailto:safety@saye.art">
          safety@saye.art
        </a>{' '}
        with:
      </p>
      <ul className="mt-4 space-y-2 text-sm text-text-muted list-disc pl-5">
        <li>Profile URL or archive URL</li>
        <li>Description of the issue</li>
        <li>Optional screenshots or evidence</li>
      </ul>
    </div>
  )
}
