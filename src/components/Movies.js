import React, { useState, useEffect } from "react";
import {
  getSeries,
  getEpisodesBySeries,
  createEpisode,
} from "../services/api";

const Movies = () => {
  const [seriesList, setSeriesList] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [newEpisode, setNewEpisode] = useState({
    title: "",
    episodeNumber: "",
  });
  const [thumbFile, setThumbFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const [error, setError] = useState("");

  useEffect(() => {
    getSeries()
      .then(setSeriesList)
      .catch((e) => setError("Seriallarni olishda xato: " + e));
  }, []);

  useEffect(() => {
    if (!selectedSeriesId) return;
    getEpisodesBySeries(selectedSeriesId)
      .then(setEpisodes)
      .catch((e) => setError("Episodlarni olishda xato: " + e));
  }, [selectedSeriesId]);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!selectedSeriesId) {
      setError("Iltimos, serial tanlang.");
      return;
    }

    setError("");

    const dto = {
      title: newEpisode.title,
      episodeNumber: newEpisode.episodeNumber,
      thumbnail: "", // optional
      fileName: newEpisode.title, // optional
      videoUrl: videoFile, // <-- bu yerda link yuboramiz
      seriesId: Number(selectedSeriesId),
    };

    try {
      const created = await createEpisode(selectedSeriesId, dto);
      setEpisodes((prev) => [...prev, created]);

      // Formani tozalash
      setNewEpisode({ title: "", episodeNumber: "" });
      setVideoFile(""); // link ham bo‘shatilsin
    } catch (err) {
      console.error(err);
      setError("Episod qo‘shishda xatolik: " + err);
    }
  };

return (
    <div className="min-h-screen bg-[#0f111a] flex justify-center items-center p-6 ml-64">
      <div className="max-w-md w-full bg-[#1c1e2c] p-8 rounded-xl shadow-lg text-white">
        <h1 className="text-3xl font-bold mb-6 text-center tracking-tight">
          Yangi Epizod Qo‘shish
        </h1>
        {error && (
          <p className="text-red-400 bg-red-500/10 p Arts 0px p-3 rounded-lg mb-6 animate-pulse text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleCreate} className="space-y-6">
          {/* Series select */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Serial tanlang:
            </label>
            <select
              className="w-full p-3 bg-[#0f111a] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-white"
              value={selectedSeriesId}
              onChange={(e) => setSelectedSeriesId(e.target.value)}
              required
            >
              <option value="">-- Serial tanlang --</option>
              {seriesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Epizod nomi:
            </label>
            <input
              type="text"
              placeholder="Epizod nomini kiriting"
              className="w-full p-3 bg-[#0f111a] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={newEpisode.title}
              onChange={(e) =>
                setNewEpisode({ ...newEpisode, title: e.target.value })
              }
              required
            />
          </div>

          {/* Episode Number */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Epizod raqami:
            </label>
            <input
              type="number"
              placeholder="Epizod raqamini kiriting"
              className="w-full p-3 bg-[#0f111a] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={newEpisode.episodeNumber}
              onChange={(e) =>
                setNewEpisode({ ...newEpisode, episodeNumber: e.target.value })
              }
              required
            />
          </div>

          {/* Video Link */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Video Link:
            </label>
            <input
              type="text"
              placeholder="Video URL kiriting"
              className="w-full p-3 bg-[#0f111a] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={videoFile || ""}
              onChange={(e) => setVideoFile(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Yuborish
          </button>
        </form>
      </div>
    </div>
  );
};

export default Movies;