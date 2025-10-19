# Email Templates: Auto Insurance Purchase Flow

**Feature**: 001-auto-insurance-flow
**Purpose**: Define email content for demo application (in-app preview/notification display)

---

## Template 1: Quote Confirmation Email

**Trigger**: Quote successfully created (POST /api/v1/quotes)
**Recipient**: Party email from Communication Identity
**Subject**: Your Auto Insurance Quote is Ready - {{quoteReferenceNumber}}

**Body**:

```
Hi {{firstName}},

Thank you for requesting an auto insurance quote with us!

Quote Details:
- Quote Reference: {{quoteReferenceNumber}}
- Vehicle: {{vehicleYear}} {{vehicleMake}} {{vehicleModel}}
- Coverage: {{coverageType}}
- Estimated Premium: ${{annualPremium}}/year
- Quote Valid Until: {{expirationDate}}

Ready to get covered? Complete your purchase:
{{bindingUrl}}

Questions? We're here to help.

Best regards,
Auto Insurance Demo Team
```

---

## Template 2: Policy Binding Confirmation Email

**Trigger**: Policy successfully bound (POST /api/v1/policies, status=BOUND)
**Recipient**: Party email from Communication Identity
**Subject**: Welcome! Your Policy {{policyNumber}} is Active

**Body**:

```
Hi {{firstName}},

Congratulations! Your auto insurance policy is now active.

Policy Information:
- Policy Number: {{policyNumber}}
- Effective Date: {{effectiveDate}}
- Expiration Date: {{expirationDate}}
- Vehicle: {{vehicleYear}} {{vehicleMake}} {{vehicleModel}}
- Annual Premium: ${{annualPremium}}

Access Your Policy Portal:
{{portalUrl}}

In your portal, you can:
✓ View policy details and coverage
✓ Review billing and payment history
✓ File claims
✓ Download policy documents

Important Documents:
- Policy Declarations (attached)
- Insurance ID Card (attached)

Thank you for choosing us!

Best regards,
Auto Insurance Demo Team
```

---

## Template 3: Portal Access Credentials Email

**Trigger**: User Account created after policy binding (FR-011, FR-012)
**Recipient**: Party email from Communication Identity
**Subject**: Access Your Insurance Portal - Policy {{policyNumber}}

**Body**:

```
Hi {{firstName}},

Your self-service insurance portal is ready!

Access Your Portal:
{{portalUrl}}

Your policy number: {{policyNumber}}

What you can do in your portal:
✓ View all your policies and quotes
✓ Check billing and payment history
✓ File and track claims
✓ Download policy documents
✓ Update contact information

This is a demo application. Your portal access is available via the URL above using your policy number.

Questions? Contact us anytime.

Best regards,
Auto Insurance Demo Team
```

---

## Template Variables Reference

| Variable | Source | Example |
|----------|--------|---------|
| `{{firstName}}` | Person.given_name | "John" |
| `{{quoteReferenceNumber}}` | Policy.quote_reference_number (status=QUOTED) | "QT-12345678" |
| `{{policyNumber}}` | Policy.policy_number | "POL-87654321" |
| `{{vehicleYear}}` | Vehicle.model_year | "2020" |
| `{{vehicleMake}}` | Vehicle.make_name | "Toyota" |
| `{{vehicleModel}}` | Vehicle.model_name | "Camry" |
| `{{coverageType}}` | Coverage.coverage_type_code | "Full Coverage" |
| `{{annualPremium}}` | Policy Amount (amount_type_code=PREMIUM) | "1,200.00" |
| `{{expirationDate}}` | Policy.expiration_date | "2025-11-18" |
| `{{effectiveDate}}` | Policy.effective_date | "2025-10-18" |
| `{{bindingUrl}}` | `/binding?quote={{quoteReferenceNumber}}` | "/binding?quote=QT-12345678" |
| `{{portalUrl}}` | `/portal/{{policyNumber}}` | "/portal/POL-87654321" |

---

## Implementation Notes

**Demo Mode Display Options**:
1. **In-App Notification Center**: Display emails as notifications with full HTML rendering
2. **Email Preview Panel**: Show email content in modal/drawer after trigger action
3. **Console Log**: Log email content to browser console for debugging
4. **Mock Email Service UI**: Create dedicated `/admin/emails` page showing all sent emails

**Production Migration Path**:
- Replace demo display with actual email delivery service (Resend, SendGrid, AWS SES)
- Email templates can be migrated to service provider's template system
- Variable substitution logic remains the same
