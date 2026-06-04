import { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Globe2,
  Languages,
  Mail,
  Menu,
  MessageSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';

type Language = 'en' | 'pt';
type Page = 'home' | 'services' | 'about' | 'contact';

const content = {
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      about: 'About',
      contact: 'Contact',
      cta: 'Book a strategy call',
      languageLabel: 'Português',
    },
    home: {
      eyebrow: 'AI consulting for modern teams',
      title: 'Practical AI strategy for ambitious businesses.',
      highlight: 'from Aurora',
      description:
        'Aurora helps leaders identify high-impact AI opportunities, design reliable workflows, and launch automation that improves how teams work every day.',
      primary: 'Explore services',
      secondary: 'Meet Aurora',
      metrics: [
        ['30%', 'average time saved in priority workflows'],
        ['12 weeks', 'from discovery to measurable deployment'],
        ['2 languages', 'English and Portuguese delivery'],
      ],
      trust: 'Trusted approach for operations, growth, and executive teams.',
    },
    services: {
      eyebrow: 'Services',
      title: 'Three focused ways to turn AI into business value.',
      description:
        'Each engagement is designed to move from clarity to implementation with responsible governance and measurable outcomes.',
      items: [
        {
          title: 'AI Opportunity Mapping',
          text: 'Audit workflows, data readiness, and team pain points to prioritize the highest-return AI use cases.',
          icon: 'chart',
        },
        {
          title: 'Automation & Agent Design',
          text: 'Design assistants, automations, and human-in-the-loop systems that reduce repetitive work without losing control.',
          icon: 'bot',
        },
        {
          title: 'Enablement & Governance',
          text: 'Train teams, create practical policies, and establish evaluation routines for safe, sustainable adoption.',
          icon: 'shield',
        },
      ],
    },
    about: {
      eyebrow: 'About Aurora',
      title: 'A strategic AI partner with a builder’s mindset.',
      paragraphs: [
        'Aurora works with founders, executives, and operations leaders who need AI initiatives that are useful, secure, and aligned with business priorities.',
        'Her consulting style blends technical fluency with clear communication: map the problem, prototype the workflow, measure impact, and teach the team how to own it.',
      ],
      values: ['Responsible adoption', 'Measurable ROI', 'Human-centered systems'],
      quote:
        'The goal is not to add AI everywhere. The goal is to make the right work faster, smarter, and more resilient.',
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Tell Aurora what you want AI to unlock.',
      description:
        'Use the form below to share your goals. Aurora will respond with next steps for a focused discovery call.',
      fields: {
        name: 'Name',
        email: 'Email',
        company: 'Company',
        message: 'What would you like to improve with AI?',
        submit: 'Send message',
      },
      note: 'Prefer email? hello@aurora-ai.consulting',
      remote: 'Discovery calls available remotely.',
      plans: 'Strategy, prototypes, and adoption plans.',
    },
  },
  pt: {
    nav: {
      home: 'Início',
      services: 'Serviços',
      about: 'Sobre',
      contact: 'Contato',
      cta: 'Agendar conversa',
      languageLabel: 'English',
    },
    home: {
      eyebrow: 'Consultoria em IA para equipes modernas',
      title: 'Estratégia de IA prática para empresas ambiciosas.',
      highlight: 'com Aurora',
      description:
        'Aurora ajuda líderes a identificar oportunidades de alto impacto, desenhar fluxos confiáveis e lançar automações que melhoram o trabalho diário das equipes.',
      primary: 'Ver serviços',
      secondary: 'Conheça Aurora',
      metrics: [
        ['30%', 'economia média de tempo em fluxos prioritários'],
        ['12 semanas', 'da descoberta à implantação mensurável'],
        ['2 idiomas', 'atendimento em inglês e português'],
      ],
      trust: 'Abordagem confiável para times de operações, crescimento e liderança.',
    },
    services: {
      eyebrow: 'Serviços',
      title: 'Três formas objetivas de transformar IA em valor.',
      description:
        'Cada projeto avança da clareza à implementação com governança responsável e resultados mensuráveis.',
      items: [
        {
          title: 'Mapeamento de Oportunidades em IA',
          text: 'Auditoria de fluxos, prontidão de dados e dores da equipe para priorizar casos de uso com maior retorno.',
          icon: 'chart',
        },
        {
          title: 'Design de Automações e Agentes',
          text: 'Criação de assistentes, automações e sistemas com supervisão humana para reduzir trabalho repetitivo com controle.',
          icon: 'bot',
        },
        {
          title: 'Capacitação e Governança',
          text: 'Treinamento de equipes, políticas práticas e rotinas de avaliação para adoção segura e sustentável.',
          icon: 'shield',
        },
      ],
    },
    about: {
      eyebrow: 'Sobre Aurora',
      title: 'Uma parceira estratégica de IA com mentalidade de construção.',
      paragraphs: [
        'Aurora trabalha com fundadores, executivos e líderes de operações que precisam de iniciativas de IA úteis, seguras e alinhadas às prioridades do negócio.',
        'Seu estilo de consultoria combina fluência técnica com comunicação clara: mapear o problema, prototipar o fluxo, medir impacto e ensinar a equipe a assumir a solução.',
      ],
      values: ['Adoção responsável', 'ROI mensurável', 'Sistemas centrados em pessoas'],
      quote:
        'O objetivo não é colocar IA em tudo. É tornar o trabalho certo mais rápido, inteligente e resiliente.',
    },
    contact: {
      eyebrow: 'Contato',
      title: 'Conte à Aurora o que você quer destravar com IA.',
      description:
        'Use o formulário abaixo para compartilhar seus objetivos. Aurora responderá com próximos passos para uma conversa de descoberta.',
      fields: {
        name: 'Nome',
        email: 'Email',
        company: 'Empresa',
        message: 'O que você quer melhorar com IA?',
        submit: 'Enviar mensagem',
      },
      note: 'Prefere email? hello@aurora-ai.consulting',
      remote: 'Conversas de descoberta disponíveis remotamente.',
      plans: 'Estratégia, protótipos e planos de adoção.',
    },
  },
};

