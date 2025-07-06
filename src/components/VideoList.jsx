import React, { useState, useEffect } from "react";
import { getSeries, updateSeries } from "../services/api";

const VideoList = () => {
  const [seriesList, setSeriesList] = useState([]);
  const [error, setError] = useState("");
  const [editingSeries, setEditingSeries] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    status: "ACTIVE",
    image: null,
  });

  // Fetch series list on mount
  useEffect(() => {
    getSeries()
      .then(setSeriesList)
      .catch((e) => setError("Seriallarni olishda xato: " + e));
  }, []);

  // Set form data when editing a series
  const handleEditClick = (series) => {
    setEditingSeries(series);
    setEditForm({
      title: series.title,
      status: series.status,
      image: null, // Reset image to allow new upload
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setEditForm((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  // Handle form submission for editing
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editForm.title) {
      setError("Sarlavha kiritilishi shart.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", editForm.title);
      formData.append("status", editForm.status);
      if (editForm.image) {
        formData.append("image", editForm.image);
      }

      const updatedSeries = await updateSeries(editingSeries.id, formData);
      setSeriesList((prev) =>
        prev.map((s) => (s.id === updatedSeries.id ? updatedSeries : s))
      );
      setEditingSeries(null);
      setEditForm({ title: "", status: "ACTIVE", image: null });
      setError("");
    } catch (err) {
      setError("Serialni yangilashda xatolik: " + err);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setEditingSeries(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#0f111a] p-6 ml-64">
      <h1 className="text-3xl font-bold text-white mb-8 text-center tracking-tight">
        Seriallar Ro‘yxati
      </h1>
      {error && (
        <p className="text-red-400 bg-red-500/10 p-3 rounded-lg mb-6 text-center animate-pulse">
          {error}
        </p>
      )}

      {/* Series Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {seriesList.map((series) => (
          <div
            key={series.id}
            className="bg-[#1c1e2c] rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition duration-200 hover:scale-105 hover:shadow-xl"
            onClick={() => handleEditClick(series)}
          >
            <img
              src={series.image || "https://via.placeholder.com/300x200"}
              alt={series.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white truncate">
                {series.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingSeries && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-md w-full bg-[#1c1e2c] p-8 rounded-xl shadow-lg text-white">
            <h2 className="text-2xl font-bold mb-6 text-center tracking-tight">
              Serialni Tahrirlash
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Sarlavha:
                </label>
                <input
                  type="text"
                  name="title"
                  className="w-full p-3 bg-[#0f111a] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  value={editForm.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Serial nomini kiriting"
                />
              </div>

              {/* Status Select */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Holat:
                </label>
                <select
                  name="status"
                  className="w-full p-3 bg-[#0f111a] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  value={editForm.status}
                  onChange={handleInputChange}
                >
                  <option value="ACTIVE">Faol</option>
                  <option value="INACTIVE">Nofaol</option>
                </select>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Rasm yuklash (ixtiyoriy):
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full p-3 bg-[#0f111a] border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition duration-200"
                  >
                    <span className="text-gray-300">
                      {editForm.image ? editForm.image.name : "Rasm tanlang"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 transform hover:scale-105"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoList;