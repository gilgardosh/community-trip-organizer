import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mb-4">העמוד לא נמצא</p>
      <Link to="/" className="text-blue-500 hover:underline">
        חזרה לדף הבית
      </Link>
    </div>
  );
};

export default NotFoundPage;
