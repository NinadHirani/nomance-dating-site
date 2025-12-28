import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Heart, ShieldCheck, Users, Zap, Sparkles, Calendar, MessageCircle, Coffee } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/30 text-secondary text-xs font-semibold mb-6">
              <Zap className="w-3 h-3" />
              <span>Redefining Human Connection</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto">
              Real intent. <br />
              <span className="text-secondary">Zero shallow swiping.</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
              Nomance is built for high-trust, high-intent dating. No infinite loops. No ghosting culture. Just meaningful matches designed for real-world outcomes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth">
                <Button size="lg" variant="secondary" className="px-8 py-6 text-lg rounded-full font-bold">
                  Begin Your Journey
                </Button>
              </Link>
              <Link href="/events">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-full border-primary-foreground/20 hover:bg-primary-foreground/10 text-primary-foreground">
                  Explore Events
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />
        </section>

        {/* First Principles Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">First-Principles Dating</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We stripped away the addictive patterns of modern apps to focus on what actually leads to long-term trust.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl border bg-card hover:shadow-lg transition-all border-border">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Intent Clarity</h3>
                <p className="text-muted-foreground">
                    No guessing games. Every user signals their intent upfront—whether it&apos;s life partnership or serious dating.
                  </p>
              </div>

              <div className="p-8 rounded-2xl border bg-card hover:shadow-lg transition-all border-border">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Limited Batches</h3>
                <p className="text-muted-foreground">
                  We give you 5 high-quality matches a day. Quality over quantity prevents burnout and decision fatigue.
                </p>
              </div>

              <div className="p-8 rounded-2xl border bg-card hover:shadow-lg transition-all border-border">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-6">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Reputation Scoring</h3>
                <p className="text-muted-foreground">
                  Our system rewards respectful behavior and responsiveness. Bad actors are naturally phased out.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* New Features Section */}
        <section className="py-24 bg-secondary/10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                <Sparkles className="w-3 h-3" />
                <span>New Features</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Beyond Swiping</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Tools designed to move you from profiles to real connection.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/coach" className="group">
                <div className="p-6 rounded-2xl border bg-card hover:shadow-xl transition-all border-border h-full">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">AI Profile Coach</h3>
                  <p className="text-sm text-muted-foreground">
                    Get personalized suggestions for photos, bio, and tone improvements.
                  </p>
                </div>
              </Link>

              <Link href="/discovery" className="group">
                <div className="p-6 rounded-2xl border bg-card hover:shadow-xl transition-all border-border h-full">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">Mood Matching</h3>
                  <p className="text-sm text-muted-foreground">
                    Match with people based on your energy—talking, meeting, or vibing.
                  </p>
                </div>
              </Link>

              <Link href="/matches" className="group">
                <div className="p-6 rounded-2xl border bg-card hover:shadow-xl transition-all border-border h-full">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Coffee className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">Date Planner</h3>
                  <p className="text-sm text-muted-foreground">
                    Get coffee spots and activity suggestions to move offline faster.
                  </p>
                </div>
              </Link>

              <Link href="/events" className="group">
                <div className="p-6 rounded-2xl border bg-card hover:shadow-xl transition-all border-border h-full">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">Events & Communities</h3>
                  <p className="text-sm text-muted-foreground">
                    Join meetups, speed dating, and interest-based rooms.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">Ready for intentional dating?</h2>
              <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
                Join thousands of singles who&apos;ve moved beyond shallow swiping to find meaningful connections.
              </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth">
                <Button size="lg" variant="secondary" className="px-8 py-6 text-lg rounded-full font-bold">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/events">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-full border-primary-foreground/20 hover:bg-primary-foreground/10 text-primary-foreground">
                  <Calendar className="w-5 h-5 mr-2" />
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-12 border-t bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-primary fill-primary" />
                <span className="font-bold text-foreground">NOMANCE</span>
              </div>
              <p className="text-sm text-muted-foreground">
                High-trust, high-intent dating for people ready for real connection.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/discovery" className="hover:text-primary transition-colors">Discovery</Link></li>
                <li><Link href="/coach" className="hover:text-primary transition-colors">AI Coach</Link></li>
                <li><Link href="/events" className="hover:text-primary transition-colors">Events</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Safety</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 Nomance Platform. Built for trust.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
