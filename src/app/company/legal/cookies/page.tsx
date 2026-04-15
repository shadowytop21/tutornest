import { cookieCategories, companyProfile } from "@/lib/company";

export default function CookiePolicyPage() {
  return (
    <div className="page-section">
      <article className="legal-shell legal-prose">
        <p className="section-eyebrow">Legal</p>
        <h1 className="legal-title">Cookie Policy</h1>
        <p className="legal-note">Last updated: {companyProfile.lastUpdated}</p>

        <h2>1. What are cookies</h2>
        <p>
          Cookies are small text files placed on your device to remember preferences, keep sessions active, and improve platform experience.
        </p>

        <h2>2. How Docent uses cookies</h2>
        <ul>
          {cookieCategories.map((item) => (
            <li key={item.key}>
              <strong>{item.label}:</strong> {item.description}
            </li>
          ))}
        </ul>

        <h2>3. Consent choices</h2>
        <p>
          On first visit, you can accept all cookies, reject optional cookies, or save custom preferences. You can update your preferences using the cookie settings button.
        </p>

        <h2>4. Managing cookies in browser</h2>
        <p>
          You can also clear or block cookies via browser settings. Some features may not work properly if essential cookies are disabled.
        </p>

        <h2>5. Contact</h2>
        <p>
          For questions about cookies or tracking technologies, contact {companyProfile.email}.
        </p>

        <p className="legal-disclaimer">
          This template should be reviewed by a qualified legal professional before production use.
        </p>
      </article>
    </div>
  );
}
