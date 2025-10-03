import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Users,
  BarChart3,
  Zap,
  ArrowRight,
  Star,
  Target,
  Clock,
  Shield,
} from "lucide-react";

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  if (user) {
    // Redirect authenticated users to dashboard
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center fixed inset-0">
        <div className="text-center px-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome back, {user.name}!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Ready to manage your tasks efficiently?
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="text-lg px-8 py-4">
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-y-auto fixed inset-0">
      {/* Header */}
      <header className="w-full px-6 py-6 flex-shrink-0 relative z-10">
        <div className="container mx-auto">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 rounded-lg p-2">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                Taskly
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center relative">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <motion.div
          className="max-w-5xl mx-auto relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}>
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              ✨ Your productivity, simplified
            </span>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white mb-8 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-300 animate-gradient">
              Taskly
            </span>
            <br />
            <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-700 dark:text-gray-300">
              Task Management
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}>
            Experience the future of task management with our intuitive,
            powerful platform.
            <br className="hidden md:block" />
            Stay organized, boost productivity, and achieve your goals with
            elegant simplicity.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}>
            <Link to="/signup">
              <Button
                size="lg"
                className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 rounded-xl font-semibold">
                Get Started Free
                <motion.div
                  className="ml-3"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}>
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-10 py-6 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400 rounded-xl font-semibold backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300">
              Watch Demo
              <motion.div
                className="ml-3"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}>
                📹
              </motion.div>
            </Button>
          </motion.div>

          <motion.div
            className="mt-16 text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}>
            <p>Trusted by 10,000+ teams worldwide</p>
            <div className="flex justify-center items-center mt-4 space-x-8 opacity-60">
              <div className="text-2xl font-bold">🚀</div>
              <div className="text-2xl font-bold">⭐</div>
              <div className="text-2xl font-bold">💎</div>
              <div className="text-2xl font-bold">🎯</div>
              <div className="text-2xl font-bold">✨</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need to stay organized
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Powerful features designed to help you manage tasks efficiently and
            collaborate seamlessly with your team.
          </p>
        </div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}>
          {[
            {
              icon: Target,
              color: "blue",
              title: "Smart Priority Boards",
              description:
                "Organize tasks with intelligent priority levels and visual boards that adapt to your workflow.",
              gradient: "from-blue-500 to-cyan-500",
            },
            {
              icon: Users,
              color: "green",
              title: "Seamless Collaboration",
              description:
                "Work together with your team in real-time with advanced assignment and tracking features.",
              gradient: "from-green-500 to-emerald-500",
            },
            {
              icon: BarChart3,
              color: "purple",
              title: "Advanced Analytics",
              description:
                "Get insights into productivity patterns with beautiful charts and progress tracking.",
              gradient: "from-purple-500 to-violet-500",
            },
            {
              icon: Clock,
              color: "orange",
              title: "Smart Scheduling",
              description:
                "AI-powered deadline management with intelligent reminders and time optimization.",
              gradient: "from-orange-500 to-red-500",
            },
            {
              icon: Zap,
              color: "yellow",
              title: "Lightning Performance",
              description:
                "Experience blazing fast task management with optimized performance and instant updates.",
              gradient: "from-yellow-500 to-orange-500",
            },
            {
              icon: Shield,
              color: "indigo",
              title: "Enterprise Security",
              description:
                "Bank-level security with end-to-end encryption and comprehensive data protection.",
              gradient: "from-indigo-500 to-purple-500",
            },
          ].map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="card-hover">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl h-full relative overflow-hidden group">
                  {/* Gradient overlay on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  <CardHeader className="relative z-10">
                    <motion.div
                      className={`bg-gradient-to-br ${feature.gradient} rounded-2xl p-4 w-fit shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 200 }}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mt-4">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>

                  {/* Decorative corner element */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-full" />
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-6 py-24 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-3xl" />

        <div className="text-center mb-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800 mb-6">
              💬 Customer Love
            </span>
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-6">
              Loved by
              <span> </span>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-extrabold">
                thousands
              </span>
              <br /> of teams worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Don't just take our word for it. See what industry leaders have to
              say about Taskly.
            </p>
          </motion.div>
        </div>

        <motion.div
          className="grid md:grid-cols-3 gap-8 relative z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}>
          {[
            {
              name: "Sarah Chen",
              role: "Product Manager at TechCorp",
              avatar: "S",
              gradient: "from-blue-500 to-cyan-500",
              quote:
                "Taskly has revolutionized our project management. The intuitive priority boards and seamless collaboration features have increased our team's productivity by 40%!",
              company: "🚀 TechCorp",
            },
            {
              name: "Mike Rodriguez",
              role: "Lead Software Engineer",
              avatar: "M",
              gradient: "from-green-500 to-emerald-500",
              quote:
                "Finally, a task manager that doesn't overcomplicate things! Clean design, powerful features, and lightning-fast performance. It's everything our dev team needed.",
              company: "✨ StartupX",
            },
            {
              name: "Alex Thompson",
              role: "Design Director",
              avatar: "A",
              gradient: "from-purple-500 to-pink-500",
              quote:
                "The attention to detail in Taskly's UI/UX is exceptional. It's not just functional—it's genuinely enjoyable to use. Our design team is obsessed!",
              company: "🎨 CreativeHub",
            },
          ].map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="card-hover">
              <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl h-full relative overflow-hidden group">
                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                {/* Quote decoration */}
                <div className="absolute top-6 right-6 text-6xl text-gray-200 dark:text-gray-700 opacity-50 font-serif">
                  “
                </div>

                <CardContent className="pt-8 pb-6 relative z-10">
                  <div className="flex items-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * i, type: "spring" }}>
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      </motion.div>
                    ))}
                  </div>

                  <blockquote className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-8 italic">
                    “{testimonial.quote}”
                  </blockquote>

                  <div className="flex items-center">
                    <motion.div
                      className={`bg-gradient-to-br ${testimonial.gradient} rounded-full h-14 w-14 flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}>
                      {testimonial.avatar}
                    </motion.div>
                    <div className="ml-4">
                      <p className="font-bold text-gray-900 dark:text-white text-lg">
                        {testimonial.name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {testimonial.role}
                      </p>
                      <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                        {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>

                {/* Decorative element */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="py-16 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to get organized?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of teams already using Taskly to boost their
              productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-4">
                  Start Free Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-blue-600 rounded-lg p-2">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Taskly
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Built by Siddhartha with ❤️ • © 2024 Cleaner Task Management
          </p>
        </div>
      </footer>
    </div>
  );
};
