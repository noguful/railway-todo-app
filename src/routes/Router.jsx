import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home } from '../pages/Home';
import { NotFound } from '../pages/NotFound';
import { SignIn } from '../pages/SignIn';
import { NewTask } from '../pages/NewTask';
import { NewList } from '../pages/NewList';
import { EditTask } from '../pages/EditTask';
import { SignUp } from '../pages/SignUp';
import { EditList } from '../pages/EditList';
import { PrivateRoute } from '../privateRoute';

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/task/new" element={<NewTask />} />
          <Route path="/list/new" element={<NewList />} />
          <Route path="/lists/:listId/tasks/:taskId" element={<EditTask />} />
          <Route path="/lists/:listId/edit" element={<EditList />} />
        </Route>
        <Route element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
