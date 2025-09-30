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
  
  // Obuna kunlari (umumiy obuna uchun)
  const [subscriptionDays, setSubscriptionDays] = useState(30); 
  // Har bir serial uchun kirish muddatini saqlash uchun Map
  const [seriesAccessDays, setSeriesAccessDays] = useState({}); 


  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData);
        setFilteredUsers(usersData);

        const seriesData = await getAllSeries();
        setSeriesList(seriesData);

        const accessDataRaw = await getAllUsersWithAccess(); 
        
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
    
    setSubscriptionDays(user.subscription ? 30 : 30); 

    const accessSet = userAccessMap[user.id] || new Set();
    const initialDays = {};
    
    // Obuna bo'lmasa va kirish huquqi mavjud bo'lsa default 30 kun beriladi (UI uchun)
    seriesList.forEach(s => {
        initialDays[s.id] = accessSet.has(s.id) && !user.subscription ? 30 : 0; 
    });
    setSeriesAccessDays(initialDays);

    setSelectedSeries(accessSet);
    setModalSearchTerm("");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => {
      const newState = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      
      if (name === 'subscription') {
        if (checked) {
          // Obuna YOQILSA: Hamma serialni tanlab, kunlarni 30 ga sozlash (ASL MANTIQ)
          setSelectedSeries(new Set(seriesList.map(s => s.id)));
          const allDays = {};
          seriesList.forEach(s => allDays[s.id] = 30);
          setSeriesAccessDays(allDays);
          setSubscriptionDays(30); 
        } else {
          // Obuna O'CHIRILSA: Hamma serialni tanlovdan chiqarish va kunlarni 0 qilish (ASL MANTIQ)
          setSelectedSeries(new Set());
          setSeriesAccessDays({});
          setSubscriptionDays(0); 
        }
      }
      return newState;
    });
  };
  
  // METOD: Umumiy obuna tugmalari uchun
  const handleSubscriptionButton = (days) => {
    setSubscriptionDays(days);
    
    if (editForm.subscription) {
         setSelectedSeries(new Set(seriesList.map(s => s.id)));
    }
  }
  
  // METOD: Alohida serial tugmalari uchun
  const handleIndividualSeriesDaysButton = (seriesId, days) => {
    const validDays = days;
    
    setSeriesAccessDays(prev => ({
      ...prev,
      [seriesId]: validDays,
    }));
    
    // Tugma bosilganda serialni avtomatik tanlash
    setSelectedSeries(prev => {
        const updated = new Set(prev);
        if (validDays > 0) {
            updated.add(seriesId);
        } else {
            updated.delete(seriesId);
        }
        return updated;
    });
  };

  const handleIndividualSeriesDaysChange = (seriesId, days) => {
    const daysInt = parseInt(days, 10);
    const validDays = isNaN(daysInt) || daysInt < 0 ? 0 : daysInt;
    
    setSeriesAccessDays(prev => ({
      ...prev,
      [seriesId]: validDays,
    }));
    
    setSelectedSeries(prev => {
        const updated = new Set(prev);
        if (validDays > 0) {
            updated.add(seriesId);
        } else {
            updated.delete(seriesId);
        }
        return updated;
    });
  };

  const handleSeriesToggle = (seriesId) => {
    // Obuna yoqiq bo'lsa o'chiramiz
    if (editForm.subscription) return;
    
    setSelectedSeries(prev => {
      const updated = new Set(prev);
      if (updated.has(seriesId)) {
          updated.delete(seriesId);
          setSeriesAccessDays(d => ({...d, [seriesId]: 0})); 
      }
      else {
          updated.add(seriesId);
          // Faqat checkbox tanlansa 30 kun beriladi
          setSeriesAccessDays(d => ({...d, [seriesId]: 30})); 
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.username || !editForm.email) {
      setError("Username va email kiritilishi shart.");
      return;
    }
    if (editForm.subscription && (!subscriptionDays || subscriptionDays <= 0)) {
       setError("Obuna uchun kunlar soni tanlanishi shart.");
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
      
      const seriesAccessMap = {};
      if (!editForm.subscription) {
        Array.from(selectedSeries).forEach(seriesId => {
            const days = seriesAccessDays[seriesId] || 0;
            if (days > 0) {
              seriesAccessMap[seriesId] = days;
            }
        });
      }

      const accessPayload = {
        seriesAccessMap: seriesAccessMap,
        subscription: editForm.subscription,
        subscriptionDays: editForm.subscription ? subscriptionDays : 0,
      }
      
      await updateUserAccess(updatedUser.id, accessPayload); 

      setUserAccessMap(prev => ({
        ...prev,
        [updatedUser.id]: new Set(selectedSeries)
      }));

      // Reset
      setEditingUser(null);
      setEditForm({ username: "", email: "", subscription: false });
      setSelectedSeries(new Set());
      setSubscriptionDays(30); 
      setSeriesAccessDays({});
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
    setSubscriptionDays(30);
    setSeriesAccessDays({});
    setError("");
  };
  
  // --- Yangi funksiyalar (Obuna/Barchasiga obuna tugmalari uchun) ---
  const handleSubscribeUser = async (user, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      const updated = await updateUser(user.id, { username: user.username, email: user.email, subscription: true });
      setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
      setFilteredUsers(prev => prev.map(u => u.id === user.id ? updated : u));
      // Faqat subscription holatini o'zgartirish, accessga tegmaslik.
      setError("");
    } catch (err) {
      setError("Obuna qilishda xatolik: " + (err?.message || err));
    }
  };

  const handleUnsubscribeUser = async (user, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      const updated = await updateUser(user.id, { username: user.username, email: user.email, subscription: false });
      setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
      setFilteredUsers(prev => prev.map(u => u.id === user.id ? updated : u));
      setError("");
    } catch (err) {
      setError("Obunani bekor qilishda xatolik: " + (err?.message || err));
    }
  };

  const handleSubscribeAllSeries = async (user, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      const map = {};
      seriesList.forEach(s => { map[s.id] = 30; });
      const payload = {
        seriesAccessMap: map,
        subscription: user.subscription, 
        subscriptionDays: user.subscription ? 30 : 0 
      };
      await updateUserAccess(user.id, payload);
      setUserAccessMap(prev => ({ ...prev, [user.id]: new Set(seriesList.map(s => s.id)) }));
      setError("");
    } catch (err) {
      setError("Barchasiga obuna qilishda xatolik: " + (err?.message || err));
    }
  };

  const handleUnsubscribeAllSeries = async (user, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      const payload = {
        seriesAccessMap: {},   
        subscription: user.subscription,
        subscriptionDays: user.subscription ? 30 : 0
      };
      await updateUserAccess(user.id, payload);
      setUserAccessMap(prev => ({ ...prev, [user.id]: new Set() }));
      setError("");
    } catch (err) {
      setError("Barchasidan chiqarishda xatolik: " + (err?.message || err));
    }
  };
  // -----------------------------------------------------------------


  const filteredSeries = seriesList.filter(s =>
    s.title.toLowerCase().includes(modalSearchTerm.toLowerCase())
  );

  // Umumiy Obuna tugmasi komponenti
  const SubscriptionButton = ({ days, label }) => (
    <button
      type="button"
      onClick={() => handleSubscriptionButton(days)}
      className={`px-3 py-1 rounded-lg text-sm transition duration-200 
        ${subscriptionDays === days && editForm.subscription 
          ? 'bg-green-600 text-white shadow-lg border-green-400' 
          : 'bg-[#0f111a] text-gray-300 hover:bg-[#2a2c3e] border border-gray-600'
        }
      `}
      disabled={!editForm.subscription}
    >
      {label}
    </button>
  );

  // Alohida Serial tugmasi komponenti
  const IndividualAccessButton = ({ seriesId, days, label }) => {
    const currentDays = seriesAccessDays[seriesId] || 0;
    const isSelected = selectedSeries.has(seriesId);
    
    return (
        <button
            type="button"
            onClick={() => handleIndividualSeriesDaysButton(seriesId, days)}
            className={`px-2 py-1 rounded-lg text-xs transition duration-200 w-1/3 min-w-[70px]
            ${currentDays === days && isSelected
              ? 'bg-purple-600 text-white shadow-lg border-purple-400' 
              : 'bg-[#0f111a] text-gray-400 hover:bg-[#2a2c3e] border border-gray-600'
            }
            `}
        >
            {label}
        </button>
    );
  };
  
  return (
    // Responsive: Kichik ekranlarda padding ishlatildi, katta ekranlarda lg:ml-64 saqlanib qoldi
    <div className="min-h-screen bg-[#0f111a] p-4 sm:p-6 lg:p-8 lg:ml-64 flex justify-center">
      <div className="max-w-7xl w-full">
        <h1 className="text-3xl font-bold text-white mb-6 sm:mb-8 text-center tracking-tight">
          Foydalanuvchilar Ro‘yxati 🎬
        </h1>
        {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-lg mb-6 text-center animate-pulse shadow-xl border border-red-400">{error}</p>}

        {/* Qidiruv */}
        <input
          type="text"
          placeholder="Username yoki email bo‘yicha qidirish..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-3 bg-[#1c1e2c] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mb-6 shadow-xl"
        />

        {/* Jadval */}
        <div className="bg-[#1c1e2c] rounded-xl shadow-2xl overflow-x-auto">
          <table className="min-w-full text-left text-white divide-y divide-gray-700">
            <thead>
              <tr className="bg-[#2a2c3e]">
                <th className="p-3 text-xs sm:text-sm font-medium text-gray-300">ID</th>
                <th className="p-3 text-xs sm:text-sm font-medium text-gray-300">Username</th>
                <th className="p-3 text-xs sm:text-sm font-medium text-gray-300 hidden md:table-cell">Email</th>
                <th className="p-3 text-xs sm:text-sm font-medium text-gray-300">Obuna</th>
                <th className="p-3 text-xs sm:text-sm font-medium text-gray-300">Boshqaruv & Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.map(user => (
                <tr
                  key={user.id}
                  className="hover:bg-[#2a2c3e] transition duration-200"
                  onClick={() => handleEditClick(user)}
                >
                  <td className="p-3 text-xs sm:text-sm text-gray-400">{user.id}</td>
                  <td className="p-3 text-xs sm:text-sm font-medium">{user.username}</td>
                  <td className="p-3 text-xs sm:text-sm hidden md:table-cell text-gray-300">{user.email}</td>
                  <td className="p-3 text-xs sm:text-sm">
                    {user.subscription ? 
                        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">Ha</span> : 
                        <span className="px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 text-xs font-semibold">Yo‘q</span>
                    }
                  </td>
                  <td className="p-3 text-sm flex flex-col gap-2">
                    {/* Access ko'rinishi */}
                    <div className="flex flex-wrap gap-1">
                      {userAccessMap[user.id] && userAccessMap[user.id].size > 0 ? (
                        Array.from(userAccessMap[user.id]).slice(0, 3).map((sid) => { 
                          const s = seriesList.find((sr) => sr.id === sid);
                          return (
                            <span
                              key={sid}
                              className="px-2 py-1 text-xs rounded-full bg-blue-600/50 text-white font-medium"
                              title={user.subscription ? 'Obuna orqali' : 'Individual'}
                            >
                              {s ? s.title : `ID:${sid}`}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-gray-400 italic text-xs">Kirish huquqi yo‘q</span>
                      )}
                      {userAccessMap[user.id] && userAccessMap[user.id].size > 3 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-600/30 text-white">
                            +{userAccessMap[user.id].size - 3}
                          </span>
                      )}
                    </div>

                    {/* Boshqaruv tugmalari - Ko'proq moslashuvchan (flex-wrap va kichik o'lchamlar) */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <button
                        onClick={(e) => handleSubscribeUser(user, e)}
                        className="px-2 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 shadow-sm"
                        disabled={user.subscription}
                      >
                        Obuna
                      </button>

                      <button
                        onClick={(e) => handleUnsubscribeUser(user, e)}
                        className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white transition duration-200 shadow-sm"
                        disabled={!user.subscription}
                      >
                        Obunani bekor qilish
                      </button>

                      <button
                        onClick={(e) => handleSubscribeAllSeries(user, e)}
                        className="px-2 py-1 text-xs rounded bg-green-600 hover:bg-green-700 text-white transition duration-200 shadow-sm"
                      >
                        Barchasiga obuna
                      </button>

                      <button
                        onClick={(e) => handleUnsubscribeAllSeries(user, e)}
                        className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white transition duration-200 shadow-sm"
                      >
                        Barchasidan chiqarish
                      </button>
                    </div>
                    {/* ----------------------------------------------------------- */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {editingUser && (
          // Responsive: Kichik ekranlarda to'liq kenglik/balandlik, katta ekranlarda max-width
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 sm:p-8 overflow-y-auto">
            <div className="w-full max-w-lg bg-[#1c1e2c] p-6 rounded-xl shadow-2xl text-white my-8 border border-gray-700">
              <h2 className="text-2xl font-bold mb-5 text-center tracking-tight text-blue-400">Foydalanuvchini Tahrirlash</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-[#0f111a] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                  placeholder="Username"
                />
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-[#0f111a] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                  placeholder="Email"
                />
                
                {/* 1. Umumiy Obuna Tanlovi */}
                <div className="border border-gray-600 rounded-lg p-4 space-y-3 bg-[#0f111a] shadow-md">
                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        name="subscription" 
                        checked={editForm.subscription} 
                        onChange={handleInputChange} 
                        className="h-5 w-5 text-blue-600 rounded border-gray-600 bg-[#1c1e2c] focus:ring-blue-500"
                      />
                      <span className="text-lg font-semibold text-green-400">Barcha seriallarga obuna</span>
                    </div>

                    {editForm.subscription && (
                        <div className="flex flex-col space-y-2 pt-2">
                            <label className="text-sm text-gray-400">Obuna muddatini tanlang:</label>
                            <div className="flex flex-wrap gap-2">
                                <SubscriptionButton days={7} label="1 Haftalik" />
                                <SubscriptionButton days={30} label="1 Oylik" />
                                <SubscriptionButton days={90} label="3 Oylik" />
                                <span className="p-2 text-sm bg-[#1c1e2c] border border-gray-500 rounded-lg flex items-center font-bold text-yellow-400 min-w-[70px] justify-center">
                                    {subscriptionDays} Kun
                                </span>
                            </div>
                        </div>
                    )}
                </div>


                <p className="text-sm text-gray-400 italic bg-[#1c1e2c] p-3 rounded-lg border border-gray-700">
                  {editForm.subscription 
                    ? `Obuna tanlangan. Barcha ${subscriptionDays} kun muddatga kirish beriladi. Individual serial tanlash o‘chiq.` 
                    : "Obuna o'chiq. Seriallarni qo‘lda tanlang va kirish kunini belgilang."
                  }
                </p>

                {/* Serial qidirish inputi */}
                <input
                  type="text"
                  placeholder="Serial qidirish..."
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  className="w-full p-3 bg-[#0f111a] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
                />
                
                {/* 2. Serial tanlash ro'yxati (Individual Access) */}
                <div className="max-h-60 overflow-y-auto border border-gray-600 rounded-lg p-2 bg-[#2a2c3e] shadow-inner">
                  {filteredSeries.length > 0 ? (
                    filteredSeries.map(s => (
                      <div 
                        key={s.id} 
                        className="p-3 border-b border-gray-700 last:border-none flex flex-col space-y-3 transition duration-150 hover:bg-[#3b3d52] rounded-md"
                      >
                        {/* Checkbox va Title */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center w-full">
                                <input
                                    type="checkbox"
                                    checked={selectedSeries.has(s.id)}
                                    onChange={() => handleSeriesToggle(s.id)}
                                    className="mr-3 h-5 w-5 text-blue-600 rounded border-gray-600 bg-[#0f111a] focus:ring-blue-500"
                                    disabled={editForm.subscription}
                                />
                                <span className={editForm.subscription ? 'text-gray-500 font-normal' : 'text-white font-medium text-base'}>
                                    {s.title}
                                </span>
                            </div>
                        </div>

                        {/* Kun tanlash tugmalari va input - Obuna bo'lmasa ko'rinadi */}
                        {!editForm.subscription && (
                            <div className="flex flex-col space-y-2 pl-8">
                                <div className="flex flex-wrap gap-2">
                                    <IndividualAccessButton seriesId={s.id} days={7} label="1 hafta" />
                                    <IndividualAccessButton seriesId={s.id} days={30} label="1 oy" />
                                    <IndividualAccessButton seriesId={s.id} days={90} label="3 oy" />
                                </div>
                                
                                <div className="flex items-center space-x-2 pt-1">
                                    <label className="text-xs text-gray-400 whitespace-nowrap w-1/3">Boshqa Kun:</label>
                                    <input
                                        type="number"
                                        value={seriesAccessDays[s.id] || 0}
                                        onChange={(e) => handleIndividualSeriesDaysChange(s.id, e.target.value)}
                                        min="0"
                                        placeholder="0"
                                        className={`w-2/3 p-1.5 bg-[#0f111a] border rounded-lg focus:outline-none focus:ring-2 text-right text-sm font-semibold 
                                            ${(seriesAccessDays[s.id] || 0) > 0 ? 'border-purple-500 text-purple-300 focus:ring-purple-500' : 'border-gray-600 focus:ring-blue-500 text-white'}
                                        `}
                                    />
                                </div>
                            </div>
                        )}
                      </div>
                    ))
                  ) : <div className="text-gray-400 p-3 text-center">Hech qanday serial topilmadi 😞</div>}
                </div>

                <div className="flex justify-end space-x-3 pt-5">
                  <button type="button" onClick={handleCloseModal} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition duration-200 shadow-lg font-medium">Bekor qilish</button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition duration-200 shadow-lg font-semibold">Saqlash</button>
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