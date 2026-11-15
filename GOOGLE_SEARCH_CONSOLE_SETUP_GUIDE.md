# Google Search Console & SEO Setup Guide - DR-NRPG Platform

**Date:** 2026-02-04
**Status:** Ready for Manual Execution
**Time Required:** 1 hour
**Priority:** P0 (Critical - Start SEO Timeline NOW)

---

## 🎯 Overview

This guide provides step-by-step instructions to configure Google Search Console and establish the online presence for the DR-NRPG Platform. Completing these tasks **starts the 3-6 month SEO ranking timeline** essential for organic traffic growth.

**Why Critical:**
- Google Search Console ranking takes 3-6 months to build
- Sitemap submission enables indexing of 6,000-11,000 URLs
- Google Business Profile improves local search visibility
- Business directory listings build domain authority

---

## ✅ Pre-Requisites Checklist

Before starting, ensure you have:
- [ ] Google account (Gmail) with admin access
- [ ] Vercel account access (for DNS verification) OR website file upload access
- [ ] Business phone number: `+61 (to be added)`
- [ ] Business email: `support@disasterrecoverynrpg.com.au`
- [ ] 1 hour of uninterrupted time

---

## 📋 PART 1: Google Search Console Setup (20 minutes)

### Step 1: Create Google Search Console Account (5 minutes)

1. **Visit Google Search Console:**
   - URL: https://search.google.com/search-console
   - Sign in with your Google account

2. **Add Property:**
   - Click "Add Property" or "+" button
   - Choose: **"Domain"** property type (recommended)
   - Enter domain: `disasterrecoverynrpg.com.au`
   - Click "Continue"

**Why Domain Property?**
- Covers all subdomains (www, blog, app, etc.)
- Covers all protocols (http, https)
- Comprehensive coverage for future growth

### Step 2: Verify Domain Ownership (10 minutes)

Google will provide a **DNS TXT record** that you need to add to your domain's DNS settings.

#### Option A: DNS TXT Record Verification (Recommended)

**DNS Record Details:**
```
Type: TXT
Name: @ (or leave blank for root domain)
Value: google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TTL: 3600 (1 hour)
```

**Where to Add DNS Record:**

**If using Vercel for domain management:**
1. Go to: https://vercel.com/dashboard
2. Navigate to: Project → Settings → Domains
3. Click on `disasterrecoverynrpg.com.au`
4. Add DNS Record:
   - Type: `TXT`
   - Name: `@`
   - Value: `google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
5. Save and wait 5-10 minutes for propagation

**If using external domain registrar (Namecheap, GoDaddy, etc.):**
1. Log into your domain registrar account
2. Navigate to: DNS Management or Advanced DNS
3. Add new TXT record with values above
4. Save and wait 5-10 minutes for propagation

**Verification:**
1. Return to Google Search Console
2. Click "Verify" button
3. If successful: "Ownership verified" message appears
4. If failed: Wait 10 more minutes and try again (DNS propagation delay)

#### Option B: HTML Meta Tag Verification (Alternative)

If you can't access DNS settings, use HTML meta tag verification:

**Meta Tag Provided by Google:**
```html
<meta name="google-site-verification" content="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" />
```

**Where to Add:**
- File: `apps/web/app/layout.tsx`
- Location: Inside `<head>` section
- Line: After other meta tags (around line 50-60)

**Example:**
```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Existing meta tags */}
        <meta name="google-site-verification" content="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Deploy to production:**
```bash
git add apps/web/app/layout.tsx
git commit -m "feat: Add Google Search Console verification meta tag"
git push origin main
```

Wait 2-3 minutes for Vercel deployment, then verify in Search Console.

### Step 3: Submit Sitemaps (5 minutes)

Once domain is verified:

1. **Navigate to Sitemaps Section:**
   - In Google Search Console sidebar
   - Click "Sitemaps"

2. **Submit Main Sitemap:**
   - Enter sitemap URL: `sitemap.xml`
   - Click "Submit"
   - Status should show: "Success" or "Pending" (will be crawled within 24 hours)

