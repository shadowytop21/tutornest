import Link from "next/link";
import { companyProfile } from "@/lib/company";

const registrationItems = [
  { label: "Legal Name", value: companyProfile.legalName },
  { label: "Registered Address", value: companyProfile.registeredAddress },
  { label: "CIN", value: companyProfile.cin },
  { label: "GSTIN", value: companyProfile.gstin },
  { label: "PAN", value: companyProfile.pan },
  { label: "Support Email", value: companyProfile.email },
];

const complianceChecks = [
  "Publish Terms and Conditions",
  "Publish Privacy Policy",
  "Publish Cookie Policy and consent controls",
  "Display registered company details on website",
  "Maintain grievance/contact channel",
  "Review data retention and deletion workflow",
];

export default function CompanyPage() {
  return (
    <div className="page-section">
      <section className="legal-shell">
        <p className="section-eyebrow">Company and Compliance</p>
        <h1 className="legal-title">Register-ready company pages for Docent</h1>
        <p className="legal-note">
          This section centralizes legal and company information required for launch. Replace bracketed placeholders before production.
        </p>

        <div className="legal-grid">
          {registrationItems.map((item) => (
            <article key={item.label} className="legal-card">
              <h2>{item.label}</h2>
              <p>{item.value}</p>
            </article>
          ))}
        </div>

        <div className="legal-links">
          <Link href="/company/legal/terms" className="btn-secondary">Terms and Conditions</Link>
          <Link href="/company/legal/privacy" className="btn-secondary">Privacy Policy</Link>
          <Link href="/company/legal/cookies" className="btn-secondary">Cookie Policy</Link>
        </div>

        <div className="legal-panel">
          <h2>Launch checklist</h2>
          <ul>
            {complianceChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
