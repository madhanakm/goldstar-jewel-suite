import { PluginOption } from 'vite';
import react from '@vitejs/plugin-react-swc';

export const getVitePlugins = (mode: string): PluginOption[] => {
  const plugins: PluginOption[] = [
    react({
      // Enable Fast Refresh for better development experience
      fastRefresh: true
    })
  ];

  return plugins.filter(Boolean);
};