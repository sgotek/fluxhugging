'use client';

import { useState } from 'react';
import Image from 'next/image';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  timestamp: Date;
}

interface FormData {
  model: 'flux' | 'sdxl';
  prompt: string;
  negative_prompt: string;
  width: number;
  height: number;
  steps: number;
  guidance_scale: number;
}

const DEFAULT_VALUES = {
  flux: {
    steps: 20,
    guidance_scale: 3.5,
    width: 768,
    height: 1024
  },
  sdxl: {
    steps: 30,
    guidance_scale: 7.5,
    width: 768,
    height: 1024
  }
};

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    model: 'flux',
    prompt: '',
    negative_prompt: 'low quality, blurry, watermark, text',
    width: DEFAULT_VALUES.flux.width,
    height: DEFAULT_VALUES.flux.height,
    steps: DEFAULT_VALUES.flux.steps,
    guidance_scale: DEFAULT_VALUES.flux.guidance_scale
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const handleModelChange = (model: 'flux' | 'sdxl') => {
    const defaults = DEFAULT_VALUES[model];
    setFormData(prev => ({
      ...prev,
      model,
      width: defaults.width,
      height: defaults.height,
      steps: defaults.steps,
      guidance_scale: defaults.guidance_scale
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      // Create blob URL from response
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      // Add to gallery (keep only last 6 images)
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: formData.prompt,
        model: formData.model,
        timestamp: new Date()
      };

      setGeneratedImages(prev => [newImage, ...prev.slice(0, 5)]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = (imageUrl: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${prompt.slice(0, 50).replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const samplePrompts = [
    "A luxury perfume bottle on a marble surface with soft lighting, product photography style",
    "Elegant glass perfume bottle with golden accents, surrounded by rose petals, studio lighting"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🤗 Hugging Face Image Generator
          </h1>
          <p className="text-gray-600">
            Generate images using FLUX.1-schnell and Stable Diffusion XL models
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Generate Image</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <select
                  value={formData.model}
                  onChange={(e) => handleModelChange(e.target.value as 'flux' | 'sdxl')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="flux">FLUX.1-schnell</option>
                  <option value="sdxl">Stable Diffusion XL</option>
                </select>
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt
                </label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="Describe the image you want to generate..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                  required
                />
                <div className="mt-2 text-xs text-gray-500">
                  Sample prompts:
                  {samplePrompts.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, prompt: sample }))}
                      className="block mt-1 text-blue-600 hover:text-blue-800 hover:underline text-left"
                    >
                      • {sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* Negative Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Negative Prompt (Optional)
                </label>
                <input
                  type="text"
                  value={formData.negative_prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, negative_prompt: e.target.value }))}
                  placeholder="What to avoid in the image..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width
                  </label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                    min="256"
                    max="1024"
                    step="64"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                    min="256"
                    max="1024"
                    step="64"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Steps and Guidance */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Steps
                  </label>
                  <input
                    type="number"
                    value={formData.steps}
                    onChange={(e) => setFormData(prev => ({ ...prev, steps: parseInt(e.target.value) }))}
                    min="1"
                    max="50"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guidance Scale
                  </label>
                  <input
                    type="number"
                    value={formData.guidance_scale}
                    onChange={(e) => setFormData(prev => ({ ...prev, guidance_scale: parseFloat(e.target.value) }))}
                    min="1"
                    max="20"
                    step="0.1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !formData.prompt.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating...
                  </div>
                ) : (
                  'Generate Image'
                )}
              </button>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </form>
          </div>

          {/* Gallery Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Gallery ({generatedImages.length}/6)
            </h2>
            
            {generatedImages.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <div className="text-6xl mb-4">🎨</div>
                <p>No images generated yet</p>
                <p className="text-sm">Generate your first image to see it here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {generatedImages.map((image) => (
                  <div key={image.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="relative group">
                      <Image
                        src={image.url}
                        alt={image.prompt}
                        width={300}
                        height={300}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <button
                          onClick={() => downloadImage(image.url, image.prompt)}
                          className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {image.prompt}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {image.model.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {image.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
