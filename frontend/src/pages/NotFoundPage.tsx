import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">404</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-2 mb-4">Trang bạn tìm kiếm không tồn tại.</p>
      <Link
        to="/"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
      >
        Về trang chủ
      </Link>
    </div>
  );
};

export default NotFoundPage;