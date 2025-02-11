import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { Sparkles, ArrowLeft, Download, Lightbulb, Key } from 'lucide-react';

const App = () => {
  const [apiKey, setApiKey] = useState('');
  const [step, setStep] = useState('api');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [idea, setIdea] = useState(null);

  const handleApiSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!apiKey.trim()) {
      setError('Please enter your OpenAI API key');
      return;
    }
    if (!apiKey.startsWith('sk-')) {
      setError('Please enter a valid OpenAI API key (starts with sk-)');
      return;
    }
    setStep('ideaGen');
  };

  const generateIdea = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a startup idea generator and project planner. Generate innovative project ideas for solopreneurs.'
            },
            {
              role: 'user',
              content: 'Generate a detailed project idea for a solopreneur, including a title, description, and step-by-step implementation plan.'
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate idea. Please check your API key.');
      }

      const data = await response.json();
      const generatedIdea = parseAIResponse(data.choices[0].message.content);
      setIdea(generatedIdea);
      setStep('idea');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const parseAIResponse = (content) => {
    // Simple parsing logic - in real app would be more robust
    return {
      title: "AI-Generated Project Idea",
      description: content.split('\n')[0],
      plan: content.split('\n').slice(1)
    };
  };

  const exportToPDF = () => {
    try {
      setLoading(true);
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text(idea.title, 20, 20);
      
      // Add description
      doc.setFontSize(12);
      doc.text(idea.description, 20, 40, { maxWidth: 170 });
      
      // Add implementation plan
      doc.setFontSize(16);
      doc.text('Implementation Plan:', 20, 70);
      
      doc.setFontSize(12);
      idea.plan.forEach((step, index) => {
        doc.text(`${index + 1}. ${step}`, 20, 90 + (index * 10), { maxWidth: 170 });
      });
      
      doc.save('project-idea.pdf');
      setError('');
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep(step === 'idea' ? 'ideaGen' : 'api');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 sm:p-6 md:p-8 animate-gradient">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center space-x-2 bg-white/50 px-4 py-1 rounded-full shadow-soft">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <span className="text-primary-700 font-medium">AI-Powered Innovation</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 font-display tracking-tight">
            SoloPro
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your entrepreneurial ideas into actionable plans with AI-powered insights
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-soft flex items-center space-x-3 max-w-lg mx-auto"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {step === 'api' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-soft p-8 max-w-lg mx-auto border border-gray-100"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <Key className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 font-display">Welcome to SoloPro!</h2>
                <p className="text-gray-600 mt-2 max-w-sm">
                  Enter your OpenAI API key to unlock AI-powered project planning and idea generation.
                </p>
              </div>
              
              <form onSubmit={handleApiSubmit} className="space-y-6">
                <div className="relative">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your OpenAI API key"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm placeholder-gray-400 text-gray-900"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-xl hover:bg-primary-700 transition-colors duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2 font-medium"
                >
                  <span>Get Started</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </form>
              
              <p className="mt-6 text-sm text-gray-500 text-center">
                Need an API key? Get one from{' '}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 font-medium">
                  OpenAI Platform
                </a>
              </p>
            </motion.div>
          )}

          {step === 'ideaGen' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-soft p-8 max-w-lg mx-auto border border-gray-100"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-secondary-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 font-display">Generate Your Project Idea</h2>
                <p className="text-gray-600 mt-2 max-w-sm">
                  Our AI will help you generate innovative project ideas tailored to your entrepreneurial journey.
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={generateIdea}
                  disabled={loading}
                  className="w-full bg-secondary-600 text-white py-3 px-6 rounded-xl hover:bg-secondary-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2 font-medium disabled:bg-secondary-300 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating Ideas...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Idea</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={goBack}
                  className="w-full bg-white text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 flex items-center justify-center space-x-2 font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
              </div>
              
              {loading && (
                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-3 h-3 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-3 h-3 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <p className="text-sm text-gray-600">AI is crafting your perfect project idea...</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 'idea' && idea && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-soft p-8 max-w-3xl mx-auto border border-gray-100"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 font-display">{idea.title}</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={exportToPDF}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </button>
                  <button
                    onClick={goBack}
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </button>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Project Overview
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{idea.description}</p>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-secondary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Implementation Plan
                  </h3>
                  <ol className="space-y-4">
                    {idea.plan.map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-600 font-semibold mr-3">
                          {index + 1}
                        </span>
                        <p className="text-gray-700 mt-1">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-primary-500" />
                      <span className="text-sm font-medium text-gray-700">Generated by AI</span>
                    </div>
                    <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;