import React from 'react';

export default function BottomActionsBar({ onFavorite, onShare, onViewSchedule }) {
  return (
    <div className="bottom-actions-bar">
      <button onClick={onFavorite}>★ Favorite stop</button>
      <button onClick={onShare}>Share</button>
      <button onClick={onViewSchedule}>View full schedule</button>
    </div>
  );
}
