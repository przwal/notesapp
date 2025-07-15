import axios from "axios";


const api = axios.create({
  baseURL: "http://localhost:3000",
});


function getAccessToken() {
  return localStorage.getItem("accessToken");
}

// automatically set auth header
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// notes apis
export const fetchNotes = (page = 1, limit = 9) => api.get(`/api/notes?page=${page}&limit=${limit}`);
export const createNote = (noteData) => api.post("/api/notes", noteData);
export const fetchNoteById = (id) => api.get(`/api/notes/${id}`);
export const updateNote = (id, data) => api.put(`/api/notes/${id}`, data);
export const deleteNote = (id) => api.delete(`/api/notes/${id}`);

// categories apis
export const fetchCategories = () => api.get("/api/category");
export const createCategory = (categoryData) => api.post("/api/category", categoryData);


// auth apis
export const registerUser = (userData) => api.post('/auth/signup', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const logout = () => {
  localStorage.removeItem('accessToken'); 
};


export default api;
