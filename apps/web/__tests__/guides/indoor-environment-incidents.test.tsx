/**
 * DR-990: homeowner guide for indoor-environment incidents.
 * Renders the page and checks the emergency stop, the incident record fields,
 * the health and occupancy limits, and the referral link to the claim flow.
 */
import { render, screen, within } from '@testing-library/react'
import Page, { metadata } from '../../app/(public)/guides/indoor-environment-incidents/page'

describe('indoor-environment incident guide (DR-990)', () => {
  beforeEach(() => {
    render(<Page />)
  })

  it('renders the guide heading', () => {
    expect(
      screen.getByRole('heading', { level: 1, name: /what to do first/i }),
    ).toBeInTheDocument()
  })

  it('tells the reader to call Triple Zero and not use the form in an emergency', () => {
    const emergency = screen.getByRole('region', { name: /is anyone in danger/i })
    expect(emergency).toHaveTextContent('Triple Zero (000)')
    expect(emergency).toHaveTextContent(/do not use the form on this site for an emergency/i)
    // The emergency section must not offer the referral form as an option.
    expect(within(emergency).queryByRole('link')).toBeNull()
  })

  it('puts the emergency stop before the referral call to action', () => {
    const emergency = screen.getByRole('region', { name: /is anyone in danger/i })
    const referral = screen.getByRole('region', { name: /request a restoration contractor/i })
    expect(
      emergency.compareDocumentPosition(referral) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(referral).toHaveTextContent(/when no one is in danger/i)
  })

  it('lists the incident record fields', () => {
    const record = screen.getByRole('region', { name: /write down what you saw/i })
    for (const field of ['Source', 'Route', 'Who and what is exposed', 'What you are unsure of']) {
      expect(within(record).getByText(field)).toBeInTheDocument()
    }
  })

  it('gives no diagnosis or occupancy decision and points to a GP', () => {
    const limits = screen.getByRole('region', { name: /what this guide cannot tell you/i })
    expect(limits).toHaveTextContent(/see your GP/i)
    expect(limits).toHaveTextContent(/cannot tell you whether your home is safe to live in/i)
  })

  it('links the referral call to action to the existing claim flow', () => {
    const referral = screen.getByRole('region', { name: /request a restoration contractor/i })
    const link = within(referral).getByRole('link', { name: /request a contractor/i })
    expect(link).toHaveAttribute('href', '/claim/step-1')
  })

  it('contains no tel: or mailto: links', () => {
    for (const link of screen.getAllByRole('link')) {
      expect(link.getAttribute('href') ?? '').not.toMatch(/^(tel|mailto):/)
    }
  })

  it('is held out of search indexes until approved', () => {
    expect(metadata.robots).toMatchObject({ index: false })
  })
})
