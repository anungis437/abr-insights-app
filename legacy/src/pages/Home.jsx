import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Scale, 
  BarChart3, 
  GraduationCap, 
  BookOpen, 
  Shield,
  Users,
  TrendingUp,
  Award,
  ArrowRight,
  Check
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [language, setLanguage] = React.useState("en");

  const content = {
    en: {
      hero: {
        title: "Transform Evidence Into",
        titleHighlight: "Equity Action",
        subtitle: "Canada's First AI-Powered Platform Analyzing 20+ Years of Tribunal Data on Anti-Black Racism",
        cta: "Explore Data Insights",
        ctaSecondary: "Start Learning",
      },
      stats: [
        { value: "20+", label: "Years of Data" },
        { value: "5,000+", label: "Cases Analyzed" },
        { value: "12", label: "Training Modules" },
        { value: "98%", label: "Satisfaction Rate" },
      ],
      features: [
        {
          icon: BarChart3,
          title: "Data-Driven Insights",
          description: "Interactive visualization of tribunal decisions revealing systemic patterns in anti-Black discrimination cases across Canada.",
        },
        {
          icon: GraduationCap,
          title: "Evidence-Based Training",
          description: "Structured micro-courses built on real case law, designed for HR professionals, investigators, and workplace leaders.",
        },
        {
          icon: BookOpen,
          title: "Comprehensive Library",
          description: "Searchable database of tribunal rulings, legal precedents, and expert analysis—all in one place.",
        },
        {
          icon: Shield,
          title: "Compliance & Certification",
          description: "Issue verified certificates and generate compliance reports that meet organizational and regulatory standards.",
        },
      ],
      howItWorks: {
        title: "How It Works",
        steps: [
          {
            number: "01",
            title: "Explore the Data",
            description: "Filter and analyze decades of tribunal decisions with AI-powered insights revealing discrimination patterns.",
          },
          {
            number: "02",
            title: "Take Courses",
            description: "Engage with interactive training modules featuring real case studies, video lessons, and assessments.",
          },
          {
            number: "03",
            title: "Earn Certification",
            description: "Receive industry-recognized certificates and demonstrate your commitment to equity and justice.",
          },
        ],
      },
      pricing: {
        title: "Choose Your Plan",
        subtitle: "Flexible pricing for individuals and organizations",
        plans: [
          {
            name: "Free",
            price: "$0",
            description: "Explore sample content",
            features: [
              "Limited data access",
              "1 sample course",
              "Community support",
            ],
          },
          {
            name: "Standard",
            price: "$5.99",
            period: "/user/month",
            description: "Full platform access",
            features: [
              "Complete data explorer",
              "All training courses",
              "Certificates of completion",
              "Email support",
            ],
            highlighted: true,
          },
          {
            name: "Enterprise",
            price: "Custom",
            description: "For organizations",
            features: [
              "Multi-seat licensing",
              "Admin analytics dashboard",
              "Custom content",
              "Priority support",
              "Live webinars",
            ],
          },
        ],
      },
      cta: {
        title: "Ready to Drive Systemic Change?",
        subtitle: "Join HR professionals, investigators, and leaders committed to evidence-based equity.",
        button: "Get Started Today",
      },
    },
    fr: {
      hero: {
        title: "Transformer les Preuves en",
        titleHighlight: "Actions Équitables",
        subtitle: "La Première Plateforme Canadienne Alimentée par l'IA Analysant Plus de 20 Ans de Données Tribunales sur le Racisme Anti-Noir",
        cta: "Explorer les Données",
        ctaSecondary: "Commencer la Formation",
      },
      stats: [
        { value: "20+", label: "Années de Données" },
        { value: "5 000+", label: "Cas Analysés" },
        { value: "12", label: "Modules de Formation" },
        { value: "98%", label: "Taux de Satisfaction" },
      ],
      features: [
        {
          icon: BarChart3,
          title: "Informations Basées sur les Données",
          description: "Visualisation interactive des décisions tribunales révélant des schémas systémiques dans les cas de discrimination anti-Noirs au Canada.",
        },
        {
          icon: GraduationCap,
          title: "Formation Fondée sur des Preuves",
          description: "Micro-cours structurés basés sur la jurisprudence réelle, conçus pour les professionnels des RH, les enquêteurs et les dirigeants.",
        },
        {
          icon: BookOpen,
          title: "Bibliothèque Complète",
          description: "Base de données consultable de décisions tribunales, de précédents juridiques et d'analyses d'experts—tout en un seul endroit.",
        },
        {
          icon: Shield,
          title: "Conformité et Certification",
          description: "Émission de certificats vérifiés et génération de rapports de conformité répondant aux normes organisationnelles et réglementaires.",
        },
      ],
      howItWorks: {
        title: "Comment Ça Marche",
        steps: [
          {
            number: "01",
            title: "Explorer les Données",
            description: "Filtrez et analysez des décennies de décisions tribunales avec des informations alimentées par l'IA révélant les schémas de discrimination.",
          },
          {
            number: "02",
            title: "Suivre des Cours",
            description: "Engagez-vous avec des modules de formation interactifs comprenant des études de cas réels, des leçons vidéo et des évaluations.",
          },
          {
            number: "03",
            title: "Obtenir une Certification",
            description: "Recevez des certificats reconnus par l'industrie et démontrez votre engagement envers l'équité et la justice.",
          },
        ],
      },
      pricing: {
        title: "Choisissez Votre Plan",
        subtitle: "Tarification flexible pour les particuliers et les organisations",
        plans: [
          {
            name: "Gratuit",
            price: "$0",
            description: "Explorer le contenu d'exemple",
            features: [
              "Accès limité aux données",
              "1 cours d'exemple",
              "Support communautaire",
            ],
          },
          {
            name: "Standard",
            price: "$5.99",
            period: "/utilisateur/mois",
            description: "Accès complet à la plateforme",
            features: [
              "Explorateur de données complet",
              "Tous les cours de formation",
              "Certificats de complétion",
              "Support par email",
            ],
            highlighted: true,
          },
          {
            name: "Entreprise",
            price: "Personnalisé",
            description: "Pour les organisations",
            features: [
              "Licence multi-places",
              "Tableau de bord analytique admin",
              "Contenu personnalisé",
              "Support prioritaire",
              "Webinaires en direct",
            ],
          },
        ],
      },
      cta: {
        title: "Prêt à Conduire le Changement Systémique?",
        subtitle: "Rejoignez les professionnels des RH, les enquêteurs et les dirigeants engagés dans l'équité fondée sur des preuves.",
        button: "Commencer Aujourd'hui",
      },
    },
  };

  const t = content[language];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Scale className="w-4 h-4 text-yellow-400" />
              {language === "en" ? "Evidence-Based Justice Training" : "Formation Fondée sur des Preuves"}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {t.hero.title}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                {t.hero.titleHighlight}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
              {t.hero.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("DataExplorer")}>
                <Button size="lg" className="gold-gradient text-gray-900 font-semibold hover:shadow-xl transition-all text-lg px-8 py-6">
                  {t.hero.cta}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl("TrainingHub")}>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all text-lg px-8 py-6">
                  {t.hero.ctaSecondary}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {t.stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {language === "en" ? "Platform Features" : "Fonctionnalités de la Plateforme"}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {language === "en"
                ? "Everything you need to understand, learn, and act on anti-Black racism in Canadian workplaces."
                : "Tout ce dont vous avez besoin pour comprendre, apprendre et agir contre le racisme anti-Noir dans les milieux de travail canadiens."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {t.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 h-full hover:shadow-xl transition-all border-2 border-transparent hover:border-teal-500">
                  <div className="w-14 h-14 teal-gradient rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t.howItWorks.title}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {t.howItWorks.steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-center">
                  <div className="inline-block relative">
                    <div className="text-8xl font-bold text-gray-100 absolute -top-8 -left-4">
                      {step.number}
                    </div>
                    <div className="relative w-20 h-20 gold-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <span className="text-2xl font-bold text-white">{step.number}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-yellow-400 to-transparent -ml-4"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t.pricing.title}
            </h2>
            <p className="text-xl text-gray-600">{t.pricing.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {t.pricing.plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-8 h-full ${
                  plan.highlighted 
                    ? "border-2 border-teal-500 shadow-xl relative" 
                    : "border border-gray-200"
                }`}>
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="gold-gradient text-white px-4 py-1 rounded-full text-sm font-semibold">
                        {language === "en" ? "Most Popular" : "Plus Populaire"}
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    <div className="mb-2">
                      <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                      {plan.period && (
                        <span className="text-gray-600 ml-1">{plan.period}</span>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "teal-gradient text-white"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                    size="lg"
                  >
                    {language === "en" ? "Get Started" : "Commencer"}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Award className="w-20 h-20 text-yellow-400 mx-auto mb-8" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t.cta.title}
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              {t.cta.subtitle}
            </p>
            <Link to={createPageUrl("TrainingHub")}>
              <Button size="lg" className="gold-gradient text-gray-900 font-semibold hover:shadow-xl transition-all text-lg px-10 py-6">
                {t.cta.button}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}