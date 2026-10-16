import { NextRequest, NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/get-tenant-db';
import { authenticateRequest, requireRole, unauthorizedRoleResponse } from '@/lib/auth-middleware';
import { handleUnexpectedError, createErrorResponse, ErrorCode } from '@/lib/api-errors';
import { getVerifiedTrainingSourceHtml, verifyTrainingSourcesPresent } from '@/lib/training/nrp-training';
import { NRPG_CERTIFICATION_NAMES } from '@/lib/training/training-policy';

export const dynamic = 'force-dynamic';

function escapeJsString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ');
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.context;

    const db = getTenantDb(authResult.context);

    if (!requireRole(user, ['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN'])) {
      return unauthorizedRoleResponse(['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN']);
    }

    await verifyTrainingSourcesPresent();

    const onboarding = await db.contractorOnboarding.findUnique({
      where: { contractorId: user.id },
      select: { status: true },
    });

    if (!onboarding || onboarding.status !== 'COMPLETED') {
      return createErrorResponse(ErrorCode.FORBIDDEN, 'Certificate is only available after training completion', 403);
    }

    const cert = await db.contractorCertification.findFirst({
      where: { contractorId: user.id, certificationName: { in: [...NRPG_CERTIFICATION_NAMES] } },
      orderBy: { createdAt: 'desc' },
    });

    if (!cert) {
      return createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND, 'Certificate not found', 404);
    }

    const profile = await db.contractorProfile.findUnique({
      where: { userId: user.id },
      select: { businessName: true },
    });

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { name: true },
    });

    const recipientName = profile?.businessName || dbUser?.name || 'NRPG Contractor';
    const certId = (cert.id || '').replace(/[^a-zA-Z0-9]/g, '').slice(-6) || '000000';
    const issueDate = cert.issueDate ? cert.issueDate.toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

    const templatePath = 'training-sources/NRP Folder/NRP-Certificate-Template.html';
    const source = await getVerifiedTrainingSourceHtml(templatePath);

    const injected = `${source.html}
<script>
  (function () {
    try {
      var recipientName = '${escapeJsString(recipientName)}';
      var certId = '${escapeJsString(certId)}';
      var issueDate = '${escapeJsString(issueDate)}';
      var nameEl = document.getElementById('recipientName');
      if (nameEl) nameEl.textContent = recipientName;
      var idEl = document.getElementById('certId');
      if (idEl) idEl.textContent = certId;
      var dateEl = document.getElementById('issueDate');
      if (dateEl && issueDate) dateEl.textContent = issueDate;
    } catch (e) {}
  })();
</script>`;

    return NextResponse.json({
      success: true,
      certificate: {
        certificationName: cert.certificationName,
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate,
        verified: cert.verified,
        html: injected,
        template: { path: templatePath, sha256: source.sha256 },
      },
    });
  } catch (error) {
    return handleUnexpectedError(error);
  }
}

