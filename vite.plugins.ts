import { PluginOption } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { componentTagger } from 'lovable-tagger';

export const getVitePlugins = (mode: string): PluginOption[] => {
  const plugins: PluginOption[] = [
    react({
      // Enable Fast Refresh for better development experience
      fastRefresh: true
    })
  ];

  // Add development-only plugins
  if (mode === 'development') {
    plugins.push(componentTagger());
  }

  return plugins.filter(Boolean);
};