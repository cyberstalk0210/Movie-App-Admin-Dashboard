import React from 'react';

const Episode = ({ episode, seriesId, onEdit, onDelete }) => {
  return (
    <li className="flex items-center justify-between">
      <div>
        <p className="font-medium text-[#2E2F2F]">{episode.title}</p>
        <p className="text-sm text-[#757575]">Episode {episode.episodeNumber}</p>
      </div>
      <div className="space-x-2">
        <button
          onClick={() => onEdit(episode)}
          className="text-[#0288D1] hover:text-[#01579B]"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(episode.id, seriesId)}
          className="text-[#D32F2F] hover:text-[#B71C1C]"
        >
          Delete
        </button>
      </div>
    </li>
  );
};

export default Episode;