# Manual Test Plan — Prelegal NDA Creator

This document covers manual verification steps for the NDA Creator feature. Run these after `npm run dev` with the app accessible at `http://localhost:3000`.

---

## 1. Layout

| # | Steps | Expected |
|---|-------|----------|
| 1.1 | Open the app | Two-column layout visible: form on left, preview on right. Header shows "Prelegal" and "Mutual NDA Creator". |
| 1.2 | Resize the browser window to a narrow width | Columns remain legible; no content overflow or overlap. |
| 1.3 | Scroll the form column | Preview column stays in place (independently scrollable). |
| 1.4 | Scroll the preview column | Form column stays in place. |

---

## 2. Live Preview — Agreement Terms

| # | Steps | Expected |
|---|-------|----------|
| 2.1 | Load the app without filling any fields | Preview shows "Not specified" placeholders for empty fields. Blank lines (`_______________`) appear in the signature block for empty party fields. |
| 2.2 | Type into the **Purpose** textarea | Preview cover page Purpose row updates in real time on every keystroke. |
| 2.3 | Set the **Effective Date** input to `2026-06-15` | Preview shows "June 15, 2026" in the cover page. |
| 2.4 | With **MNDA Term** set to "Expires after", change the years field to `3` | Cover page shows "Expires 3 year(s) from Effective Date." |
| 2.5 | Click the **Until terminated** radio for MNDA Term | Cover page shows "Continues until terminated in accordance with the terms of the MNDA." The years field becomes disabled. |
| 2.6 | Switch back to **Expires after** | Years field becomes enabled again. Cover page reverts to the expiry text. |
| 2.7 | With **Term of Confidentiality** on "years", change to `5` | Cover page shows "5 year(s) from Effective Date, but in the case of trade secrets…" |
| 2.8 | Click **In perpetuity** radio | Cover page shows "In perpetuity." The years field becomes disabled. |
| 2.9 | Type `Delaware` in the **Governing Law** field | Cover page Governing Law row updates. Standard Term 9 (Governing Law and Jurisdiction) body text also updates with "Delaware". |
| 2.10 | Type `Wilmington, DE` in the **Jurisdiction** field | Cover page Jurisdiction row updates. Standard Term 9 body text updates accordingly. |
| 2.11 | Type text in the **MNDA Modifications** field | An "MNDA Modifications" row appears in the cover page with the entered text. |
| 2.12 | Clear the **MNDA Modifications** field | The "MNDA Modifications" row disappears from the cover page. |

---

## 3. Live Preview — Party Fields

| # | Steps | Expected |
|---|-------|----------|
| 3.1 | Type a name in **Party 1 → Full Name** | Blank placeholder in the signature block disappears; name appears in its place. |
| 3.2 | Type a title in **Party 1 → Title** | Title appears in the signature block Party 1 column. |
| 3.3 | Type a company in **Party 1 → Company** | Company name appears in the cover page "Party 1" row and in the signature block. |
| 3.4 | Type an email in **Party 1 → Notice Address** | Notice address appears in the cover page "Notices" row. |
| 3.5 | Set **Party 1 → Date** to `2026-07-01` | Signature block Party 1 date shows "July 1, 2026". |
| 3.6 | Repeat 3.1–3.5 for Party 2 fields | All Party 2 values update symmetrically in the preview. |

---

## 4. Standard Terms

| # | Steps | Expected |
|---|-------|----------|
| 4.1 | Scroll the preview to the Standard Terms section | All 11 standard terms are visible, each with a numbered heading and body text. |
| 4.2 | Set **Governing Law** to `California` and **Jurisdiction** to `San Francisco, CA` | Standard Term 9 body text contains "California" and "San Francisco, CA". |
| 4.3 | Clear both **Governing Law** and **Jurisdiction** | Standard Term 9 body text reverts to bracket placeholders `[Governing Law]` and `[Jurisdiction]`. |

---

## 5. PDF Download

| # | Steps | Expected |
|---|-------|----------|
| 5.1 | Click **↓ Download PDF** | A print dialog opens (no new browser tab). Dialog title should reference the document or the page URL. |
| 5.2 | Choose "Save as PDF" in the print dialog and save | Saved PDF contains real selectable text (not a rasterised image). |
| 5.3 | Open the saved PDF | Document has a cover page, signature block, and all 11 standard terms. Text is properly paginated — terms are not cut mid-paragraph. |
| 5.4 | Fill in all fields (purpose, parties, dates, governing law) then download | All filled values appear correctly in the PDF. No bracket placeholders remain for filled fields. |
| 5.5 | Leave all party name/company fields blank then download | PDF shows `_______________` blank lines in the signature block. |
| 5.6 | After downloading, confirm the page state is unchanged | The form and preview are intact; no navigation has occurred. |
| 5.7 | Type `<script>alert("xss")</script>` into the **Purpose** field and download | PDF shows literal `<script>alert("xss")</script>` text — no alert fires. |

---

## 6. Edge Cases

| # | Steps | Expected |
|---|-------|----------|
| 6.1 | Enter a very long purpose (500+ characters) | Text wraps correctly in both the preview and the PDF. |
| 6.2 | Enter special characters (`&`, `"`, `<`, `>`) in party name and company fields | Preview and PDF display the characters correctly without breaking the layout. |
| 6.3 | Enter `0` in the **MNDA Term years** field | Input prevents submission of invalid values (minimum is 1). |
| 6.4 | Open the app in an incognito/private browser window | App loads and functions correctly with no MetaMask or extension errors. |
| 6.5 | Open the app in Firefox and Safari | Layout, live preview, and PDF download all work as expected. |

---

## 7. Attribution

| # | Steps | Expected |
|---|-------|----------|
| 7.1 | Scroll to the bottom of the preview | Attribution text "Based on Common Paper Mutual NDA Standard Terms v1.0 (CC BY 4.0)" is visible. |
| 7.2 | Download the PDF and check the footer | Attribution appears in the PDF footer. |
