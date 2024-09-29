import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import Home from './pages/home/Home.jsx';
import SignIn from './pages/auth/signin/SignIn.jsx';
import SignUp from './pages/auth/signup/SignUp.jsx';
import ErrorDisplay from './components/error/ErrorDisplay.jsx';
import Notifications from './pages/notifications/Notifications.jsx';
import Profile from './pages/profile/Profile.jsx';

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/signin',
        element: <SignIn />,
      },
      {
        path: '/signup',
        element: <SignUp />,
      },
      {
        path: '/notifications',
        element: <Notifications />,
      },
      {
        path: '/profile',
        element: <Profile />,
      }
    ],
    // not found page
    errorElement: <ErrorDisplay />
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={appRouter} />
  </StrictMode>
);
