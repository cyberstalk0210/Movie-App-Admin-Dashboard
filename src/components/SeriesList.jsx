import React, { useState, useEffect } from 'react';
import {
  getAllSeries,
  getEpisodesBySeries,
  createEpisode,
  updateEpisode,
  deleteEpisode,
  updateSeries,
} from '../services/api';
import Episode from './Episode';

const SeriesList = () => {
  const [series, setSeries] = useState([]);
  const [expandedSeries, setExpandedSeries] = useState(null);
  const [episodes, setEpisodes] = useState({});
  const [editSeries, setEditSeries] = useState(null);
  const [editEpisode, setEditEpisode] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    episodeNumber: '',
    videoUrl: '',
    image: null,
    status: '', // Added for series editing
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setIsLoading(true);
        const data = await getAllSeries();
        setSeries(data);
      } catch (err) {
        setError('Failed to fetch series');
        console.error('Error fetching series:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSeries();
  }, []);

  const fetchEpisodes = async (seriesId) => {
    try {
      const data = await getEpisodesBySeries(seriesId);
      setEpisodes((prev) => ({ ...prev, [seriesId]: data }));
    } catch (err) {
      setError('Failed to fetch episodes');
      console.error('Error fetching episodes:', err);
    }
  };

  const handleSeriesClick = (seriesId) => {
    if (expandedSeries === seriesId) {
      setExpandedSeries(null);
    } else {
      setExpandedSeries(seriesId);
      if (!episodes[seriesId]) {
        fetchEpisodes(seriesId);
      }
    }
  };

  const handleEditSeriesClick = (series) => {
    setEditSeries(series);
    setFormData({
      title: series.title,
      status: series.status,
      image: null,
    });
  };

  const handleEditEpisodeClick = (episode) => {
    setEditEpisode(episode);
    setFormData({
      title: episode.title,
      episodeNumber: episode.episodeNumber,
      videoUrl: episode.videoUrl,
      image: null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleUpdateSeries = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('title', formData.title);
    form.append('status', formData.status);
    if (formData.image) {
      form.append('image', formData.image);
    }

    try {
      const updatedSeries = await updateSeries(editSeries.id, form);
      setSeries((prev) =>
        prev.map((s) => (s.id === editSeries.id ? updatedSeries : s))
      );
      setEditSeries(null);
      setFormData({ title: '', episodeNumber: '', videoUrl: '', image: null, status: '' });
      setError(null);
    } catch (err) {
      setError('Failed to update series');
      console.error('Error updating series:', err);
    }
  };

  const handleUpdateEpisode = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('title', formData.title);
    form.append('episodeNumber', formData.episodeNumber);
    form.append('videoUrl', formData.videoUrl);
    if (formData.image) {
      form.append('image', formData.image);
    }

    try {
      const updatedEpisode = await updateEpisode(editEpisode.id, form);
      setEpisodes((prev) => ({
        ...prev,
        [editEpisode.seriesId]: prev[editEpisode.seriesId].map((ep) =>
          ep.id === editEpisode.id ? updatedEpisode : ep
        ),
      }));
      setEditEpisode(null);
      setFormData({ title: '', episodeNumber: '', videoUrl: '', image: null, status: '' });
      setError(null);
    } catch (err) {
      setError('Failed to update episode');
      console.error('Error updating episode:', err);
    }
  };

  const handleDeleteEpisode = async (episodeId, seriesId) => {
    try {
      await deleteEpisode(episodeId);
      setEpisodes((prev) => ({
        ...prev,
        [seriesId]: prev[seriesId].filter((ep) => ep.id !== episodeId),
      }));
      setError(null);
    } catch (err) {
      setError('Failed to delete episode');
      console.error('Error deleting episode:', err);
    }
  };

  const handleAddEpisode = async (e, seriesId) => {
    e.preventDefault();
    const form = new FormData();
    form.append('title', formData.title);
    form.append('episodeNumber', formData.episodeNumber);
    form.append('videoUrl', formData.videoUrl);
    if (formData.image) {
      form.append('image', formData.image);
    }

    try {
      const newEpisode = await createEpisode(seriesId, form);
      setEpisodes((prev) => ({
        ...prev,
        [seriesId]: [...(prev[seriesId] || []), newEpisode],
      }));
      setFormData({ title: '', episodeNumber: '', videoUrl: '', image: null, status: '' });
      setError(null);
    } catch (err) {
      setError('Failed to add episode');
      console.error('Error adding episode:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="ml-0 md:ml-64 p-4 min-h-screen bg-[#F5F6F5] flex items-center justify-center">
        <p className="text-[#2E2F2F] text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="ml-0 md:ml-64 p-4 min-h-screen  bg-[#0f111a]">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#fdfdfd]">Kinolar Ro'yxati</h1>
      {error && <p className="text-[#D32F2F] text-center mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-5">
        {series.map((s) => (
          <div key={s.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
            <img
              src={`http://localhost:8080${s.imagePath}`}
              alt={s.title}
              className="w-full h-42 object-contain cursor-pointer"
              onClick={() => handleSeriesClick(s.id)}
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-[#2E2F2F]">{s.title}</h2>
              <p className="text-[#757575]">{s.status}</p>
              {/* <button
                onClick={() => handleEditSeriesClick(s)}
                className="mt-2 text-[#0288D1] hover:text-[#01579B]"
              >
                Edit Series
              </button> */}
              {expandedSeries === s.id && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-[#2E2F2F]">Episodes:</h3>
                  {episodes[s.id]?.length > 0 ? (
                    <ul className="space-y-2">
                      {episodes[s.id].map((ep) => (
                        <Episode
                          key={ep.id}
                          episode={ep}
                          seriesId={s.id}
                          onEdit={handleEditEpisodeClick}
                          onDelete={handleDeleteEpisode}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[#757575]">No episodes available</p>
                  )}
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-[#2E2F2F]">Add New Episode</h4>
                    <form
                      onSubmit={(e) => handleAddEpisode(e, s.id)}
                      className="space-y-2"
                    >
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Episode Title"
                        className="w-full p-2 border rounded border-[#B0BEC5]"
                      />
                      <input
                        type="number"
                        name="episodeNumber"
                        value={formData.episodeNumber}
                        onChange={handleInputChange}
                        placeholder="Episode Number"
                        className="w-full p-2 border rounded border-[#B0BEC5]"
                      />
                      <input
                        type="text"
                        name="videoUrl"
                        value={formData.videoUrl}
                        onChange={handleInputChange}
                        placeholder="Video URL"
                        className="w-full p-2 border rounded border-[#B0BEC5]"
                      />
                      <input
                        type="file"
                        name="image"
                        onChange={handleFileChange}
                        className="w-full p-2 border rounded border-[#B0BEC5]"
                      />
                      <button
                        type="submit"
                        className="bg-[#0288D1] text-white px-4 py-2 rounded hover:bg-[#01579B]"
                      >
                        Add Episode
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {(editSeries || editEpisode) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            {editSeries ? (
              <>
                <h2 className="text-xl font-semibold text-[#2E2F2F] mb-4">Edit Series</h2>
                <form onSubmit={handleUpdateSeries} className="space-y-4">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Series Title"
                    className="w-full p-2 border rounded border-[#B0BEC5]"
                  />
                  <input
                    type="text"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    placeholder="Status"
                    className="w-full p-2 border rounded border-[#B0BEC5]"
                  />
                  <input
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                    className="w-full p-2 border rounded border-[#B0BEC5]"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditSeries(null)}
                      className="bg-[#B0BEC5] text-white px-4 py-2 rounded hover:bg-[#90A4AE]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#0288D1] text-white px-4 py-2 rounded hover:bg-[#01579B]"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-[#2E2F2F] mb-4">Edit Episode</h2>
                <form onSubmit={handleUpdateEpisode} className="space-y-4">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Episode Title"
                    className="w-full p-2 border rounded border-[#B0BEC5]"
                  />
                  <input
                    type="number"
                    name="episodeNumber"
                    value={formData.episodeNumber}
                    onChange={handleInputChange}
                    placeholder="Episode Number"
                    className="w-full p-2 border rounded border-[#B0BEC5]"
                  />
                  <input
                    type="text"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    placeholder="Video URL"
                    className="w-full p-2 border rounded border-[#B0BEC5]"
                  />
                  <input
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                    className="w-full p-2 border rounded border-[#B0BEC5]"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditEpisode(null)}
                      className="bg-[#B0BEC5] text-white px-4 py-2 rounded hover:bg-[#90A4AE]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#0288D1] text-white px-4 py-2 rounded hover:bg-[#01579B]"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesList;