import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Heart, ShieldCheck, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-slate-950 text-white">
          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
              <Zap className="w-3 h-3" />
              <span>Redefining Human Connection</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto">
              Real intent. <br />
              <span className="text-primary">Zero shallow swiping.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Nomance is built for high-trust, high-intent dating. No infinite loops. No ghosting culture. Just meaningful matches designed for real-world outcomes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth">
                <Button size="lg" className="px-8 py-6 text-lg rounded-full">
                  Begin Your Journey
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-full border-slate-700 hover:bg-slate-800">
                Learn our Philosophy
              </Button>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        </section>

        {/* First Principles Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">First-Principles Dating</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We stripped away the addictive patterns of modern apps to focus on what actually leads to long-term trust.
              </p>
            </div>

            <div className="grid md:grid-grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl border bg-card hover:shadow-lg transition-all border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Intent Clarity</h3>
                <p className="text-muted-foreground">
                  No guessing games. Every user signals their intent upfront—whether it's life partnership or serious dating.
                </p>
              </div>

              <div className="p-8 rounded-2xl border bg-card hover:shadow-lg transition-all border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Limited Batches</h3>
                <p className="text-muted-foreground">
                  We give you 5 high-quality matches a day. Quality over quantity prevents burnout and decision fatigue.
                </p>
              </div>

              <div className="p-8 rounded-2xl border bg-card hover:shadow-lg transition-all border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-6">
                  <Heart className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Reputation Scoring</h3>
                <p className="text-muted-foreground">
                  Our system rewards respectful behavior and responsiveness. Bad actors are naturally phased out.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-12 border-t bg-slate-50">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Nomance Platform. Built for trust.</p>
        </div>
      </footer>
    </div>
  );
}
