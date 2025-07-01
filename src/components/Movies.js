import React, { useState, useEffect } from "react";
import { createEpisode, deleteEpisode, uploadFile , getEpisodesBySeries } from "../services/api";

const Movies = ({ seriesId }) => {
  const [episodes, setEpisodes] = useState([]);
  const [newEpisode, setNewEpisode] = useState({
    title: "",
    episodeNumber: "",
    thumbnail: "",
    fileName: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState("");

  // // Placeholder for fetching episodes
  // const fetchEpisodes = async () => {
  //   try {
  //     // TODO: getEpisodesBySeries(seriesId) qo‘shilsa, shu yerdan foydalaning
  //     setEpisodes([]); // Hozircha bo‘sh ro‘yxat
  //   } catch (err) {
  //     setError("Episodlarni olishda xato: " + err.message);
  //   }
  // };

useEffect(() => {
  if (!seriesId || isNaN(seriesId)) {
      setError("Series ID topilmadi yoki noto‘g‘ri formatda!");
      return;
    }

  const fetchEpisodes = async () => {
        try {
            const data = await getEpisodesBySeries(seriesId);
            setEpisodes(data);
        } catch (err) {
            setError("Episodlarni olishda xato: " + err.message);
        }
    };
    fetchEpisodes();
}, [seriesId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      let updatedEpisode = { ...newEpisode };

      if (imageFile) {
        updatedEpisode.thumbnail = await uploadFile(imageFile, "image");
      }

      if (videoFile) {
        updatedEpisode.fileName = await uploadFile(videoFile, "video");
      }

      const createdEpisode = await createEpisode(seriesId, updatedEpisode);
      setEpisodes([...episodes, createdEpisode]);
      setNewEpisode({ title: "", episodeNumber: "", thumbnail: "", fileName: "" });
      setImageFile(null);
      setVideoFile(null);
    } catch (err) {
      setError("Episod qo‘shishda xato: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEpisode(id);
      setEpisodes(episodes.filter((episode) => episode.id !== id));
    } catch (err) {
      setError("Episodni o‘chirishda xato: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Yangi Episod Qo‘shish (Seria {seriesId})</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleCreate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">Nomi</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-800"
              value={newEpisode.title}
              onChange={(e) => setNewEpisode({ ...newEpisode, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block mb-2">Episod raqami</label>
            <input
              type="number"
              className="w-full p-2 rounded bg-gray-800"
              value={newEpisode.episodeNumber}
              onChange={(e) => setNewEpisode({ ...newEpisode, episodeNumber: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block mb-2">Rasm</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full p-2 rounded bg-gray-800"
            />
          </div>

          <div>
            <label className="block mb-2">Video</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="w-full p-2 rounded bg-gray-800"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700"
        >
          Qo‘shish
        </button>
      </form>

      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Episodlar ro‘yxati</h2>
        <ul className="space-y-4">
          {episodes.map((episode) => (
            <li
              key={episode.id}
              className="bg-gray-800 p-4 rounded flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{episode.title}</h3>
                <p className="text-sm text-gray-400">Episod {episode.episodeNumber}</p>
                {episode.thumbnail && (
                  <img
                    src={episode.thumbnail}
                    alt={episode.title}
                    className="w-24 h-36 object-cover mt-2"
                  />
                )}
                {episode.fileName && (
                  <a
                    href={episode.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-blue-400 mt-2"
                  >
                    Videoni ko‘rish
                  </a>
                )}
              </div>
              <button
                onClick={() => handleDelete(episode.id)}
                className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
              >
                O‘chirish
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Movies;