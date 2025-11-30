import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';

const ProductFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(isEditMode);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: 'Running',
        tags: '',
        featured: false,
        images: {
            primary: '',
            thumbnail: '',
            gallery: ['', '', '']
        },
        sizes: [
            { size: 'US 7', stock: 0 },
            { size: 'US 8', stock: 0 },
            { size: 'US 9', stock: 0 },
            { size: 'US 10', stock: 0 },
            { size: 'US 11', stock: 0 }
        ]
    });

    useEffect(() => {
        if (isEditMode) {
            fetchProduct();
        }
        // eslint-disable-next-line
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/products/${id}`);
            const data = await response.json();

            // Ensure gallery has exactly 3 slots
            const galleryArray = data.images?.gallery || [];
            while (galleryArray.length < 3) galleryArray.push('');

            setFormData({
                title: data.title || '',
                description: data.description || '',
                price: data.price || '',
                category: data.category || 'Running',
                tags: data.tags?.join(', ') || '',
                featured: data.featured || false,
                images: {
                    primary: data.images?.primary || '',
                    thumbnail: data.images?.thumbnail || '',
                    gallery: galleryArray.slice(0, 3)
                },
                sizes: data.sizes || []
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching product:', error);
            alert('Failed to load product');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            images: {
                primary: formData.images.primary,
                thumbnail: formData.images.thumbnail,
                gallery: formData.images.gallery.filter(url => url)
            }
        };

        try {
            const url = isEditMode
                ? `http://localhost:5000/api/admin/products/${id}`
                : 'http://localhost:5000/api/admin/products';

            const response = await fetch(url, {
                method: isEditMode ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(productData),
            });

            if (response.ok) {
                alert(`Product ${isEditMode ? 'updated' : 'created'} successfully!`);
                navigate('/admin/products');
            } else {
                const data = await response.json();
                alert(data.msg || `Failed to ${isEditMode ? 'update' : 'create'} product`);
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error saving product');
        }
    };

    const handleSizeStockChange = (index, value) => {
        const newSizes = [...formData.sizes];
        newSizes[index].stock = parseInt(value) || 0;
        setFormData({ ...formData, sizes: newSizes });
    };

    if (loading) {
        return <div className="text-gray-400">Loading product...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {isEditMode ? 'Edit Product' : 'Add New Product'}
                    </h1>
                    <p className="text-gray-400">
                        {isEditMode ? 'Only change fields you want to update' : 'Fill all required fields'}
                    </p>
                </div>
                <button onClick={() => navigate('/admin/products')} className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Product Name *</label>
                            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Nike Air Zoom Pegasus" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Price (₹) *</label>
                            <input type="number" required min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 8995" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                            <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="Running">Running</option>
                                <option value="Training">Training</option>
                                <option value="Casual">Casual</option>
                                <option value="Basketball">Basketball</option>
                                <option value="Football">Football</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
                            <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., running, lightweight" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                            <textarea required rows="4" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe the product..." />
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="featured" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-5 h-5 rounded bg-gray-700 border-gray-600" />
                            <label htmlFor="featured" className="text-sm font-medium text-gray-300">Featured Product</label>
                        </div>
                    </div>
                </div>

                {/* Images - Optional in Edit Mode */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">
                        Product Images {isEditMode && <span className="text-sm text-gray-500 font-normal ml-2">(Optional - Leave blank to keep existing)</span>}
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Primary Image URL {!isEditMode && '*'}</label>
                            <input type="text" required={!isEditMode} value={formData.images.primary} onChange={(e) => setFormData({ ...formData, images: { ...formData.images, primary: e.target.value } })} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://example.com/image.jpg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail URL</label>
                            <input type="text" value={formData.images.thumbnail} onChange={(e) => setFormData({ ...formData, images: { ...formData.images, thumbnail: e.target.value } })} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://example.com/thumbnail.jpg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Gallery Images (up to 3)</label>
                            {formData.images.gallery.map((url, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    value={url}
                                    onChange={(e) => {
                                        const newGallery = [...formData.images.gallery];
                                        newGallery[index] = e.target.value;
                                        setFormData({ ...formData, images: { ...formData.images, gallery: newGallery } });
                                    }}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                                    placeholder={`Gallery image ${index + 1} URL`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sizes & Stock */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">Sizes & Stock</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {formData.sizes.map((size, index) => (
                            <div key={index}>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{size.size}</label>
                                <input type="number" min="0" value={size.stock} onChange={(e) => handleSizeStockChange(index, e.target.value)} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Stock" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-4">
                    <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium">
                        <Save className="w-5 h-5" />
                        {isEditMode ? 'Update Product' : 'Create Product'}
                    </button>
                    <button type="button" onClick={() => navigate('/admin/products')} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductFormPage;
