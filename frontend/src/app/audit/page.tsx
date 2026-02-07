import AuditForm from "@/components/audit/audit-form";
import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <section className="bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Get Your AI Employment Visibility Audit
            </h1>
            <p className="text-lg text-gray-600">
              Discover how AI search engines describe your employer brand and get a
              prioritized action plan.
            </p>
          </div>
        </section>
        <AuditForm showResults />
      </main>
      <Footer />
    </div>
  );
}
