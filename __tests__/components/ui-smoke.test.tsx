import { render } from '@testing-library/react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

test('Card renders', () => {
  const { getByText } = render(<Card>Content</Card>)
  expect(getByText('Content')).toBeInTheDocument()
})

test('Input renders with label', () => {
  const { getByLabelText } = render(<Input id="x" label="Name" />)
  expect(getByLabelText('Name')).toBeInTheDocument()
})

test('Badge renders', () => {
  const { getByText } = render(<Badge>Artist</Badge>)
  expect(getByText('Artist')).toBeInTheDocument()
})
