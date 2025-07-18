import React, { useState, useEffect } from 'react';
import {
  getBanners,
  getSeries,
  addBanner,
  updateBanner,
  deleteBanner
} from '../services/api';

const BannerComponent = () => {
  const [banners, setBanners] = useState([]);
  const [series, setSeries] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    image: null,
    imageUrl: '',
    seriesId: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchBanners();
    fetchSeries();
  }, []);

  const fetchBanners = async () => {
    try {
      const data = await getBanners();
      setBanners(data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const fetchSeries = async () => {
    try {
      const data = await getSeries();
      setSeries(data);
    } catch (error) {
      console.error('Error fetching series:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'imageUrl') setPreviewUrl(value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
    setPreviewUrl(URL.createObjectURL(file));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (!formData.seriesId) return alert('Series tanlang');

    if (!formData.image && !isEditing) {
      return alert('Iltimos, rasm yuklang');
    }

    if (isEditing) {
      if (!formData.image) {
        return alert("Iltimos, yangi rasm tanlang");
      }
      await updateBanner(formData.id, formData.image, formData.seriesId);
    alert('Banner yangilandi!');
    } else {
      await addBanner(formData.seriesId, formData.image);
      alert('Banner yaratildi!');
    }

    resetForm();
    fetchBanners();
  } catch (error) {
    console.error('Error saving banner:', error);
    alert(error?.response?.data?.message || 'Xatolik yuz berdi');
  }
};


  const handleEdit = (banner) => {
    setFormData({
      id: banner.id,
      image: null,
      imageUrl: banner.image,
      seriesId: banner.series.id
    });
    setPreviewUrl(banner.image);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, seriesId) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteBanner(id, seriesId);
        fetchBanners();
        alert('Banner deleted!');
      } catch (error) {
        console.error('Error deleting banner:', error);
        alert(error?.message || 'Error deleting banner');
      }
    }
  };

  const resetForm = () => {
    setFormData({ id: null, image: null, imageUrl: '', seriesId: '' });
    setPreviewUrl(null);
    setIsEditing(false);
  };

  return (
    <div className="ml-64 p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{isEditing ? 'Edit Banner' : 'Create Banner'}</h1>
          <p className="text-gray-600">Upload and link banners to a series</p>
        </div>

        {/* Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-10">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Series</label>
              <select
                name="seriesId"
                value={formData.seriesId}
                onChange={handleInputChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-200"
                required
              >
                <option value="">-- Select a series --</option>
                {series.map((s) => (
                  <option key={s.id} value={s.id}>
                    {`${s.title}` || `Series ${s.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
  <label className="block text-sm font-medium mb-1">
    {isEditing ? 'Upload New Image' : 'Upload Image'}
  </label>
  <input
    type="file"
    name="image"
    onChange={handleFileChange}
    accept="image/*"
    className="block w-full text-sm file:py-2 file:px-4 file:rounded-md file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
    required={!isEditing}
  />
</div>

            {previewUrl && (
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Preview</label>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-64 object-contain rounded-md border"
                />
              </div>
            )}

            <div className="col-span-2 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {isEditing ? 'Update' : 'Create'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Banner List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Existing Banners</h2>
          {banners.length === 0 ? (
            <p className="text-gray-500">No banners available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="border rounded-lg p-4 bg-gray-50 hover:shadow-lg transition"
                >
                  <img
                    src={"http://37.60.235.197:8080"+banner.image}
                    alt="Banner"
                    className="w-full h-40 object-cover rounded-md mb-2"
                  />
                  <p className="text-sm text-gray-700 font-medium">
                    Series: {banner.series?.name || `Series ${banner.series?.id}`}
                  </p>
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id, banner.series.id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerComponent;
