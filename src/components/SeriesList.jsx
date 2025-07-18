import React, { useState, useEffect, useRef } from "react";
import {
  getAllSeries,
  getEpisodesBySeries,
  createEpisode,
  updateEpisode,
  deleteEpisode,
  updateSeries,
  deleteSeries,
} from "../services/api";
import Episode from "./Episode";

const SeriesList = () => {
  const [series, setSeries] = useState([]);
  const [expandedSeries, setExpandedSeries] = useState(null);
  const [episodes, setEpisodes] = useState({});
  const [editSeries, setEditSeries] = useState(null);
  const [editEpisode, setEditEpisode] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    episodeNumber: "",
    videoUrl: "",
    image: null,
    status: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setIsLoading(true);
        const data = await getAllSeries();
        setSeries(data);
      } catch (err) {
        setError("Failed to fetch series");
        console.error("Error fetching series:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSeries();
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && (editSeries || editEpisode)) {
        setEditSeries(null);
        setEditEpisode(null);
        setFormData({
          title: "",
          episodeNumber: "",
          videoUrl: "",
          image: null,
          status: "",
        });
        setFormErrors({});
        setImagePreview(null);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [editSeries, editEpisode]);

  const fetchEpisodes = async (seriesId) => {
    try {
      const data = await getEpisodesBySeries(seriesId);
      setEpisodes((prev) => ({ ...prev, [seriesId]: data }));
    } catch (err) {
      setError("Failed to fetch episodes");
      console.error("Error fetching episodes:", err);
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
    setImagePreview(`http://37.60.235.197:8080${series.imagePath}`);
    setFormErrors({});
  };

  const handleEditEpisodeClick = (episode) => {
    setEditEpisode(episode);
    setFormData({
      title: episode.title,
      episodeNumber: episode.episodeNumber,
      videoUrl: episode.videoUrl,
      image: null,
    });
    setImagePreview(
      episode.imagePath ? `http://37.60.235.197:8080${episode.imagePath}` : null
    );
    setFormErrors({});
  };

  const handleDeleteSeries = async (seriesId) => {
    if (!window.confirm("Are you sure you want to delete this series?")) return;
    try {
      await deleteSeries(seriesId);
      setSeries((prev) => prev.filter((s) => s.id !== seriesId));
      setEpisodes((prev) => {
        const updated = { ...prev };
        delete updated[seriesId];
        return updated;
      });
      setExpandedSeries(null);
      setError(null);
      setSuccess("Series deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to delete series: " + (err.message || "Unknown error"));
      console.error("Error deleting series:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const validateForm = (isEpisode) => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (isEpisode) {
      if (!formData.episodeNumber)
        errors.episodeNumber = "Episode number is required";
      if (!formData.videoUrl.trim()) errors.videoUrl = "Video URL is required";
    } else {
      if (!formData.status) errors.status = "Status is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateSeries = async (e) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    const form = new FormData();
    form.append("title", formData.title);
    form.append("status", formData.status);
    if (formData.image) {
      form.append("image", formData.image);
    }

    try {
      const updatedSeries = await updateSeries(editSeries.id, form);
      setSeries((prev) =>
        prev.map((s) => (s.id === editSeries.id ? updatedSeries : s))
      );
      setEditSeries(null);
      setFormData({
        title: "",
        episodeNumber: "",
        videoUrl: "",
        image: null,
        status: "",
      });
      setImagePreview(null);
      setError(null);
      setSuccess("Series updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to update series: " + (err.message || "Unknown error"));
      console.error("Error updating series:", err);
    }
  };

  const handleUpdateEpisode = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    const form = new FormData();
    form.append("title", formData.title);
    form.append("episodeNumber", formData.episodeNumber);
    form.append("videoUrl", formData.videoUrl);
    if (formData.image) {
      form.append("image", formData.image);
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
      setFormData({
        title: "",
        episodeNumber: "",
        videoUrl: "",
        image: null,
        status: "",
      });
      setImagePreview(null);
      setError(null);
      setSuccess("Episode updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to update episode: " + (err.message || "Unknown error"));
      console.error("Error updating episode:", err);
    }
  };

  const handleDeleteEpisode = async (episodeId, seriesId) => {
    if (!window.confirm("Are you sure you want to delete this episode?"))
      return;
    try {
      await deleteEpisode(episodeId);
      setEpisodes((prev) => ({
        ...prev,
        [seriesId]: prev[seriesId].filter((ep) => ep.id !== episodeId),
      }));
      setError(null);
      setSuccess("Episode deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to delete episode: " + (err.message || "Unknown error"));
      console.error("Error deleting episode:", err);
    }
  };

  const handleAddEpisode = async (e, seriesId) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    const form = new FormData();
    form.append("title", formData.title);
    form.append("episodeNumber", formData.episodeNumber);
    form.append("videoUrl", formData.videoUrl);
    if (formData.image) {
      form.append("image", formData.image);
    }

    try {
      const newEpisode = await createEpisode(seriesId, form);
      setEpisodes((prev) => ({
        ...prev,
        [seriesId]: [...(prev[seriesId] || []), newEpisode],
      }));
      setFormData({
        title: "",
        episodeNumber: "",
        videoUrl: "",
        image: null,
        status: "",
      });
      setImagePreview(null);
      setError(null);
      setSuccess("Episode added successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to add episode: " + (err.message || "Unknown error"));
      console.error("Error adding episode:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="ml-0 md:ml-64 p-4 min-h-screen bg-[#0f111a] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-8 w-8 text-[#0288D1]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
            ></path>
          </svg>
          <p className="text-[#fdfdfd] text-lg mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-0 md:ml-64 p-6 min-h-screen bg-[#0f111a]">
      <h1 className="text-4xl font-bold mb-8 text-center text-[#fdfdfd] tracking-tight">
        Kinolar Ro'yxati
      </h1>
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6 text-center animate-fade-in">
          {success}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {series.map((s) => (
          <div
            key={s.id}
            className="bg-white shadow-lg rounded-xl overflow-hidden transform transition hover:shadow-2xl"
          >
            <img
              src={`http://37.60.235.197:8080${s.imagePath}`}
              alt={s.title}
              className="w-full h-48 object-contain cursor-pointer"
              onClick={() => handleSeriesClick(s.id)}
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-[#2E2F2F] truncate">
                {s.title}
              </h2>
              <p className="text-[#757575] text-sm mt-1">{s.status}</p>
              <div className="mt-3 flex space-x-3">
                <button
                  onClick={() => handleEditSeriesClick(s)}
                  className="text-[#0288D1] hover:text-[#01579B] font-medium transition-colors relative group"
                  aria-label={`Edit series ${s.title}`}
                >
                  Edit
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit Series
                  </span>
                </button>
                <button
                  onClick={() => handleDeleteSeries(s.id)}
                  className="text-[#D32F2F] hover:text-[#B71C1C] font-medium transition-colors relative group"
                  aria-label={`Delete series ${s.title}`}
                >
                  Delete
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Delete Series
                  </span>
                </button>
              </div>
              {expandedSeries === s.id && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-[#2E2F2F] mb-2">
                    Episodes:
                  </h3>
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
                    <p className="text-[#757575] text-sm">
                      No episodes available
                    </p>
                  )}
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-[#2E2F2F] mb-2">
                      Add New Episode
                    </h4>
                    <form
                      onSubmit={(e) => handleAddEpisode(e, s.id)}
                      className="space-y-3"
                    >
                      <div>
                        <label
                          htmlFor="episode-title"
                          className="block text-sm font-medium text-[#2E2F2F]"
                        >
                          Episode Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="episode-title"
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Enter episode title"
                          className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#0288D1] focus:outline-none ${
                            formErrors.title
                              ? "border-red-500"
                              : "border-[#B0BEC5]"
                          }`}
                          aria-required="true"
                        />
                        {formErrors.title && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.title}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="episode-number"
                          className="block text-sm font-medium text-[#2E2F2F]"
                        >
                          Episode Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="episode-number"
                          type="number"
                          name="episodeNumber"
                          value={formData.episodeNumber}
                          onChange={handleInputChange}
                          placeholder="Enter episode number"
                          className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#0288D1] focus:outline-none ${
                            formErrors.episodeNumber
                              ? "border-red-500"
                              : "border-[#B0BEC5]"
                          }`}
                          aria-required="true"
                        />
                        {formErrors.episodeNumber && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.episodeNumber}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="video-url"
                          className="block text-sm font-medium text-[#2E2F2F]"
                        >
                          Video URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="video-url"
                          type="text"
                          name="videoUrl"
                          value={formData.videoUrl}
                          onChange={handleInputChange}
                          placeholder="Enter video URL"
                          className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#0288D1] focus:outline-none ${
                            formErrors.videoUrl
                              ? "border-red-500"
                              : "border-[#B0BEC5]"
                          }`}
                          aria-required="true"
                        />
                        {formErrors.videoUrl && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.videoUrl}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="episode-image"
                          className="block text-sm font-medium text-[#2E2F2F]"
                        >
                          Episode Image
                        </label>
                        <input
                          id="episode-image"
                          type="file"
                          name="image"
                          onChange={handleFileChange}
                          className="w-full p-2 border rounded-lg border-[#B0BEC5] text-[#2E2F2F]"
                          accept="image/*"
                        />
                        {imagePreview && (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="mt-2 w-full h-32 object-contain rounded-lg"
                          />
                        )}
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-[#0288D1] text-white px-4 py-2 rounded-lg hover:bg-[#01579B] transition-colors"
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
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby={
            editSeries ? "edit-series-title" : "edit-episode-title"
          }
          ref={modalRef}
        >
          <div className="bg-white p-6 rounded-xl w-full max-w-lg transform transition-all duration-300 scale-95">
            {editSeries ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2
                    id="edit-series-title"
                    className="text-xl font-semibold text-[#2E2F2F]"
                  >
                    Edit Series
                  </h2>
                  <button
                    onClick={() => {
                      setEditSeries(null);
                      setFormData({
                        title: "",
                        episodeNumber: "",
                        videoUrl: "",
                        image: null,
                        status: "",
                      });
                      setFormErrors({});
                      setImagePreview(null);
                    }}
                    className="text-[#757575] hover:text-[#2E2F2F] text-xl"
                    aria-label="Close modal"
                  >
                    &times;
                  </button>
                </div>
                {error && (
                  <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                <form onSubmit={handleUpdateSeries} className="space-y-4">
                  <div>
                    <label
                      htmlFor="series-title"
                      className="block text-sm font-medium text-[#2E2F2F]"
                    >
                      Series Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="series-title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter series title"
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#0288D1] focus:outline-none ${
                        formErrors.title ? "border-red-500" : "border-[#B0BEC5]"
                      }`}
                      aria-required="true"
                    />
                    {formErrors.title && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.title}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="series-status"
                      className="block text-sm font-medium text-[#2E2F2F]"
                    >
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="series-status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#0288D1] focus:outline-none ${
                        formErrors.status
                          ? "border-red-500"
                          : "border-[#B0BEC5]"
                      }`}
                      aria-required="true"
                    >
                      <option value="" disabled>
                        Select status
                      </option>
                      <option value="COMING_SOON">Tez kunda</option>
                      <option value="PUBLISHED">Efirda / Nashr etilgan</option>
                      <option value="UNLISTED">Yashirin</option>
                      <option value="ARCHIVED">Arxivlangan</option>
                      <option value="DRAFT">Qoralama</option>
                      <option value="REMOVED">O'chirilgan</option>
                    </select>
                    {formErrors.status && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.status}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="series-image"
                      className="block text-sm font-medium text-[#2E2F2F]"
                    >
                      Series Image
                    </label>
                    <input
                      id="series-image"
                      type="file"
                      name="image"
                      onChange={handleFileChange}
                      className="w-full p-2 border rounded-lg border-[#B0BEC5] text-[#2E2F2F]"
                      accept="image/*"
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mt-2 w-full h-32 object-contain rounded-lg"
                      />
                    )}
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditSeries(null);
                        setFormData({
                          title: "",
                          episodeNumber: "",
                          videoUrl: "",
                          image: null,
                          status: "",
                        });
                        setFormErrors({});
                        setImagePreview(null);
                      }}
                      className="bg-[#B0BEC5] text-white px-4 py-2 rounded-lg hover:bg-[#90A4AE] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#0288D1] text-white px-4 py-2 rounded-lg hover:bg-[#01579B] transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2
                    id="edit-episode-title"
                    className="text-xl font-semibold text-[#2E2F2F]"
                  >
                    Edit Episode
                  </h2>
                  <button
                    onClick={() => {
                      setEditEpisode(null);
                      setFormData({
                        title: "",
                        episodeNumber: "",
                        videoUrl: "",
                        image: null,
                        status: "",
                      });
                      setFormErrors({});
                      setImagePreview(null);
                    }}
                    className="text-[#757575] hover:text-[#2E2F2F] text-xl"
                    aria-label="Close modal"
                  >
                    &times;
                  </button>
                </div>
                {error && (
                  <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                <form onSubmit={handleUpdateEpisode} className="space-y-4">
                  <div>
                    <label
                      htmlFor="edit-episode-title"
                      className="block text-sm font-medium text-[#2E2F2F]"
                    >
                      Episode Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="edit-episode-title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter episode title"
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#0288D1] focus:outline-none ${
                        formErrors.title ? "border-red-500" : "border-[#B0BEC5]"
                      }`}
                      aria-required="true"
                    />
                    {formErrors.title && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.title}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="edit-episode-number"
                      className="block text-sm font-medium text-[#2E2F2F]"
                    >
                      Episode Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="edit-episode-number"
                      type="number"
                      name="episodeNumber"
                      value={formData.episodeNumber}
                      onChange={handleInputChange}
                      placeholder="Enter episode number"
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#0288D1] focus:outline-none ${
                        formErrors.episodeNumber
                          ? "border-red-500"
                          : "border-[#B0BEC5]"
                      }`}
                      aria-required="true"
                    />
                    {formErrors.episodeNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.episodeNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="edit-video-url"
                      className="block text-sm font-medium text-[#2E2F2F]"
                    >
                      Video URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="edit-video-url"
                      type="text"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleInputChange}
                      placeholder="Enter video URL"
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#0288D1] focus:outline-none ${
                        formErrors.videoUrl
                          ? "border-red-500"
                          : "border-[#B0BEC5]"
                      }`}
                      aria-required="true"
                    />
                    {formErrors.videoUrl && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.videoUrl}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="edit-episode-image"
                      className="block text-sm font-medium text-[#2E2F2F]"
                    >
                      Episode Image
                    </label>
                    <input
                      id="edit-episode-image"
                      type="file"
                      name="image"
                      onChange={handleFileChange}
                      className="w-full p-2 border rounded-lg border-[#B0BEC5] text-[#2E2F2F]"
                      accept="image/*"
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mt-2 w-full h-32 object-contain rounded-lg"
                      />
                    )}
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditEpisode(null);
                        setFormData({
                          title: "",
                          episodeNumber: "",
                          videoUrl: "",
                          image: null,
                          status: "",
                        });
                        setFormErrors({});
                        setImagePreview(null);
                      }}
                      className="bg-[#B0BEC5] text-white px-4 py-2 rounded-lg hover:bg-[#90A4AE] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#0288D1] text-white px-4 py-2 rounded-lg hover:bg-[#01579B] transition-colors"
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
