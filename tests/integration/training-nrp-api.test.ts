import { GET as getIndex } from '@/app/api/training/nrp/index/route';
import { GET as getQuiz } from '@/app/api/training/nrp/quiz/[moduleNumber]/route';
import { GET as getModule } from '@/app/api/training/nrp/module/[moduleId]/route';
import { createMockRequest } from '@tests/utils/testHelpers';

describe('NRPG training APIs', () => {
  it('returns training index', async () => {
    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/training/nrp/index',
    });

    const response = await getIndex(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.index.modules)).toBe(true);
    expect(data.index.modules.length).toBeGreaterThan(0);
  });

  it('returns quiz for module 1', async () => {
    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/training/nrp/quiz/1',
    });

    const response = await getQuiz(request, { params: { moduleNumber: '1' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.quiz.moduleNumber).toBe(1);
    expect(Array.isArray(data.quiz.questions)).toBe(true);
    expect(data.quiz.questions.length).toBeGreaterThan(0);
  });

  it('returns source-verified HTML for NRP-001', async () => {
    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/training/nrp/module/NRP-001',
    });

    const response = await getModule(request, { params: { moduleId: 'NRP-001' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.module.moduleId).toBe('NRP-001');
    expect(typeof data.module.sha256).toBe('string');
    expect(data.module.sha256.length).toBeGreaterThan(10);
    expect(typeof data.module.html).toBe('string');
    expect(data.module.html).toContain('<!DOCTYPE html');
  });
});

