import { useState, useEffect, useCallback } from 'react';
import ReactGA from 'react-ga4';
import { TOOL_HASH_MAP, HASH_TOOL_MAP } from '@/types';
import type { Tool, URLContext, Language } from '@/types';

// Initialize GA4
const GA_MEASUREMENT_ID = 'G-MS36WTHPCZ';

export interface HashRouterReturn {
  currentTool: Tool | null;
  setCurrentTool: (tool: Tool | null) => void;
  context: URLContext | null;
}

export const useHashRouter = (): HashRouterReturn => {
  const [currentTool, setCurrentToolState] = useState<Tool | null>(null);
  const [context, setContext] = useState<URLContext | null>(null);
  const [gaInitialized, setGaInitialized] = useState(false);

  // Initialize GA
  useEffect(() => {
    if (!gaInitialized) {
      ReactGA.initialize(GA_MEASUREMENT_ID);
      setGaInitialized(true);
    }
  }, [gaInitialized]);

  // Parse hash and URL parameters on mount and hash change
  useEffect(() => {
    const parseHashWithParams = () => {
      const hash = window.location.hash.slice(1); // Remove #
      const [toolHash, queryString] = hash.split('?');

      // Parse tool from hash
      const tool = TOOL_HASH_MAP[toolHash] || null;

      // Track tool selection if it changed and is valid
      if (tool && tool !== currentTool) {
        ReactGA.event({
          category: 'Tool',
          action: 'use_tool',
          label: tool,
          value: 1
        });

        // Also send a pageview for SPA behavior
        ReactGA.send({ hitType: "pageview", page: window.location.hash });
      }

      setCurrentToolState(tool);

      // Parse URL parameters for context
      if (queryString) {
        const params = new URLSearchParams(queryString);

        const urlContext: URLContext = {
          source: (params.get('source') as URLContext['source']) || 'direct',
          referrer: params.get('ref') || null,
          language: (params.get('lang') as Language) || 'en',
          utmParams: params.get('utm') || null,
          isFirstVisit: params.get('first_visit') === '1',
        };

        setContext(urlContext);

        // Save language preference if provided
        if (params.get('lang')) {
          localStorage.setItem('preferred_language', params.get('lang')!);
        }

        // Track first visit
        if (urlContext.isFirstVisit) {
          localStorage.setItem('visited_spa', 'true');
        }

        // Track visit count
        const visitCount = parseInt(localStorage.getItem('visit_count') || '0', 10);
        localStorage.setItem('visit_count', (visitCount + 1).toString());
      } else {
        // No params in URL - set default context only once
        setContext(prev => prev || {
          source: 'direct',
          referrer: null,
          language: (localStorage.getItem('preferred_language') as Language) || 'en',
          utmParams: null,
          isFirstVisit: localStorage.getItem('visited_spa') !== 'true',
        });
      }
    };

    // Parse on mount
    parseHashWithParams();

    // Listen for hash changes
    window.addEventListener('hashchange', parseHashWithParams);

    return () => {
      window.removeEventListener('hashchange', parseHashWithParams);
    };
  }, [currentTool]); // Add currentTool as dependency

  // Update hash when tool changes (programmatic navigation)
  const setCurrentTool = useCallback((tool: Tool | null) => {
    if (tool) {
      const hash = HASH_TOOL_MAP[tool];

      // Preserve query string if exists
      const currentHash = window.location.hash.slice(1);
      const [, queryString] = currentHash.split('?');

      if (queryString) {
        window.location.hash = `${hash}?${queryString} `;
      } else {
        window.location.hash = hash;
      }

      // Track programmatically
      ReactGA.event({
        category: 'Tool',
        action: 'use_tool',
        label: tool,
        value: 1
      });

      // Track tool selection in localStorage
      localStorage.setItem('last_tool', tool);

      // Track tools used
      const toolsUsed = JSON.parse(localStorage.getItem('tools_used') || '[]');
      if (!toolsUsed.includes(tool)) {
        toolsUsed.push(tool);
        localStorage.setItem('tools_used', JSON.stringify(toolsUsed));
      }
    } else {
      window.location.hash = '';
    }
  }, []);

  return {
    currentTool,
    setCurrentTool,
    context,
  };
};
