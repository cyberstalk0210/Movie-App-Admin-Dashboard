import React, { useState, useEffect } from "react";
import { getSeries, getEpisodesBySeries, createEpisode } from "../services/api";

const Movies = () => {
  const [seriesList, setSeriesList] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [newEpisode, setNewEpisode] = useState({
    title: "",
    episodeNumber: "",
    videoUrl: "",
  });
  const [thumbFile, setThumbFile] = useState(null);
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

    if (!selectedSeriesId || !thumbFile) {
      setError("Serial va rasmni tanlang.");
      return;
    }

    const formData = new FormData();
    formData.append("title", newEpisode.title);
    formData.append("episodeNumber", newEpisode.episodeNumber);
    formData.append("videoUrl", newEpisode.videoUrl);
    formData.append("image", thumbFile);

    try {
      const created = await createEpisode(selectedSeriesId, formData);
      setEpisodes((prev) => [...prev, created]);

      // Reset form
      setNewEpisode({ title: "", episodeNumber: "", videoUrl: "" });
      setThumbFile(null);
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
          <p className="text-red-400 bg-red-500/10 p-3 rounded-lg mb-6 animate-pulse text-center">
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
              className="w-full p-3 bg-[#0f111a] border border-gray-600 rounded-lg text-white"
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
              value={newEpisode.title}
              onChange={(e) =>
                setNewEpisode({ ...newEpisode, title: e.target.value })
              }
              className="w-full p-3 bg-[#0f111a] border border-gray-600 rounded-lg text-white"
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
              value={newEpisode.episodeNumber}
              onChange={(e) =>
                setNewEpisode({ ...newEpisode, episodeNumber: e.target.value })
              }
              className="w-full p-3 bg-[#0f111a] border border-gray-600 rounded-lg text-white"
              required
            />
          </div>

          {/* Video Link */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Video URL:
            </label>
            <input
              type="text"
              value={newEpisode.videoUrl}
              onChange={(e) =>
                setNewEpisode({ ...newEpisode, videoUrl: e.target.value })
              }
              className="w-full p-3 bg-[#0f111a] border border-gray-600 rounded-lg text-white"
              required
            />
          </div>

          {/* Thumbnail upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Epizod rasmi:
            </label>
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow transition duration-200">
                <span>
                  {thumbFile ? "Tanlandi: " + thumbFile.name : "Rasm tanlang"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbFile(e.target.files[0])}
                  className="hidden"
                  required
                />
              </label>
              {thumbFile && (
                <img
                  src={URL.createObjectURL(thumbFile)}
                  alt="Preview"
                  className="w-12 h-12 rounded object-cover border border-gray-600"
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
          >
            Epizodni Yaratish
          </button>
        </form>
      </div>
    </div>
  );
};

export default Movies;
