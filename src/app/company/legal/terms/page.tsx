import { companyProfile } from "@/lib/company";

export default function TermsPage() {
  return (
    <div className="page-section">
      <article className="legal-shell legal-prose">
        <p className="section-eyebrow">Legal</p>
        <h1 className="legal-title">Terms and Conditions</h1>
        <p className="legal-note">Last updated: {companyProfile.lastUpdated}</p>

        <h2>1. Acceptance of terms</h2>
        <p>
          By accessing or using Docent, you agree to these Terms and all applicable laws and regulations.
        </p>

        <h2>2. Platform role</h2>
        <p>
          Docent is a discovery and connection platform. Final engagement terms between parent and tutor are agreed directly between those parties.
        </p>

        <h2>3. Account responsibilities</h2>
        <p>
          You are responsible for the accuracy of profile information, account credentials, and activity carried out under your account.
        </p>

        <h2>4. Prohibited conduct</h2>
        <p>
          Users must not publish misleading information, abuse the platform, violate third-party rights, or attempt unauthorized access to systems.
        </p>

        <h2>5. Reviews and content</h2>
        <p>
          You grant us a non-exclusive right to display submitted reviews and profile content for platform operations. We may moderate content for policy compliance.
        </p>

        <h2>6. Limitation of liability</h2>
        <p>
          To the extent permitted by law, Docent is not liable for indirect or consequential damages arising from tutor-parent arrangements.
        </p>

        <h2>7. Termination</h2>
        <p>
          We may suspend or terminate access if terms are violated or if required for security, legal, or operational reasons.
        </p>

        <h2>8. Governing law</h2>
        <p>
          These terms are governed by laws applicable in {companyProfile.state}, {companyProfile.country}, subject to competent courts in {companyProfile.city}.
        </p>

        <h2>9. Contact</h2>
        <p>
          For legal notices, contact {companyProfile.legalName} at {companyProfile.email}.
        </p>

        <p className="legal-disclaimer">
          This template should be reviewed by a qualified legal professional before production use.
        </p>
      </article>
    </div>
  );
}
