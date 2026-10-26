import { defineConfig } from 'vite';
export default defineConfig({base:'./',build:{outDir:'docs',emptyOutDir:true,chunkSizeWarningLimit:1600,rollupOptions:{output:{manualChunks:(id:string)=>id.includes('node_modules/phaser')?'phaser':undefined}}},server:{host:'0.0.0.0'}});