const pageOrder: Page[] = ['home', 'services', 'about', 'contact'];

function ServiceIcon({ icon }: { icon: string }) {
  const className = 'h-7 w-7 text-cyan-300';
  if (icon === 'chart') return <BarChart3 className={className} />;
  if (icon === 'bot') return <Bot className={className} />;
  return <ShieldCheck className={className} />;
}

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [page, setPage] = useState<Page>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const t = content[language];

  const navigate = (target: Page) => {
    setPage(target);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#030712] text-slate-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-10rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-[-14rem] right-[-8rem] h-[34rem] w-[34rem] rounded-full bg-blue-700/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.06)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_top,black,transparent_70%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 md:px-8 lg:px-10">
        <header className="flex items-center justify-between rounded-3xl border border-cyan-400/10 bg-white/[0.03] px-4 py-3 shadow-2xl shadow-cyan-950/20 backdrop-blur md:px-5">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="flex items-center gap-3 text-left"
            aria-label="Aurora home"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/30">
              <Sparkles size={22} strokeWidth={2.5} />
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight">Aurora</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-300">
                AI Consultant
              </span>
            </span>
          </button>

          <nav className="hidden items-center gap-2 lg:flex">
            {pageOrder.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => navigate(item)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  page === item
                    ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {t.nav[item]}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/10"
            >
              <Languages size={16} />
              {t.nav.languageLabel}
            </button>
            <button
              type="button"
              onClick={() => navigate('contact')}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
            >
              {t.nav.cta}
              <ArrowRight size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 text-cyan-100 lg:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        {menuOpen && (
          <div className="mt-3 rounded-3xl border border-cyan-400/10 bg-slate-950/95 p-3 shadow-2xl shadow-cyan-950/20 backdrop-blur lg:hidden">
            {pageOrder.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => navigate(item)}
                className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-200 hover:bg-white/10"
              >
                {t.nav[item]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
              className="mt-2 flex w-full items-center gap-2 rounded-2xl border border-cyan-300/20 px-4 py-3 text-left text-sm font-semibold text-cyan-100"
            >
              <Languages size={16} />
              {t.nav.languageLabel}
            </button>
          </div>
        )}

        <main className="flex flex-1 items-center py-10 md:py-14">
          {page === 'home' && (
            <section className="grid w-full items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
              <div>
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-200">
                  <Zap size={15} />
                  {t.home.eyebrow}
                </p>
                <h1 className="max-w-4xl text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-7xl">
                  {t.home.title}{' '}
                  <span className="bg-gradient-to-r from-cyan-200 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                    {t.home.highlight}
                  </span>
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                  {t.home.description}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate('services')}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-7 py-4 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-400/25 transition hover:bg-cyan-300"
                  >
                    {t.home.primary}
                    <ArrowRight size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('about')}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-4 text-sm font-bold text-white transition hover:border-cyan-300/50 hover:bg-white/10"
                  >
                    {t.home.secondary}
                  </button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-cyan-300/15 bg-slate-950/70 p-5 shadow-2xl shadow-blue-950/30 backdrop-blur">
                <div className="rounded-[1.5rem] border border-cyan-300/15 bg-gradient-to-br from-cyan-400/10 via-blue-500/10 to-transparent p-6">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Aurora OS</p>
                      <p className="mt-2 text-sm text-slate-400">AI readiness dashboard</p>
                    </div>
                    <Globe2 className="text-cyan-300" />
                  </div>
                  <div className="space-y-4">
                    {t.home.metrics.map(([value, label]) => (
                      <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                        <p className="text-3xl font-bold text-white">{value}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 flex items-start gap-3 rounded-3xl bg-cyan-400/10 p-4 text-sm leading-6 text-cyan-100">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                    {t.home.trust}
                  </p>
                </div>
              </div>
            </section>
          )}

          {page === 'services' && (
            <section className="w-full">
              <PageIntro eyebrow={t.services.eyebrow} title={t.services.title} description={t.services.description} />
              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {t.services.items.map((service, index) => (
                  <article key={service.title} className="group rounded-[2rem] border border-cyan-300/15 bg-white/[0.04] p-6 shadow-2xl shadow-blue-950/20 transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-cyan-300/[0.06]">
                    <div className="mb-8 flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-300/20">
                        <ServiceIcon icon={service.icon} />
                      </div>
                      <span className="font-mono text-sm text-cyan-300/70">0{index + 1}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{service.title}</h2>
                    <p className="mt-4 leading-7 text-slate-400">{service.text}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {page === 'about' && (
            <section className="grid w-full gap-8 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-[2rem] border border-cyan-300/15 bg-cyan-400/10 p-7">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">{t.about.eyebrow}</p>
                <h1 className="mt-5 text-4xl font-bold leading-tight text-white md:text-5xl">{t.about.title}</h1>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 md:p-9">
                <div className="space-y-5 text-lg leading-8 text-slate-300">
                  {t.about.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {t.about.values.map((value) => (
                    <div key={value} className="rounded-2xl border border-cyan-300/15 bg-slate-950/60 p-4 text-sm font-bold text-cyan-100">
                      {value}
                    </div>
                  ))}
                </div>
                <blockquote className="mt-8 rounded-3xl border-l-4 border-cyan-300 bg-cyan-300/10 p-6 text-xl font-semibold leading-8 text-white">
                  “{t.about.quote}”
                </blockquote>
              </div>
            </section>
          )}

          {page === 'contact' && (
            <section className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <PageIntro eyebrow={t.contact.eyebrow} title={t.contact.title} description={t.contact.description} />
                <div className="mt-8 space-y-4 text-slate-300">
                  <p className="flex items-center gap-3"><Mail className="text-cyan-300" /> {t.contact.note}</p>
                  <p className="flex items-center gap-3"><MessageSquare className="text-cyan-300" /> {t.contact.remote}</p>
                  <p className="flex items-center gap-3"><Rocket className="text-cyan-300" /> {t.contact.plans}</p>
                </div>
              </div>
              <form className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.04] p-6 shadow-2xl shadow-blue-950/20 md:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField label={t.contact.fields.name} name="name" />
                  <TextField label={t.contact.fields.email} name="email" type="email" />
                </div>
                <div className="mt-5">
                  <TextField label={t.contact.fields.company} name="company" />
                </div>
                <label className="mt-5 block">
                  <span className="mb-2 block text-sm font-semibold text-slate-200">{t.contact.fields.message}</span>
                  <textarea
                    name="message"
                    rows={6}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10"
                    placeholder="AI roadmap, automation, team training..."
                  />
                </label>
                <button type="button" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-400 px-7 py-4 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-400/25 transition hover:bg-cyan-300">
                  {t.contact.fields.submit}
                  <ArrowRight size={18} />
                </button>
              </form>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-3xl">
      <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">{eyebrow}</p>
      <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">{title}</h1>
      <p className="mt-5 text-lg leading-8 text-slate-300">{description}</p>
    </div>
  );
}

function TextField({ label, name, type = 'text' }: { label: string; name: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-200">{label}</span>
      <input
        name={name}
        type={type}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10"
      />
    </label>
  );
}
