# Specification

## Summary
**Goal:** Update the header branding by replacing the logo image and, when logged out, let users choose Customer or Vendor login by clicking the logo symbol.

**Planned changes:**
- Add and use a new static header logo image asset (while keeping the visible brand text exactly “MyLocal Kart” and updating the logo image alt text to reference “MyLocal Kart”).
- Make the header logo symbol clickable when logged out to open a small login chooser with “Customer” and “Vendor” options and an English login call-to-action that triggers the existing Internet Identity login flow using the selected mode.
- Remove or hide the existing standalone header ModeSelector when logged out so mode selection primarily happens via the logo click; ensure normal behavior is not blocked when logged in.

**User-visible outcome:** When logged out, clicking the logo symbol opens a chooser to log in as Customer or Vendor; the header shows the new logo image with brand text “MyLocal Kart”.
