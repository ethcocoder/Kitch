import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Zap, Shield, TrendingUp, Menu, X } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      type: "spring" as const,
    },
  },
};

const morphVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 1,
      type: "spring" as const,
    },
  },
};

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  const heroRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const howItWorksRef = useRef<HTMLDivElement | null>(null);
  const testimonialsRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>, section: string) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"
          >
            <ChefHat className="w-8 h-8 text-amber-400" />
            Kitch
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8">
            {[
              { label: "Features", ref: featuresRef, id: "features" },
              { label: "How It Works", ref: howItWorksRef, id: "how-it-works" },
              { label: "Testimonials", ref: testimonialsRef, id: "testimonials" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.ref, item.id)}
                className={`text-sm font-medium transition-colors ${
                  activeSection === item.id ? "text-amber-400" : "text-slate-300 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex gap-4">
            {isAuthenticated ? (
              <Button variant="default" className="bg-amber-500 hover:bg-amber-600">
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => (window.location.href = '/login')}>
                  Login
                </Button>
                <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => (window.location.href = '/signup')}>Get Started</Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-900 border-t border-slate-800"
            >
              <div className="px-4 py-4 space-y-4">
                {[
                  { label: "Features", ref: featuresRef, id: "features" },
                  { label: "How It Works", ref: howItWorksRef, id: "how-it-works" },
                  { label: "Testimonials", ref: testimonialsRef, id: "testimonials" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.ref, item.id)}
                    className="block w-full text-left text-sm font-medium text-slate-300 hover:text-white"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="min-h-screen flex items-center justify-center pt-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl font-bold leading-tight"
            >
              Premium Kitchen
              <span className="block bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Equipment & Solutions
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl text-slate-300 leading-relaxed">
              Discover the finest culinary equipment and materials for your kitchen. From professional-grade appliances to essential tools, we have everything you need.
            </motion.p>

            <motion.div variants={itemVariants} className="flex gap-4 pt-4">
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                onClick={() => scrollToSection(ctaRef, "cta")}
              >
                Explore Products
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-800"
                onClick={() => (window.location.href = '/login')}
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero Morph Animation */}
          <motion.div
            variants={morphVariants}
            initial="hidden"
            animate="visible"
            className="relative h-96 md:h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl blur-3xl" />
            <motion.div
              animate={{
                borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "70% 30% 30% 70% / 70% 70% 30% 30%", "30% 70% 70% 30% / 30% 30% 70% 70%"],
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 relative overflow-hidden"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <ChefHat className="w-32 h-32 text-white opacity-80" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Kitch?</h2>
            <p className="text-xl text-slate-400">Everything you need for a professional kitchen</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Zap,
                title: "Premium Quality",
                description: "Handpicked products from leading manufacturers worldwide",
              },
              {
                icon: Shield,
                title: "Guaranteed Authenticity",
                description: "100% authentic products with manufacturer warranties",
              },
              {
                icon: TrendingUp,
                title: "Best Prices",
                description: "Competitive pricing with regular discounts and promotions",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8 hover:border-amber-500/50 transition-colors"
              >
                <feature.icon className="w-12 h-12 text-amber-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section ref={howItWorksRef} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-slate-400">Simple steps to get your kitchen equipped</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-4 gap-6"
          >
            {["Browse", "Select", "Order", "Deliver"].map((step, idx) => (
              <motion.div key={idx} variants={itemVariants} className="text-center">
                <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-semibold">{step}</h3>
                <p className="text-slate-400 mt-2">
                  {idx === 0 && "Explore our vast collection of kitchen products"}
                  {idx === 1 && "Choose items that fit your needs"}
                  {idx === 2 && "Complete your order securely"}
                  {idx === 3 && "Fast delivery to your doorstep"}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Our Customers Say</h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                name: "Sarah Johnson",
                role: "Professional Chef",
                text: "Kitch has transformed how I source kitchen equipment. Quality is unmatched!",
              },
              {
                name: "Michael Chen",
                role: "Restaurant Owner",
                text: "Best prices and fastest delivery. Highly recommended for all kitchen needs.",
              },
              {
                name: "Emma Davis",
                role: "Culinary Instructor",
                text: "The variety and authenticity of products make Kitch my go-to supplier.",
              },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-slate-300 mb-4">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-12 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to Upgrade Your Kitchen?</h2>
          <p className="text-xl text-white/90 mb-8">Join thousands of satisfied customers today</p>
          <Button
            size="lg"
            className="bg-white text-amber-600 hover:bg-slate-100 font-semibold"
            onClick={() => (window.location.href = '/signup')}
          >
            Get Started Now
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4 sm:px-6 lg:px-8 bg-slate-950">
        <div className="max-w-6xl mx-auto text-center text-slate-400">
          <p>&copy; 2026 Kitch. All rights reserved. Premium Kitchen Solutions.</p>
        </div>
      </footer>
    </div>
  );
}