3. **Submit Contractor Sitemap:**
   - Enter sitemap URL: `sitemap-contractors.xml`
   - Click "Submit"
   - Status should show: "Success" or "Pending"

**Expected Results (Within 48 Hours):**
- Discovered URLs: 6,000-11,000 pages
- Submitted: 2 sitemaps
- Indexed: Will grow over 1-2 weeks (start with ~100 URLs, then 1,000+, eventually 6,000+)

### Step 4: Configure Search Console Settings (Optional - 5 minutes)

**Email Notifications:**
- Navigate to: Settings → Users and Permissions
- Add team email: `support@disasterrecoverynrpg.com.au`
- Enable notifications for:
  - Critical issues (manual actions, security issues)
  - Indexing errors
  - Mobile usability issues

**Target Geographic Location:**
- Navigate to: Settings → Crawling
- Set target country: **Australia**
- This helps Google understand your target audience

---

## 📋 PART 2: Google Business Profile Setup (15 minutes)

### Step 1: Create Google Business Profile (10 minutes)

1. **Visit Google Business Profile:**
   - URL: https://business.google.com
   - Sign in with the same Google account used for Search Console

2. **Create Business Profile:**
   - Click "Manage now" or "Create a profile"
   - Follow the wizard:

**Business Information:**
```
Business Name: NRPG - National Restoration Professionals Group

Category:
- Primary: "Disaster Restoration Service"
- Secondary: "Emergency Management Service"
- Tertiary: "Contractor"

Business Description (750 characters max):
NRPG (National Restoration Professionals Group) is Australia's leading network of qualified disaster recovery contractors. We connect property owners with verified, professional restoration specialists for water damage, flood restoration, fire damage, mould remediation, storm damage, and biohazard cleanup. Our platform ensures 24/7 emergency response, transparent pricing, and quality-assured service across all Australian major cities. All contractors are independently verified, fully insured, and committed to industry best practices. Whether you're facing an emergency flood, fire damage, or mould issue, NRPG connects you with trusted professionals who respond fast and restore right.

Service Area:
- Type: "Service Area Business" (contractors come to customers)
- Service Areas:
  * Sydney, NSW
  * Melbourne, VIC
  * Brisbane, QLD
  * Perth, WA
  * Adelaide, SA
  * Canberra, ACT
  * Hobart, TAS
  * Darwin, NT

Contact Information:
- Phone: +61 [Add your business phone]
- Website: https://disasterrecoverynrpg.com.au
- Email: support@disasterrecoverynrpg.com.au

Hours:
- Monday: Open 24 hours
- Tuesday: Open 24 hours
- Wednesday: Open 24 hours
- Thursday: Open 24 hours
- Friday: Open 24 hours
- Saturday: Open 24 hours
- Sunday: Open 24 hours
- Special: "24/7 Emergency Response Available"

Attributes:
☑ Online appointments available
☑ Emergency services offered
☑ LGBTQ+ friendly
☑ Women-led
```

### Step 2: Verify Business (5 minutes - Initiate)

Google will offer verification methods:

**Option 1: Postcard Verification (Recommended for Service Area Businesses)**
- Google mails a postcard with verification code to business address
- Delivery: 5-14 days
- Enter code on Google Business Profile once received

**Option 2: Phone Verification (If Available)**
- Google calls your business phone number
- Automated system provides verification code
- Enter code immediately

**Option 3: Email Verification (If Available)**
- Google sends verification email to domain email
- Click verification link
- Instant verification

**Recommended:** Choose postcard or phone verification and note the expected completion date.

### Step 3: Optimize Profile (After Verification - 30 minutes later)

Once verified, optimize your profile:

**Photos to Upload (8+ photos):**
1. Logo: NRPG logo (square format, 720x720px)
2. Cover Photo: Disaster restoration team at work (1200x720px)
3. Interior Photos: Office, equipment, training facility
4. Team Photos: Certified contractors, staff members
5. Before/After: Restoration work examples (with permission)
6. Products/Services: Equipment photos, certification badges

**Posts to Create (Weekly):**
- **Update:** "How to Prepare for Flood Season in Australia"
- **Event:** "Free Disaster Preparedness Webinar - March 15th"
- **Offer:** "20% Off Mould Inspections for New Clients"

