import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  clearCategoryError,
  setCurrentCategory,
  clearCurrentCategory,
  clearSuccess
} from '../redux/categorySlice';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Search,
  RefreshCw,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Upload
} from 'lucide-react';


function Category() {
  const dispatch = useDispatch();


  // Redux state
  const { categories, loading, error, currentCategory, success } = useSelector(
    (state) => state.categories
  );


  // Local state
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'inactive'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });


  // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);


  // Handle success messages
  useEffect(() => {
    if (success) {
      setShowModal(false);
      resetForm();
      setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
    }
  }, [success, dispatch]);


  // Handle edit mode - populate form with current category
  useEffect(() => {
    if (currentCategory) {
      setFormData({
        name: currentCategory.name || '',
        description: currentCategory.description || '',
        isActive: currentCategory.isActive !== undefined ? currentCategory.isActive : true
      });
      setImagePreview(currentCategory.image || '');
      setIsEditMode(true);
      setShowModal(true);
    }
  }, [currentCategory]);


  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
    setImageFile(null);
    setImagePreview('');
    setIsEditMode(false);
    dispatch(clearCurrentCategory());
  };


  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  };


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('isActive', formData.isActive);

    if (imageFile) {
      submitData.append('image', imageFile);
    }

    if (isEditMode && currentCategory) {
      await dispatch(
        updateCategory({
          categoryId: currentCategory._id,
          categoryData: submitData
        })
      );
    } else {
      await dispatch(createCategory(submitData));
    }
  };


  // Handle edit click
  const handleEdit = (category) => {
    dispatch(setCurrentCategory(category));
  };


  // Handle delete
  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await dispatch(deleteCategory(categoryId));
    }
  };


  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
    dispatch(clearCategoryError());
  };


  // Handle create new category
  const handleCreateNew = () => {
    resetForm();
    setShowModal(true);
  };


  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchAllCategories());
  };


  // Filter categories based on search and active filter
  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());


    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && category.isActive) ||
      (filterActive === 'inactive' && !category.isActive);


    return matchesSearch && matchesFilter;
  });


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-600 mt-1">
            Manage product categories for your jewelry store
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>


      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-green-800 font-medium">
            Category {isEditMode ? 'updated' : 'created'} successfully!
          </p>
        </div>
      )}


      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">Error</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={() => dispatch(clearCategoryError())}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}


      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


          {/* Filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterActive('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterActive === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({categories.length})
            </button>
            <button
              onClick={() => setFilterActive('active')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterActive === 'active'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({categories.filter((c) => c.isActive).length})
            </button>
            <button
              onClick={() => setFilterActive('inactive')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterActive === 'inactive'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactive ({categories.filter((c) => !c.isActive).length})
            </button>
          </div>


          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>


      {/* Categories Grid */}
      {loading && !categories.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Category Image */}
              <div className="relative h-48 bg-gray-100">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="absolute inset-0 flex items-center justify-center bg-gray-200"
                  style={{ display: category.image ? 'none' : 'flex' }}
                >
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                </div>


                {/* Active Status Badge */}
                <div className="absolute top-3 right-3">
                  {category.isActive ? (
                    <div className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      <Eye className="w-3 h-3" />
                      Active
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      <EyeOff className="w-3 h-3" />
                      Inactive
                    </div>
                  )}
                </div>
              </div>


              {/* Category Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {category.description || 'No description available'}
                </p>


                {/* Timestamps */}
                <div className="text-xs text-gray-500 mb-4 space-y-1">
                  <p>
                    Created: {new Date(category.createdAt).toLocaleDateString()}
                  </p>
                  {category.updatedAt !== category.createdAt && (
                    <p>
                      Updated: {new Date(category.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>


                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No categories found
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterActive !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first category to get started'}
          </p>
        </div>
      )}


      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditMode ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>


            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Rings, Necklaces, Bracelets"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>


              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe this category..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>


              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
                </label>

                {/* Upload Area */}
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="imageUpload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600 mb-1">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-gray-500">
                        PNG, JPG, GIF or WebP (Max 5MB)
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="mt-2 text-center">
                      <label
                        htmlFor="imageUpload"
                        className="text-sm text-blue-500 hover:text-blue-600 cursor-pointer"
                      >
                        Change Image
                      </label>
                      <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>


              {/* Is Active */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Set as Active Category
                </label>
              </div>


              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Saving...' : isEditMode ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


export default Category;