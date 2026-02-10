// This wrapper ensures Tailwind CSS is bundled with the federated module
// When host app loads this remote module, the CSS will be injected automatically
import '../index.css';
import '@sdk-repo/sdk/styles.css';

export { UserDashboard } from './UserDashboard';