**Q&A Section:**
- Preemptively answer common questions:
  * "Are your contractors qualified?" → Yes, all verified contractors...
  * "Do you provide 24/7 emergency service?" → Yes, our network...
  * "What areas do you service?" → We service all Australian major cities...

---

## 📋 PART 3: Business Directory Submissions (20 minutes)

Submit your business to 20+ Australian directories to build citations and backlinks.

### Tier 1: Major Australian Directories (10 minutes)

**Pre-Filled Business Information:**
```
Business Name: NRPG - National Restoration Professionals Group
Website: https://disasterrecoverynrpg.com.au
Phone: +61 [Add your number]
Email: support@disasterrecoverynrpg.com.au
Category: Disaster Restoration Service, Emergency Services, Contractor
Description: Australia's leading network of qualified disaster recovery contractors. 24/7 emergency response for water damage, flood restoration, fire damage, mould remediation, storm damage, and biohazard cleanup.

Service Areas: Sydney, Melbourne, Brisbane, Perth, Adelaide, Canberra, Hobart, Darwin
Hours: 24/7 Emergency Service
Keywords: disaster recovery, flood restoration, water damage, fire damage, mould remediation, storm damage, emergency restoration, qualified contractors, Australia
```

**Directory List:**

1. **TrueLocal** (DA 60)
   - URL: https://www.truelocal.com.au
   - Create business listing (free tier)
   - Estimated time: 5 minutes

2. **Yellow Pages Australia** (DA 70)
   - URL: https://www.yellowpages.com.au
   - Create business profile (free tier)
   - Estimated time: 5 minutes

3. **Yelp Australia** (DA 95)
   - URL: https://www.yelp.com.au
   - Create business account
   - Claim your business listing
   - Estimated time: 5 minutes

4. **White Pages Australia** (DA 80)
   - URL: https://www.whitepages.com.au
   - Add business listing
   - Estimated time: 3 minutes

5. **Start Local** (DA 50)
   - URL: https://www.startlocal.com.au
   - Create business listing
   - Estimated time: 3 minutes

### Tier 2: Industry-Specific Directories (10 minutes)

6. **HIPages** (DA 72)
   - URL: https://www.hipages.com.au
   - Create contractor profile (consider paid tier for leads)
   - Estimated time: 5 minutes

7. **ServiceSeeking** (DA 65)
   - URL: https://www.serviceseeking.com.au
   - Create service provider profile
   - Estimated time: 5 minutes

8. **Oneflare** (DA 55)
   - URL: https://www.oneflare.com.au
   - Add business listing
   - Estimated time: 3 minutes

9. **Airtasker** (DA 68)
   - URL: https://www.airtasker.com
   - Create business account (for emergency services)
   - Estimated time: 3 minutes

10. **Local Search** (DA 48)
    - URL: https://www.localsearch.com.au
    - Create free listing
    - Estimated time: 3 minutes

### Tier 3: Additional Australian Directories (Optional - 20 minutes)

11. **True Blue** (DA 40)
12. **Brownbook Australia** (DA 58)
13. **Cylex Australia** (DA 52)
14. **Hotfrog Australia** (DA 60)
15. **Aussie Web** (DA 45)
16. **Find Open** (DA 42)
17. **Bing Places** (DA 100)
18. **Apple Maps Connect** (DA 100)
19. **Waze Places** (DA 90)
20. **Foursquare** (DA 92)

**Tip:** Use a spreadsheet to track submissions:
```
Directory Name | URL | Submitted (Y/N) | Date | Username | Verification Status
TrueLocal | ... | Y | 2026-02-04 | ... | Verified
Yellow Pages | ... | Y | 2026-02-04 | ... | Pending
```

---

## 📋 PART 4: Monitoring & Verification (Ongoing)

### Week 1: Initial Monitoring (Daily Checks)

**Google Search Console:**
- [ ] Day 1: Verify domain ownership successful
- [ ] Day 2: Check sitemap submission status (should show "Success")
- [ ] Day 3: Monitor discovered URLs (expect 100-500 URLs discovered)
- [ ] Day 7: Check indexed pages (expect 50-100 indexed)

