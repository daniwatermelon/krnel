import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import  {VitePWA} from "vite-plugin-pwa";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),VitePWA(
{
  manifest:{
name: "KrnelPWA",
short_name:"Krnel",
theme_color:"#AC21C",
icons: [
  {
    src: '/icons/iconpwa.png',
    sizes: '512x512',
    type: 'image/png',
  }
]
  },
  registerType: 'autoUpdate',
  devOptions:{enabled: true}
}

  )],
})
