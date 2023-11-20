import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

export const PrivateRoute = () => {
  const auth = useSelector((state) => state.auth.isSignIn);

  return auth ? <Outlet /> : <Navigate to="/signin" />;
};
