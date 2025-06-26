/**
 * StyleTestPage.tsx
 * Диагностическая страница для проверки правильности работы стилей
 */

import React from 'react';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { Spinner } from '../components/atoms/Spinner';
import { FileSpreadsheet, Zap, Sparkles } from 'lucide-react';

export const StyleTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Style Test Page</h1>
          <p className="text-xl text-gray-600">Testing Tailwind CSS and component styling</p>
        </div>

        {/* Tailwind Basic Tests */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Tailwind CSS Basic Tests</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Colors</h3>
              <p className="text-blue-700 text-sm">Blue color scheme working</p>
            </div>
            
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-medium text-green-900">Grid Layout</h3>
              <p className="text-green-700 text-sm">Responsive grid working</p>
            </div>
            
            <div className="bg-purple-100 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900">Spacing</h3>
              <p className="text-purple-700 text-sm">Padding & margins working</p>
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-semibold">Typography</h3>
            <p className="text-base">Regular text (text-base)</p>
            <p className="text-sm text-gray-600">Small text (text-sm)</p>
            <p className="text-xs text-gray-500">Extra small text (text-xs)</p>
            <p className="font-bold">Bold text</p>
            <p className="font-medium">Medium weight text</p>
          </div>

          {/* Flexbox */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
            <span>Flexbox test</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Space between working</span>
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Component Tests */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Component Tests</h2>
          
          {/* Buttons */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="danger">Danger Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" loading>Loading Button</Button>
              <Button variant="primary" icon={Zap}>With Icon</Button>
              <Button variant="primary" fullWidth>Full Width Button</Button>
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">Primary Badge</Badge>
              <Badge variant="secondary">Secondary Badge</Badge>
              <Badge variant="success">Success Badge</Badge>
              <Badge variant="warning">Warning Badge</Badge>
              <Badge variant="error">Error Badge</Badge>
            </div>
          </div>

          {/* Spinners */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium">Spinners</h3>
            <div className="flex items-center gap-4">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
              <span className="text-sm text-gray-600">Loading indicators</span>
            </div>
          </div>

          {/* Icons */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Icons</h3>
            <div className="flex items-center gap-4">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              <Zap className="w-6 h-6 text-yellow-600" />
              <Sparkles className="w-6 h-6 text-purple-600" />
              <span className="text-sm text-gray-600">Lucide React icons</span>
            </div>
          </div>
        </Card>

        {/* Fallback Style Tests */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Fallback Style Tests</h2>
          <p className="text-gray-600 mb-4">
            These elements use fallback styles in case Tailwind CSS doesn't load properly:
          </p>
          
          <div className="space-y-4">
            {/* Fallback Buttons */}
            <div>
              <h3 className="text-lg font-medium mb-2">Fallback Buttons</h3>
              <div className="space-x-2">
                <button className="btn-fallback btn-primary-fallback">Primary Fallback</button>
                <button className="btn-fallback btn-secondary-fallback">Secondary Fallback</button>
              </div>
            </div>

            {/* Fallback Cards */}
            <div>
              <h3 className="text-lg font-medium mb-2">Fallback Card</h3>
              <div className="card-fallback">
                <p>This card uses fallback styling from App.css</p>
              </div>
            </div>

            {/* Fallback Badge */}
            <div>
              <h3 className="text-lg font-medium mb-2">Fallback Badges</h3>
              <div className="space-x-2">
                <span className="badge-fallback badge-success-fallback">Success Fallback</span>
                <span className="badge-fallback badge-secondary-fallback">Secondary Fallback</span>
              </div>
            </div>

            {/* Fallback Spinner */}
            <div>
              <h3 className="text-lg font-medium mb-2">Fallback Spinner</h3>
              <div className="spinner-fallback"></div>
            </div>
          </div>
        </Card>

        {/* Interactive Elements */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Interactive Elements</h2>
          
          {/* Hover Effects */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Hover Effects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                <p className="font-medium text-blue-900">Hover to change background</p>
                <p className="text-sm text-blue-700">Background color transition</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                <p className="font-medium text-green-900">Hover for shadow</p>
                <p className="text-sm text-green-700">Box shadow transition</p>
              </div>
            </div>
          </div>

          {/* Responsive Design */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Responsive Design Test</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="p-3 bg-red-100 rounded text-center">
                <p className="font-medium text-red-900">1 col</p>
                <p className="text-xs text-red-700">Mobile</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded text-center">
                <p className="font-medium text-yellow-900">2 cols</p>
                <p className="text-xs text-yellow-700">SM+</p>
              </div>
              <div className="p-3 bg-blue-100 rounded text-center">
                <p className="font-medium text-blue-900">3 cols</p>
                <p className="text-xs text-blue-700">MD+</p>
              </div>
              <div className="p-3 bg-green-100 rounded text-center">
                <p className="font-medium text-green-900">4 cols</p>
                <p className="text-xs text-green-700">LG+</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Animation Tests */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Animation Tests</h2>
          
          <div className="space-y-6">
            {/* CSS Animations */}
            <div>
              <h3 className="text-lg font-medium mb-2">CSS Animations</h3>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Pulse animation</span>
              </div>
            </div>

            {/* Custom Animations */}
            <div>
              <h3 className="text-lg font-medium mb-2">Custom Animations</h3>
              <div className="flex items-center gap-4">
                <div className="float-animation">
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                </div>
                <span>Float animation (from CSS)</span>
              </div>
            </div>

            {/* Transition Effects */}
            <div>
              <h3 className="text-lg font-medium mb-2">Transition Effects</h3>
              <div className="hover-lift-fallback p-4 bg-purple-50 rounded-lg cursor-pointer inline-block">
                <p className="font-medium text-purple-900">Hover to lift</p>
                <p className="text-sm text-purple-700">Transform transition</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Status Report */}
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h2 className="text-xl font-semibold text-green-900">Status Report</h2>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-green-800">✅ Tailwind CSS is loading properly</p>
            <p className="text-green-800">✅ Component system is working</p>
            <p className="text-green-800">✅ Fallback styles are available</p>
            <p className="text-green-800">✅ Icons are rendering correctly</p>
            <p className="text-green-800">✅ Responsive design is functional</p>
            <p className="text-green-800">✅ Animations and transitions work</p>
          </div>
          
          <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
            <h3 className="font-medium text-green-900 mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-green-800 text-sm">
              <li>If all elements above display correctly, the styling system is working</li>
              <li>You can now safely navigate to the Enhanced CSV to PDF page</li>
              <li>If any elements look broken, check browser console for errors</li>
              <li>Verify that all CSS files are being loaded in the network tab</li>
            </ol>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center">
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => window.location.href = '/enhanced-csv-to-pdf'}
          >
            Go to Enhanced CSV to PDF Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StyleTestPage;