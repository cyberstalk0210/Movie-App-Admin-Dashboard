import React, { useState, useEffect } from "react";
import {
  createEpisode,
  uploadFile,
  getEpisodesBySeries,
  getSeries,
} from "../services/api";

const Movies = () => {
  const [seriesList, setSeriesList] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [newEpisode, setNewEpisode] = useState({
    title: "",
    episodeNumber: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const all = await getSeries();
        setSeriesList(all);
      } catch (err) {
        setError("Serial ro‘yxatini olishda xato: " + err);
      }
    };
    fetchSeries();
  }, []);

  useEffect(() => {
    if (!selectedSeriesId) return;
    const fetchEpisodes = async () => {
      try {
        const data = await getEpisodesBySeries(selectedSeriesId);
        setEpisodes(data);
      } catch (err) {
        setError("Episodlarni olishda xato: " + err);
      }
    };
    fetchEpisodes();
  }, [selectedSeriesId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedSeriesId) return setError("Iltimos, serial tanlang.");

    try {
      const updated = { ...newEpisode };

      if (imageFile) {
        updated.thumbnail = await uploadFile(
          imageFile,
          "image",
          `ep_${newEpisode.episodeNumber}_thumb.jpg`,
          selectedSeriesId,
          true,
          newEpisode.episodeNumber,
          newEpisode.title
        );
      }

      if (videoFile) {
        updated.fileName = await uploadFile(
          videoFile,
          "video",
          `ep_${newEpisode.episodeNumber}_video.mp4`,
          selectedSeriesId,
          true,
          newEpisode.episodeNumber,
          newEpisode.title
        );
      }

      const created = await createEpisode(selectedSeriesId, updated);
      setEpisodes((prev) => [...prev, created]);

      setNewEpisode({ title: "", episodeNumber: "" });
      setImageFile(null);
      setVideoFile(null);
      setError("");
    } catch (err) {
      setError("Episod qo‘shishda xato: " + err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-white p-10">
      <h1 className="text-3xl font-bold mb-6">Yangi Epizod Qo‘shish</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleCreate} className="space-y-4 bg-[#1c1e2c] p-6 rounded-lg">
        <div>
          <label className="text-sm text-gray-400">Serial tanlang:</label>
          <select
            className="w-full bg-[#0f111a] text-white border border-gray-700 p-2 rounded"
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

        <input
          type="text"
          placeholder="Epizod nomi"
          className="w-full p-3 bg-[#0f111a] border border-gray-700 rounded"
          value={newEpisode.title}
          onChange={(e) => setNewEpisode({ ...newEpisode, title: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Epizod raqami"
          className="w-full p-3 bg-[#0f111a] border border-gray-700 rounded"
          value={newEpisode.episodeNumber}
          onChange={(e) => setNewEpisode({ ...newEpisode, episodeNumber: e.target.value })}
          required
        />

        <div>
          <label className="text-sm text-gray-400">Thumbnail yuklang:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">Video yuklang:</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white"
        >
          Yuborish
        </button>
      </form>
    </div>
  );
};

export default Movies;
