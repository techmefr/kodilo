import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'app.kodilo.tools',
	appName: 'Kodilo',
	webDir: 'dist-app',
	server: { androidScheme: 'https' },
};

export default config;
