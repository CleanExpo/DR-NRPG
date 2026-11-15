/**
 * @jest-environment node
 */
import path from 'path'
import { spawnSync } from 'child_process'

// One owner for the rule: this runs the same script the build runs.
const SCRIPT = path.resolve(__dirname, '../../../../scripts/check-iicrc-standard-refs.cjs')
const WEB_ROOT = path.resolve(__dirname, '../../../..')

function run(args: string[]) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd: WEB_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  const lines = (r.stdout || '').trim().split('\n')
  return { status: r.status, last: lines[lines.length - 1], stdout: r.stdout, stderr: r.stderr }
}

describe('IICRC standard references', () => {
  it('the check can fail: every banned form is caught and every clean twin passes', () => {
    const r = run(['--selftest'])
    expect(r.stderr).toBe('')
    expect(r.last).toMatch(/^IICRC_STANDARD_REFS selftest cases=\d+ failed=0 PASS$/)
    expect(r.status).toBe(0)
  })

  it('the tree shows no IICRC standard number or standard title', () => {
    const r = run([])
    expect(r.last).toMatch(/^IICRC_STANDARD_REFS findings=0 files_scanned=[1-9]\d* excluded=\d+ PASS$/)
    expect(r.status).toBe(0)
  })
})
