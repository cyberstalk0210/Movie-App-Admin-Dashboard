import React, { useState, useEffect } from "react";
import { getAllUsers, updateUser } from "../services/api";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    subscription: false,
  });

  // Fetch users on mount
  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch((e) => setError("Foydalanuvchilarni olishda xato: " + e));
  }, []);

  // Set form data when editing a user
  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      subscription: user.subscription,
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission for editing
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editForm.username || !editForm.email) {
      setError("Username va email kiritilishi shart.");
      return;
    }

    try {
      const updatedUser = await updateUser(editingUser.id, {
        username: editForm.username,
        email: editForm.email,
        subscription: editForm.subscription,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
      setEditingUser(null);
      setEditForm({ username: "", email: "", subscription: false });
      setError("");
    } catch (err) {
      setError("Foydalanuvchini yangilashda xatolik: " + err);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setEditingUser(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#0f111a] p-6 ml-64 flex justify-center">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-white mb-8 text-center tracking-tight">
          Foydalanuvchilar Ro‘yxati
        </h1>
        {error && (
          <p className="text-red-400 bg-red-500/10 p-3 rounded-lg mb-6 text-center animate-pulse">
            {error}
          </p>
        )}

        {/* Users Table */}
        <div className="bg-[#1c1e2c] rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full text-left text-white">
            <thead>
              <tr className="bg-[#2a2c3e]">
                <th className="p-4 text-sm font-medium text-gray-300">ID</th>
                <th className="p-4 text-sm font-medium text-gray-300">Username</th>
                <th className="p-4 text-sm font-medium text-gray-300">Email</th>
                <th className="p-4 text-sm font-medium text-gray-300">Obuna</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-gray-600 hover:bg-[#2a2c3e] cursor-pointer transition duration-200"
                  onClick={() => handleEditClick(user)}
                >
                  <td className="p-4 text-sm">{user.id}</td>
                  <td className="p-4 text-sm">{user.username}</td>
                  <td className="p-4 text-sm">{user.email}</td>
                  <td className="p-4 text-sm">
                    {user.subscription ? "Ha" : "Yo‘q"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="max-w-md w-full bg-[#1c1e2c] p-8 rounded-xl shadow-lg text-white">
              <h2 className="text-2xl font-bold mb-6 text-center tracking-tight">
                Foydalanuvchini Tahrirlash
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Username:
                  </label>
                  <input
                    type="text"
                    name="username"
                    className="w-full p-3 bg-[#0f111a] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    value={editForm.username}
                    onChange={handleInputChange}
                    required
                    placeholder="Username kiriting"
                  />
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Email:
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full p-3 bg-[#0f111a] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    value={editForm.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Email kiriting"
                  />
                </div>

                {/* Subscription Checkbox */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-300">
                    <input
                      type="checkbox"
                      name="subscription"
                      checked={editForm.subscription}
                      onChange={handleInputChange}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                    />
                    Obuna
                  </label>
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
    </div>
  );
};

export default UsersTable;