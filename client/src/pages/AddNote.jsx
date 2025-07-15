import { useState, useEffect } from 'react';
import { fetchCategories, createNote, updateNote } from '../api/api';

export default function AddNote({ onNoteCreated, editNote, onNoteUpdated, onDeleteNote }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate for edit mode
  useEffect(() => {
    if (editNote) {
      setTitle(editNote.title || '');
      setContent(editNote.content || '');
      setSelectedCategoryIds(editNote.Categories?.map(c => c.id) || []);
    }
  }, [editNote]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetchCategories();
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }
    if (selectedCategoryIds.length === 0) {
      setError('Please select at least one category.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        categoryIds: selectedCategoryIds,
      };

      if (editNote) {
        await updateNote(editNote.id, payload);
        if (onNoteUpdated) onNoteUpdated();
      } else {
        await createNote(payload);
        if (onNoteCreated) onNoteCreated();
      }

      // Reset only if new
      if (!editNote) {
        setTitle('');
        setContent('');
        setSelectedCategoryIds([]);
      }

    } catch (err) {
      console.error('Failed to save note', err);
      setError(err.response?.data?.error || 'Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">{editNote ? 'Edit Note' : 'Add New Note'}</h2>

      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={loading}
        />

        <textarea
          placeholder="Note Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="w-full p-2 border rounded resize-none"
          disabled={loading}
        />

        <div>
          <label className="block font-medium mb-1">Select Categories</label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-auto border rounded p-2">
            {categories.length === 0 && <p className="text-gray-500">No categories found.</p>}
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={() => handleCategoryToggle(cat.id)}
                  disabled={loading}
                />
                <span>{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center space-x-4">
          {editNote && (
            <button
              type="button"
              onClick={() => onDeleteNote && onDeleteNote(editNote.id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 hover:cursor-pointer"
              disabled={loading}
            >
              Delete
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gray-800 text-white p-3 rounded hover:bg-gray-900 transition-colors hover:cursor-pointer"
          >
            {loading ? (editNote ? 'Updating...' : 'Saving...') : (editNote ? 'Update Note' : 'Save Note')}
          </button>
        </div>
      </form>
    </div>
  );
}
