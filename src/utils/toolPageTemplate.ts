/**
 * Template for tool pages layout updates
 * This template helps standardize all tool pages
 */

// Required imports for all tool pages:
/*
import React, { useState, useEffect } from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import { Header, Footer } from '../../components/organisms';
import RelatedTools from '../../components/common/RelatedTools';
*/

// Standard layout structure:
/*
return (
  <>
    <SEOHead ... />

    <div className="min-h-screen bg-gradient-mesh flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 pt-20 pb-8">
        // Page content here
      </main>

      <Footer />
    </div>
  </>
);
*/

// Standard scroll behavior:
/*
useEffect(() => {
  window.scrollTo(0, 0);
}, []);
*/

export const TOOL_PAGE_LAYOUT_TEMPLATE = `
Key changes needed for each tool page:

1. Add imports: Header, Footer, useEffect
2. Add scroll to top useEffect
3. Wrap in layout div with bg-gradient-mesh
4. Add Header component after SEOHead
5. Update main to: flex-grow container mx-auto px-4 pt-20 pb-8
6. Add Footer before closing layout div
7. Ensure pt-20 for header spacing
`;

export default TOOL_PAGE_LAYOUT_TEMPLATE;
