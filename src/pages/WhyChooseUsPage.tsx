import { DynamicMainHeader } from '@/components/layout/DynamicMainHeader';
import { DynamicFooter } from '@/components/layout/DynamicFooter';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { TrustBar } from '@/components/conversion/TrustBar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { defaultWhyChooseUsConfig, type WhyChooseUsConfig } from '@/lib/whyChooseUsConfig';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Zap, Shield, Award } from 'lucide-react';

const WhyChooseUsPage = () => {
  const { data: company } = useCompanyInfo();
  
  const config: WhyChooseUsConfig = {
    ...defaultWhyChooseUsConfig,
    ...(company?.why_choose_us_config as any || {}),
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TrustBar />
      <DynamicMainHeader />
      <NavigationBar />

      <main className="flex-1" style={{ fontFamily: config.font || 'inherit' }}>
        {/* Hero */}
        {config.hero.enabled && (
          <section className="relative py-20 lg:py-32 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
            {config.hero.backgroundImage && (
              <img src={config.hero.backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
            )}
            <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl font-bold tracking-tight mb-6"
              >
                {config.hero.headline}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-muted-foreground mb-8"
              >
                {config.hero.subtitle}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Link to={config.hero.ctaLink}>
                  <Button size="lg" className="text-lg px-8">
                    {config.hero.ctaText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* Technologies */}
        {config.technologies.enabled && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Nossas Tecnologias</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {config.technologies.items.map((tech, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-2xl p-6 bg-background border shadow-sm hover:shadow-md transition-shadow"
                  >
                    {tech.image && (
                      <img src={tech.image} alt={tech.title} className="w-full h-48 object-cover rounded-xl mb-4" />
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-bold">{tech.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{tech.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Metrics */}
        {config.metrics.enabled && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {config.metrics.items.map((metric, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <p className="text-3xl md:text-4xl font-bold text-primary mb-2">{metric.value}</p>
                    <p className="text-muted-foreground font-medium">{metric.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Process */}
        {config.process.enabled && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">{config.process.title}</h2>
              <div className="grid md:grid-cols-4 gap-6">
                {config.process.steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center mx-auto mb-4">
                      {i + 1}
                    </div>
                    <h3 className="font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery */}
        {config.gallery.enabled && config.gallery.images.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">{config.gallery.title}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {config.gallery.images.map((img, i) => (
                  <img key={i} src={img} alt={`Projeto ${i + 1}`} className="rounded-xl w-full aspect-square object-cover" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Final */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Pronto para criar algo incrível?</h2>
            <p className="text-muted-foreground mb-8">
              Entre em contato e transforme sua ideia em realidade com a qualidade Pincel de Luz.
            </p>
            <Link to="/checkout">
              <Button size="lg" className="text-lg px-8">
                Fazer Pedido
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <DynamicFooter />
    </div>
  );
};

export default WhyChooseUsPage;
