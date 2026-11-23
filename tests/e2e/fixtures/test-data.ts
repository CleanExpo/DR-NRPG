/**
 * E2E Test Data Fixtures
 *
 * Reusable test data for all E2E tests including user data,
 * claim data, contractor data, and form inputs
 */

export const testUsers = {
  homeowner: {
    email: 'homeowner.test@nrpg.com',
    password: 'Test123!@#',
    firstName: 'John',
    lastName: 'Homeowner',
    phone: '555-0101',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
    },
  },
  contractor: {
    email: 'contractor.test@nrpg.com',
    password: 'Test123!@#',
    firstName: 'Jane',
    lastName: 'Contractor',
    phone: '555-0102',
    company: 'Best Restoration LLC',
    licenseNumber: 'LIC-123456',
    certifications: ['Water Restoration Technician (WRT)', 'EPA Lead-Safe'],
  },
  admin: {
    email: 'admin.test@nrpg.com',
    password: 'Admin123!@#',
    firstName: 'Admin',
    lastName: 'User',
  },
};

export const testClaims = {
  waterDamage: {
    type: 'Water Damage',
    severity: 'Moderate',
    description: 'Burst pipe in kitchen caused flooding',
    affectedAreas: ['Kitchen', 'Dining Room'],
    damageDate: '2025-01-01',
    estimatedDamage: 15000,
    images: ['kitchen-flood-1.jpg', 'kitchen-flood-2.jpg'],
    urgency: 'High',
  },
  fireDamage: {
    type: 'Fire Damage',
    severity: 'Severe',
    description: 'Kitchen fire spread to living room',
    affectedAreas: ['Kitchen', 'Living Room'],
    damageDate: '2025-01-02',
    estimatedDamage: 50000,
    images: ['fire-damage-1.jpg'],
    urgency: 'Critical',
  },
  moldInfestation: {
    type: 'Mould',
    severity: 'Moderate',
    description: 'Black mold discovered in basement',
    affectedAreas: ['Basement'],
    damageDate: '2024-12-15',
    estimatedDamage: 8000,
    images: ['mold-basement.jpg'],
    urgency: 'Medium',
  },
};

export const testContractorApplications = {
  waterRestoration: {
    companyName: 'Water Restoration Experts',
    businessType: 'LLC',
    yearsInBusiness: 10,
    licenseNumber: 'WR-123456',
    insuranceProvider: 'Acme Insurance',
    policyNumber: 'POL-789012',
    serviceAreas: ['New York', 'New Jersey'],
    specializations: ['Water Damage', 'Flood Restoration'],
    certifications: [
      { name: 'Water Restoration Technician (WRT)', number: 'WRT-12345', expiryDate: '2026-12-31' },
      { name: 'Applied Structural Drying (ASD)', number: 'ASD-67890', expiryDate: '2026-12-31' },
    ],
    references: [
      { name: 'ABC Property Management', phone: '555-1111', email: 'contact@abc.com' },
      { name: 'XYZ Insurance', phone: '555-2222', email: 'claims@xyz.com' },
    ],
  },
  fireRestoration: {
    companyName: 'Fire Damage Recovery Inc',
    businessType: 'Corporation',
    yearsInBusiness: 15,
    licenseNumber: 'FR-654321',
    insuranceProvider: 'Best Insurance Co',
    policyNumber: 'POL-345678',
    serviceAreas: ['New York', 'Connecticut'],
    specializations: ['Fire Damage', 'Smoke Damage', 'Odor Removal'],
    certifications: [
      { name: 'Fire and Smoke Technician (FST)', number: 'FST-11111', expiryDate: '2027-06-30' },
    ],
    references: [
      { name: 'City Fire Department', phone: '555-3333', email: 'chief@cityfd.gov' },
    ],
  },
};

export const testContactForms = {
  generalInquiry: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '555-9999',
    subject: 'General Inquiry',
    message: 'I would like to know more about your services.',
  },
  claimAssistance: {
    name: 'Homeowner Smith',
    email: 'smith@example.com',
    phone: '555-8888',
    subject: 'Need Help with Claim',
    message: 'My insurance claim was denied. Can you help?',
    preferredContact: 'Phone',
    urgency: 'High',
  },
  partnershipInquiry: {
    name: 'Business Owner',
    email: 'owner@company.com',
    phone: '555-7777',
    subject: 'Partnership Opportunity',
    message: 'Interested in becoming a partner contractor.',
    companyName: 'ABC Restoration',
  },
};

export const testAddresses = {
  newYork: {
    street: '123 Broadway',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'USA',
  },
  newJersey: {
    street: '456 Garden State Pkwy',
    city: 'Newark',
    state: 'NJ',
    zip: '07102',
    country: 'USA',
  },
  california: {
    street: '789 Pacific Coast Hwy',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90001',
    country: 'USA',
  },
};

export const testPaymentInfo = {
  creditCard: {
    number: '4242424242424242', // Stripe test card
    expMonth: '12',
    expYear: '2028',
    cvc: '123',
    name: 'Test Cardholder',
    zip: '10001',
  },
  bankAccount: {
    routingNumber: '110000000',
    accountNumber: '000123456789',
    accountType: 'Checking',
    accountHolder: 'Test Account Holder',
  },
};

export const testFileUploads = {
  images: {
    jpeg: 'test-image.jpg',
    png: 'test-image.png',
    multiple: ['image1.jpg', 'image2.jpg', 'image3.png'],
  },
  documents: {
    pdf: 'test-document.pdf',
    word: 'test-document.docx',
    excel: 'test-spreadsheet.xlsx',
  },
  invalidFiles: {
    tooLarge: 'large-file-20mb.jpg', // > 10MB
    invalidType: 'invalid-file.exe',
  },
};

export const testPaginationData = {
  page1: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` })),
  page2: Array.from({ length: 10 }, (_, i) => ({ id: i + 11, name: `Item ${i + 11}` })),
  page3: Array.from({ length: 5 }, (_, i) => ({ id: i + 21, name: `Item ${i + 21}` })),
};

export const testSearchQueries = {
  claims: [
    { query: 'water damage', expectedResults: 15 },
    { query: 'fire', expectedResults: 8 },
    { query: 'mold', expectedResults: 12 },
    { query: 'storm damage', expectedResults: 20 },
  ],
  contractors: [
    { query: 'New York', expectedResults: 25 },
    { query: 'water restoration', expectedResults: 18 },
    { query: 'qualified contractors', expectedResults: 30 },
  ],
};

export const testNotifications = {
  success: {
    claimSubmitted: 'Your claim has been submitted successfully',
    profileUpdated: 'Profile updated successfully',
    paymentReceived: 'Payment received',
  },
  error: {
    invalidEmail: 'Please enter a valid email address',
    requiredField: 'This field is required',
    uploadFailed: 'File upload failed',
  },
  warning: {
    unsavedChanges: 'You have unsaved changes',
    sessionExpiring: 'Your session will expire soon',
  },
};
