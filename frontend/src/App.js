import React, { useState } from 'react';
import { motion } from 'framer-motion';

const App = () => {
  const [apiKey, setApiKey] = useState('');
  const [step, setStep] = useState('api');
  const [loading, setLoading] = useState(false);
  const [idea, setIdea] = useState(null);

  const handleApiSubmit = (e) => {
    e.preventDefault();
    if (apiKey) {
      setStep('ideaGen');
    }
  };

  const generateIdea = async () => {
    setLoading(true);
    // TODO: Implement OpenAI API call
    setTimeout(() => {
      setIdea({
        title: "Sample Project Idea",
        description: "This is where the AI-generated idea will appear",
        plan: ["Step 1", "Step 2", "Step 3"]
      });
      setLoading(false);
      setStep('idea');
    }, 1500);
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

        {step === 'api' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
            className="bg-white rounded-lg shadow-xl p-8"
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Generate Your Project Idea</h2>
            <p className="text-gray-600 mb-6">
              Let our AI help you generate innovative project ideas tailored to your skills and interests.
            </p>
            <button
              onClick={generateIdea}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
            >
              {loading ? 'Generating...' : 'Generate Idea'}
            </button>
          </motion.div>
        )}

        {step === 'idea' && idea && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
            <div className="mt-8 flex justify-end">
              <button className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                Export as PDF
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default App;