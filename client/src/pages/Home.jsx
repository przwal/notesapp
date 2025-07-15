import { useState, useEffect } from 'react';
import { Search, Plus, FolderPlus, Menu, Edit3, X } from 'lucide-react';
import { fetchCategories, fetchNotes, createCategory, logout, fetchNoteById, updateNote, deleteNote } from '../api/api';  // your API helpers
import AddNote from './AddNote';  
import { useNavigate } from 'react-router-dom';



function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categories, setCategories] = useState([{ id: 'all', name: 'All Notes' }]);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null); 
  const [showEditNoteModal, setShowEditNoteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);



  const navigate = useNavigate();



  // Update useEffect to pass page
  useEffect(() => {
    loadCategories();
    loadNotes(currentPage);
  }, [currentPage]);

  const loadCategories = async () => {
    try {
      const res = await fetchCategories();
      // Prepend "All Notes" category manually
      setCategories([{ id: 'all', name: 'All Notes' }, ...res.data]);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };



  const loadNotes = async (page = 1) => {
    try {
      const res = await fetchNotes(page);
      setNotes(res.data.notes);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage);
    } catch (err) {
      console.error('Failed to load notes', err);
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const res = await createCategory({ name: newCategoryName.trim() });
        setCategories(prev => [...prev, res.data]);
        setNewCategoryName('');
        setShowCategoryModal(false);
      } catch (err) {
        console.error('Failed to create category', err);
      }
    }
  };

  const handleModalClose = () => {
    setShowCategoryModal(false);
    setNewCategoryName('');
  };

  // Filter notes by category
  const filteredNotes = notes.filter(note => {
    if (selectedCategory === 'all') return true;
    // notes come with categories included, check if note has selected category
    return note.Categories?.some(cat => cat.id === selectedCategory);
  }).filter(note => {
    if (!searchTerm) return true;
    return note.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-800 text-white transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className={`font-bold text-xl ${sidebarOpen ? 'block' : 'hidden'}`}>SafeNotes</h1>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 space-y-3">
          <button
            onClick={() => setShowAddNoteModal(true)}
            className="w-full flex items-center space-x-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            {sidebarOpen && <span>Add Note</span>}
          </button>

          <button
            onClick={() => setShowCategoryModal(true)}
            className="w-full flex items-center space-x-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <FolderPlus className="w-5 h-5" />
            {sidebarOpen && <span>Add Category</span>}
          </button>
        </div>

        {/* Categories */}
        {sidebarOpen && (
          <div className="px-4 py-2 flex-1 overflow-auto">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-gray-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4">
          <button
            onClick={() => {
              logout();          
              navigate('/login'); 
            }}
            className="w-full flex items-center space-x-3 p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors hover:cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1"></path>
            </svg>
            {sidebarOpen && <span>Logout</span>}
          </button>

        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {categories.find(cat => cat.id === selectedCategory)?.name || 'All Notes'}
              </h2>
              <p className="text-gray-600 mt-1">{filteredNotes.length} notes</p>
            </div>
            
            {/* Search */}
            <div className="relative w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search notes..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNote(note);
                    setShowEditNoteModal(true);
                  }}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                >

                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 text-lg">{note.title}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {note.content}
                </p>
                <div className="flex flex-wrap gap-2">
                  {note.Categories?.map(cat => (
                    <span
                      key={cat.id}
                      className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-full"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* pagination controls */}
          {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 rounded ${currentPage === index + 1 ? 'bg-gray-800 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {index + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}


          {/* Empty State */}
          {filteredNotes.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white border border-gray-200 rounded-lg p-8 inline-block">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No notes found</h3>
                <p className="text-gray-600 mb-4">Create your first note to get started</p>
                <button
                  onClick={() => setShowAddNoteModal(true)}
                  className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Add Note
                </button>

              </div>
            </div>
          )}
        </div>

        {/* Add Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">New Category</h2>
                <button 
                  onClick={handleModalClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent mb-6 text-gray-800 placeholder-gray-400"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleModalClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium transition-colors"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">New Note</h2>
              <button 
                onClick={() => setShowAddNoteModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <AddNote
              onNoteCreated={() => {
                loadNotes(); 
                setShowAddNoteModal(false); 
              }}
            />
          </div>
        </div>
      )}

      {showEditNoteModal && selectedNote && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Note</h2>
              <button
                onClick={() => setShowEditNoteModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <AddNote
              editNote={selectedNote}
              onNoteUpdated={() => {
                loadNotes();
                setShowEditNoteModal(false);
                setSelectedNote(null);
              }}
              onDeleteNote={async (id) => {
                try {
                  await deleteNote(id);
                  loadNotes();
                  setShowEditNoteModal(false);
                  setSelectedNote(null);
                } catch (err) {
                  console.error("Failed to delete note", err);
                }
              }}
            />
          </div>
        </div>
      )}


      </div>
    </div>
  );
}

export default Home;
