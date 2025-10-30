import * as React from 'react';

export interface IAppProps {
}

export function ReviewCards (props: IAppProps) {
  return (
    <div className="max-w-sm bg-white border border-gray-200 rounded-2xl shadow-md p-6">
    {/* Верхняя часть — логотип/аватар и имя */}
    <div className="flex items-center gap-4 mb-4">
      <img
        src="/images/user.jpg"
        alt="Client Avatar"
        className="w-12 h-12 rounded-full object-cover"
      />
      <div>
        <h3 className="text-lg font-semibold text-gray-900">John Doe</h3>
        <p className="text-sm text-gray-500">CEO, Example Corp</p>
      </div>
    </div>

    {/* Текст отзыва */}
    <p className="text-gray-700 leading-relaxed mb-5">
      “The service was outstanding! Communication was fast and professional.
      Definitely recommend this company for anyone looking for reliable
      solutions.”
    </p>

    {/* Низ — рейтинг (красный) и дата */}
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-1 text-red-600">
        {/* 5 одинаковых звёзд – теперь красные */}
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.174c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.286 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.785.57-1.84-.197-1.54-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.174a1 1 0 00.95-.69l1.287-3.967z" />
            </svg>
          ))}
      </div>
      <span className="text-gray-500">October 2025</span>
    </div>
  </div>
  );
}
