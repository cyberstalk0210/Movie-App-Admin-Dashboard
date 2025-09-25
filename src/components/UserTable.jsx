import React, { useState, useEffect } from "react";
import { 
  getAllUsers, 
  getAllSeries, 
  getAllUsersWithAccess, 
  updateUser, 
  updateUserAccess 
} from "../services/api";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: "", email: "", subscription: false });
  const [seriesList, setSeriesList] = useState([]);
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [userAccessMap, setUserAccessMap] = useState({});
  const [selectedSeries, setSelectedSeries] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData);
        setFilteredUsers(usersData);

        const seriesData = await getAllSeries();
        setSeriesList(seriesData);

        const accessDataRaw = await getAllUsersWithAccess();
        // { userId: [ {id, title}, {id, title} ] }
        console.log(accessDataRaw);
        
        const accessMap = {};
        Object.keys(accessDataRaw).forEach((userId) => {
          accessMap[userId] = new Set(accessDataRaw[userId].map((s) => s.id));
        });
        setUserAccessMap(accessMap);
      } catch (e) {
        setError("Ma'lumotlarni olishda xatolik: " + e);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      subscription: user.subscription,
    });
    setSelectedSeries(() => {
      const accessSet = userAccessMap[user.id];
      return accessSet ? new Set(accessSet) : new Set();
    });
    setModalSearchTerm("");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSeriesToggle = (seriesId) => {
    setSelectedSeries(prev => {
      const updated = new Set(prev);
      if (updated.has(seriesId)) updated.delete(seriesId);
      else updated.add(seriesId);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.username || !editForm.email) {
      setError("Username va email kiritilishi shart.");
      return;
    }
    try {
      const updatedUser = await updateUser(editingUser.id, editForm);
      const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      ));

      await updateUserAccess(updatedUser.id, Array.from(selectedSeries));

      setUserAccessMap(prev => ({
        ...prev,
        [updatedUser.id]: new Set(selectedSeries)
      }));

      setEditingUser(null);
      setEditForm({ username: "", email: "", subscription: false });
      setSelectedSeries(new Set());
      setError("");
    } catch (err) {
      setError("Foydalanuvchini yangilashda xatolik: " + err);
    }
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setEditForm({ username: "", email: "", subscription: false });
    setModalSearchTerm("");
    setSelectedSeries(new Set());
    setError("");
  };

  const filteredSeries = seriesList.filter(s =>
    s.title.toLowerCase().includes(modalSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f111a] p-6 ml-64 flex justify-center">
      <div className="max-w-5xl w-full">
        <h1 className="text-3xl font-bold text-white mb-8 text-center tracking-tight">
          Foydalanuvchilar Ro‘yxati
        </h1>
        {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-lg mb-6 text-center animate-pulse">{error}</p>}

        <input
          type="text"
          placeholder="Username yoki email bo‘yicha qidirish..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-3 bg-[#1c1e2c] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mb-6"
        />

        <div className="bg-[#1c1e2c] rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full text-left text-white">
            <thead>
              <tr className="bg-[#2a2c3e]">
                <th className="p-4 text-sm font-medium text-gray-300">ID</th>
                <th className="p-4 text-sm font-medium text-gray-300">Username</th>
                <th className="p-4 text-sm font-medium text-gray-300">Email</th>
                <th className="p-4 text-sm font-medium text-gray-300">Obuna</th>
                <th className="p-4 text-sm font-medium text-gray-300">Serial Access</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr
                  key={user.id}
                  className="border-t border-gray-600 hover:bg-[#2a2c3e] cursor-pointer transition duration-200"
                  onClick={() => handleEditClick(user)}
                >
                  <td className="p-4 text-sm">{user.id}</td>
                  <td className="p-4 text-sm">{user.username}</td>
                  <td className="p-4 text-sm">{user.email}</td>
                  <td className="p-4 text-sm">{user.subscription ? "Ha" : "Yo‘q"}</td>
                  <td className="p-4 text-sm flex flex-wrap gap-1">
                    {userAccessMap[user.id] && userAccessMap[user.id].size > 0 ? (
                      Array.from(userAccessMap[user.id]).map((sid) => {
                        const s = seriesList.find((sr) => sr.id === sid);
                        return (
                          <span
                            key={sid}
                            className="px-2 py-1 text-xs rounded-lg bg-blue-600 text-white"
                          >
                            {s ? s.title : `ID:${sid}`}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-gray-400 italic">Yo‘q</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="max-w-md w-full bg-[#1c1e2c] p-6 rounded-xl shadow-2xl text-white">
              <h2 className="text-2xl font-bold mb-4 text-center tracking-tight">Foydalanuvchini Tahrirlash</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-[#0f111a] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Username"
                />
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-[#0f111a] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email"
                />
                <div className="flex items-center space-x-2">
                  <input type="checkbox" name="subscription" checked={editForm.subscription} onChange={handleInputChange} className="h-4 w-4 text-blue-600 rounded border-gray-600"/>
                  <span>Obuna</span>
                </div>

                <input
                  type="text"
                  placeholder="Serial qidirish..."
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  className="w-full p-2 bg-[#0f111a] border border-gray-600 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ul className="max-h-40 overflow-y-auto border border-gray-600 rounded-lg p-2 bg-[#1c1e2c]">
                  {filteredSeries.length > 0 ? (
                    filteredSeries.map(s => (
                      <li key={s.id} className="p-1 border-b border-gray-700 last:border-none flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSeries.has(s.id)}
                          onChange={() => handleSeriesToggle(s.id)}
                          className="mr-2"
                        />
                        {s.title}
                      </li>
                    ))
                  ) : <li className="text-gray-400">Hech qanday serial yo‘q</li>}
                </ul>

                <div className="flex justify-end space-x-2 mt-4">
                  <button type="button" onClick={handleCloseModal} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg">Bekor qilish</button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">Saqlash</button>
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