**Expected Timeline:**
- **Day 1-2:** Sitemaps submitted and discovered
- **Day 3-7:** Initial pages indexed (50-100 URLs)
- **Week 2-4:** Bulk indexing (500-2,000 URLs)
- **Month 2-3:** Full indexing (6,000-11,000 URLs)

### Month 1-3: Growth Monitoring (Weekly Checks)

**Metrics to Track:**
1. **Indexing Status:**
   - Coverage → Indexed pages (target: 1,000+ by Month 1)
   - Crawl stats → Pages crawled per day

2. **Search Performance:**
   - Total clicks (target: 10+ by Month 1, 100+ by Month 3)
   - Total impressions (target: 500+ by Month 1, 5,000+ by Month 3)
   - Average CTR (target: 2-5%)
   - Average position (will be 50-100+ initially, aim for top 20 by Month 3)

3. **Keyword Rankings:**
   - Use Google Search Console → Performance → Queries
   - Track top 20 keywords
   - Monitor position changes weekly

4. **Issues to Address:**
   - Coverage → Errors (fix 404s, redirect chains)
   - Mobile usability → Issues (fix responsive problems)
   - Core Web Vitals → Poor URLs (optimize performance)

### Month 3-6: Optimization (Bi-Weekly Checks)

**Actions:**
1. **Identify Top-Performing Pages:**
   - Pages with highest impressions but low CTR → Optimize meta titles/descriptions
   - Pages ranking positions 11-20 → Optimize content to break into top 10

2. **Keyword Gap Analysis:**
   - Find queries with high impressions but low clicks
   - Create dedicated content for those queries

3. **Technical SEO Issues:**
   - Fix any crawl errors reported
   - Improve Core Web Vitals scores
   - Update sitemaps if new pages added

---

## 📊 Success Criteria

### Immediate (Week 1):
- ✅ Google Search Console domain verified
- ✅ 2 sitemaps submitted successfully
- ✅ Google Business Profile created (verification pending)
- ✅ 10+ business directory submissions completed
- ✅ Initial pages discovered (100-500 URLs)

### Short-Term (Month 1):
- ✅ 1,000+ pages indexed in Google Search Console
- ✅ Google Business Profile verified
- ✅ First organic traffic appears (10-50 visitors/month)
- ✅ 20+ business directory listings live
- ✅ 5+ keywords ranking in top 100

### Medium-Term (Month 3):
- ✅ 5,000+ pages indexed
- ✅ 1,000 organic visitors/month
- ✅ 10 keywords in top 50 positions
- ✅ 20+ quote requests from organic search
- ✅ Google Business Profile reviews (5+ reviews)

### Long-Term (Month 6):
- ✅ 6,000-11,000 pages indexed (full sitemap)
- ✅ 10,000 organic visitors/month
- ✅ 30 keywords in top 10 positions
- ✅ 100+ quote requests from organic search
- ✅ Domain Authority 20-25

---

## 🚨 Common Issues & Troubleshooting

### Issue 1: Domain Verification Failed

**Symptoms:** "Verification failed" error in Google Search Console

**Solutions:**
1. Wait 10-15 minutes for DNS propagation
2. Check TXT record is correct (no extra spaces, correct value)
3. Use `dig` or `nslookup` to verify DNS record:
   ```bash
   nslookup -type=TXT disasterrecoverynrpg.com.au
   ```
4. Try alternative verification method (HTML meta tag)

### Issue 2: Sitemap Not Indexing

**Symptoms:** "Couldn't fetch" error on sitemap submission

**Solutions:**
1. Test sitemap manually: https://disasterrecoverynrpg.com.au/sitemap.xml
2. Ensure robots.txt allows crawling (already configured)
3. Check for XML syntax errors
4. Wait 24-48 hours for Google to retry fetch
5. Manually request indexing for critical pages

### Issue 3: Google Business Profile Suspended

**Symptoms:** Profile suspended or disabled after creation

