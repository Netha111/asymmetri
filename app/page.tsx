"use client";

import {  useState } from 'react';
import { ChatInput } from '@/components/chat/chat-input';
import { CodePreview } from '@/components/chat/code-preview';
import { Button } from '@/components/ui/button';
//import { Card } from '@/components/ui/card';
import { signOut } from 'next-auth/react';

const LANDING_PAGE_TYPES = [
  {
    type: "Business",
    points: [
      "Clean and professional design",
      "Services/Products showcase",
      "Team section",
      "Client testimonials",
      "Contact information"
    ]
  },
  {
    type: "Product",
    points: [
      "Hero with product images",
      "Feature highlights",
      "Pricing plans",
      "User testimonials",
      "Call-to-action buttons"
    ]
  },
  {
    type: "Portfolio",
    points: [
      "About me section",
      "Skills/Services",
      "Project gallery",
      "Work experience",
      "Contact form"
    ]
  },
  {
    type: "SaaS",
    points: [
      "Feature comparison",
      "Integration logos",
      "Pricing tiers",
      "Live demo section",
      "FAQ section"
    ]
  }
];

// const TEMPLATE_PROMPTS = [
//   {
//     title: "Business Landing Page",
//     description: "Professional layout with hero, features, and contact sections",
//     prompt: "Create a professional business landing page with a clean design, hero section showcasing the main value proposition, features section highlighting key services, testimonials, and a contact form. Use a professional color scheme with blue and white."
//   },
//   {
//     title: "Product Launch",
//     description: "Showcase a product with features and pricing",
//     prompt: "Generate a product launch landing page with a hero section featuring product images, key features and benefits, pricing comparison table, customer testimonials, and a prominent pre-order or buy now button. Use modern and engaging design."
//   },
//   {
//     title: "Portfolio",
//     description: "Showcase work with gallery and contact info",
//     prompt: "Design a creative portfolio landing page with a personal introduction, skills section, project gallery showcasing work examples, and contact information. Make it minimal and elegant with good typography."
//   }
// ];

export default function Home() {
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/status');
      if (!response.ok) throw new Error('Failed to check status');
      
      const data = await response.json();
      if (data.status === 'completed' && data.code) {
        setGeneratedCode(data.code);
        setIsLoading(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Status check error:', err);
      return false;
    }
  };

  const pollStatus = async () => {
    const interval = setInterval(async () => {
      const isComplete = await checkStatus();
      if (isComplete) {
        clearInterval(interval);
      }
    }, 5000); 

    
    setTimeout(() => clearInterval(interval), 300000);
  };

  const handlePromptSubmit = async (prompt: string) => {
    setCurrentPrompt(prompt);
    setIsLoading(true);
    setError(null);

    try {
      const selectedTemplate = LANDING_PAGE_TYPES.find(t => t.type === selectedType);
      const enhancedPrompt = selectedTemplate 
        ? `${prompt}\n\nIncorporate these sections for ${selectedType} type:\n${selectedTemplate.points.join('\n')}`
        : prompt;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          existingCode: generatedCode || null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate code');
      }

     
      pollStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'landing-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleNewChat = () => {
    setGeneratedCode('');
    setCurrentPrompt('');
    setSelectedType(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <main className="container mx-auto p-4 min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <Button 
            onClick={handleNewChat}
            variant="outline"
          >
            New Chat
          </Button>
          <Button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            variant="outline"
          >
            Sign Out
          </Button>
        </div>
        
        <h1 className="text-4xl font-bold mb-8 text-center">Landing Page Generator</h1>
        
    
        
        {/* Templates Section */}
        {/* <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Start with a Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TEMPLATE_PROMPTS.map((template, index) => (
              <Card key={index} className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => !isLoading && handlePromptSubmit(template.prompt)}>
                <h3 className="font-semibold mb-2">{template.title}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </Card>
            ))}
          </div>
        </div> */}

        {/* Existing chat interface */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <ChatInput 
              onSubmit={handlePromptSubmit} 
              isLoading={isLoading}
              defaultValue={currentPrompt}
              onReset={handleNewChat}
            />
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
                <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Landing Page Type (Optional)</h2>
          <div className="flex flex-wrap gap-2">
            {LANDING_PAGE_TYPES.map((type, index) => (
              <button
                key={index}
                onClick={() => setSelectedType(selectedType === type.type ? null : type.type)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  selectedType === type.type 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'hover:border-blue-500'
                }`}
              >
                {type.type}
              </button>
            ))}
          </div>
        </div>
            {generatedCode && (
              <Button 
                onClick={handleDownload} 
                className="w-full"
                disabled={isLoading}
              >
                Download HTML
              </Button>
            )}

          </div>
          
          <div className="border rounded-lg p-4 bg-gray-50">
            {isLoading ? (
              <div className="text-center text-gray-500">
                Generating code...
              </div>
            ) : generatedCode ? (
              <CodePreview code={generatedCode} />
            ) : (
              <div className="text-center text-gray-500">
                Generated code will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
