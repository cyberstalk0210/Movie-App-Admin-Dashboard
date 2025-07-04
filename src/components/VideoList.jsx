import React, { useEffect, useState } from "react";
import { getAllVideos } from "../services/api";

const VideoList = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await getAllVideos();
        setVideos(data);
      } catch (err) {
        console.error("Videolarni olishda xato:", err.message);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="p-4 bg-[#0f111a] text-white">
      <h2 className="text-xl mb-4 font-semibold">Wasabi videolar ro'yxati</h2>
      <ul className="space-y-2">
        {videos.map((videoUrl, idx) => (
          <li key={idx} className="bg-[#1c1f2d] p-3 rounded">
            <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              {videoUrl}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VideoList;
