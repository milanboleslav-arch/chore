"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Gamepad2,
  QrCode,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Clock,
  Camera
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full max-w-7xl px-6 py-8 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Gamepad2 className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight font-outfit uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Chore
          </span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">Přihlásit se</Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">Vytvořit dům</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full max-w-5xl px-6 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>Vaše domácnost jako RPG hra</span>
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-black font-outfit leading-tight mb-8 tracking-tighter">
          Proměňte úkoly <br />
          <span className="text-gradient">v epické questy</span>
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Motivujte děti k plnění domácích prací pomocí herních prvků, odměn a jasných pravidel.
          Jednoduché, zábavné a efektivní pro celou rodinu.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="h-16 px-10 text-xl">
            Začít zdarma
          </Button>
          <Button variant="outline" size="lg" className="h-16 px-10 text-xl">
            Jak to funguje?
          </Button>
        </div>
      </section>

      {/* Demo Quest Card */}
      <section className="w-full max-w-7xl px-6 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold font-outfit leading-tight">
              Úkoly, které děti <br /> budou bavit plnit
            </h2>
            <p className="text-lg text-slate-400">
              Nastavte termín, určete odměnu a přidejte fotodůkaz.
              Děti vidí svůj progres a bojují o každičký bod.
            </p>

            <div className="space-y-4">
              {[
                { icon: ShieldCheck, text: "Vlastní rodinný prostor (House)" },
                { icon: QrCode, text: "Pozvání členů pomocí QR kódu" },
                { icon: Trophy, text: "Systém odměn a postihů" }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success">
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-slate-200">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 bg-violet-600/20 blur-[100px] rounded-full pointer-events-none" />
            <Card glow className="relative border-violet-500/50 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white text-xl font-bold">
                    T
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Uklidit pokojíček</h3>
                    <p className="text-sm text-slate-400">Přiřazeno: Tomáš</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Quest
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-slate-300">
                  <Clock className="w-5 h-5 text-violet-400" />
                  <span>Do dneška 18:00</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Camera className="w-5 h-5 text-violet-400" />
                  <span>Vyžadována fotografie</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Odměna</span>
                  <span className="text-success font-bold">+50 Bodů</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Postih</span>
                  <span className="text-accent font-bold">Zákaz PC na 24h</span>
                </div>
              </div>

              <Button variant="secondary" className="w-full">
                Odevzdat úkol
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Multi-tenant Features */}
      <section className="w-full bg-white/[0.02] border-y border-white/5 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold font-outfit mb-6">Proč používat Chore?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Vše co potřebujete pro šťastnou a organizovanou domácnost v jedné aplikaci.</p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <Card variants={item} className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center text-violet-400 mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Přehlednost</h3>
              <p className="text-slate-400 leading-relaxed">
                Už žádné dohadování o tom, kdo měl co udělat. Vše je zapsáno a doloženo.
              </p>
            </Card>
            <Card variants={item} className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 flex items-center justify-center text-cyan-400 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Celá rodina</h3>
              <p className="text-slate-400 leading-relaxed">
                Pozvěte manželku jako admina a děti jako uživatele. Každý má své rozhraní.
              </p>
            </Card>
            <Card variants={item} className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-success/20 flex items-center justify-center text-success mb-6">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Motivace</h3>
              <p className="text-slate-400 leading-relaxed">
                Děti nebaví poslouchat zákazy, ale baví je sbírat body a odměny.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-7xl px-6 py-20 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
            <Gamepad2 className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight font-outfit uppercase">
            Chore
          </span>
        </div>
        <p className="text-slate-500 text-sm">
          Navrženo pro moderní rodiny. Open source s láskou k pořádku. <br />
          © 2026 Chore Project.
        </p>
      </footer>
    </div>
  );
}
