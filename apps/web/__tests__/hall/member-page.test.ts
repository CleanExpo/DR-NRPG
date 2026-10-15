/** @jest-environment node */
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('../../lib/auth', () => ({ authOptions: {} }));
jest.mock('../../lib/prisma', () => ({ basePrisma: {} }));
jest.mock('../../lib/hall/receiving', () => ({ resolveHallActor: jest.fn() }));
jest.mock('../../app/hall/enquiry/MemberEnquiry', () => ({ __esModule: true, default: () => null }));
import Page from '../../app/hall/enquiry/page';
import { resolveHallActor } from '../../lib/hall/receiving';
import { memberProfile } from '../../lib/hall/member-flow';
jest.mock('../../lib/hall/member-flow', () => ({ memberProfile: jest.fn() }));
function content(value: any): string { if (typeof value === 'string') return value; if (Array.isArray(value)) return value.map(content).join(' '); return value?.props ? content(value.props.children) : ''; }
test('disabled page never checks identity, and absent current actor never renders form', async () => {
 (memberProfile as jest.Mock).mockReturnValue(null); const disabled = await Page(); expect(content(disabled)).toContain('not connected'); expect(resolveHallActor).not.toHaveBeenCalled();
 (memberProfile as jest.Mock).mockReturnValue({ approvedProductIds: ['ccw-probe'] }); (resolveHallActor as jest.Mock).mockResolvedValue(null);
 expect(content(await Page())).toContain('verified, active NRPG');
});