**Solutions:**
1. Ensure business name doesn't include keywords (NRPG is clean)
2. Don't use PO Box for address (service area business doesn't need address)
3. Use real phone number (no virtual numbers)
4. Appeal suspension via Google Business Profile Help

### Issue 4: Low Indexing Rate

**Symptoms:** Only 100-200 pages indexed after 2 weeks

**Solutions:**
1. Check Core Web Vitals (slow pages index slower)
2. Ensure pages have unique content (avoid thin content)
3. Manually request indexing for priority pages (10 per day limit)
4. Increase internal linking between pages
5. Build external backlinks to priority pages

---

## 📁 Document Attachments

**Files Created:**
- `GOOGLE_SEARCH_CONSOLE_SETUP_GUIDE.md` (this file)
- `SEO_KEYWORD_RESEARCH.md` (keyword strategy)
- `BACKLOG-SEO_OPTIMIZATION.md` (technical implementation)

**Files Referenced:**
- `apps/web/app/sitemap.ts` (main sitemap)
- `apps/web/app/sitemap-contractors.xml/route.ts` (contractor sitemap)
- `apps/web/public/robots.txt` (crawler rules)

---

## ✅ Completion Checklist

Print this checklist and mark off as you complete:

### Google Search Console (20 minutes):
- [ ] Account created at https://search.google.com/search-console
- [ ] Domain property added: `disasterrecoverynrpg.com.au`
- [ ] Domain verified via DNS TXT record or HTML meta tag
- [ ] Sitemap submitted: `sitemap.xml`
- [ ] Sitemap submitted: `sitemap-contractors.xml`
- [ ] Email notifications configured
- [ ] Target country set to Australia

### Google Business Profile (15 minutes):
- [ ] Profile created at https://business.google.com
- [ ] Business information filled (name, category, description)
- [ ] Service areas added (8 Australian cities)
- [ ] Contact information added (phone, email, website)
- [ ] Hours set to 24/7
- [ ] Verification initiated (postcard/phone/email)
- [ ] Verification code entered (after receiving)

### Business Directories (20 minutes):
- [ ] TrueLocal listing created
- [ ] Yellow Pages listing created
- [ ] Yelp Australia listing created
- [ ] White Pages listing created
- [ ] Start Local listing created
- [ ] HIPages profile created
- [ ] ServiceSeeking profile created
- [ ] Oneflare listing created
- [ ] Airtasker account created
- [ ] Local Search listing created
- [ ] 10+ additional directories submitted (optional)

### Monitoring Setup (5 minutes):
- [ ] Calendar reminders set for weekly Search Console checks
- [ ] Spreadsheet created for tracking directory submissions
- [ ] Baseline metrics recorded (0 indexed pages, 0 traffic)

---

## 🎯 Next Steps After Completion

Once you've completed this guide:

1. **Wait 48 Hours:**
   - Allow time for initial indexing
   - Check Search Console for discovered URLs
   - Verify sitemaps show "Success" status

2. **Create Calendar Reminders:**
   - Weekly: Check Google Search Console performance
   - Monthly: Review keyword rankings and optimize
   - Quarterly: Conduct full SEO audit

3. **Proceed to Option B:**
   - Start building marketing landing pages (24 hours)
   - Create pre-launch email capture pages
   - Set up A/B testing for campaign variations

4. **Document Results:**
   - Take screenshots of initial Search Console stats
   - Record baseline metrics (0 pages, 0 traffic)
   - Track progress over 3-6 months

---

## 📞 Support Resources

**Google Search Console Help:**
- Help Center: https://support.google.com/webmasters
- Community Forum: https://support.google.com/webmasters/community

**Google Business Profile Help:**
- Help Center: https://support.google.com/business
- Community Forum: https://support.google.com/business/community

**DR-NRPG Platform Support:**
- Email: support@disasterrecoverynrpg.com.au
- Documentation: See `SEO_KEYWORD_RESEARCH.md` and `BACKLOG-SEO_OPTIMIZATION.md`

---

**Created:** 2026-02-04
**Last Updated:** 2026-02-04
**Version:** 1.0
**Status:** ✅ Ready for Execution

Start your SEO journey today and begin building organic traffic for the DR-NRPG Platform! 🚀
