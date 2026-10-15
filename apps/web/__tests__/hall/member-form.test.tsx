import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MemberEnquiry from '../../app/hall/enquiry/MemberEnquiry';
const submit = jest.fn();
jest.mock('../../lib/hall/member-flow', () => ({ createMemberSubmitter: () => ({ submit, invalidate: jest.fn() }), productLabel: () => 'Delmhorst 21-E Deep Wall Probe' }));
jest.mock('../../lib/hooks/useCsrfToken', () => ({ useCsrfToken: () => ({ csrfToken: 'synthetic-csrf', loading: false, error: null }) }));
const profile = { recipientOrganisationId: 'synthetic-ccw', approvedProductIds: ['ccw-probe'], sourceRevision: 'a'.repeat(40), catalogueVersion: 'synthetic-v1', consentVersion: 'synthetic-v1' };
beforeEach(() => { submit.mockReset(); global.fetch = jest.fn(); Object.defineProperty(window.crypto, 'randomUUID', { configurable: true, value: () => '00000000-0000-4000-8000-000000000001' }); });
test('confirmation is unticked and no submission occurs until explicit consent', async () => {
 submit.mockResolvedValue({ status: 'unverified' }); render(<MemberEnquiry profile={profile} />);
 const button = screen.getByRole('button', { name: 'Confirm enquiry' }); expect(button).toBeDisabled(); expect(screen.getByRole('checkbox')).not.toBeChecked();
 fireEvent.click(button); expect(submit).not.toHaveBeenCalled();
 fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Synthetic' } });
 fireEvent.change(screen.getByLabelText('Reply contact'), { target: { value: 'synthetic@example.invalid' } });
 fireEvent.change(screen.getByLabelText('Your enquiry'), { target: { value: 'Synthetic supplier enquiry' } });
 fireEvent.click(screen.getByRole('checkbox')); fireEvent.click(button);
 await waitFor(() => expect(submit).toHaveBeenCalledTimes(1)); expect(submit.mock.calls[0][2].confirmed).toBe(true);
 await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Receiving could not be verified'));
 expect(screen.getByLabelText('Your enquiry')).toHaveValue('Synthetic supplier enquiry'); expect(screen.getByRole('button', { name: 'Confirm enquiry' })).not.toBeDisabled();
});
test('only matched held source receipt changes status and locks the accepted draft', async () => {
 submit.mockResolvedValue({ status: 'received-held' }); render(<MemberEnquiry profile={profile} />);
 fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Synthetic' } });
 fireEvent.change(screen.getByLabelText('Reply contact'), { target: { value: 'synthetic@example.invalid' } });
 fireEvent.change(screen.getByLabelText('Your enquiry'), { target: { value: 'Synthetic supplier enquiry' } });
 fireEvent.click(screen.getByRole('checkbox')); fireEvent.click(screen.getByRole('button', { name: 'Confirm enquiry' }));
 await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Supplier delivery is pending'));
 expect(screen.getByLabelText('Your enquiry')).toBeDisabled(); expect(screen.getByRole('button', { name: 'Confirm enquiry' })).toBeDisabled();
});


test.each(['not_connected', 'unverified'])('real CSRF wrapper preserves the identical draft/event on %s retry', async status => {
 submit.mockResolvedValue({ status }); render(<MemberEnquiry profile={profile} />);
 fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Synthetic' } });
 fireEvent.change(screen.getByLabelText('Reply contact'), { target: { value: 'synthetic@example.invalid' } });
 fireEvent.change(screen.getByLabelText('Your enquiry'), { target: { value: 'Synthetic supplier enquiry' } });
 fireEvent.click(screen.getByRole('checkbox'));
 fireEvent.click(screen.getByRole('button', { name: 'Confirm enquiry' }));
 await waitFor(() => expect(screen.getByRole('button', { name: 'Confirm enquiry' })).not.toBeDisabled());
 expect(screen.getByLabelText('Your name')).toHaveValue('Synthetic');
 expect(screen.getByLabelText('Reply contact')).toHaveValue('synthetic@example.invalid');
 expect(screen.getByLabelText('Your enquiry')).toHaveValue('Synthetic supplier enquiry');
 expect(screen.getByLabelText('Carpet Cleaners Warehouse product')).toHaveValue('ccw-probe');
 const first = submit.mock.calls[0];
 fireEvent.click(screen.getByRole('button', { name: 'Confirm enquiry' }));
 await waitFor(() => expect(submit).toHaveBeenCalledTimes(2));
 expect(submit.mock.calls[1][0]).toEqual(first[0]);
 expect(submit.mock.calls[1][2].eventId).toBe(first[2].eventId);
 await waitFor(() => expect(screen.getByRole('button', { name: 'Confirm enquiry' })).not.toBeDisabled());
});
