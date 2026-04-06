import { RouterProvider } from 'react-router';
import { UserProvider } from '@/app/contexts/UserContext';
import { router } from '@/app/routes';
import { Toaster } from '@/app/components/ui/sonner';

export default function App() {
  return (
    <UserProvider>
      <RouterProvider router={router} />
      <Toaster />
    </UserProvider>
  );
}