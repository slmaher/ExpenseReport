import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const ManageUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [role, setRole] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.get(`${API_URL}/users`)
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
  }, [API_URL]);

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setRole(user.role);
  };

  const handleSave = async (userId) => {
    try {
      await axios.put(`${API_URL}/users/${userId}/role`, { role });
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
      setEditingUserId(null);
    } catch {
      alert(t("manageUsers.saveFailed"));
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{t("manageUsers.title")}</h2>
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4">{t("manageUsers.tableHeaders.name")}</th>
            <th className="py-2 px-4">{t("manageUsers.tableHeaders.email")}</th>
            <th className="py-2 px-4">{t("manageUsers.tableHeaders.role")}</th>
            <th className="py-2 px-4">{t("manageUsers.tableHeaders.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="py-2 px-4">{user.name}</td>
              <td className="py-2 px-4">{user.email}</td>
              <td className="py-2 px-4">
                {editingUserId === user.id ? (
                  <select value={role} onChange={e => setRole(e.target.value)} className="border rounded px-2 py-1">
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                ) : (
                  user.role
                )}
              </td>
              <td className="py-2 px-4">
                {editingUserId === user.id ? (
                  <button className="btn btn-primary mr-2" onClick={() => handleSave(user.id)}>{t("manageUsers.save")}</button>
                ) : (
                  <button className="btn btn-secondary" onClick={() => handleEdit(user)}>{t("manageUsers.edit")}</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;
