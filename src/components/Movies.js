import React, { useState, useEffect } from "react";
import { getMovies, createMovie, deleteMovie } from "../services/api";
import axios from "axios";

const Movies = () => {
  
  const [movies, setMovies] = useState([]);
  
  const [newMovie, setNewMovie] = useState({
    title: "",
    description: "",
    imageUrl: "",
    videoUrl: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const BUNNY_STORAGE_URL = "https://storage.bunnycdn.com/muhammadamin/"; // Storage Zone endpoint
  const BUNNY_API_KEY = "107dd695-481a-433e-9f21ccff5510-4096-473e"; // Storage API Key
  const BUNNY_CDN_URL = "https://Tarixiykino1.b-cdn.net/"; // Pull Zone URL

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const data = await getMovies();
      setMovies(data);
    } catch (err) {
      console.error("Filmlarni olishda xato:", err);
    }
  };

  const uploadToBunnyCDN = async (file, fileName) => {
    try {
      const response = await axios.put(
        `${BUNNY_STORAGE_URL}${fileName}`,
        file,
        {
          headers: {
            AccessKey: BUNNY_API_KEY,
            "Content-Type": file.type,
          },
        }
      );

      if (response.status === 200) {
        console.log("Yuklandi:", `${BUNNY_CDN_URL}${fileName}`);
        return `${BUNNY_CDN_URL}${fileName}`;
      }
      throw new Error("Fayl yuklashda xato");
    } catch (error) {
      console.error("BunnyCDN yuklash xatosi:", error);
      throw new Error("Faylni BunnyCDN’ga yuklashda xato");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      let updatedMovie = { ...newMovie };

      if (imageFile) {
        const imageFileName = `images/${Date.now()}_${imageFile.name}`;
        updatedMovie.imageUrl = await uploadToBunnyCDN(
          imageFile,
          imageFileName
        );
      }

      if (videoFile) {
        const videoFileName = `videos/${Date.now()}_${videoFile.name}`;
        updatedMovie.videoUrl = await uploadToBunnyCDN(
          videoFile,
          videoFileName
        );
      }

      console.log("Backendga yuborilayotgan ma'lumot:", updatedMovie);
      await createMovie(updatedMovie);
      setNewMovie({ title: "", description: "", imageUrl: "", videoUrl: "" });
      setImageFile(null);
      setVideoFile(null);
      fetchMovies();
    } catch (err) {
      console.error("Film qo‘shishda xato:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMovie(id);
      fetchMovies();
    } catch (err) {
      console.error("Film o‘chirishda xato:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-semibold mb-6">Add new item</h1>
      <form onSubmit={handleCreate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cover Image Upload */}
          <div className="md:col-span-1">
            <div className="bg-gray-800 p-4 rounded-lg text-center h-64 flex items-center justify-center">
              <label className="cursor-pointer">
                <span className="text-gray-400">Upload cover (190 x 270)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Title and Description */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <label className="block text-gray-400 mb-2">Title</label>
              <input
                type="text"
                value={newMovie.title}
                onChange={(e) =>
                  setNewMovie({ ...newMovie, title: e.target.value })
                }
                className="w-full p-2 bg-gray-700 rounded-lg"
                placeholder="Enter title"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Description</label>
              <textarea
                value={newMovie.description}
                onChange={(e) =>
                  setNewMovie({ ...newMovie, description: e.target.value })
                }
                className="w-full p-2 bg-gray-700 rounded-lg h-24"
                placeholder="Enter description"
                required
              />
            </div>
          </div>
        </div>

        {/* Video Upload */}
        <div>
          <label className="block text-gray-400 mb-2">Upload video</label>
          <div className="flex space-x-4">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="w-full p-2 bg-gray-700 rounded-lg"
            />
            <span className="text-gray-400">or</span>
            <input
              type="text"
              value={newMovie.videoUrl}
              onChange={(e) =>
                setNewMovie({ ...newMovie, videoUrl: e.target.value })
              }
              placeholder="or add a link"
              className="w-full p-2 bg-gray-700 rounded-lg"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700"
          >
            PUBLISH
          </button>
        </div>
      </form>

      {/* Movie List */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Filmlar</h2>
        <ul className="space-y-4">
          {movies.map((movie) => (
            <li
              key={movie.id}
              className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <span>
                  {movie.title} - {movie.description}
                </span>
                {movie.imageUrl && (
                  <img
                    src={movie.imageUrl}
                    alt={movie.title}
                    className="w-16 h-24 object-cover ml-4"
                  />
                )}
                {movie.videoUrl && (
                  <a
                    href={movie.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 ml-4"
                  >
                    Videoni ko‘rish
                  </a>
                )}
              </div>
              <button
                onClick={() => handleDelete(movie.id)}
                className="px-3 py-1 bg-red-600 rounded-lg text-white hover:bg-red-700"
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
