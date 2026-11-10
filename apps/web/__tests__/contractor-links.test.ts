import path from 'path'

// One owner for the rule: the same checker runs here, in the Done contract and by hand.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { findBrokenContractorLinks } = require('../scripts/check-contractor-links.cjs')

describe('contractor links', () => {
  it('never link to /contractor/<word> unless a page exists there', () => {
    const broken = findBrokenContractorLinks(path.join(__dirname, '..'))
    expect(broken).toEqual([])
  })
})
