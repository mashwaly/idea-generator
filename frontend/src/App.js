import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';

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
  };

  const goBack = () => {
    setStep(step === 'idea' ? 'ideaGen' : 'api');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center text-indigo-900 mb-8"
        >
          SoloPro
          <span className="block text-lg font-normal text-indigo-600 mt-2">
            AI-Powered Project Planner for Solopreneurs
          </span>
        </motion.h1>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          {step === 'api' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-8"
            >
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Welcome to SoloPro!</h2>
              <p className="text-gray-600 mb-6">
                To get started, please enter your OpenAI API key. We'll use this to power the AI features.
              </p>
              <form onSubmit={handleApiSubmit} className="space-y-4">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your OpenAI API key"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Get Started
                </button>
              </form>
            </motion.div>
          )}

          {step === 'ideaGen' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-8"
            >
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Generate Your Project Idea</h2>
              <p className="text-gray-600 mb-6">
                Let our AI help you generate innovative project ideas tailored to your skills and interests.
              </p>
              <div className="space-y-4">
                <button
                  onClick={generateIdea}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                >
                  {loading ? 'Generating...' : 'Generate Idea'}
                </button>
                <button
                  onClick={goBack}
                  className="w-full border border-indigo-600 text-indigo-600 py-3 px-6 rounded-md hover:bg-indigo-50 transition-colors"
                >
                  Back
                </button>
              </div>
            </motion.div>
          )}

          {step === 'idea' && idea && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-8"
            >
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">{idea.title}</h2>
              <p className="text-gray-600 mb-6">{idea.description}</p>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Implementation Plan:</h3>
                <ul className="list-disc list-inside space-y-2">
                  {idea.plan.map((step, index) => (
                    <li key={index} className="text-gray-600">{step}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 flex justify-between">
                <button
                  onClick={goBack}
                  className="border border-indigo-600 text-indigo-600 py-2 px-4 rounded-md hover:bg-indigo-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={exportToPDF}
                  className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Export as PDF
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;