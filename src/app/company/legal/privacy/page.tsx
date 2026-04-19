import { companyProfile } from "@/lib/company";

export default function PrivacyPolicyPage() {
  return (
    <div className="page-section">
      <article className="legal-shell legal-prose">
        <p className="section-eyebrow">Legal</p>
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-note">Last updated: {companyProfile.lastUpdated}</p>

        <h2>1. Who we are</h2>
        <p>
          {companyProfile.legalName} (&quot;Docent&quot;, &quot;we&quot;, &quot;our&quot;) provides a platform for families and tutors to discover and connect.
        </p>

        <h2>2. Data we collect</h2>
        <p>
          We may collect account details (name, email, phone), profile content, tutor listing information, review content, and usage metadata.
        </p>

        <h2>3. How we use data</h2>
        <p>
          We use personal data to operate accounts, match parents with tutors, communicate service updates, improve platform quality, and protect the platform from abuse.
        </p>

        <h2>4. Cookies</h2>
        <p>
          We use essential cookies for authentication and optional cookies for analytics and marketing, based on your consent preferences.
        </p>

        <h2>5. Sharing and disclosures</h2>
        <p>
          We do not sell personal data. Data may be shared with service providers who support hosting, analytics, communication, or security operations.
        </p>

        <h2>6. Retention</h2>
        <p>
          We retain data for as long as needed for platform operations, legal compliance, and dispute handling, unless a longer period is required by law.
        </p>

        <h2>7. Your rights</h2>
        <p>
          Depending on local law, you may request access, correction, deletion, or export of your personal data. Contact us at {companyProfile.email}.
        </p>

        <h2>8. Contact</h2>
        <p>
          Privacy and data queries can be sent to {companyProfile.dpoEmail} or {companyProfile.email}. Registered office: {companyProfile.registeredAddress}.
        </p>

        <p className="legal-disclaimer">
          This template should be reviewed by a qualified legal professional before production use.
        </p>
      </article>
    </div>
  );
}
