import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Tag, 
  Scale, 
  Crown, 
  FileImage, 
  CheckCircle, 
  X,
  Search,
  Upload,
  Image as ImageIcon,
  FolderTree
} from 'lucide-react';
import {
  fetchAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  clearProductError,
  clearSuccess,
  setCurrentProduct,
  clearCurrentProduct
} from '../redux/productSlice';
import { fetchAllCategories } from '../redux/categorySlice';


function Product() {
  const dispatch = useDispatch();

  // Get products data from Redux store
  const { products, loading, error, success, currentProduct } = useSelector((state) => state.products);

  // Get categories from Redux store
  const { categories, loading: categoriesLoading } = useSelector((state) => state.categories);

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    categoryId: '',
    weight: '',
    purity: '',
    makingChargesPerGram: '',
    isActive: true
  });


  // Fetch products and categories on component mount
  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(fetchAllCategories());
  }, [dispatch]);


  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);


  // Cleanup image previews when component unmounts or modal closes
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreviews]);


  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categoryId?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Validate file types and sizes
      const validFiles = files.filter(file => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(file.type)) {
          alert(`${file.name} is not a valid image format`);
          return false;
        }
        if (file.size > maxSize) {
          alert(`${file.name} is too large (max 10MB)`);
          return false;
        }
        return true;
      });

      // Limit to 5 images
      const selectedFiles = validFiles.slice(0, 5 - imageFiles.length);
      setImageFiles(prevFiles => [...prevFiles, ...selectedFiles].slice(0, 5));

      // Create preview URLs
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews].slice(0, 5));
    }
  };


  const handleRemoveImage = (index) => {
    // Revoke the URL to free memory (only for blob URLs)
    if (imagePreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviews[index]);
    }

    setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData for multipart/form-data
    const formDataToSend = new FormData();

    // Append text fields
    formDataToSend.append('name', formData.name);
    formDataToSend.append('sku', formData.sku);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('categoryId', formData.categoryId);
    formDataToSend.append('weight', parseFloat(formData.weight));
    formDataToSend.append('purity', formData.purity);
    formDataToSend.append('makingChargesPerGram', parseFloat(formData.makingChargesPerGram));
    formDataToSend.append('isActive', formData.isActive);

    // Append image files
    imageFiles.forEach((file, index) => {
      formDataToSend.append('images', file);
    });


    if (currentProduct) {
      // Update existing product
      dispatch(updateProduct({ 
        productId: currentProduct._id, 
        productData: formDataToSend 
      }));
    } else {
      // Create new product
      dispatch(createProduct(formDataToSend));
    }

    closeModal();
  };


  const handleEdit = (product) => {
    dispatch(setCurrentProduct(product));
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      description: product.description || '',
      categoryId: product.categoryId || '',
      weight: product.weight || '',
      purity: product.purity || '',
      makingChargesPerGram: product.makingChargesPerGram || '',
      isActive: product.isActive !== undefined ? product.isActive : true
    });

    // Set existing images for preview (if editing)
    if (product.images && product.images.length > 0) {
      setImagePreviews(product.images);
      setImageFiles([]); // Clear file objects for existing images
    }

    setShowModal(true);
  };


  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(productId));
    }
  };


  const handleAddNew = () => {
    dispatch(clearCurrentProduct());
    resetForm();
    setShowModal(true);
  };


  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => {
      resetForm();
      dispatch(clearCurrentProduct());
    }, 300);
  };


  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      categoryId: '',
      weight: '',
      purity: '',
      makingChargesPerGram: '',
      isActive: true
    });

    // Clean up image previews
    imagePreviews.forEach(preview => {
      if (preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });
    setImageFiles([]);
    setImagePreviews([]);
  };


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };


  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : categoryId;
  };


  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Package size={32} className="text-blue-600" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Product Management</h2>
            <p className="text-sm text-gray-500 mt-1">{products.length} products</p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg font-medium"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>


      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">Operation completed successfully!</p>
        </div>
      )}


      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => dispatch(clearProductError())}
            className="text-red-700 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}


      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="relative max-w-md">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name, SKU, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
          />
        </div>
      </div>


      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No products found</p>
            <p className="text-gray-400 text-sm mt-2">
              Add your first product to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Purity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Making Charges
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-linear-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                            <Crown size={24} className="text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Tag size={16} className="text-gray-400" />
                        <span>{product.sku || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Scale size={16} className="text-gray-400" />
                        <span>{product.weight ? `${product.weight}g` : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {product.purity || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium capitalize">
                        {getCategoryName(product.categoryId) || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{product.makingChargesPerGram || 0}/g
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          disabled={loading}
                          className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                          title="Edit Product"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={loading}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                          title="Delete Product"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="text-2xl font-bold text-gray-900">
                {currentProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>


            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload Section */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
                  <ImageIcon size={16} className="text-gray-400" />
                  <span>Product Images (Max 5)</span>
                </label>

                {/* Image Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={imagePreviews.length >= 5}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex flex-col items-center justify-center cursor-pointer ${
                      imagePreviews.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload size={48} className="text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF, WebP up to 10MB ({imagePreviews.length}/5 images)
                    </p>
                  </label>
                </div>


                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-5 gap-3 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X size={16} />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>


              {/* Product Name */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Package size={16} className="text-gray-400" />
                  <span>Product Name *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="22K Gold Ring"
                />
              </div>


              {/* SKU */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Tag size={16} className="text-gray-400" />
                  <span>SKU *</span>
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="RING101"
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
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Product description..."
                />
              </div>


              {/* Category */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <FolderTree size={16} className="text-gray-400" />
                  <span>Category *</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? 'Loading categories...' : 'Select Category'}
                  </option>
                  {categories
                    .filter(cat => cat.isActive) // Only show active categories
                    .map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                {categories.length === 0 && !categoriesLoading && (
                  <p className="text-xs text-red-500 mt-1">
                    No categories available. Please create a category first.
                  </p>
                )}
              </div>


              {/* Weight and Purity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Scale size={16} className="text-gray-400" />
                    <span>Weight (grams) *</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="5.2"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Crown size={16} className="text-gray-400" />
                    <span>Purity *</span>
                  </label>
                  <input
                    type="text"
                    name="purity"
                    value={formData.purity}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., 24K, 22K, 18K, 916, 750"
                  />
                </div>
              </div>


              {/* Making Charges */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Making Charges (per gram) *
                </label>
                <input
                  type="number"
                  name="makingChargesPerGram"
                  value={formData.makingChargesPerGram}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="500"
                />
              </div>


              {/* Active Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Product is Active
                </label>
              </div>


              {/* Submit Button */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      <span>{currentProduct ? 'Update Product' : 'Create Product'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


export default Product;