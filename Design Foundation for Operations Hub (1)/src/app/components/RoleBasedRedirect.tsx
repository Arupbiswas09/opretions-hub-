import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUser, isInternalUser } from '@/app/contexts/UserContext';

export const RoleBasedRedirect = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on user role when they switch users
    const isInternal = isInternalUser(currentUser.role);
    const isOnPortalRoute = window.location.pathname.startsWith('/portal');
    
    if (isInternal && isOnPortalRoute) {
      // Internal user on portal route - redirect to internal
      navigate('/cockpit');
    } else if (!isInternal && !isOnPortalRoute) {
      // Portal user on internal route - redirect to portal
      navigate('/portal');
    }
  }, [currentUser.role, navigate]);

  return null;
};
