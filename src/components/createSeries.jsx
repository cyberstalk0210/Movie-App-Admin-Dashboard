import React, { useState } from "react";
import { createSeries } from "../services/api"; 

const CreateSeries = () => {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("COMING_SOON");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !image) {
      return setMessage("Barcha maydonlarni to‘ldiring.");
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("status", status);
      formData.append("image", image);

      const res = await createSeries(formData);
      setMessage(`Yangi series yaratildi. ID: ${res.id}`);
      setTitle("");
      setImage(null);
    } catch (error) {
      console.error(error);
      setMessage("Xatolik yuz berdi.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f111a] flex justify-center items-center p-6 ml-64">
      <div className="max-w-md w-full bg-[#1c1e2c] p-8 rounded-xl shadow-lg text-white">
        <h2 className="text-3xl font-bold mb-6 text-center tracking-tight">
          Yangi Series Yaratish
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Sarlavha:
            </label>
            <input
              type="text"
              className="w-full p-3 bg-[#0f111a] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Series nomini kiriting"
            />
          </div>

          {/* Status Select */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Holat:
            </label>
            <select
              className="w-full p-3 bg-[#0f111a] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
            <option value="COMING_SOON">Tez kunda</option>
            <option value="PUBLISHED">Efirda / Nashr etilgan</option>
            <option value="UNLISTED">Yashirin</option>
            <option value="ARCHIVED">Arxivlangan</option>
            <option value="DRAFT">Qoralama</option>
            <option value="REMOVED">O'chirilgan</option>
</select>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Rasm yuklash:
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                required
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center w-full p-3 bg-[#0f111a] border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition duration-200"
              >
                <span className="text-gray-300">
                  {image ? image.name : "Rasm tanlang"}
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
          >
            Saqlash
          </button>

          {/* Message */}
          {message && (
            <p
              className={`text-sm mt-4 text-center ${
                message.includes("Xatolik")
                  ? "text-red-400 animate-pulse"
                  : "text-green-400 animate-fade-in"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateSeries;