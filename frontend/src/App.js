import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { Sparkles, ArrowLeft, Download, Lightbulb, Key, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const App = () => {
  const [apiKey, setApiKey] = useState('');
  const [step, setStep] = useState('api');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [idea, setIdea] = useState(null);
  const [userPreferences, setUserPreferences] = useState({
    strengths: '',
    interests: ''
  });

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
    setStep('preferences');
  };

  const handlePreferencesSubmit = (e) => {
    e.preventDefault();
    if (!userPreferences.strengths.trim() || !userPreferences.interests.trim()) {
      setError('Please fill in both fields');
      return;
    }
    setStep('ideaGen');
  };

  const generateIdea = async () => {
    setLoading(true);
    setError('');
    
    try {
      const prompt = `As a startup idea generator, consider the following:
      Strengths: ${userPreferences.strengths}
      Areas of Interest: ${userPreferences.interests}
      
      Based on these preferences, generate a detailed project idea that leverages the user's strengths and aligns with their interests. Include:
      
      # Project Title
      
      ## Overview
      [Provide a compelling description of the project, its target audience, and its unique value proposition]
      
      ## Why This Fits You
      [Detailed explanation of how this project aligns with the user's strengths and interests]
      
      ## Market Analysis
      [Brief analysis of the market opportunity and potential competitors]
      
      ## Implementation Roadmap
      
      ### 2-Week Sprint Plan (Getting Started)
      1. [Week 1 goals and tasks]
      2. [Week 2 goals and tasks]
      
      **Key Milestones:**
      - [Milestone 1]
      - [Milestone 2]
      
      ### 2-Month Development Plan
      1. [Month 1 objectives]
      2. [Month 2 objectives]
      
      **Key Milestones:**
      - [Milestone 1]
      - [Milestone 2]
      
      ### 2-Year Growth Strategy
      1. [First 6 months]
      2. [6-12 months]
      3. [Year 2]
      
      **Key Milestones:**
      - [Milestone 1]
      - [Milestone 2]
      - [Milestone 3]
      
      ## Success Metrics
      - [Key Performance Indicator 1]
      - [Key Performance Indicator 2]
      - [Key Performance Indicator 3]
      
      ## Resource Requirements
      - [Technology/Tools needed]
      - [Skills required]
      - [Other resources]
      
      ## Potential Challenges & Solutions
      1. Challenge: [Description]
   Solution: [Proposed solution]
      
      2. Challenge: [Description]
   Solution: [Proposed solution]`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a startup idea generator and project planner. Generate innovative project ideas for solopreneurs.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate idea. Please check your API key.');
      }

      const data = await response.json();
      setIdea({
        content: data.choices[0].message.content,
      });
      setStep('idea');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    try {
      setLoading(true);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;
      
      // Helper function to add text with proper line breaks and spacing
      const addText = (text, fontSize, isBold = false, maxWidth = contentWidth) => {
        doc.setFontSize(fontSize);
        doc.setFont(undefined, isBold ? 'bold' : 'normal');
        
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, margin, yPos);
        yPos += (fontSize / 4) * lines.length + 5;
        
        // Add extra spacing after the text block
        yPos += 5;
        
        // Check if we need a new page
        if (yPos > doc.internal.pageSize.height - margin) {
          doc.addPage();
          yPos = margin;
        }
      };
      
      // Process sections directly without using addSection helper
      idea.content.split('\n\n').forEach(section => {
        if (section.startsWith('# ')) {
          // Main title
          addText(section.replace('# ', ''), 24, true);
        } else if (section.startsWith('## ')) {
          // Section title
          addText(section.replace('## ', ''), 18, true);
        } else if (section.startsWith('### ')) {
          // Subsection title
          addText(section.replace('### ', ''), 14, true);
        } else if (section.trim().startsWith('- ')) {
          // Bullet points
          section.split('\n').forEach(line => {
            addText(line.trim(), 11, false, contentWidth - 10);
          });
        } else if (section.trim().startsWith('**')) {
          // Bold text (like milestones)
          addText(section.replace(/\*\*/g, ''), 12, true);
        } else if (section.trim()) {
          // Regular paragraph
          addText(section.trim(), 11);
        }
      });

      // Add header and footer
      doc.setFillColor(247, 250, 252);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('SoloPro', margin, 25);
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth - margin - 40, 25);

      // Add page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      doc.save('project-idea.pdf');
      setError('');
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep(step === 'idea' ? 'ideaGen' : step === 'ideaGen' ? 'preferences' : 'api');
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
          <h1 className="text-5xl font-bold text-gray-900 font-display">
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
                  <span>Continue</span>
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

          {step === 'preferences' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-soft p-8 max-w-lg mx-auto border border-gray-100"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-secondary-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 font-display">Tell Us About Yourself</h2>
                <p className="text-gray-600 mt-2 max-w-sm">
                  Help us understand your strengths and interests to generate better-suited project ideas.
                </p>
              </div>
              
              <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="strengths" className="block text-sm font-medium text-gray-700 mb-1">
                      What are your key strengths and skills?
                    </label>
                    <textarea
                      id="strengths"
                      value={userPreferences.strengths}
                      onChange={(e) => setUserPreferences(prev => ({ ...prev, strengths: e.target.value }))}
                      placeholder="E.g., programming, design, marketing, writing..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm placeholder-gray-400 text-gray-900 min-h-[100px]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
                      What areas or industries interest you?
                    </label>
                    <textarea
                      id="interests"
                      value={userPreferences.interests}
                      onChange={(e) => setUserPreferences(prev => ({ ...prev, interests: e.target.value }))}
                      placeholder="E.g., education, health tech, e-commerce..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm placeholder-gray-400 text-gray-900 min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    className="w-full bg-secondary-600 text-white py-3 px-6 rounded-xl hover:bg-secondary-700 transition-colors duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2 font-medium"
                  >
                    <span>Continue</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                  
                  <button
                    type="button"
                    onClick={goBack}
                    className="w-full bg-white text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 flex items-center justify-center space-x-2 font-medium"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                  </button>
                </div>
              </form>
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
                  Our AI will generate a project idea tailored to your strengths and interests.
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
                <h2 className="text-3xl font-bold text-gray-900 font-display">Your Project Idea</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={exportToPDF}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-primary-300 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                      </>
                    )}
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
              
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => {
  if (!props.children || props.children.length === 0) return null;
  return <h1 className="text-3xl font-bold text-gray-900 mb-4" {...props} />;
},
h2: ({ node, ...props }) => {
  if (!props.children || props.children.length === 0) return null;
  return <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4" {...props} />;
},                    p: ({ node, ...props }) => <p className="text-gray-600 mb-4 leading-relaxed" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-6" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-2 mb-6" {...props} />,
                    li: ({ node, ...props }) => <li className="text-gray-600" {...props} />,
                  }}
                >
                  {idea.content}
                </ReactMarkdown>
              </div>
              
              <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-primary-500" />
                    <span className="text-sm font-medium text-gray-700">Generated by AI based on your preferences</span>
                  </div>
                  <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
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
