"use client"

import { Github, Mail, ExternalLink, Clock } from "lucide-react"
import { motion } from "framer-motion"

export function Contact() {
  return (
    <>
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-12 text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 font-mono">
              Let's build something{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                legendary
              </span>{" "}
              together
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Ready to turn your ideas into reality? Let's collaborate on your next project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.upwork.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-lg transition-all duration-300"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Hire Me on Upwork
              </a>
              <a
                href="mailto:opeyemi@example.com"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-cyan-400 border-2 border-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-all duration-300"
              >
                <Mail className="w-5 h-5 mr-2" />
                Email Me
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-gray-800 py-12 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <p className="font-mono text-gray-400 italic">"Crafted with code, curiosity, and chaos."</p>
              <p className="text-sm text-gray-500 mt-2">© 2024 Opeyemi. All rights reserved.</p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <motion.div
                className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full text-sm text-green-400 font-mono"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Clock className="w-4 h-4 mr-2" />
                Built in &lt;24hrs
              </motion.div>
              <div className="flex space-x-6">
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  <Github className="w-6 h-6" />
                </a>
                <a href="mailto:opeyemi@example.com" className="text-gray-400 hover:text-cyan-400 transition-colors">
                  <Mail className="w-6 h-6" />
                </a>
                <a
                  href="https://www.upwork.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  <ExternalLink className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
