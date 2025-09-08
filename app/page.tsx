import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FileText, Gavel, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Smart Legal Documents & Lawyer Access
          </h1>
          <p className="mt-6 text-lg md:text-xl text-blue-100">
            Generate contracts in minutes, consult verified lawyers, and manage your legal needs — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-700 cursor-pointer hover:bg-blue-100">
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-white cursor-pointer border-white bg-transparent hover:bg-blue-700">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose MobiDocs?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-lg border border-gray-100">
            <CardHeader>
              <FileText className="w-10 h-10 text-blue-600" />
              <CardTitle>Document Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Create tenancy, freelance, and loan agreements in minutes with editable templates.</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border border-gray-100">
            <CardHeader>
              <Gavel className="w-10 h-10 text-blue-600" />
              <CardTitle>Lawyer on Demand</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Hire verified lawyers instantly for consultations and contract reviews.</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border border-gray-100">
            <CardHeader>
              <Users className="w-10 h-10 text-blue-600" />
              <CardTitle>Dual Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Separate dashboards for Clients & Lawyers, tailored to their needs.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Flexible Plans for Everyone</h2>
          <p className="mt-4 text-gray-600">
            Start free and upgrade anytime. Choose a plan that fits your legal needs.
          </p>
          <div className="mt-8 grid md:grid-cols-2 gap-8">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Clients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><CheckCircle2 className="inline w-4 h-4 text-green-500 mr-2"/> 3 Free Templates</p>
                <p><CheckCircle2 className="inline w-4 h-4 text-green-500 mr-2"/> Lawyer Directory</p>
                <p><CheckCircle2 className="inline w-4 h-4 text-green-500 mr-2"/> Consultations</p>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Lawyers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><CheckCircle2 className="inline w-4 h-4 text-green-500 mr-2"/> Profile Boost</p>
                <p><CheckCircle2 className="inline w-4 h-4 text-green-500 mr-2"/> Accept Bookings</p>
                <p><CheckCircle2 className="inline w-4 h-4 text-green-500 mr-2"/> Paid Consultations</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 shadow-md">
            <p className="text-gray-700 italic">
              "Lawbridge helped me draft my tenancy agreement in minutes. Saved me time and money!"
            </p>
            <p className="mt-4 font-semibold">– Adebayo, Tenant</p>
          </Card>
          <Card className="p-6 shadow-md">
            <p className="text-gray-700 italic">
              "As a lawyer, I love how easy it is to get clients through MobiDocs."
            </p>
            <p className="mt-4 font-semibold">– Chidinma, Corporate Lawyer</p>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-700 text-white py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Ready to simplify your legal journey?</h2>
        <p className="mt-4 text-blue-100">Join thousands of users and lawyers already using MobiDocs.</p>
        <div className="mt-6">
          <Link href="/signup">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-100">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
