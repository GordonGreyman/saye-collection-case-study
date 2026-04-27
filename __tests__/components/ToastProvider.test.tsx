import { fireEvent, render, screen } from '@testing-library/react'
import { ToastProvider, useToast } from '@/components/ui/ToastProvider'

function ToastTrigger() {
  const { showToast } = useToast()
  return <button onClick={() => showToast('Profile updated successfully.', 'success')}>Show toast</button>
}

test('renders visible toast feedback when triggered', () => {
  render(
    <ToastProvider>
      <ToastTrigger />
    </ToastProvider>
  )

  fireEvent.click(screen.getByText('Show toast'))

  const toast = screen.getByRole('status')
  expect(toast).toHaveTextContent('Profile updated successfully.')
  expect(toast).toHaveStyle({ position: '' })
  expect(toast.parentElement).toHaveStyle({ position: 'fixed' })
})
